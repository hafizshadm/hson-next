"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./contact-brief.css";
import {
  SERVICE_GROUPS,
  UNSURE,
  STEPS,
  GOAL_FIELDS,
  CONTACT_FIELDS,
  detailBlocks,
  fieldsForStep,
  fieldLabel,
  isRequired,
  isVisible,
  pruneAnswers,
  summarize,
  validateStep,
  visibleOptions,
  serviceName,
} from "@/lib/brief";
import { CONTACT_EMAIL } from "@/lib/site";

const CALENDLY = "https://calendly.com/hsonagency/marketingconsultation";
const DRAFT_KEY = "hson-brief-v1";
const ALL_SERVICE_IDS = [...SERVICE_GROUPS.flatMap((g) => g.services.map((s) => s.id)), UNSURE.id];

/**
 * The contact page's markup is a static string injected with
 * dangerouslySetInnerHTML (see frontend/contact.html), so the form can't be a
 * JSX child of it. Instead it is portalled into the #hson-brief placeholder
 * once the page has mounted. React never re-renders the injected markup, so it
 * never touches the portal's host node.
 */
export default function ContactBrief() {
  const [host, setHost] = useState(null);
  useEffect(() => {
    const el = document.getElementById("hson-brief");
    if (el) {
      el.querySelector("noscript")?.remove();
      setHost(el);
    }
  }, []);

  // "Copy address" buttons in the static markup ([data-copy-email]).
  useEffect(() => {
    const onClick = async (e) => {
      const btn = e.target.closest?.("[data-copy-email]");
      if (!btn) return;
      const label = btn.dataset.label || btn.textContent;
      btn.dataset.label = label;
      try {
        await navigator.clipboard.writeText(btn.dataset.copyEmail);
        btn.textContent = "Copied ✓";
      } catch {
        window.location.href = `mailto:${btn.dataset.copyEmail}`;
        return;
      }
      clearTimeout(btn._t);
      btn._t = setTimeout(() => (btn.textContent = label), 2000);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return host ? createPortal(<BriefForm />, host) : null;
}

// ---------------------------------------------------------------------------

function readDraft() {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeDraft(value) {
  try {
    if (value) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
    else window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* private mode / blocked storage: the form still works, just no draft */
  }
}

/** ?service=seo,ads on the URL preselects services (for deep links from /services). */
function servicesFromUrl() {
  try {
    const q = new URLSearchParams(window.location.search).get("service");
    if (!q) return [];
    return q.split(",").map((s) => s.trim()).filter((s) => ALL_SERVICE_IDS.includes(s));
  } catch {
    return [];
  }
}

function BriefForm() {
  const [answers, setAnswers] = useState({ services: [] });
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | fallback
  const [restored, setRestored] = useState(false);
  const startedAt = useRef(Date.now());
  const rootRef = useRef(null);
  const honeypot = useRef(null);

  // Restore a saved draft (or URL preselection) once, client-side only.
  useEffect(() => {
    const fromUrl = servicesFromUrl();
    const draft = readDraft();
    if (draft?.answers) {
      const services = [...new Set([...(draft.answers.services || []), ...fromUrl])];
      setAnswers({ ...draft.answers, services });
      if (draft.answers.services?.length) setRestored(true);
    } else if (fromUrl.length) {
      setAnswers({ services: fromUrl });
    }
  }, []);

  useEffect(() => {
    if (status === "sent") return;
    const hasContent = Object.keys(answers).some((k) => (Array.isArray(answers[k]) ? answers[k].length : answers[k]));
    writeDraft(hasContent ? { answers } : null);
  }, [answers, status]);

  const current = STEPS[step];

  const set = useCallback((id, value) => {
    setAnswers((a) => ({ ...a, [id]: value }));
    setErrors((e) => {
      if (!e[id]) return e;
      const { [id]: _, ...rest } = e;
      return rest;
    });
  }, []);

  const toggleService = useCallback((id) => {
    setAnswers((a) => {
      const s = a.services || [];
      return { ...a, services: s.includes(id) ? s.filter((x) => x !== id) : [...s, id] };
    });
    setErrors((e) => (e.services ? {} : e));
  }, []);

  const scrollToTop = () => {
    const el = rootRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 110;
    if (window.scrollY > top) window.scrollTo({ top, behavior: "smooth" });
  };

  const focusFirstError = (errs) => {
    const first = Object.keys(errs)[0];
    if (!first) return;
    requestAnimationFrame(() => {
      const el = rootRef.current?.querySelector(`[data-field="${first}"]`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.querySelector("input, textarea, select, button")?.focus({ preventScroll: true });
    });
  };

  const goTo = (i) => {
    setErrors({});
    setStep(i);
    setMaxStep((m) => Math.max(m, i));
    scrollToTop();
    requestAnimationFrame(() => rootRef.current?.querySelector(".hb-step-heading")?.focus({ preventScroll: true }));
  };

  const next = () => {
    const errs = validateStep(current.id, answers);
    if (Object.keys(errs).length) {
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    goTo(Math.min(step + 1, STEPS.length - 1));
  };

  const back = () => goTo(Math.max(step - 1, 0));

  /** Jump via the step rail: backwards freely, forwards only through valid steps. */
  const jump = (target) => {
    if (target <= step) return goTo(target);
    for (let i = step; i < target; i++) {
      const errs = validateStep(STEPS[i].id, answers);
      if (Object.keys(errs).length) {
        if (i !== step) goTo(i);
        setErrors(errs);
        focusFirstError(errs);
        return;
      }
    }
    goTo(target);
  };

  const clean = useMemo(() => pruneAnswers(answers), [answers]);

  const submit = async () => {
    // Re-validate every step: an earlier answer may have changed what's required.
    for (let i = 0; i < STEPS.length - 1; i++) {
      const errs = validateStep(STEPS[i].id, answers);
      if (Object.keys(errs).length) {
        setStep(i);
        setErrors(errs);
        focusFirstError(errs);
        return;
      }
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: clean,
          meta: { elapsedMs: Date.now() - startedAt.current, fax: honeypot.current?.value || "" },
        }),
      });
      if (res.ok) {
        setStatus("sent");
        writeDraft(null);
        scrollToTop();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 400 && data.errors && Object.keys(data.errors).length) {
        const firstId = Object.keys(data.errors)[0];
        const at = STEPS.findIndex((s) =>
          s.id === "services" ? firstId === "services" : fieldsForStep(s.id, answers).some((f) => f.id === firstId)
        );
        setStatus("idle");
        if (at >= 0) setStep(at);
        setErrors(data.errors);
        focusFirstError(data.errors);
        return;
      }
      setStatus("fallback");
    } catch {
      setStatus("fallback");
    }
  };

  const onKeyDown = (e) => {
    // Enter advances, except inside textareas and on buttons (which handle it).
    if (e.key !== "Enter" || e.shiftKey || e.target.tagName === "TEXTAREA" || e.target.tagName === "BUTTON") return;
    if (e.target.tagName === "INPUT" && (e.target.type === "checkbox" || e.target.type === "radio")) return;
    e.preventDefault();
    if (current.id === "review") submit();
    else next();
  };

  if (status === "sent") return <Success answers={clean} />;

  const progress = ((step + (status === "sending" ? 1 : 0)) / (STEPS.length - 1)) * 100;

  return (
    <div className="hb" ref={rootRef} onKeyDown={onKeyDown}>
      <div className="hb-head">
        <ol className="hb-steps" aria-label="Brief progress">
          {STEPS.map((s, i) => {
            const state = i === step ? "current" : i <= maxStep ? "done" : "todo";
            return (
              <li key={s.id} className={`hb-steps__item is--${state}`}>
                <button
                  type="button"
                  className="hb-steps__btn"
                  disabled={i > maxStep || status === "sending"}
                  aria-current={i === step ? "step" : undefined}
                  onClick={() => jump(i)}
                >
                  <span className="hb-steps__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="hb-steps__label">{s.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="hb-progress" aria-hidden="true">
          <div className="hb-progress__bar" style={{ width: `${Math.max(progress, 4)}%` }} />
        </div>
      </div>

      <div className="hb-body" key={current.id}>
        <div className="hb-step-intro">
          <h2 className="hb-step-heading" tabIndex={-1}>{current.heading}</h2>
          <p className="hb-step-sub">{current.sub}</p>
          {restored && step === 0 && (
            <p className="hb-restored">
              We kept your earlier answers.{" "}
              <button
                type="button"
                className="hb-link"
                onClick={() => {
                  setAnswers({ services: [] });
                  setRestored(false);
                  writeDraft(null);
                }}
              >
                Start over
              </button>
            </p>
          )}
        </div>

        {current.id === "services" && (
          <ServicePicker selected={answers.services || []} onToggle={toggleService} error={errors.services} />
        )}

        {current.id === "details" && <Details answers={answers} set={set} errors={errors} />}

        {current.id === "goals" && <FieldList fields={GOAL_FIELDS} answers={answers} set={set} errors={errors} />}

        {current.id === "contact" && (
          <>
            <FieldList fields={CONTACT_FIELDS} answers={answers} set={set} errors={errors} />
            {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
            <div className="hb-hp" aria-hidden="true">
              <label>
                Fax
                <input ref={honeypot} type="text" name="fax" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
          </>
        )}

        {current.id === "review" && <Review answers={clean} onEdit={(stepId) => goTo(STEPS.findIndex((s) => s.id === stepId))} />}

        {status === "fallback" && <Fallback answers={clean} />}
      </div>

      <div className="hb-foot">
        {step > 0 ? (
          <button type="button" className="hb-btn is--ghost" onClick={back} disabled={status === "sending"}>
            <span aria-hidden="true">←</span> Back
          </button>
        ) : (
          <span className="hb-foot__note">
            {(answers.services || []).length
              ? `${answers.services.length} selected`
              : "Takes about 2 minutes"}
          </span>
        )}
        {current.id === "review" ? (
          <button type="button" className="hb-btn is--primary" onClick={submit} disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send brief"} <span aria-hidden="true">→</span>
          </button>
        ) : (
          <button type="button" className="hb-btn is--primary" onClick={next}>
            Continue <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function ServicePicker({ selected, onToggle, error }) {
  return (
    <div className="hb-services" data-field="services">
      {SERVICE_GROUPS.map((g) => (
        <fieldset key={g.id} className="hb-services__group">
          <legend className="hb-services__legend">{g.label}</legend>
          <div className="hb-services__grid">
            {g.services.map((s) => (
              <ServiceCard key={s.id} s={s} checked={selected.includes(s.id)} onToggle={onToggle} />
            ))}
          </div>
        </fieldset>
      ))}
      <div className="hb-services__unsure">
        <ServiceCard s={UNSURE} checked={selected.includes(UNSURE.id)} onToggle={onToggle} wide />
      </div>
      {error && <p className="hb-error" role="alert">{error}</p>}
    </div>
  );
}

function ServiceCard({ s, checked, onToggle, wide }) {
  return (
    <label className={`hb-card${checked ? " is--checked" : ""}${wide ? " is--wide" : ""}`}>
      <input type="checkbox" className="hb-sr" checked={checked} onChange={() => onToggle(s.id)} />
      <span className="hb-card__check" aria-hidden="true">
        <svg viewBox="0 0 12 12"><path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span className="hb-card__name">{s.name}</span>
      <span className="hb-card__blurb">{s.blurb}</span>
    </label>
  );
}

function Details({ answers, set, errors }) {
  const blocks = detailBlocks(answers);
  return (
    <div className="hb-blocks">
      {blocks.map((b, i) => (
        <section key={b.id} className="hb-block">
          <header className="hb-block__head">
            <span className="hb-block__num">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="hb-block__title">{b.name}</h3>
          </header>
          <FieldList fields={b.fields} answers={answers} set={set} errors={errors} />
        </section>
      ))}
    </div>
  );
}

function FieldList({ fields, answers, set, errors }) {
  return (
    <div className="hb-fields">
      {fields.filter((f) => isVisible(f, answers)).map((f) => (
        <Field key={f.id} field={f} answers={answers} set={set} error={errors[f.id]} />
      ))}
    </div>
  );
}

function Field({ field, answers, set, error }) {
  const id = `hb-${field.id}`;
  const label = fieldLabel(field, answers);
  const required = isRequired(field, answers);
  const value = answers[field.id];
  const errId = error ? `${id}-err` : undefined;
  const hintId = field.hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  const cls = `hb-field is--${field.type}${field.half ? " is--half" : ""}${error ? " has--error" : ""}`;

  const labelEl = (as = "label") => {
    const Tag = as;
    return (
      <Tag className="hb-label" {...(as === "label" ? { htmlFor: id } : {})}>
        {label}
        {required ? <span className="hb-req" aria-hidden="true"> *</span> : <span className="hb-opt"> optional</span>}
      </Tag>
    );
  };

  if (field.type === "chips" || field.type === "choice") {
    const multi = field.type === "chips";
    const opts = visibleOptions(field, answers);
    const arr = Array.isArray(value) ? value : [];
    return (
      <fieldset className={cls} data-field={field.id} aria-describedby={describedBy} aria-required={required || undefined}>
        {labelEl("legend")}
        {field.hint && <p className="hb-hint" id={hintId}>{field.hint}</p>}
        <div className="hb-chips">
          {opts.map((o) => {
            const checked = multi ? arr.includes(o) : value === o;
            return (
              <label key={o} className={`hb-chip${checked ? " is--checked" : ""}`}>
                <input
                  className="hb-sr"
                  type={multi ? "checkbox" : "radio"}
                  name={id}
                  value={o}
                  checked={checked}
                  onChange={() => set(field.id, multi ? (checked ? arr.filter((x) => x !== o) : [...arr, o]) : o)}
                />
                {multi && (
                  <span className="hb-chip__mark" aria-hidden="true">
                    <svg viewBox="0 0 12 12"><path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                )}
                {o}
              </label>
            );
          })}
        </div>
        {error && <p className="hb-error" id={errId} role="alert">{error}</p>}
      </fieldset>
    );
  }

  const common = {
    id,
    name: field.id,
    value: typeof value === "string" ? value : "",
    onChange: (e) => set(field.id, e.target.value),
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    "aria-required": required || undefined,
    autoComplete: field.autoComplete || "off",
    placeholder: field.placeholder,
  };

  return (
    <div className={cls} data-field={field.id}>
      {labelEl()}
      {field.hint && <p className="hb-hint" id={hintId}>{field.hint}</p>}
      {field.type === "textarea" ? (
        <>
          <textarea className="hb-input is--area" rows={4} maxLength={field.max || 500} {...common} />
          {typeof value === "string" && value.length > (field.max || 500) * 0.8 && (
            <span className="hb-count">{value.length}/{field.max || 500}</span>
          )}
        </>
      ) : field.type === "select" ? (
        <select className="hb-input is--select" {...common}>
          <option value="">{field.placeholder || "Choose…"}</option>
          {field.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          className="hb-input"
          type={field.type === "url" ? "text" : field.type}
          inputMode={field.type === "url" ? "url" : field.type === "email" ? "email" : undefined}
          maxLength={field.max || 500}
          {...common}
        />
      )}
      {error && <p className="hb-error" id={errId} role="alert">{error}</p>}
    </div>
  );
}

function Review({ answers, onEdit }) {
  const sections = summarize(answers);
  let lastStep = null;
  return (
    <div className="hb-review">
      {sections.map((s, i) => {
        const showEdit = s.step !== lastStep;
        lastStep = s.step;
        return (
          <section key={`${s.step}-${s.title}-${i}`} className="hb-review__section">
            <header className="hb-review__head">
              <h3 className="hb-review__title">{s.title}</h3>
              {showEdit && (
                <button type="button" className="hb-link" onClick={() => onEdit(s.step)}>
                  Edit
                </button>
              )}
            </header>
            <dl className="hb-review__rows">
              {s.rows.map((r) => (
                <div key={r.id} className="hb-review__row">
                  <dt>{r.label}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}

function briefText(answers) {
  return summarize(answers)
    .map((s) => `${s.title.toUpperCase()}\n${s.rows.map((r) => `- ${r.label}: ${r.value}`).join("\n")}`)
    .join("\n\n");
}

function Fallback({ answers }) {
  const [copied, setCopied] = useState(false);
  const text = briefText(answers);
  const subject = `Project brief: ${answers.company || answers.name || "New enquiry"}`;
  const body = text.length > 1800 ? `${text.slice(0, 1800)}\n\n[Trimmed to fit. Use "Copy brief" on the site and paste the full version here.]\n` : text;
  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="hb-fallback" role="alert">
      <p className="hb-fallback__title">We couldn't send that automatically.</p>
      <p>Your answers are saved. Send them straight to our inbox instead:</p>
      <div className="hb-fallback__actions">
        <a className="hb-btn is--primary" href={href}>Open in email app</a>
        <button type="button" className="hb-btn is--ghost" onClick={copy}>{copied ? "Copied" : "Copy brief"}</button>
      </div>
      <p className="hb-fallback__note">
        Or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> directly.
      </p>
    </div>
  );
}

function Success({ answers }) {
  const wantsCall = answers.next_step === "Let's get on a call";
  const first = (answers.name || "").split(" ")[0];
  const calendly = `${CALENDLY}?${new URLSearchParams({
    name: answers.name || "",
    email: answers.email || "",
    hide_gdpr_banner: "1",
  })}`;
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div className="hb hb-success" role="status">
      <div className="hb-success__mark" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M5 12.5 9.5 17 19 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <h2 className="hb-success__title" tabIndex={-1} ref={ref}>
        Brief received{first ? `, ${first}` : ""}.
      </h2>
      <p className="hb-success__text">
        It's with the team now. One of us (a person, not an autoresponder) will reply to{" "}
        <strong>{answers.email}</strong> within one business day
        {wantsCall ? ". Want to skip the back-and-forth? Pick a time now." : " with next steps."}
      </p>
      <p className="hb-success__services">
        {(answers.services || []).map((id) => (
          <span key={id} className="hb-tag">{serviceName(id)}</span>
        ))}
      </p>
      <div className="hb-success__actions">
        {wantsCall ? (
          <a className="hb-btn is--primary" href={calendly} target="_blank" rel="noopener">
            Book the call <span aria-hidden="true">→</span>
          </a>
        ) : (
          <a className="hb-btn is--ghost" href="/services">Browse our services</a>
        )}
      </div>
    </div>
  );
}

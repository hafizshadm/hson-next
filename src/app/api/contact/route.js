// POST /api/contact: receives a project brief from the /contact form and
// emails it to the team.
//
// Delivery uses Resend's HTTP API (no SDK dependency). Configure in Vercel →
// Project → Settings → Environment Variables:
//   RESEND_API_KEY      required. Without it the route answers 503 and the
//                       form falls back to opening the visitor's email app.
//   CONTACT_TO_EMAIL    optional. Recipient; defaults to info@hsonagency.com.
//   CONTACT_FROM_EMAIL  optional. Sender, e.g. "Hson Website <brief@hsonagency.com>".
//                       Must be on a domain verified in Resend. Defaults to
//                       Resend's shared test sender, which only delivers to
//                       the Resend account's own address.
//
// The brief schema in src/lib/brief.js is re-applied here, so the server shows
// the same questions and enforces the same required rules as the browser.

import { NextResponse } from "next/server";
import { CONTACT_EMAIL } from "@/lib/site";
import { STEPS, pruneAnswers, summarize, validateStep, serviceName } from "@/lib/brief";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_FILL_MS = 2500; // faster than any human fills the form
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map(); // best-effort, per serverless instance

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_MAX;
}

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function renderEmail(a) {
  const sections = summarize(a);
  const text = sections
    .map((s) => `${s.title.toUpperCase()}\n${s.rows.map((r) => `${r.label}: ${r.value}`).join("\n")}`)
    .join("\n\n");

  const html = `<!doctype html><html><body style="margin:0;background:#fbf8ed;font-family:Helvetica,Arial,sans-serif;color:#080909">
<div style="max-width:640px;margin:0 auto;padding:32px 20px">
  <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#96794a;margin-bottom:8px">New project brief · hsonagency.com</div>
  <h1 style="font-size:24px;line-height:1.25;margin:0 0 4px">${esc(a.company || a.name)}</h1>
  <p style="margin:0 0 24px;color:#595959;font-size:14px">${esc(a.name)} · <a href="mailto:${esc(a.email)}" style="color:#96794a">${esc(a.email)}</a>${a.next_step ? ` · <strong>${esc(a.next_step)}</strong>` : ""}</p>
  ${sections
    .map(
      (s) => `<div style="background:#fff;border:1px solid rgba(8,9,9,.08);border-radius:12px;padding:18px 20px;margin-bottom:12px">
    <div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-weight:600;margin-bottom:10px">${esc(s.title)}</div>
    <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.5">
      ${s.rows
        .map(
          (r) => `<tr><td style="padding:5px 12px 5px 0;color:#595959;vertical-align:top;width:42%">${esc(r.label)}</td><td style="padding:5px 0;vertical-align:top;white-space:pre-wrap">${esc(r.value)}</td></tr>`
        )
        .join("")}
    </table></div>`
    )
    .join("")}
  <p style="font-size:12px;color:#595959;margin-top:20px">Reply to this email to answer ${esc(a.name)} directly.</p>
</div></body></html>`;

  return { text, html };
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const raw = body && typeof body.answers === "object" && body.answers ? body.answers : {};
  const meta = body && typeof body.meta === "object" && body.meta ? body.meta : {};

  // Bots: fill the hidden field or submit instantly. Answer as if it worked so
  // they get no signal to adapt to, but send nothing.
  if (meta.fax || Number(meta.elapsedMs) < MIN_FILL_MS) {
    return NextResponse.json({ ok: true });
  }

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const answers = pruneAnswers(raw);
  const errors = {};
  for (const step of STEPS) Object.assign(errors, validateStep(step.id, answers));
  if (Object.keys(errors).length) {
    return NextResponse.json({ error: "invalid", errors }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const to = (process.env.CONTACT_TO_EMAIL || CONTACT_EMAIL).split(",").map((s) => s.trim()).filter(Boolean);
  const from = process.env.CONTACT_FROM_EMAIL || "Hson Website <onboarding@resend.dev>";
  const services = answers.services.map(serviceName);
  const subject = `New brief: ${answers.company} · ${services.slice(0, 3).join(", ")}${services.length > 3 ? ` +${services.length - 3}` : ""}`;
  const { text, html } = renderEmail(answers);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, reply_to: answers.email, subject, text, html }),
    });
    if (!res.ok) {
      console.error("[contact] resend failed", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("[contact] resend error", err);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

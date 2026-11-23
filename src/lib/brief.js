// Project brief schema — the single source of truth for the /contact form.
//
// Shared by the client form (src/components/ContactBrief.jsx) and the API
// route (src/app/api/contact/route.js): the browser uses it to decide which
// questions to show, the server re-runs the exact same rules to validate and to
// format the email. A field is only asked, validated, and sent when its `when`
// predicate holds for the current answers, so a hidden field can never block a
// step or leak stale values into the brief.
//
// Answers are a flat object: { [fieldId]: string | string[] }.
// Field types: "chips" (multi-select), "choice" (single-select pills),
// "text" | "email" | "url" | "textarea" | "select".

export const SERVICE_GROUPS = [
  {
    id: "creative",
    label: "Content & Creative",
    services: [
      { id: "content", name: "Content Creation", blurb: "Bilingual copy, scripts and short-form video", kind: "ongoing" },
      { id: "branding", name: "Graphic Design & Branding", blurb: "Identity, brand systems and design assets", kind: "project" },
      { id: "production", name: "Photography & Videography", blurb: "Studio and on-location shoots", kind: "project" },
    ],
  },
  {
    id: "growth",
    label: "Growth & Performance",
    services: [
      { id: "social", name: "Social Media Management", blurb: "Channels, calendars and community", kind: "ongoing" },
      { id: "ads", name: "Ads Management", blurb: "Paid social and search that pays back", kind: "ongoing" },
      { id: "influencer", name: "Influencer Marketing", blurb: "Creators matched to your GCC audience", kind: "project" },
      { id: "seo", name: "SEO / AEO / GEO", blurb: "Rank on Google and get cited by AI answers", kind: "ongoing" },
      { id: "behaviour", name: "Behavioural Intelligence", blurb: "Find out why people buy, or don't", kind: "project" },
    ],
  },
  {
    id: "build",
    label: "Build & Technical",
    services: [
      { id: "website", name: "Website Design & Development", blurb: "Fast, search-ready sites built to convert", kind: "project" },
      { id: "app", name: "Web & Mobile App Development", blurb: "Custom iOS, Android and web apps", kind: "project" },
      { id: "ai", name: "AI Automations", blurb: "Remove the manual work from your workflows", kind: "project" },
    ],
  },
];

export const UNSURE = { id: "unsure", name: "Not sure yet", blurb: "Tell us the problem. We'll recommend the mix." };

export const SERVICES = SERVICE_GROUPS.flatMap((g) => g.services);
const SERVICE_BY_ID = Object.fromEntries([...SERVICES, UNSURE].map((s) => [s.id, s]));
export const serviceName = (id) => SERVICE_BY_ID[id]?.name || id;

// ---------------------------------------------------------------------------
// Helpers for `when` predicates.
const sel = (a) => (Array.isArray(a.services) ? a.services : []);
const has = (a, id) => sel(a).includes(id);
const is = (a, field, ...values) => values.includes(a[field]);
const includes = (a, field, value) => Array.isArray(a[field]) && a[field].includes(value);

export const hasOngoing = (a) => sel(a).some((id) => SERVICE_BY_ID[id]?.kind === "ongoing");
export const hasProject = (a) => sel(a).some((id) => SERVICE_BY_ID[id]?.kind === "project");
const onlyUnsure = (a) => sel(a).length === 1 && has(a, "unsure");

/** The website URL becomes required when the work is about an existing site. */
export const websiteRequired = (a) =>
  has(a, "seo") || has(a, "behaviour") || (has(a, "website") && is(a, "web_stage", "Redesign an existing site"));

const SOCIAL_PLATFORMS = ["Instagram", "TikTok", "Snapchat", "YouTube", "LinkedIn", "X (Twitter)"];
const BUDGET_MONTHLY = ["Under $1.5k", "$1.5k – $3k", "$3k – $7.5k", "$7.5k – $15k", "$15k+", "Not sure yet"];
const BUDGET_PROJECT = ["Under $3k", "$3k – $10k", "$10k – $25k", "$25k – $60k", "$60k+", "Not sure yet"];

// ---------------------------------------------------------------------------
// Per-service follow-up questions (step 2). Only blocks for selected services
// are shown, in the order the visitor picked them.
export const SERVICE_QUESTIONS = {
  content: [
    { id: "content_platforms", label: "Where will the content live?", type: "chips", required: true, options: [...SOCIAL_PLATFORMS, "Website / blog"] },
    { id: "content_formats", label: "Which formats?", type: "chips", options: ["Short-form video", "Static & carousel posts", "Long-form video", "Blog articles", "Ad creatives"] },
    { id: "content_lang", label: "Language", type: "choice", required: true, options: ["Arabic", "English", "Both"] },
    { id: "content_volume", label: "Roughly how much per month?", type: "choice", options: ["Up to 8 pieces", "8 – 20 pieces", "20+ pieces", "Not sure"] },
  ],
  branding: [
    { id: "brand_stage", label: "Where is the brand today?", type: "choice", required: true, options: ["Brand new, nothing exists yet", "Refresh an existing brand", "Design work on our existing brand"] },
    {
      id: "brand_deliverables",
      label: "What do you need?",
      type: "chips",
      required: true,
      options: [
        { v: "Naming", when: (a) => is(a, "brand_stage", "Brand new, nothing exists yet") },
        { v: "Logo", when: (a) => !is(a, "brand_stage", "Design work on our existing brand") },
        { v: "Full visual identity", when: (a) => !is(a, "brand_stage", "Design work on our existing brand") },
        "Brand guidelines",
        "Packaging",
        "Social media templates",
        "Print & signage",
        "Pitch deck / presentations",
      ],
    },
    { id: "brand_why", label: "What's prompting the refresh?", type: "textarea", when: (a) => is(a, "brand_stage", "Refresh an existing brand"), placeholder: "New positioning, a merger, it just looks dated…" },
    { id: "brand_guidelines", label: "Do you have brand guidelines we should follow?", type: "choice", when: (a) => is(a, "brand_stage", "Design work on our existing brand"), options: ["Yes", "Partially", "No"] },
  ],
  production: [
    { id: "prod_output", label: "Photo, video, or both?", type: "choice", required: true, options: ["Photo", "Video", "Both"] },
    { id: "prod_type", label: "What are we shooting?", type: "chips", required: true, options: ["Product", "Lifestyle / campaign", "Food & hospitality", "Real estate & interiors", "Fashion", "Events", "Corporate & headshots"] },
    { id: "prod_video_use", label: "What's the video for?", type: "chips", when: (a) => is(a, "prod_output", "Video", "Both"), options: ["Social short-form", "Ad creatives", "Brand film", "Event highlights"] },
    { id: "prod_location", label: "Shoot location", type: "text", required: true, placeholder: "City, country" },
    { id: "prod_talent", label: "Will you need models or talent?", type: "choice", options: ["Yes", "No", "Not sure"] },
  ],
  social: [
    { id: "social_platforms", label: "Which platforms?", type: "chips", required: true, options: SOCIAL_PLATFORMS },
    { id: "social_current", label: "Who runs your social today?", type: "choice", required: true, options: ["Nobody yet", "We do it in-house", "Another agency or freelancer"] },
    { id: "social_handle", label: "Main account handle", type: "text", when: (a) => !is(a, "social_current", "Nobody yet"), placeholder: "@yourbrand" },
    { id: "social_issue", label: "What's not working with the current setup?", type: "textarea", when: (a) => is(a, "social_current", "We do it in-house", "Another agency or freelancer"), placeholder: "Low engagement, inconsistent posting, content feels generic…" },
  ],
  ads: [
    { id: "ads_status", label: "Are you running ads today?", type: "choice", required: true, options: ["Not yet", "Yes, in-house", "Yes, through an agency"] },
    { id: "ads_platforms", label: "Which platforms?", type: "chips", required: true, labelWhen: (a) => (is(a, "ads_status", "Not yet") ? "Which platforms are you considering?" : "Which platforms are you running on?"), options: ["Meta (Instagram / Facebook)", "Google Search & YouTube", "TikTok", "Snapchat", "LinkedIn", "X (Twitter)", "Not sure"] },
    { id: "ads_spend", label: "Current monthly ad spend", type: "choice", required: true, when: (a) => is(a, "ads_status", "Yes, in-house", "Yes, through an agency"), options: ["Under $1k", "$1k – $5k", "$5k – $20k", "$20k – $50k", "$50k+"] },
    { id: "ads_goal", label: "What should the ads drive?", type: "choice", required: true, options: ["Leads & enquiries", "Online sales", "App installs", "Store visits", "Awareness"] },
    { id: "ads_issue", label: "What's not working right now?", type: "textarea", when: (a) => is(a, "ads_status", "Yes, in-house", "Yes, through an agency"), placeholder: "Cost per lead too high, leads are low quality, can't tell what's working…" },
  ],
  influencer: [
    { id: "inf_type", label: "What kind of campaign?", type: "choice", required: true, options: ["One-off launch", "Ongoing ambassadors", "Event / activation", "UGC for ads"] },
    { id: "inf_tier", label: "Creator size", type: "chips", options: ["Nano (under 10k)", "Micro (10k – 100k)", "Macro (100k – 1M)", "Celebrity (1M+)", "Not sure"] },
    { id: "inf_platforms", label: "Platforms", type: "chips", options: ["Instagram", "TikTok", "Snapchat", "YouTube"] },
  ],
  seo: [
    { id: "seo_goal", label: "What do you want to win?", type: "chips", required: true, options: ["Rank higher on Google", "Get cited in AI answers (ChatGPT, Perplexity, AI Overviews)", "Local search & Google Maps", "Fix technical SEO issues"] },
    { id: "seo_lang", label: "Search language", type: "choice", required: true, options: ["Arabic", "English", "Both"] },
    { id: "seo_history", label: "Has SEO been done before?", type: "choice", options: ["Never", "In-house", "By an agency"] },
  ],
  behaviour: [
    { id: "bi_question", label: "What do you need to understand?", type: "chips", required: true, options: ["Why visitors don't convert", "Who our best customers really are", "Which messages and offers work", "Why customers leave", "How our pricing is perceived"] },
    { id: "bi_data", label: "What data do you already have?", type: "chips", options: ["Google Analytics / GA4", "CRM data", "Sales data", "Surveys or reviews", "Nothing yet"] },
  ],
  website: [
    { id: "web_stage", label: "New site or redesign?", type: "choice", required: true, options: ["New website", "Redesign an existing site"] },
    { id: "web_type", label: "What kind of site?", type: "choice", required: true, options: ["Company / corporate", "E-commerce store", "Landing page(s)", "Booking / services", "Portfolio"] },
    { id: "web_products", label: "How many products?", type: "choice", required: true, when: (a) => is(a, "web_type", "E-commerce store"), options: ["Under 50", "50 – 500", "500+"] },
    { id: "web_platform", label: "Preferred platform", type: "choice", when: (a) => is(a, "web_type", "E-commerce store"), options: ["Shopify", "WooCommerce", "Custom build", "Not sure"] },
    { id: "web_pages", label: "Roughly how many pages?", type: "choice", when: (a) => !!a.web_type && !is(a, "web_type", "Landing page(s)", "E-commerce store"), options: ["1 – 5", "6 – 15", "16 – 40", "40+"] },
    { id: "web_lang", label: "Site language", type: "choice", required: true, options: ["English", "Arabic (RTL)", "Both"] },
    { id: "web_features", label: "Anything it must do?", type: "chips", options: ["Edit content ourselves (CMS)", "Blog / news", "Booking & scheduling", "Online payments", "Member login", "CRM / form integrations"] },
    { id: "web_content", label: "Is the content ready?", type: "choice", options: ["Copy and images ready", "Partially", "We need help with content"] },
  ],
  app: [
    { id: "app_stage", label: "Where is the app today?", type: "choice", required: true, options: ["Just an idea", "Designs are ready", "MVP to improve", "Live app to scale"] },
    { id: "app_idea", label: "Describe the idea in a few lines", type: "textarea", required: true, when: (a) => is(a, "app_stage", "Just an idea"), placeholder: "Who it's for, the problem it solves, the one thing it must do well." },
    { id: "app_link", label: "Link to the app or prototype", type: "text", when: (a) => is(a, "app_stage", "Designs are ready", "MVP to improve", "Live app to scale"), placeholder: "App Store / Play Store / Figma link" },
    { id: "app_platforms", label: "Platforms", type: "chips", required: true, options: ["iOS", "Android", "Web app", "Admin dashboard"] },
    { id: "app_features", label: "Key features", type: "chips", options: ["User accounts", "Payments", "Booking", "Chat / messaging", "Maps & location", "Push notifications", "Third-party integrations"] },
  ],
  ai: [
    { id: "ai_area", label: "What would you like to automate?", type: "chips", required: true, options: ["Lead capture & follow-up", "WhatsApp / chat assistant", "Customer support", "Content production", "Reporting & dashboards", "Internal operations"] },
    { id: "ai_tools", label: "Tools you already use", type: "text", placeholder: "e.g. HubSpot, Zoho, Google Sheets, WhatsApp Business" },
    { id: "ai_hours", label: "How much manual time does this take today?", type: "choice", options: ["A few hours a week", "A day or more a week", "A full-time role", "Not sure"] },
  ],
  unsure: [
    { id: "unsure_problem", label: "What's the problem you're trying to solve?", type: "textarea", required: true, placeholder: "e.g. Our units sit empty while competitors fill theirs. Our ads get clicks but no enquiries." },
  ],
};

// ---------------------------------------------------------------------------
// Steps. Step 1 (services) and step 2 (per-service details) are special-cased
// in the UI; steps 3 and 4 are plain field lists.
export const GOAL_FIELDS = [
  { id: "goal", label: "What matters most right now?", type: "choice", required: true, options: ["More leads & enquiries", "More online sales", "Launch something new", "Brand awareness", "Enter a new market", "Fix what isn't working"] },
  { id: "markets", label: "Which markets?", type: "chips", required: true, options: ["UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman", "United Kingdom", "Other"] },
  { id: "markets_other", label: "Which other markets?", type: "text", required: true, when: (a) => includes(a, "markets", "Other"), placeholder: "e.g. Egypt, Jordan" },
  {
    id: "budget_monthly",
    label: "Monthly budget for ongoing work",
    labelWhen: (a) => (onlyUnsure(a) ? "Rough monthly budget" : hasProject(a) ? "Monthly budget for ongoing work" : "Monthly budget"),
    hint: "Retainer fees, excluding ad spend. In USD.",
    type: "choice",
    required: true,
    when: (a) => hasOngoing(a) || onlyUnsure(a),
    options: BUDGET_MONTHLY,
  },
  {
    id: "budget_project",
    label: "Budget for one-off projects",
    labelWhen: (a) => (hasOngoing(a) ? "Budget for one-off projects" : "Project budget"),
    hint: "In USD. A range is fine. It helps us propose the right scope.",
    type: "choice",
    required: true,
    when: (a) => hasProject(a),
    options: BUDGET_PROJECT,
  },
  { id: "timeline", label: "When do you want to start?", type: "choice", required: true, options: ["As soon as possible", "Within a month", "In 1 – 3 months", "Just exploring"] },
  { id: "challenge", label: "What's working, and what isn't?", type: "textarea", placeholder: "Far more useful to us than \"we need marketing help\". A couple of lines is plenty.", max: 2000 },
];

export const CONTACT_FIELDS = [
  { id: "name", label: "Your name", type: "text", required: true, autoComplete: "name", half: true },
  { id: "email", label: "Work email", type: "email", required: true, autoComplete: "email", half: true },
  { id: "company", label: "Company / brand", type: "text", required: true, autoComplete: "organization", half: true },
  { id: "role", label: "Your role", type: "text", autoComplete: "organization-title", half: true, placeholder: "Optional" },
  {
    id: "website",
    label: "Website",
    labelWhen: (a) => (websiteRequired(a) ? "Website we'll be working on" : "Website"),
    type: "url",
    required: websiteRequired,
    autoComplete: "url",
    placeholder: "yourbrand.com",
    half: true,
  },
  { id: "instagram", label: "Instagram", type: "text", placeholder: "@yourbrand (optional)", half: true, when: (a) => has(a, "social") || has(a, "content") || has(a, "influencer") || has(a, "ads") },
  { id: "source", label: "How did you hear about us?", type: "select", options: ["Instagram", "Google search", "AI assistant (ChatGPT, Perplexity…)", "Referral", "LinkedIn", "Other"], placeholder: "Optional" },
  { id: "next_step", label: "What should happen next?", type: "choice", required: true, options: ["Email me a proposal", "Let's get on a call"] },
];

export const STEPS = [
  { id: "services", title: "Services", heading: "What can we help with?", sub: "Pick everything that applies. We'll only ask about what you choose." },
  { id: "details", title: "Details", heading: "A few specifics", sub: "Just enough for us to come back with something useful, not a generic deck." },
  { id: "goals", title: "Goals", heading: "Goals, budget & timing", sub: "Ranges are fine. This is how we size the proposal to you." },
  { id: "contact", title: "You", heading: "Who should we reply to?", sub: "We reply within one business day." },
  { id: "review", title: "Review", heading: "Check your brief", sub: "Edit anything before you send it." },
];

// ---------------------------------------------------------------------------
// Rule engine.
export const isVisible = (field, a) => (typeof field.when === "function" ? !!field.when(a) : true);
export const isRequired = (field, a) => (typeof field.required === "function" ? !!field.required(a) : !!field.required);
export const fieldLabel = (field, a) => (typeof field.labelWhen === "function" ? field.labelWhen(a) : field.label);
export const optionValue = (o) => (typeof o === "string" ? o : o.v);
export const visibleOptions = (field, a) =>
  (field.options || []).filter((o) => typeof o === "string" || typeof o.when !== "function" || o.when(a)).map(optionValue);

/** Service blocks for step 2, in the order the visitor selected them. */
export function detailBlocks(a) {
  return sel(a)
    .filter((id) => SERVICE_QUESTIONS[id])
    .map((id) => ({ id, name: serviceName(id), fields: SERVICE_QUESTIONS[id].filter((f) => isVisible(f, a)) }));
}

export function fieldsForStep(stepId, a) {
  if (stepId === "details") return detailBlocks(a).flatMap((b) => b.fields);
  if (stepId === "goals") return GOAL_FIELDS.filter((f) => isVisible(f, a));
  if (stepId === "contact") return CONTACT_FIELDS.filter((f) => isVisible(f, a));
  return [];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_RE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;

function isEmpty(v) {
  return v == null || (Array.isArray(v) ? v.length === 0 : String(v).trim() === "");
}

/** Validate one field. Returns an error message or null. */
export function validateField(field, a) {
  const v = a[field.id];
  if (isEmpty(v)) return isRequired(field, a) ? (field.type === "chips" || field.type === "choice" ? "Pick at least one option" : "This one's required") : null;
  if (field.type === "email" && !EMAIL_RE.test(String(v).trim())) return "That email doesn't look right";
  if (field.type === "url" && !URL_RE.test(String(v).trim())) return "Enter a web address like yourbrand.com";
  if (field.type === "choice" && !visibleOptions(field, a).includes(v)) return "Pick one of the options";
  if (field.type === "chips") {
    const allowed = visibleOptions(field, a);
    if (!Array.isArray(v) || v.some((x) => !allowed.includes(x))) return "Pick from the options";
  }
  if (typeof v === "string" && v.length > (field.max || 500)) return `Keep it under ${field.max || 500} characters`;
  return null;
}

/** Validate a step. Returns { [fieldId]: message }. */
export function validateStep(stepId, a) {
  const errors = {};
  if (stepId === "services") {
    if (sel(a).length === 0) errors.services = "Pick at least one service, or \"Not sure yet\"";
    return errors;
  }
  for (const f of fieldsForStep(stepId, a)) {
    const e = validateField(f, a);
    if (e) errors[f.id] = e;
  }
  return errors;
}

/** Drop answers for fields that are no longer visible (or options no longer offered). */
export function pruneAnswers(a) {
  const out = { services: [...new Set(sel(a))].filter((id) => SERVICE_BY_ID[id]) };
  const base = { ...a, services: out.services };
  for (const stepId of ["details", "goals", "contact"]) {
    for (const f of fieldsForStep(stepId, base)) {
      const v = a[f.id];
      if (isEmpty(v)) continue;
      if (f.type === "chips") {
        const allowed = visibleOptions(f, base);
        const kept = (Array.isArray(v) ? v : []).filter((x) => allowed.includes(x));
        if (kept.length) out[f.id] = kept;
      } else {
        out[f.id] = typeof v === "string" ? v.trim() : v;
      }
    }
  }
  return out;
}

/** Ordered sections of { label, value } rows: used by the review step and the email. */
export function summarize(a) {
  const fmt = (v) => (Array.isArray(v) ? v.join(", ") : String(v));
  const rows = (fields) =>
    fields.filter((f) => !isEmpty(a[f.id])).map((f) => ({ id: f.id, label: fieldLabel(f, a), value: fmt(a[f.id]) }));
  return [
    { step: "services", title: "Services", rows: [{ id: "services", label: "Selected", value: sel(a).map(serviceName).join(", ") }] },
    ...detailBlocks(a).map((b) => ({ step: "details", title: b.name, rows: rows(b.fields) })),
    { step: "goals", title: "Goals, budget & timing", rows: rows(fieldsForStep("goals", a)) },
    { step: "contact", title: "Contact", rows: rows(fieldsForStep("contact", a)) },
  ].filter((s) => s.rows.length);
}

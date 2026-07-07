// Hearty Supabase Edge Function
// sync-hearty-lead-to-brevo — v35r server-side Brevo sender
// Supports both direct browser payloads and Supabase Database Webhook INSERT payloads from meal_plan_leads.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type AnyRecord = Record<string, unknown>;

function jsonResponse(body: AnyRecord, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}
function cleanText(value: unknown, max = 50000) {
  return String(value || "").replace(/\r\n/g, "\n").trim().slice(0, max);
}
function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function firstNameFrom(name: string) {
  return String(name || "").trim().split(/\s+/)[0] || "";
}
function asObject(value: unknown): AnyRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as AnyRecord : {};
}
function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  try { return JSON.parse(trimmed); } catch (_err) { return value; }
}
function arrayFrom(value: unknown): unknown[] {
  const parsed = parseMaybeJson(value);
  if (Array.isArray(parsed)) return parsed;
  const obj = asObject(parsed);
  if (Array.isArray(obj.days)) return obj.days;
  return [];
}
function mealTitle(meal: unknown): string {
  const m = asObject(meal);
  return cleanText(m.render_template || m.title || m.name || m.meal || m.label || "", 220);
}
function mealDescription(meal: unknown): string {
  const m = asObject(meal);
  return cleanText(m.instruction || m.description || m.notes || m.prep || "", 700);
}
function collectShopping(days: unknown[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const rawDay of days) {
    const day = asObject(rawDay);
    for (const key of ["breakfast", "lunch", "dinner", "snack", "snacks"]) {
      const meal = asObject(day[key]);
      const list = Array.isArray(meal.shopping_list_items) ? meal.shopping_list_items : [];
      for (const raw of list) {
        const item = cleanText(raw, 120);
        const lower = item.toLowerCase();
        if (item && !seen.has(lower)) { seen.add(lower); out.push(item); }
      }
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}
function buildPlanTextFromRecord(record: AnyRecord): string {
  const explicit = cleanText(record.plan_text || record.planText || "", 50000);
  if (explicit) return explicit;
  const days = arrayFrom(record.generated_plan || record.plan || record.days).slice(0, 7);
  const lines: string[] = ["Hearty 7-day GLP-1 meal plan", ""];
  if (!days.length) {
    lines.push("Thanks for using the Hearty GLP-1 meal planner.");
    lines.push("Your on-page plan was generated successfully. If this email does not include the full plan, please open the meal plan page again from your browser history.");
    return lines.join("\n");
  }
  for (const rawDay of days) {
    const day = asObject(rawDay);
    lines.push(`Day ${cleanText(day.day || "", 20) || ""}`.trim());
    const summary = cleanText(day.nutritionSummary || day.nutrition_summary || day.daily_total || "", 300);
    if (summary) lines.push(summary);
    for (const key of ["breakfast", "lunch", "dinner", "snack"]) {
      const title = mealTitle(day[key]);
      if (title) {
        lines.push(`${key.charAt(0).toUpperCase()}${key.slice(1)}: ${title}`);
        const desc = mealDescription(day[key]);
        if (desc) lines.push(`  ${desc}`);
      }
    }
    lines.push("");
  }
  const shopping = collectShopping(days);
  if (shopping.length) {
    lines.push("Shopping list preview:");
    for (const item of shopping) lines.push(`- ${item}`);
  }
  return lines.join("\n");
}
function normalizeInput(input: AnyRecord): AnyRecord {
  const record = asObject(input.record || input.new || input.row || input);
  const direct = input;
  const name = cleanText(direct.name || direct.firstName || record.first_name || record.name || record.firstName || "", 120);
  const generatedPlan = record.generated_plan || direct.generated_plan || direct.plan || record.plan || direct.days || record.days;
  const planText = cleanText(direct.plan_text || direct.planText || buildPlanTextFromRecord({ ...record, generated_plan: generatedPlan }), 50000);
  return {
    email: cleanEmail(direct.email || record.email),
    name,
    firstName: firstNameFrom(name),
    source: cleanText(direct.source || record.utm_source || record.source || "free_meal_plan", 120),
    campaign: cleanText(direct.campaign || record.utm_campaign || record.campaign || "free_meal_plan", 180),
    page: cleanText(direct.page || record.checkout_url || record.page || "free-meal-plan", 260),
    sendPlanEmail: direct.send_plan_email === false ? false : true,
    planSubject: cleanText(direct.plan_subject || "Your GLP-1 meal plan + shopping list", 180),
    planText,
    webhook: Boolean(input.record || input.new || input.row),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ ok: false, error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("BREVO_API_KEY") || Deno.env.get("SENDINBLUE_API_KEY") || "";
  const listIdRaw = Deno.env.get("BREVO_LIST_ID") || Deno.env.get("HEARTY_BREVO_LIST_ID") || "";
  const listId = Number.parseInt(listIdRaw, 10);
  const senderEmail = Deno.env.get("BREVO_SENDER_EMAIL") || Deno.env.get("HEARTY_BREVO_SENDER_EMAIL") || "info@hearty.health";
  const senderName = Deno.env.get("BREVO_SENDER_NAME") || Deno.env.get("HEARTY_BREVO_SENDER_NAME") || "Hearty";
  if (!apiKey) return jsonResponse({ ok: false, error: "Missing BREVO_API_KEY" }, 500);

  let input: AnyRecord = {};
  try { input = await req.json(); } catch (_err) { return jsonResponse({ ok: false, error: "Invalid JSON" }, 400); }

  const normalized = normalizeInput(input);
  const email = cleanEmail(normalized.email);
  const name = cleanText(normalized.name, 120);
  const firstName = firstNameFrom(name);
  const campaign = cleanText(normalized.campaign || "free_meal_plan", 180);
  const source = cleanText(normalized.source || "free_meal_plan", 120);
  const page = cleanText(normalized.page || "", 260);
  const sendPlanEmail = Boolean(normalized.sendPlanEmail);
  const planSubject = cleanText(normalized.planSubject || "Your GLP-1 meal plan + shopping list", 180);
  const planText = cleanText(normalized.planText || "", 50000);

  if (!/^\S+@\S+\.\S+$/.test(email)) return jsonResponse({ ok: false, error: "Invalid email", webhook: Boolean(normalized.webhook) }, 400);

  const attributes: Record<string, string> = { FIRSTNAME: firstName, SOURCE: source, CAMPAIGN: campaign, PAGE: page };
  const contactPayload: AnyRecord = { email, attributes, updateEnabled: true };
  if (Number.isFinite(listId)) contactPayload.listIds = [listId];

  let contact_ok = false, contact_status = 0, contact_error = "";
  try {
    const contactRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify(contactPayload),
    });
    contact_status = contactRes.status;
    const contactBody = await contactRes.text();
    contact_ok = contactRes.ok;
    if (!contact_ok && /already|duplicate|exists/i.test(contactBody)) {
      const updatePayload: AnyRecord = { attributes };
      if (Number.isFinite(listId)) updatePayload.listIds = [listId];
      const updateRes = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: JSON.stringify(updatePayload),
      });
      contact_status = updateRes.status;
      const updateBody = await updateRes.text();
      contact_ok = updateRes.ok;
      if (!contact_ok) contact_error = updateBody;
    } else if (!contact_ok) contact_error = contactBody;
  } catch (err) { contact_error = err instanceof Error ? err.message : String(err); }

  let plan_email_sent = false, plan_email_status = 0, plan_email_error = "";
  if (sendPlanEmail && planText) {
    const safePlan = escapeHtml(planText);
    const htmlContent = `<div style="font-family:Arial,sans-serif;line-height:1.45;color:#102a43;max-width:720px;margin:0 auto;"><h2 style="color:#0c5b97;margin-bottom:8px;">Your GLP-1 meal plan</h2><p>Here is your simple text copy. You can save this email or copy it into your notes.</p><pre style="white-space:pre-wrap;font-family:Arial,sans-serif;background:#f7fbff;border:1px solid #d9e8f5;border-radius:14px;padding:16px;line-height:1.45;">${safePlan}</pre></div>`;
    try {
      const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email, name: name || undefined }],
          subject: planSubject,
          textContent: planText,
          htmlContent,
          tags: ["hearty-free-meal-plan", normalized.webhook ? "server-webhook" : "direct"],
        }),
      });
      plan_email_status = emailRes.status;
      const emailBody = await emailRes.text();
      plan_email_sent = emailRes.ok;
      if (!plan_email_sent) plan_email_error = emailBody;
    } catch (err) { plan_email_error = err instanceof Error ? err.message : String(err); }
  }

  return jsonResponse({
    ok: contact_ok || plan_email_sent,
    version: "v35r_server_side_brevo",
    webhook: Boolean(normalized.webhook),
    contact_ok,
    contact_status,
    contact_error,
    plan_email_requested: sendPlanEmail,
    plan_text_length: planText.length,
    plan_email_sent,
    email_ok: plan_email_sent,
    plan_email_status,
    plan_email_error,
  });
});

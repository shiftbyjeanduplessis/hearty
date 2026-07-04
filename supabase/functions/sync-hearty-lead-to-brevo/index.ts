// Hearty Supabase Edge Function
// sync-hearty-lead-to-brevo — v35p plain text plan email
// Env vars needed in Supabase Function settings:
// BREVO_API_KEY
// BREVO_LIST_ID (optional but recommended)
// BREVO_SENDER_EMAIL (verified Brevo sender, e.g. hello@hearty.health)
// BREVO_SENDER_NAME (optional, defaults to Hearty)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
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
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function firstNameFrom(name: string) {
  return String(name || "").trim().split(/\s+/)[0] || "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("BREVO_API_KEY") || Deno.env.get("SENDINBLUE_API_KEY") || "";
  const listIdRaw = Deno.env.get("BREVO_LIST_ID") || Deno.env.get("HEARTY_BREVO_LIST_ID") || "";
  const listId = Number.parseInt(listIdRaw, 10);
  const senderEmail = Deno.env.get("BREVO_SENDER_EMAIL") || Deno.env.get("HEARTY_BREVO_SENDER_EMAIL") || "hello@hearty.health";
  const senderName = Deno.env.get("BREVO_SENDER_NAME") || Deno.env.get("HEARTY_BREVO_SENDER_NAME") || "Hearty";

  if (!apiKey) {
    return jsonResponse({ ok: false, error: "Missing BREVO_API_KEY" }, 500);
  }

  let input: Record<string, unknown> = {};
  try {
    input = await req.json();
  } catch (_err) {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
  }

  const email = cleanEmail(input.email);
  const name = cleanText(input.name || input.firstName || "", 120);
  const firstName = firstNameFrom(name);
  const campaign = cleanText(input.campaign || "free_meal_plan", 180);
  const source = cleanText(input.source || "free_meal_plan", 120);
  const page = cleanText(input.page || "", 260);
  const sendPlanEmail = Boolean(input.send_plan_email);
  const planSubject = cleanText(input.plan_subject || "Your GLP-1 meal plan + shopping list", 180);
  const planText = cleanText(input.plan_text || "", 50000);

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return jsonResponse({ ok: false, error: "Invalid email" }, 400);
  }

  const attributes: Record<string, string> = {
    FIRSTNAME: firstName,
    SOURCE: source,
    CAMPAIGN: campaign,
    PAGE: page,
  };

  const contactPayload: Record<string, unknown> = {
    email,
    attributes,
    updateEnabled: true,
  };
  if (Number.isFinite(listId)) {
    contactPayload.listIds = [listId];
  }

  let contact_ok = false;
  let contact_status = 0;
  let contact_error = "";

  try {
    const contactRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(contactPayload),
    });
    contact_status = contactRes.status;
    const contactBody = await contactRes.text();
    contact_ok = contactRes.ok;

    if (!contact_ok && /already|duplicate|exists/i.test(contactBody)) {
      const updatePayload: Record<string, unknown> = { attributes };
      if (Number.isFinite(listId)) {
        updatePayload.listIds = [listId];
      }
      const updateRes = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify(updatePayload),
      });
      contact_status = updateRes.status;
      const updateBody = await updateRes.text();
      contact_ok = updateRes.ok;
      if (!contact_ok) contact_error = updateBody;
    } else if (!contact_ok) {
      contact_error = contactBody;
    }
  } catch (err) {
    contact_error = err instanceof Error ? err.message : String(err);
  }

  let plan_email_sent = false;
  let plan_email_status = 0;
  let plan_email_error = "";

  if (sendPlanEmail && planText) {
    const safePlan = escapeHtml(planText);
    const htmlContent = `
      <div style="font-family:Arial,sans-serif;line-height:1.45;color:#102a43;max-width:720px;margin:0 auto;">
        <h2 style="color:#0c5b97;margin-bottom:8px;">Your GLP-1 meal plan</h2>
        <p>Here is your simple text copy. You can save this email or copy it into your notes.</p>
        <pre style="white-space:pre-wrap;font-family:Arial,sans-serif;background:#f7fbff;border:1px solid #d9e8f5;border-radius:14px;padding:16px;line-height:1.45;">${safePlan}</pre>
      </div>`;

    try {
      const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email, name: name || undefined }],
          subject: planSubject,
          textContent: planText,
          htmlContent,
          tags: ["hearty-free-meal-plan"],
        }),
      });
      plan_email_status = emailRes.status;
      const emailBody = await emailRes.text();
      plan_email_sent = emailRes.ok;
      if (!plan_email_sent) plan_email_error = emailBody;
    } catch (err) {
      plan_email_error = err instanceof Error ? err.message : String(err);
    }
  }

  return jsonResponse({
    ok: contact_ok || plan_email_sent,
    contact_ok,
    contact_status,
    contact_error,
    plan_email_requested: sendPlanEmail,
    plan_email_sent,
    email_ok: plan_email_sent,
    plan_email_status,
    plan_email_error,
  });
});

const API_KEY = process.env.RESEND_API_KEY || process.env.MAILJET_API_KEY || "";
const FROM = process.env.EMAIL_FROM || "noreply@pmtool.local";

export async function sendEmail({ to, subject, html, text }) {
  if (!API_KEY) {
    console.log(`[email] Would send email to=${to} subject="${subject}" (no API key configured)`);
    return { queued: false, mock: true };
  }

  if (process.env.RESEND_API_KEY) {
    return sendViaResend({ to, subject, html, text });
  }
  if (process.env.MAILJET_API_KEY) {
    return sendViaMailjet({ to, subject, html, text });
  }
  return sendViaSMTP({ to, subject, html, text });
}

async function sendViaResend({ to, subject, html, text }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html, text }),
  });
  if (!res.ok) throw new Error(`Resend error: ${res.status} ${await res.text()}`);
  return { queued: true, provider: "resend", id: (await res.json()).id };
}

async function sendViaMailjet({ to, subject, html, text }) {
  const secret = process.env.MAILJET_API_SECRET || "";
  const auth = Buffer.from(`${API_KEY}:${secret}`).toString("base64");
  const res = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      Messages: [{ From: { Email: FROM }, To: [{ Email: to }], Subject: subject, HTMLPart: html, TextPart: text }],
    }),
  });
  if (!res.ok) throw new Error(`Mailjet error: ${res.status} ${await res.text()}`);
  return { queued: true, provider: "mailjet", id: (await res.json()).Messages?.[0]?.To?.[0]?.MessageID };
}

async function sendViaSMTP({ to, subject, html, text }) {
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await transporter.sendMail({ from: FROM, to, subject, html, text });
  return { queued: true, provider: "smtp" };
}

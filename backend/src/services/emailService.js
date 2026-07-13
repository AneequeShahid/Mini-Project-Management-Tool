import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail({ to, subject, text, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[Email Fallback] To: ${to} | Subject: ${subject} | Body: ${text}`);
    return { success: true, fallback: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"PM Tool" <${process.env.EMAIL_FROM || "no-reply@pmtool.com"}>`,
      to,
      subject,
      text,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("Email error:", err.message);
    return { success: false, error: err.message };
  }
}

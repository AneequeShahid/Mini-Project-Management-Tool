import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendNotificationEmail(to, subject, content) {
  if (!resend) {
    console.log('[Email] RESEND_API_KEY not configured, skipping email send');
    return;
  }
  try {
    await resend.emails.send({
      from: 'ProjectTool <notifications@yourdomain.com>',
      to,
      subject,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f172a; padding: 24px; border-radius: 12px;">
            <h2 style="color: #f1f5f9; margin: 0 0 16px;">${subject}</h2>
            <div style="color: #94a3b8; line-height: 1.6;">${content}</div>
          </div>
        </div>
      `
    });
    console.log(`[Email] Notification email sent to ${to}`);
  } catch (err) {
    console.error('[Email] Failed:', err.message);
  }
}

export default sendNotificationEmail;

import { Router, Request, Response } from 'express';
import { emailService } from '../email/emailService.js';

const router = Router();

// In-memory rate limiting: Max 3 requests per IP / email per 15 minutes
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 mins
  const maxAllowed = 3;

  const timestamps = (rateLimitMap.get(key) || []).filter(t => now - t < windowMs);
  if (timestamps.length >= maxAllowed) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return true;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body || {};

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ message: 'Please enter a valid name (2-100 characters).' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim()) || email.trim().length > 150) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3 || subject.trim().length > 150) {
      return res.status(400).json({ message: 'Please enter a subject (3-150 characters).' });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 3000) {
      return res.status(400).json({ message: 'Message must be between 10 and 3,000 characters.' });
    }

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const rateLimitKey = `${clientIp}_${email.trim().toLowerCase()}`;

    if (!checkRateLimit(rateLimitKey)) {
      return res.status(429).json({
        message: 'Too many contact requests. Please wait 15 minutes before sending another message.'
      });
    }

    const cleanName = escapeHtml(name.trim());
    const cleanEmail = escapeHtml(email.trim());
    const cleanSubject = escapeHtml(subject.trim());
    const cleanMessage = escapeHtml(message.trim()).replace(/\n/g, '<br/>');
    const timestamp = new Date().toUTCString();

    const adminEmail = process.env.ADMIN_CONTACT_EMAIL
      || process.env.GMAIL_USER
      || process.env.SMTP_USER
      || 'buildo.ai.work@gmail.com';

    // 2. Email 1 — Internal Admin Notification (Reply-To user email)
    const adminHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .badge { display: inline-block; background-color: #e0e7ff; color: #4338ca; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px; }
          h2 { margin-top: 0; font-size: 20px; color: #0f172a; }
          .field { margin-bottom: 16px; }
          .label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
          .value { font-size: 14px; color: #1e293b; line-height: 1.6; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
          .footer { margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; pt-16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">New Contact Submission</span>
          <h2>Buildo Contact Inquiry</h2>
          <div class="field">
            <div class="label">Name</div>
            <div class="value">${cleanName}</div>
          </div>
          <div class="field">
            <div class="label">Email</div>
            <div class="value">${cleanEmail}</div>
          </div>
          <div class="field">
            <div class="label">Subject</div>
            <div class="value">${cleanSubject}</div>
          </div>
          <div class="field">
            <div class="label">Message</div>
            <div class="value">${cleanMessage}</div>
          </div>
          <div class="field">
            <div class="label">Submitted At</div>
            <div class="value">${timestamp}</div>
          </div>
          <div class="footer">
            Buildo Automated Contact Service • Reply directly to this email to respond to ${cleanEmail}.
          </div>
        </div>
      </body>
      </html>
    `;

    const adminEmailResult = await emailService.send({
      to: adminEmail,
      subject: `New Buildo Contact — ${subject.trim()}`,
      html: adminHtml,
      text: `New Buildo Contact\nName: ${name.trim()}\nEmail: ${email.trim()}\nSubject: ${subject.trim()}\nMessage: ${message.trim()}\nTime: ${timestamp}`,
      replyTo: email.trim()
    });

    if (!adminEmailResult.success) {
      console.error('[Contact Route] Failed to send internal admin notification:', adminEmailResult.error);
    }

    // 3. Email 2 — User Confirmation
    const userHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7F5F0; color: #0e0f14; margin: 0; padding: 32px 16px; }
          .container { max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E5E0D5; border-radius: 16px; padding: 40px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
          .brand { font-family: monospace; font-size: 20px; font-weight: 800; letter-spacing: -0.03em; color: #0e0f14; margin-bottom: 24px; }
          h1 { font-size: 22px; font-weight: 700; color: #0e0f14; margin: 0 0 12px 0; }
          p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0; }
          .quote-box { background-color: #F8FAFC; border-left: 4px solid #4b8ebc; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 24px 0; }
          .quote-subject { font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 6px; }
          .quote-msg { font-size: 13px; color: #334155; line-height: 1.6; }
          .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #F1F5F9; padding-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand">BUILDO</div>
          <h1>We received your message</h1>
          <p>Hi ${cleanName},</p>
          <p>Thanks for reaching out to Buildo. We've received your inquiry and our team will review it shortly.</p>
          <div class="quote-box">
            <div class="quote-subject">${cleanSubject}</div>
            <div class="quote-msg">${cleanMessage}</div>
          </div>
          <p>We'll get back to you as soon as possible.</p>
          <p>Warm regards,<br/><strong>The Buildo Team</strong><br/><span style="color:#64748b; font-size:12px;">From thought to website.</span></p>
          <div class="footer">
            © 2026 Buildo. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    await emailService.send({
      to: email.trim(),
      subject: 'We received your message — Buildo',
      html: userHtml,
      text: `Hi ${name.trim()},\n\nThanks for reaching out to Buildo. We've received your message:\n\nSubject: ${subject.trim()}\nMessage: ${message.trim()}\n\nWe'll get back to you as soon as possible.\n\nBuildo Team`
    });

    return res.status(200).json({
      success: true,
      message: "Message sent! Thanks for reaching out to Buildo. We've received your message and sent a copy to your email address."
    });

  } catch (error: any) {
    console.error('[Contact Route] Error handling contact form submission:', error);
    return res.status(500).json({
      message: "We couldn't send your message right now. Please try again."
    });
  }
});

export default router;

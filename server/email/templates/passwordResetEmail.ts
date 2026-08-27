import { renderEmailWrapper, escapeHtml } from './emailWrapper.js'
import { PasswordResetEmailData } from '../types.js'

export const renderPasswordResetEmail = (data: PasswordResetEmailData): string => {
  const name = escapeHtml(data.name || 'Creator')
  const resetUrl = data.resetUrl
  const expiresInMinutes = data.expiresInMinutes || 60

  const contentHtml = `
    <div style="text-align: center;">
      <div style="display: inline-block; padding: 10px 16px; background-color: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 999px; margin-bottom: 20px;">
        <span style="color: #818cf8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Security Notification</span>
      </div>

      <h2 style="color: #f3f4f6; font-size: 22px; margin: 0 0 12px 0; font-weight: 700; letter-spacing: -0.3px;">
        Reset Your Buildo Password
      </h2>

      <p style="color: #d1d5db; font-size: 14px; margin: 0 0 8px 0;">Hi ${name},</p>

      <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0;">
        We received a request to reset the password for your Buildo account. Click the secure button below to create a new password:
      </p>

      <div style="margin: 28px 0;">
        <a href="${resetUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);">
          Reset Password
        </a>
      </div>

      <div style="background-color: #08080a; border: 1px solid #22242c; border-radius: 12px; padding: 16px; margin-top: 24px; text-align: left;">
        <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
          <strong style="color: #9ca3af;">Security Note:</strong> If you didn't request a password reset, you can safely ignore this email. Your account remains secure. This reset link will expire in <strong>${expiresInMinutes} minutes</strong>.
        </p>
      </div>
    </div>
  `

  return renderEmailWrapper({
    title: 'Reset Your Buildo Password',
    preheader: 'We received a request to reset your Buildo account password.',
    contentHtml
  })
}

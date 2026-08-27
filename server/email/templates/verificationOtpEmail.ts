import { renderEmailWrapper, escapeHtml } from './emailWrapper.js'
import { VerificationOtpEmailData } from '../types.js'

export const renderVerificationOtpEmail = (data: VerificationOtpEmailData): string => {
  const name = escapeHtml(data.name || 'Creator')
  const rawOtp = data.otpCode || ''
  // Format OTP code with space in middle if 6 digits or format nicely
  const formattedOtp = escapeHtml(rawOtp)
  const expiresInMinutes = data.expiresInMinutes || 5

  const contentHtml = `
    <div style="text-align: center;">
      <div style="display: inline-block; padding: 10px 16px; background-color: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 999px; margin-bottom: 20px;">
        <span style="color: #818cf8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Email Verification</span>
      </div>

      <h2 style="color: #f3f4f6; font-size: 22px; margin: 0 0 12px 0; font-weight: 700; letter-spacing: -0.3px;">
        Verify Your Buildo Email
      </h2>

      <p style="color: #d1d5db; font-size: 14px; margin: 0 0 8px 0;">Hi ${name},</p>

      <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0;">
        Use this verification code to confirm your email address and unlock website creation features on Buildo:
      </p>

      <div style="background-color: #08080a; border: 1px solid rgba(99, 102, 241, 0.3); padding: 20px; border-radius: 14px; margin: 24px 0; display: inline-block; min-width: 220px;">
        <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #818cf8; font-family: 'Courier New', Courier, monospace;">
          ${formattedOtp}
        </span>
      </div>

      <p style="color: #6b7280; font-size: 12px; margin: 16px 0 0 0; line-height: 1.5;">
        This code expires in <strong>${expiresInMinutes} minutes</strong>.<br />
        If you didn't create a Buildo account, you can safely ignore this email.
      </p>
    </div>
  `

  return renderEmailWrapper({
    title: `${formattedOtp} is your Buildo email verification code`,
    preheader: 'Use this code to verify your Buildo account.',
    contentHtml
  })
}

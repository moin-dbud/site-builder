import nodemailer from 'nodemailer'
import { getTransporter, resetTransporter } from './transporter.js'
import { EmailResult, SendEmailOptions } from './types.js'
import { renderWelcomeEmail } from './templates/welcomeEmail.js'
import { renderPasswordResetEmail } from './templates/passwordResetEmail.js'
import { renderVerificationOtpEmail } from './templates/verificationOtpEmail.js'

// Simple in-memory rate limiter per recipient email address
// Max 5 emails per recipient per 10-minute window to prevent spam abuse
const rateLimitMap = new Map<string, number[]>()

const checkRateLimit = (email: string): boolean => {
  const now = Date.now()
  const windowMs = 10 * 60 * 1000 // 10 minutes
  const maxEmails = 5

  const normalizedEmail = email.toLowerCase().trim()
  const timestamps = (rateLimitMap.get(normalizedEmail) || []).filter(t => now - t < windowMs)

  if (timestamps.length >= maxEmails) {
    return false
  }

  timestamps.push(now)
  rateLimitMap.set(normalizedEmail, timestamps)
  return true
}

/**
 * Mask sensitive email for safe logging (e.g., "u***r@gmail.com")
 */
const maskEmail = (email: string): string => {
  const parts = email.split('@')
  if (parts.length !== 2) return '***'
  const [user, domain] = parts
  const maskedUser = user.length <= 2 ? `${user[0] || '*'}***` : `${user[0]}***${user[user.length - 1]}`
  return `${maskedUser}@${domain}`
}

/**
 * Centralized Buildo Email Service
 */
export const emailService = {
  /**
   * Generic sender with rate limiting, retry logic, and safe logging.
   */
  send: async (options: SendEmailOptions): Promise<EmailResult> => {
    const recipient = options.to.trim()
    const maskedRecipient = maskEmail(recipient)

    // Rate limit check
    if (!checkRateLimit(recipient)) {
      console.warn(`[EMAIL-SERVICE] ⚠️ Rate limit exceeded for recipient: ${maskedRecipient}`)
      return {
        success: false,
        error: 'Too many emails requested. Please wait a few minutes before trying again.'
      }
    }

    const fromAddress = process.env.SMTP_FROM || process.env.GMAIL_USER || 'Buildo AI <buildo.ai.work@gmail.com>'
    const replyTo = options.replyTo || process.env.GMAIL_USER || process.env.SMTP_USER

    const mailOptions = {
      from: fromAddress,
      replyTo,
      to: recipient,
      subject: options.subject,
      html: options.html,
      text: options.text
    }

    let attempts = 0
    const maxAttempts = 2

    while (attempts < maxAttempts) {
      attempts++
      try {
        const transporter = await getTransporter()
        const info = await transporter.sendMail(mailOptions)

        console.log(`[EMAIL-SERVICE] ✅ Sent "${options.subject}" → to: ${maskedRecipient} (MessageID: ${info.messageId})`)

        const testUrl = nodemailer.getTestMessageUrl(info)
        if (testUrl) {
          console.log(`[EMAIL-SERVICE] Ethereal Preview URL: ${testUrl}`)
        }

        return {
          success: true,
          messageId: info.messageId,
          previewUrl: testUrl
        }
      } catch (err: any) {
        console.error(`[EMAIL-SERVICE] ❌ Attempt ${attempts}/${maxAttempts} failed for ${maskedRecipient}: ${err?.message || err}`)
        resetTransporter()

        if (attempts >= maxAttempts) {
          return {
            success: false,
            error: err?.message || 'Email delivery failed after retries.'
          }
        }

        // Short wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    return { success: false, error: 'Failed to send email' }
  },

  /**
   * Send Welcome Email to newly registered user
   */
  sendWelcomeEmail: async (toEmail: string, name: string = 'Creator'): Promise<EmailResult> => {
    const buildUrl = process.env.FRONTEND_URL || process.env.BETTER_AUTH_URL || 'https://buildo.moinsheikh.in'
    const html = renderWelcomeEmail({ name, buildUrl })
    return emailService.send({
      to: toEmail,
      subject: 'Welcome to Buildo — From thought to website',
      html
    })
  },

  /**
   * Send Password Reset Email using Better Auth reset URL
   */
  sendPasswordResetEmail: async (toEmail: string, resetUrl: string, name: string = 'Creator'): Promise<EmailResult> => {
    const html = renderPasswordResetEmail({ name, resetUrl, expiresInMinutes: 60 })
    return emailService.send({
      to: toEmail,
      subject: 'Reset your Buildo password',
      html
    })
  },

  /**
   * Send Email Verification OTP
   */
  sendVerificationOtpEmail: async (toEmail: string, otpCode: string, name: string = 'Creator'): Promise<EmailResult> => {
    const html = renderVerificationOtpEmail({ name, otpCode, expiresInMinutes: 5 })
    return emailService.send({
      to: toEmail,
      subject: `${otpCode} is your Buildo verification code`,
      html
    })
  }
}

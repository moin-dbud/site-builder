/**
 * Legacy Mailer Facade
 * Forwards requests directly to the centralized Buildo Email Service.
 */
import { emailService } from '../email/emailService.js'
import { verifyTransporter } from '../email/transporter.js'

export const sendVerificationOtpEmail = async (toEmail: string, otpCode: string, name: string = 'Creator') => {
  return emailService.sendVerificationOtpEmail(toEmail, otpCode, name)
}

export const sendPasswordResetEmail = async (toEmail: string, resetUrl: string, name: string = 'Creator') => {
  return emailService.sendPasswordResetEmail(toEmail, resetUrl, name)
}

export const sendWelcomeEmail = async (toEmail: string, name: string = 'Creator') => {
  return emailService.sendWelcomeEmail(toEmail, name)
}

export const verifySMTPConnection = async () => {
  return verifyTransporter()
}

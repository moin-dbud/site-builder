export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  previewUrl?: string | false
  error?: string
}

export interface BaseTemplateData {
  name?: string
  appName?: string
  appUrl?: string
}

export interface WelcomeEmailData extends BaseTemplateData {
  name: string
  buildUrl: string
}

export interface PasswordResetEmailData extends BaseTemplateData {
  name: string
  resetUrl: string
  expiresInMinutes?: number
}

export interface VerificationOtpEmailData extends BaseTemplateData {
  name: string
  otpCode: string
  expiresInMinutes?: number
}

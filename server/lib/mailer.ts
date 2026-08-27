import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

const resetTransporter = () => {
  transporter = null
}

const getTransporter = async () => {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const rawPass = process.env.SMTP_PASS || ''
  const pass = rawPass.trim()

  if (user && pass) {
    const isGmail = host.includes('gmail') || user.endsWith('@gmail.com')
    if (isGmail) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      })
    } else {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      })
    }
  } else {
    // Generate test SMTP service (Ethereal.email) ONLY if no SMTP_USER/PASS provided
    try {
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      })
      console.log(`[NODEMAILER] Using Ethereal test email account: ${testAccount.user}`)
    } catch (err) {
      console.error('[NODEMAILER] Error creating Ethereal test account', err)
      throw new Error('SMTP credentials not configured and Ethereal test account failed.')
    }
  }

  return transporter
}

export const sendVerificationOtpEmail = async (toEmail: string, otpCode: string, name: string = 'Creator') => {
  try {
    const mailTransporter = await getTransporter()
    const fromAddress = process.env.SMTP_FROM || 'Buildo AI <buildo.ai.work@gmail.com>'
    console.log(`[NODEMAILER] Sending from: "${fromAddress}" → to: ${toEmail}`)

    const mailOptions = {
      from: fromAddress,
      replyTo: process.env.SMTP_USER,
      to: toEmail,
      subject: `${otpCode} is your Buildo email verification code`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #08080a; color: #ffffff; padding: 30px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #22242c;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #6366f1; margin: 0; font-size: 24px; font-weight: 700;">Buildo AI</h1>
            <p style="color: #9ca3af; font-size: 13px; margin-top: 4px;">AI-Powered Website Builder</p>
          </div>
          <div style="background-color: #111216; padding: 24px; border-radius: 12px; border: 1px solid #22242c; text-align: center;">
            <p style="color: #d1d5db; font-size: 14px; margin-top: 0;">Hi ${name},</p>
            <p style="color: #9ca3af; font-size: 13px; line-height: 1.5;">
              Use the 4-digit verification code below to verify your email address and unlock full website creation features on Buildo:
            </p>
            <div style="margin: 24px 0; background-color: #08080a; border: 1px border-indigo-500/30; padding: 16px; border-radius: 10px;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #818cf8; font-family: monospace;">${otpCode}</span>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-bottom: 0;">This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #4b5563; font-size: 11px;">
            &copy; ${new Date().getFullYear()} Buildo AI. All rights reserved.
          </div>
        </div>
      `
    }

    const info = await mailTransporter.sendMail(mailOptions)
    console.log(`\n==========================================`)
    console.log(`[NODEMAILER] Sent Verification OTP to ${toEmail}`)
    console.log(`[NODEMAILER] Message ID: ${info.messageId}`)
    const testUrl = nodemailer.getTestMessageUrl(info)
    if (testUrl) {
      console.log(`[NODEMAILER] Preview Ethereal URL: ${testUrl}`)
    }
    console.log(`==========================================\n`)

    return { success: true, messageId: info.messageId, previewUrl: testUrl }
  } catch (error: any) {
    console.error('[NODEMAILER] Error sending OTP email:', error.message)
    console.error('[NODEMAILER] Full error:', error)
    // Reset transporter so the next call re-initialises with fresh credentials
    resetTransporter()
    // Re-throw so the controller can respond with a proper error
    throw error
  }
}

export const sendPasswordResetEmail = async (toEmail: string, resetUrl: string, name: string = 'Creator') => {
  try {
    const mailTransporter = await getTransporter()
    const fromAddress = process.env.SMTP_FROM || 'Buildo AI <buildo.ai.work@gmail.com>'
    console.log(`[NODEMAILER] Sending Password Reset from: "${fromAddress}" → to: ${toEmail}`)

    const mailOptions = {
      from: fromAddress,
      replyTo: process.env.SMTP_USER,
      to: toEmail,
      subject: 'Reset your Buildo password',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #08080a; color: #ffffff; padding: 32px; border-radius: 20px; max-width: 520px; margin: 0 auto; border: 1px solid #22242c; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #6366f1; margin: 0; font-size: 26px; font-weight: 800; tracking-tight: -0.5px;">Buildo</h1>
            <p style="color: #9ca3af; font-size: 13px; margin-top: 4px;">From thought to website.</p>
          </div>
          <div style="background-color: #111216; padding: 28px; border-radius: 16px; border: 1px solid #22242c; text-align: center;">
            <h2 style="color: #f3f4f6; font-size: 18px; margin-top: 0; margin-bottom: 12px; font-weight: 700;">Password Reset Request</h2>
            <p style="color: #d1d5db; font-size: 14px; margin-top: 0;">Hi ${name},</p>
            <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin-bottom: 24px;">
              We received a request to reset the password for your Buildo account. Click the button below to securely create a new password:
            </p>
            <div style="margin: 28px 0;">
              <a href="${resetUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
                Reset Your Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-bottom: 0; line-height: 1.5;">
              If you didn't request a password reset, you can safely ignore this email. This link will expire in 1 hour.
            </p>
          </div>
          <div style="text-align: center; margin-top: 24px; color: #4b5563; font-size: 11px;">
            &copy; ${new Date().getFullYear()} Buildo. All rights reserved.
          </div>
        </div>
      `
    }

    const info = await mailTransporter.sendMail(mailOptions)
    console.log(`[NODEMAILER] Sent Password Reset Email to ${toEmail}`)
    console.log(`[NODEMAILER] Message ID: ${info.messageId}`)
    const testUrl = nodemailer.getTestMessageUrl(info)
    if (testUrl) {
      console.log(`[NODEMAILER] Preview Ethereal URL: ${testUrl}`)
    }
    return { success: true, messageId: info.messageId, previewUrl: testUrl }
  } catch (error: any) {
    console.error('[NODEMAILER] Error sending password reset email:', error.message)
    resetTransporter()
    throw error
  }
}

export const verifySMTPConnection = async () => {
  try {
    const t = await getTransporter()
    await t.verify()
    console.log('[NODEMAILER] ✅ SMTP connection verified successfully')
  } catch (err: any) {
    console.error('[NODEMAILER] ❌ SMTP connection FAILED:', err.message)
    console.error('[NODEMAILER] Check your SMTP_HOST, SMTP_USER, SMTP_PASS environment variables.')
    console.error('[NODEMAILER] For Gmail: make sure 2FA is ON and you are using an App Password (not your account password).')
  }
}

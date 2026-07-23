import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

const getTransporter = async () => {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const rawPass = process.env.SMTP_PASS || ''
  const pass = rawPass.replace(/[\s-]/g, '')

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
    const fromAddress = process.env.SMTP_FROM || '"Buildo AI" <noreply@buildo.com>'

    const mailOptions = {
      from: fromAddress,
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
              Use the 6-digit verification code below to verify your email address and unlock full website creation features on Buildo:
            </p>
            <div style="margin: 24px 0; background-color: #08080a; border: 1px border-indigo-500/30; padding: 16px; border-radius: 10px;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #818cf8; font-family: monospace;">${otpCode}</span>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-bottom: 0;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
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
    // Return gracefully so flow does not crash
    return { success: false, error: error.message }
  }
}

import nodemailer from 'nodemailer'

let transporterInstance: nodemailer.Transporter | null = null

export const resetTransporter = (): void => {
  transporterInstance = null
}

export const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (transporterInstance) {
    return transporterInstance
  }

  // Priority 1: Check GMAIL_USER & GMAIL_APP_PASS (portfolio reference architecture)
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER
  const gmailPass = (process.env.GMAIL_APP_PASS || process.env.SMTP_PASS || '').trim()

  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '587', 10)

  if (gmailUser && gmailPass) {
    const isGmail = host.includes('gmail') || gmailUser.endsWith('@gmail.com')
    if (isGmail) {
      transporterInstance = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      })
    } else {
      transporterInstance = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      })
    }
  } else {
    // Development fallback using Ethereal test account if credentials are not configured
    try {
      const testAccount = await nodemailer.createTestAccount()
      transporterInstance = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      })
      console.log(`[EMAIL-TRANSPORTER] Configured Ethereal test account: ${testAccount.user}`)
    } catch (err: any) {
      console.error('[EMAIL-TRANSPORTER] Failed to create Ethereal test account:', err?.message || err)
      throw new Error('SMTP credentials not configured and Ethereal test fallback failed.')
    }
  }

  return transporterInstance
}

export const verifyTransporter = async (): Promise<boolean> => {
  try {
    const transporter = await getTransporter()
    await transporter.verify()
    console.log('[EMAIL-TRANSPORTER] ✅ SMTP connection verified successfully.')
    return true
  } catch (err: any) {
    console.error('[EMAIL-TRANSPORTER] ❌ SMTP connection failed:', err?.message || err)
    resetTransporter()
    return false
  }
}

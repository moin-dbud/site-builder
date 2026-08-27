import nodemailer from 'nodemailer'
import dns from 'dns'

// Ensure Node defaults to IPv4 resolution for network connections process-wide
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first')
}

let transporterInstance: nodemailer.Transporter | null = null

export const resetTransporter = (): void => {
  transporterInstance = null
}

const createGmailTransport = (user: string, pass: string, usePort587: boolean = false): nodemailer.Transporter => {
  if (usePort587) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS
      family: 4, // Force IPv4 to avoid ENETUNREACH on IPv6 addresses
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    } as any)
  }

  return nodemailer.createTransport({
    service: 'gmail',
    family: 4, // Force IPv4 to avoid ENETUNREACH on IPv6 addresses
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  } as any)
}

export const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (transporterInstance) {
    return transporterInstance
  }

  // Priority 1: Check GMAIL_USER & GMAIL_APP_PASS (or SMTP credentials)
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER
  const rawPass = process.env.GMAIL_APP_PASS || process.env.SMTP_PASS || ''
  const gmailPass = rawPass.replace(/[\s-]/g, '').trim()

  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '587', 10)

  if (gmailUser && gmailPass) {
    const isGmail = host.includes('gmail') || gmailUser.endsWith('@gmail.com')
    if (isGmail) {
      // Try default service transport with IPv4 forced
      transporterInstance = createGmailTransport(gmailUser, gmailPass, false)
    } else {
      transporterInstance = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        family: 4, // Force IPv4
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
          user: gmailUser,
          pass: gmailPass
        },
        tls: {
          rejectUnauthorized: false
        }
      } as any)
    }
  } else {
    // Development fallback using Ethereal test account if credentials are not configured
    try {
      const testAccount = await nodemailer.createTestAccount()
      transporterInstance = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        family: 4,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      } as any)
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
    let transporter = await getTransporter()
    try {
      await transporter.verify()
    } catch (verifyErr: any) {
      const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER
      const rawPass = process.env.GMAIL_APP_PASS || process.env.SMTP_PASS || ''
      const gmailPass = rawPass.replace(/[\s-]/g, '').trim()
      const host = process.env.SMTP_HOST || 'smtp.gmail.com'
      const isGmail = host.includes('gmail') || (gmailUser && gmailUser.endsWith('@gmail.com'))

      // Fallback: If port 465 / service 'gmail' connection times out or fails, fallback to port 587 STARTTLS
      if (isGmail && gmailUser && gmailPass) {
        console.warn('[EMAIL-TRANSPORTER] ⚠️ Primary Gmail transport failed. Retrying with Port 587 STARTTLS + IPv4...')
        transporterInstance = createGmailTransport(gmailUser, gmailPass, true)
        transporter = transporterInstance
        await transporter.verify()
      } else {
        throw verifyErr
      }
    }
    console.log('[EMAIL-TRANSPORTER] ✅ SMTP connection verified successfully.')
    return true
  } catch (err: any) {
    console.error('[EMAIL-TRANSPORTER] ❌ SMTP connection failed:', err?.message || err)
    resetTransporter()
    return false
  }
}


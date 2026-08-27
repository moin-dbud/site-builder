/**
 * Safely escapes HTML special characters in dynamic user inputs
 * to prevent XSS injection attacks inside HTML email renderers.
 */
export const escapeHtml = (str: string | undefined | null): string => {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export interface EmailWrapperOptions {
  title: string
  preheader?: string
  contentHtml: string
  appUrl?: string
}

/**
 * Centralized Buildo HTML Email Shell
 * Visual Style: Editorial, minimal, dark studio theme (#08080a), indigo accents (#6366f1), 
 * clean card container (#111216) with subtle subtle borders (#22242c).
 */
export const renderEmailWrapper = ({
  title,
  preheader = 'Buildo — From thought to website.',
  contentHtml,
  appUrl = process.env.FRONTEND_URL || process.env.BETTER_AUTH_URL || 'https://buildo.moinsheikh.in'
}: EmailWrapperOptions): string => {
  const safeTitle = escapeHtml(title)
  const safePreheader = escapeHtml(preheader)
  const currentYear = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${safeTitle}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #08080a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #f3f4f6;">
  <div style="display: none; font-size: 1px; color: #08080a; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${safePreheader}
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #08080a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <a href="${appUrl}" target="_blank" style="text-decoration: none;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #6366f1; letter-spacing: -0.5px; display: inline-block;">Buildo</h1>
              </a>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #9ca3af; font-weight: 400;">From thought to website.</p>
            </td>
          </tr>

          <!-- Main Card Content -->
          <tr>
            <td style="background-color: #111216; border: 1px solid #22242c; border-radius: 20px; padding: 32px 28px; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 28px; color: #6b7280; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 8px 0;">
                <a href="${appUrl}" target="_blank" style="color: #818cf8; text-decoration: none; font-weight: 500;">Visit Buildo</a>
                &nbsp;&bull;&nbsp;
                <a href="${appUrl}/pricing" target="_blank" style="color: #9ca3af; text-decoration: none;">Pricing</a>
              </p>
              <p style="margin: 0; color: #4b5563; font-size: 11px;">
                &copy; ${currentYear} Buildo AI. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

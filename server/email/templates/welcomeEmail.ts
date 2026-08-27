import { renderEmailWrapper, escapeHtml } from './emailWrapper.js'
import { WelcomeEmailData } from '../types.js'

export const renderWelcomeEmail = (data: WelcomeEmailData): string => {
  const name = escapeHtml(data.name || 'Creator')
  const buildUrl = data.buildUrl || data.appUrl || process.env.FRONTEND_URL || 'https://buildo.moinsheikh.in'

  const contentHtml = `
    <div style="text-align: center;">
      <div style="display: inline-block; padding: 10px 16px; background-color: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 999px; margin-bottom: 20px;">
        <span style="color: #818cf8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Welcome to Buildo</span>
      </div>

      <h2 style="color: #f3f4f6; font-size: 22px; margin: 0 0 12px 0; font-weight: 700; letter-spacing: -0.3px;">
        Hi ${name}, welcome aboard!
      </h2>

      <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
        Your ideas are now just one prompt away from becoming live, beautiful, high-performing websites.
      </p>

      <div style="background-color: #08080a; border: 1px solid #22242c; border-radius: 14px; padding: 20px; text-align: left; margin-bottom: 28px;">
        <p style="color: #d1d5db; font-size: 13px; margin: 0 0 12px 0; font-weight: 600;">What you can do with Buildo:</p>
        <ul style="margin: 0; padding-left: 20px; color: #9ca3af; font-size: 13px; line-height: 1.8;">
          <li>Describe your vision in plain English</li>
          <li>Watch your full website UI build live step-by-step</li>
          <li>Customize sections, themes, typography, and interactive components</li>
          <li>Publish and launch instantly with one click</li>
        </ul>
      </div>

      <div style="margin: 28px 0 12px 0;">
        <a href="${buildUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);">
          Start Building Now &rarr;
        </a>
      </div>
    </div>
  `

  return renderEmailWrapper({
    title: 'Welcome to Buildo',
    preheader: 'Your idea is now one prompt away from becoming a real website.',
    contentHtml,
    appUrl: buildUrl
  })
}

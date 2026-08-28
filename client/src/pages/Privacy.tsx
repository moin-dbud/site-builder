import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheckIcon, CalendarIcon, ChevronRightIcon } from 'lucide-react'
import Footer from '../components/Footer'

interface Section {
  id: string
  title: string
  content: React.ReactNode
}

export const Privacy: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState('introduction')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  // Title and scroll
  useEffect(() => {
    document.title = 'Privacy Policy — Buildo'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Read Buildo privacy policy and learn how we protect your user account, website projects, and data.')
    }
    window.scrollTo(0, 0)
  }, [])

  // Motion handling
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(motionQuery.matches)
    const handleMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches)
    motionQuery.addEventListener('change', handleMotionChange)

    if (motionQuery.matches) return

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return
      const { innerWidth, innerHeight } = window
      const x = ((e.clientX / innerWidth) - 0.5) * 14
      const y = ((e.clientY / innerHeight) - 0.5) * 10
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      motionQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  const sections: Section[] = useMemo(() => [
    {
      id: 'introduction',
      title: '1. Introduction',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Buildo ("we", "us", or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy describes how we collect, store, process, and safeguard information when you visit or use our website builder platform at <code className="font-mono-tech bg-gray-100 px-1.5 py-0.5 rounded text-xs">buildo.moinsheikh.in</code> and associated services.
          </p>
          <p>
            By accessing or using Buildo, you acknowledge that you have read and understood this policy.
          </p>
        </div>
      )
    },
    {
      id: 'information-collected',
      title: '2. Information We Collect',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>We collect information you directly provide to us, as well as metadata generated automatically during your interaction with the platform:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li><strong>Account Data:</strong> Name, email address, password hashes, and username details.</li>
            <li><strong>Project Data:</strong> Prompts, website design code, HTML/CSS assets, version snapshots, and project titles.</li>
            <li><strong>Payment & Credit Data:</strong> Order IDs, credit allocation logs, and payment status returned via our payment processor.</li>
            <li><strong>Technical Data:</strong> IP addresses, browser agent headers, error logs, and session tokens.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'account-information',
      title: '3. Account Information',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            When you register an account, we store your identity information securely using Better Auth. Email addresses are used for essential transaction notifications, security OTP verification, password resets, and user service updates.
          </p>
        </div>
      )
    },
    {
      id: 'project-data',
      title: '4. Website & Project Data',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Websites created on Buildo are stored in our secure database. Private projects are restricted to your account session. If you choose to publish a project or list it on the Community showcase, your project title, author handle, and design components become visible to the public.
          </p>
        </div>
      )
    },
    {
      id: 'ai-content',
      title: '5. AI-Generated Content & Prompts',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Prompts submitted to the Buildo AI website generator are processed to return HTML/CSS code structures. Prompts and output code are logged to provide project history, allow follow-up AI revisions, and maintain quality assurance.
          </p>
        </div>
      )
    },
    {
      id: 'how-we-use',
      title: '6. How We Use Information',
      content: (
        <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <p>We use your information strictly for the following operational purposes:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>To operate, maintain, and deliver the Buildo platform functionality.</li>
            <li>To manage credit balance allocations, billing receipts, and account authentication.</li>
            <li>To respond to customer support inquiries and security alerts.</li>
            <li>To prevent fraud, abuse, rate limit violations, and security threats.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'authentication',
      title: '7. Authentication & Security',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Authentication tokens and passwords are encrypted using modern cryptographic standards (Scrypt/Bcrypt). We enforce HTTP-only cookie security flags and CORS strict origin verification on all server API endpoints.
          </p>
        </div>
      )
    },
    {
      id: 'email-communications',
      title: '8. Email Communications',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            We send transactional emails (verification OTPs, welcome guides, password resets, and contact confirmations) via our verified email infrastructure (Resend API / SMTP). We do not sell or trade your email address to third-party marketing brokers.
          </p>
        </div>
      )
    },
    {
      id: 'payments-billing',
      title: '9. Payments and Billing',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Credit pack purchases are processed securely by <strong>Cashfree Payments</strong>. Buildo does not store full credit card numbers or UPI PINs on our servers. Cashfree handles billing compliance and webhooks directly.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-950 font-medium">
            <strong className="block mb-1 text-amber-900">[OWNER REVIEW REQUIRED: Confirm refund policy & payment terms]</strong>
            Default policy: Credit pack purchases are non-refundable once credits have been consumed. Unused credit packs may be reviewed on a case-by-case basis through support.
          </div>
        </div>
      )
    },
    {
      id: 'third-party-services',
      title: '10. Third-Party Services',
      content: (
        <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <p>We work with trusted service providers to run Buildo:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li><strong>Resend / SMTP:</strong> Email delivery infrastructure.</li>
            <li><strong>Cashfree:</strong> Payment gateway and transaction handling.</li>
            <li><strong>Vercel Analytics:</strong> Privacy-focused client performance reporting.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'community-content',
      title: '11. Public & Community Content',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            When you publish a website project or enable Community Showcase visibility, your username, project title, and live design preview become publicly accessible on the web.
          </p>
        </div>
      )
    },
    {
      id: 'data-retention',
      title: '12. Data Retention',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            We retain account data and project versions for as long as your account remains active. You may request account deletion or delete specific projects directly from your dashboard at any time.
          </p>
        </div>
      )
    },
    {
      id: 'data-security',
      title: '13. Data Security',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            We implement TLS encryption for all data in transit and restricted database access control for data at rest. While no internet service can guarantee 100% security, we continuously monitor systems against unauthorized access.
          </p>
        </div>
      )
    },
    {
      id: 'cookies',
      title: '14. Cookies and Local Storage',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Buildo uses essential session cookies and local storage tokens to keep you logged in, persist workspace preferences, and remember theme states. We do not use intrusive cross-site tracking cookies.
          </p>
        </div>
      )
    },
    {
      id: 'user-rights',
      title: '15. Your Rights and Choices',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            You have the right to access, update, or delete your account information. You may update your profile details in Account Settings or contact us to exercise data subject requests.
          </p>
        </div>
      )
    },
    {
      id: 'childrens-privacy',
      title: '16. Children\'s Privacy',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Buildo is not directed toward children under 13 years of age. We do not knowingly collect personal information from children under 13.
          </p>
        </div>
      )
    },
    {
      id: 'changes-to-policy',
      title: '17. Changes to This Policy',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            We may update this Privacy Policy from time to time to reflect platform changes or legal updates. The "Last Updated" date at the top of this page indicates when revisions take effect.
          </p>
        </div>
      )
    },
    {
      id: 'contact-us',
      title: '18. Contact Us',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            If you have questions regarding this Privacy Policy or Buildo's data practices, please reach out via our <a href="/contact" className="text-sky-800 font-bold hover:underline">Contact Page</a> or email <a href="mailto:privacy@moinsheikh.in" className="text-sky-800 font-bold hover:underline">hello@moinsheikh.in</a>.
          </p>
        </div>
      )
    }
  ], [])

  const scrollToSection = (id: string) => {
    setActiveSectionId(id)
    const el = document.getElementById(id)
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top: topOffset, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#0e0f14] flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Background visual motion accent */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-32 right-1/4 size-[550px] rounded-full bg-gradient-to-b from-sky-100/40 via-indigo-50/30 to-transparent blur-3xl transition-transform duration-700 ease-out"
          style={{
            transform: !isReducedMotion
              ? `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`
              : 'none'
          }}
        />
      </div>

      <div className="relative z-10 pt-28 sm:pt-36 pb-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full flex-1">
        
        {/* Page Header */}
        <div className="max-w-3xl mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-800 text-xs font-mono tracking-wider uppercase font-semibold mb-4"
          >
            <ShieldCheckIcon className="size-3.5 text-sky-600" />
            <span>LEGAL & TRANSPARENCY</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight"
          >
            Privacy <span className="font-serif-italic text-sky-900 font-normal">Policy</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 text-xs text-gray-500 font-mono-tech mt-3"
          >
            <CalendarIcon className="size-3.5 text-gray-400" />
            <span>Last updated: August 28, 2026</span>
          </motion.div>
        </div>

        {/* Content Layout: Left Table of Contents Sticky + Right Document Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* Sticky Table of Contents Sidebar */}
          <aside className="md:col-span-4 lg:col-span-3 sticky top-28 bg-white/80 backdrop-blur-md border border-[#E5E0D5] rounded-2xl p-5 shadow-sm max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900 mb-3 pb-2 border-b border-gray-200">
              On this page
            </h3>

            <nav className="space-y-1" aria-label="Table of contents">
              {sections.map(section => {
                const isActive = activeSectionId === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-sky-900 text-white font-semibold shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="truncate">{section.title}</span>
                    <ChevronRightIcon className={`size-3 transition-transform ${isActive ? 'text-white' : 'opacity-0 group-hover:opacity-100 text-gray-400'}`} />
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Right Document Sections */}
          <main className="col-span-1 md:col-span-8 lg:col-span-9 space-y-6">
            {sections.map(section => (
              <section
                key={section.id}
                id={section.id}
                className="bg-white/90 border border-[#E5E0D5] rounded-3xl p-6 sm:p-8 shadow-sm transition-all hover:border-gray-300"
              >
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight mb-4 pb-2 border-b border-gray-100">
                  {section.title}
                </h2>

                <div className="prose prose-sm max-w-none">
                  {section.content}
                </div>
              </section>
            ))}
          </main>

        </div>

      </div>

      <Footer />
    </div>
  )
}

export default Privacy

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileTextIcon, CalendarIcon, ChevronRightIcon } from 'lucide-react'
import Footer from '../components/Footer'

interface Section {
  id: string
  title: string
  content: React.ReactNode
}

export const Terms: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState('acceptance-of-terms')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  // Title and scroll
  useEffect(() => {
    document.title = 'Terms of Service — Buildo'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Review the Terms of Service for using Buildo website generation platform and services.')
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
      id: 'acceptance-of-terms',
      title: '1. Acceptance of Terms',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            By accessing, browsing, or using Buildo ("Platform", "Service", "we", "us", or "our"), you confirm that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with these terms, you must discontinue using the Platform immediately.
          </p>
        </div>
      )
    },
    {
      id: 'about-buildo',
      title: '2. About Buildo',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Buildo provides an AI-assisted web development environment enabling users to generate, edit, preview, and publish responsive website code through natural language instructions, interactive code tools, and credit-based generation models.
          </p>
        </div>
      )
    },
    {
      id: 'eligibility',
      title: '3. Eligibility',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            You must be at least 13 years old (or the legal minimum age of digital consent in your jurisdiction) to create an account or use Buildo. By creating an account, you represent that you possess legal capacity to enter into a binding contract.
          </p>
        </div>
      )
    },
    {
      id: 'your-account',
      title: '4. Your Account',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account. You agree to notify us immediately of any unauthorized access or security breaches.
          </p>
        </div>
      )
    },
    {
      id: 'using-buildo',
      title: '5. Using Buildo & Platform Rules',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Buildo grants you a limited, non-exclusive, non-transferable, revocable license to use the Platform in accordance with these Terms. You agree not to reverse-engineer, attempt to extract backend API tokens, or overload Buildo infrastructure with automated bot traffic.
          </p>
        </div>
      )
    },
    {
      id: 'ai-generated-content',
      title: '6. AI-Generated Content & Ownership',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Subject to your compliance with these Terms, you retain full ownership rights to the final code, text content, and site designs generated for your projects through Buildo. Buildo claims no exclusive copyright over code snippets output by the generative model.
          </p>
          <p>
            You are solely responsible for ensuring that prompts and generated websites do not infringe third-party trademarks, copyrights, or privacy rights.
          </p>
        </div>
      )
    },
    {
      id: 'user-content',
      title: '7. User Content',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            You retain ownership of all assets, copy, images, and brand materials you upload or enter into Buildo. You grant Buildo a non-exclusive license to host, render, store, and display your content solely for the purpose of operating the Platform services for you.
          </p>
        </div>
      )
    },
    {
      id: 'intellectual-property',
      title: '8. Intellectual Property',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            The Buildo brand name, logo, UI design system, editor architecture, graphics, and proprietary software are protected by intellectual property laws. You may not copy or replicate Buildo branding without written permission.
          </p>
        </div>
      )
    },
    {
      id: 'public-projects',
      title: '9. Public and Community Projects',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            When you publish a website project or feature it on the Community Showcase, you grant other Buildo users permission to view, inspect, and remix your public design templates within the platform.
          </p>
        </div>
      )
    },
    {
      id: 'credits-payments',
      title: '10. Credits and Payments',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Buildo operates a credit-based utility model. New project creation and AI revision updates consume credits according to current platform rates (default: 5 credits per action). Purchased credits never expire.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-950 font-medium">
            <strong className="block mb-1 text-amber-900">[OWNER REVIEW REQUIRED: Confirm refund policy & billing rules]</strong>
            Default policy: Purchases are non-refundable once credit allocations have been drawn down. Payments are processed securely via Cashfree Payments.
          </div>
        </div>
      )
    },
    {
      id: 'prohibited-use',
      title: '11. Prohibited Use',
      content: (
        <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <p>You agree not to use Buildo to generate or publish content that:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>Is illegal, fraudulent, defamatory, or deceptive.</li>
            <li>Distributes malware, phishing landing pages, or dangerous scripts.</li>
            <li>Infringes on intellectual property rights of others.</li>
            <li>Promotes hate speech, harassment, or severe harm.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'third-party-services',
      title: '12. Third-Party Services',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Buildo integrates with third-party providers (e.g. Cashfree for payments, Resend for transactional email). Your interactions with third-party providers are governed by their respective terms and policies.
          </p>
        </div>
      )
    },
    {
      id: 'availability-changes',
      title: '13. Availability and Changes',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            We continuously improve Buildo. We reserve the right to update, modify, suspend, or discontinue any feature, endpoint, or credit cost schedule with reasonable notice where feasible.
          </p>
        </div>
      )
    },
    {
      id: 'disclaimer',
      title: '14. Disclaimer of Warranties',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p className="uppercase text-xs font-semibold tracking-wider text-gray-500">
            The platform is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. Buildo does not guarantee that AI outputs will be completely error-free or suited to every specific commercial purpose.
          </p>
        </div>
      )
    },
    {
      id: 'limitation-of-liability',
      title: '15. Limitation of Liability',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p className="text-xs text-gray-600 leading-relaxed">
            To the maximum extent permitted by law, Buildo and its operators shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use or inability to use the Platform.
          </p>
        </div>
      )
    },
    {
      id: 'account-termination',
      title: '16. Account Suspension and Termination',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            We reserve the right to suspend or terminate accounts that violate these Terms, engage in abuse, or deploy harmful phishing/malware content via published site routes.
          </p>
        </div>
      )
    },
    {
      id: 'changes-to-terms',
      title: '17. Changes to Terms',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            We may revise these Terms at any time. Continued use of Buildo after updated terms take effect constitutes your acceptance of the new terms.
          </p>
        </div>
      )
    },
    {
      id: 'contact-info',
      title: '18. Contact Information',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            For any legal questions regarding these Terms, please contact us via our <a href="/contact" className="text-sky-800 font-bold hover:underline">Contact Page</a> or by email at <a href="mailto:legal@moinsheikh.in" className="text-sky-800 font-bold hover:underline">hello@moinsheikh.in</a>.
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
          className="absolute -top-32 left-1/3 size-[550px] rounded-full bg-gradient-to-b from-indigo-100/40 via-sky-100/30 to-transparent blur-3xl transition-transform duration-700 ease-out"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-mono tracking-wider uppercase font-semibold mb-4"
          >
            <FileTextIcon className="size-3.5 text-indigo-600" />
            <span>TERMS & CONDITIONS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight"
          >
            Terms of <span className="font-serif-italic text-indigo-900 font-normal">Service</span>
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

        {/* Content Layout: Sticky Left TOC + Main Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* Table of Contents */}
          <aside className="md:col-span-4 lg:col-span-3 sticky top-28 bg-white/80 backdrop-blur-md border border-[#E5E0D5] rounded-2xl p-5 shadow-sm max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900 mb-3 pb-2 border-b border-gray-200">
              Sections
            </h3>

            <nav className="space-y-1" aria-label="Terms table of contents">
              {sections.map(section => {
                const isActive = activeSectionId === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-indigo-900 text-white font-semibold shadow-sm'
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

          {/* Right Main Body */}
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

export default Terms

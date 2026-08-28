import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MailIcon, SendIcon, CheckCircle2Icon, AlertCircleIcon, Loader2Icon, MessageSquareIcon, HelpCircleIcon, BugIcon, HandshakeIcon, ArrowLeftIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '@/configs/axios'
import Footer from '../components/Footer'

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  // Title & reset scroll
  useEffect(() => {
    document.title = 'Contact Buildo'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Get in touch with the Buildo team for support, feedback, partnerships, or general inquiries.')
    }
    window.scrollTo(0, 0)
  }, [])

  // Parallax motion
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(motionQuery.matches)
    const handleMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches)
    motionQuery.addEventListener('change', handleMotionChange)

    if (motionQuery.matches) return

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return
      const { innerWidth, innerHeight } = window
      const x = ((e.clientX / innerWidth) - 0.5) * 16
      const y = ((e.clientY / innerHeight) - 0.5) * 12
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      motionQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your name (at least 2 characters).'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      newErrors.subject = 'Please enter a subject (at least 3 characters).'
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Please enter a message (at least 10 characters).'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setStatus('submitting')
      setErrorMessage('')

      const { data } = await api.post('/api/contact', formData)

      if (data?.success) {
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMessage(data?.message || "We couldn't send your message right now. Please try again.")
      }
    } catch (err: any) {
      console.error('[Contact Form] Submission error:', err)
      setStatus('error')
      setErrorMessage(err.response?.data?.message || "We couldn't send your message right now. Please try again.")
    }
  }

  const handleReset = () => {
    setFormData({ name: '', email: '', subject: '', message: '' })
    setErrors({})
    setStatus('idle')
    setErrorMessage('')
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#0e0f14] flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Background radial accent */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-gradient-to-b from-amber-200/35 via-sky-100/30 to-transparent blur-3xl transition-transform duration-700 ease-out"
          style={{
            transform: !isReducedMotion
              ? `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) translateX(-50%)`
              : 'translateX(-50%)'
          }}
        />
      </div>

      <div className="relative z-10 pt-28 sm:pt-36 pb-20 max-w-5xl mx-auto px-4 sm:px-6 md:px-12 w-full flex-1">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-mono tracking-wider uppercase font-semibold mb-4"
          >
            <MailIcon className="size-3.5 text-amber-700" />
            <span>GET IN TOUCH</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight"
          >
            Let's build <span className="font-serif-italic text-amber-900 font-normal">something.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-gray-600 mt-3 font-medium leading-relaxed"
          >
            Have a question, feedback, or idea? We'd love to hear from you.
          </motion.p>
        </div>

        {/* Contact Container Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Secondary Inquiry Information Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white/80 backdrop-blur-md border border-[#E5E0D5] rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900 pb-3 border-b border-gray-100">
                Ways we can help
              </h3>

              <div className="space-y-4">
                {[
                  {
                    icon: <HelpCircleIcon className="size-4 text-sky-600" />,
                    title: 'General Questions',
                    desc: 'Curious about credits, project exports, or features? Ask us anything.'
                  },
                  {
                    icon: <MessageSquareIcon className="size-4 text-amber-600" />,
                    title: 'Feedback & Ideas',
                    desc: 'We are constantly improving Buildo. Tell us what you want built next.'
                  },
                  {
                    icon: <HandshakeIcon className="size-4 text-emerald-600" />,
                    title: 'Partnerships & Business',
                    desc: 'Looking for custom volume plans or agency partnerships?'
                  },
                  {
                    icon: <BugIcon className="size-4 text-rose-600" />,
                    title: 'Bug Reports',
                    desc: 'Found an unexpected behavior in the editor? Let our engineers fix it.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="size-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-sky-500/10 border border-[#E5E0D5] rounded-2xl p-5 text-center text-xs text-gray-600 space-y-1">
              <span className="font-mono-tech font-bold text-gray-900">Direct Contact</span>
              <p>Email: <a href="mailto:support@moinsheikh.in" className="text-sky-800 font-medium hover:underline">hello@moinsheikh.in</a></p>
            </div>
          </div>

          {/* Right Column: Contact Form or Success State */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#E5E0D5] rounded-3xl p-6 sm:p-8 shadow-sm relative">
              
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-8 space-y-4"
                  >
                    <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2Icon className="size-8 stroke-[2.5]" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900">Message sent!</h3>

                    <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                      Thanks for reaching out to Buildo. We've received your message and sent a confirmation copy to your email address.
                    </p>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link
                        to="/"
                        className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0e0f14] text-white text-xs font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowLeftIcon className="size-3.5" />
                        <span>Back to Buildo</span>
                      </Link>

                      <button
                        onClick={handleReset}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Send another message
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    noValidate
                  >
                    {status === 'error' && (
                      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 flex items-start gap-3">
                        <AlertCircleIcon className="size-5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <strong className="block font-bold mb-0.5">Submission Failed</strong>
                          <span>{errorMessage || "We couldn't send your message right now. Please try again."}</span>
                        </div>
                      </div>
                    )}

                    {/* Name Input */}
                    <div>
                      <label htmlFor="name" className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-900 mb-1.5">
                        Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        disabled={status === 'submitting'}
                        className={`w-full px-4 py-3 rounded-2xl bg-gray-50/70 border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${
                          errors.name ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20' : 'border-gray-200 focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20'
                        }`}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {errors.name && <p id="name-error" className="text-xs text-rose-600 mt-1 font-medium">{errors.name}</p>}
                    </div>

                    {/* Email Input */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-900 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="you@domain.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        disabled={status === 'submitting'}
                        className={`w-full px-4 py-3 rounded-2xl bg-gray-50/70 border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${
                          errors.email ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20' : 'border-gray-200 focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20'
                        }`}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      {errors.email && <p id="email-error" className="text-xs text-rose-600 mt-1 font-medium">{errors.email}</p>}
                    </div>

                    {/* Subject Input */}
                    <div>
                      <label htmlFor="subject" className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-900 mb-1.5">
                        Subject <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="subject"
                        type="text"
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        disabled={status === 'submitting'}
                        className={`w-full px-4 py-3 rounded-2xl bg-gray-50/70 border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${
                          errors.subject ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20' : 'border-gray-200 focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20'
                        }`}
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                      />
                      {errors.subject && <p id="subject-error" className="text-xs text-rose-600 mt-1 font-medium">{errors.subject}</p>}
                    </div>

                    {/* Message Textarea */}
                    <div>
                      <label htmlFor="message" className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-900 mb-1.5">
                        Message <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Tell us more about your request..."
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        disabled={status === 'submitting'}
                        className={`w-full px-4 py-3 rounded-2xl bg-gray-50/70 border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${
                          errors.message ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20' : 'border-gray-200 focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20'
                        }`}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                      />
                      {errors.message && <p id="message-error" className="text-xs text-rose-600 mt-1 font-medium">{errors.message}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#0e0f14] hover:bg-black text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2Icon className="size-4 animate-spin" />
                          <span>Sending message...</span>
                        </>
                      ) : (
                        <>
                          <span>Send message</span>
                          <SendIcon className="size-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>

      </div>

      <Footer />
    </div>
  )
}

export default Contact

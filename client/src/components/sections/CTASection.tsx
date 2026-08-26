import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRightIcon, SparklesIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'

export const CTASection: React.FC = () => {
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()

  const handleAction = () => {
    if (session?.user) {
      const heroInput = document.querySelector('textarea')
      if (heroInput) {
        heroInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => heroInput.focus(), 500)
      } else {
        navigate('/projects')
      }
    } else {
      navigate('/auth/sign-in')
    }
  }

  return (
    <section className="relative w-full py-16 sm:py-14 md:py-18 px-4 sm:px-6 md:px-12 bg-[#F7F5F0] text-gray-900 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Main CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background:
              'linear-gradient(135deg, #c9a45c 0%, #e8d5a8 25%, #d4c29a 40%, #a8c8d8 60%, #7fb5cc 80%, #4b8ebc 100%)',
          }}
          className="relative rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-12 md:p-14 overflow-hidden border border-white/30 shadow-2xl shadow-black/20 text-center flex flex-col items-center justify-center gap-6 sm:gap-8"
        >
          {/* Ambient Glow Orbs with continuous breathing movement */}
          <motion.div
            aria-hidden="true"
            animate={{
              y: [-12, 12, -12],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-amber-400/25 blur-[100px] pointer-events-none"
          />
          <motion.div
            aria-hidden="true"
            animate={{
              y: [12, -12, 12],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-cyan-400/25 blur-[110px] pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent blur-2xl pointer-events-none"
          />

          {/* Noise texture */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-[0.035]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '128px 128px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 space-y-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide text-[#1a1a2e] shadow-sm"
            >
              <SparklesIcon className="size-3.5 text-[#1a1a2e]" />
              <span>Instant AI Website Builder</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.12] text-[#1a1a2e] font-serif-italic"
            >
              What should we build today?
            </motion.h2>
          </div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.35 }}
            className="relative z-10"
          >
            <motion.button
              onClick={handleAction}
              whileHover={{ scale: 1.05, boxShadow: '0 20px 35px rgba(0,0,0,0.18)' }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="group inline-flex items-center gap-2.5 bg-white text-gray-900 font-semibold text-sm sm:text-base px-8 py-4 rounded-full shadow-xl transition-all"
            >
              <span>Try Buildo for free</span>
              <ArrowRightIcon className="size-4 text-gray-900 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}

export default CTASection

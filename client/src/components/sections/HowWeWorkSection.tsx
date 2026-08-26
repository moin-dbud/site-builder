import React from 'react'
import { motion } from 'framer-motion'
import {
  LightbulbIcon,
  Wand2Icon,
  SlidersIcon,
  RocketIcon,
  CheckCircle2Icon,
} from 'lucide-react'

interface ProcessStep {
  number: string
  icon: React.ElementType
  title: string
  description: string
  highlights: string[]
  accentColor: string
  badgeBg: string
  badgeText: string
}

const STEPS: ProcessStep[] = [
  {
    number: '01',
    icon: LightbulbIcon,
    title: 'Describe Your Vision',
    description:
      'Enter a simple text prompt describing your business, brand, or idea — or pick one of our curated build presets to get started.',
    highlights: ['Natural language prompt', 'Curated presets', 'Instant setup'],
    accentColor: '#b89158',
    badgeBg: 'bg-amber-100/70 border-amber-200',
    badgeText: 'text-amber-800',
  },
  {
    number: '02',
    icon: Wand2Icon,
    title: 'AI Crafts Your Site',
    description:
      'Buildo AI generates a full responsive layout, writes custom content, picks typography, and pairs colors tailored specifically to your brand.',
    highlights: ['Auto responsive layout', 'Custom copy & visuals', 'Theme matching'],
    accentColor: '#4b8ebc',
    badgeBg: 'bg-sky-100/70 border-sky-200',
    badgeText: 'text-sky-800',
  },
  {
    number: '03',
    icon: SlidersIcon,
    title: 'Refine & Customize',
    description:
      'Tweak layout sections in the live workspace, ask Buildo AI for real-time revisions, and switch devices to preview desktop or mobile views.',
    highlights: ['Live interactive workspace', 'AI revision assistant', 'Device preview'],
    accentColor: '#6366f1',
    badgeBg: 'bg-indigo-100/70 border-indigo-200',
    badgeText: 'text-indigo-800',
  },
  {
    number: '04',
    icon: RocketIcon,
    title: 'Publish & Scale',
    description:
      'One click deploys your website globally on our edge CDN network with automatic SSL certification, ready for visitors worldwide.',
    highlights: ['One-click deployment', 'Free SSL & domain', 'Global edge CDN'],
    accentColor: '#10b981',
    badgeBg: 'bg-emerald-100/70 border-emerald-200',
    badgeText: 'text-emerald-800',
  },
]

export const HowWeWorkSection: React.FC = () => {
  return (
    <section className="relative w-full py-10 sm:py-14 md:py-18 px-4 sm:px-6 md:px-12 bg-[#F7F5F0] text-gray-900 overflow-hidden">
      {/* Background ambient accents */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-amber-200/15 via-sky-200/15 to-indigo-200/15 rounded-full blur-[140px] pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ── Section Header ── */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200 px-3.5 py-1 rounded-full text-xs font-mono tracking-widest text-[#b89158] uppercase font-semibold shadow-sm"
          >
            HOW WE WORK
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.12]"
          >
            From prompt to live site in{' '}
            <span className="font-serif-italic text-[#4b8ebc]">four simple steps.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed"
          >
            Buildo combines generative AI with an intuitive live workspace so anyone can build, customize, and publish a website in seconds.
          </motion.p>
        </div>

        {/* ── Process Grid (4 Cards) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
                className="group relative bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Step Number & Icon Header */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-bold font-mono text-gray-300 group-hover:text-gray-900 transition-colors">
                      {step.number}
                    </span>
                    <div
                      className="size-11 rounded-xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: `${step.accentColor}12`,
                        borderColor: `${step.accentColor}30`,
                      }}
                    >
                      <Icon className="size-5" style={{ color: step.accentColor }} />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                {/* Highlights List */}
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  {step.highlights.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                      <CheckCircle2Icon className="size-3.5 shrink-0" style={{ color: step.accentColor }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HowWeWorkSection

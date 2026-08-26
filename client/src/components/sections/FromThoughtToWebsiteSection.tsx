import React, { useEffect, useRef, useState } from 'react'
import {
  SparklesIcon,
  LightbulbIcon,
  GlobeIcon,
  CheckIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  LayoutGridIcon,
  GridIcon,
  LayersIcon,
  CheckCircle2Icon,
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const FULL_PROMPT_TEXT =
  'Create a modern portfolio for a product designer with a clean, minimal style...'

/* ─── Processing steps definition ─────────────────────────────────────── */
type StepStatus = 'pending' | 'active' | 'done'

interface ProcessStep {
  label: string
  icon: React.ElementType
}

const PROCESS_STEPS: ProcessStep[] = [
  { label: 'Understanding your idea...', icon: LayoutGridIcon },
  { label: 'Designing layout...',         icon: GridIcon        },
  { label: 'Adding content & visuals...', icon: SparklesIcon   },
  { label: 'Finalizing your website...',  icon: LayersIcon     },
]

function getStepStatus(stepIndex: number, activeStep: number): StepStatus {
  if (activeStep > stepIndex + 1) return 'done'
  if (activeStep === stepIndex + 1) return 'active'
  return 'pending'
}

/* ─── Step Row ─────────────────────────────────────────────────────────── */
const StepRow: React.FC<{
  step: ProcessStep
  status: StepStatus
}> = ({ step, status }) => {
  const Icon = step.icon
  const isDone   = status === 'done'
  const isActive = status === 'active'

  return (
    <div
      className={[
        'flex items-center justify-between p-3.5 rounded-xl border transition-all duration-500',
        isDone   ? 'bg-white border-sky-200/80 text-gray-800 shadow-sm'                                         : '',
        isActive ? 'bg-white border-sky-300 text-sky-950 font-semibold shadow-md ring-2 ring-sky-400/20'        : '',
        !isDone && !isActive ? 'bg-[#F7F5F0]/60 border-gray-200/70 text-gray-400'                              : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 text-xs sm:text-sm">
        <Icon
          className={[
            'size-4 shrink-0',
            isDone   ? 'text-sky-500'                           : '',
            isActive ? 'text-sky-500'                           : '',
            !isDone && !isActive ? 'text-gray-300'             : '',
          ].join(' ')}
        />
        <span>{step.label}</span>
      </div>

      {/* Right indicator */}
      {isDone && <CheckIcon className="size-4 text-sky-500 shrink-0" />}
      {isActive && (
        <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
      )}
      {!isDone && !isActive && (
        <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
      )}
    </div>
  )
}

/* ─── Main Component ───────────────────────────────────────────────────── */
export const FromThoughtToWebsiteSection: React.FC = () => {
  /* refs */
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const stage1Ref  = useRef<HTMLDivElement>(null)
  const stage2Ref  = useRef<HTMLDivElement>(null)
  const stage3Ref  = useRef<HTMLDivElement>(null)
  const arrow1Ref  = useRef<HTMLDivElement>(null)
  const arrow2Ref  = useRef<HTMLDivElement>(null)
  const badgeRef   = useRef<HTMLDivElement>(null)

  /* state */
  const [typedPrompt,         setTypedPrompt]         = useState('')
  const [activeProcessingStep, setActiveProcessingStep] = useState(0)
  const [isReducedMotion,     setIsReducedMotion]     = useState(false)

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const reduced = motionQuery.matches
    setIsReducedMotion(reduced)

    /* ── Reduced motion: show final state immediately ── */
    if (reduced) {
      setTypedPrompt(FULL_PROMPT_TEXT)
      setActiveProcessingStep(PROCESS_STEPS.length + 1)
      return
    }

    /* ── Set initial hidden states ── */
    gsap.set([arrow1Ref.current, arrow2Ref.current], { opacity: 0, x: -10 })
    gsap.set(badgeRef.current, { opacity: 0, scale: 0.85, y: 12 })

    const ctx = gsap.context(() => {

      /* ════════════════════════════════════════════════════════════════
         PHASE 1-2: Heading + stage headers staggered on scroll entry
      ════════════════════════════════════════════════════════════════ */
      const revealTL = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
          toggleActions: 'play none none none',
        },
      })

      revealTL.fromTo(
        headingRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
      )

      /* Stage 01 panel */
      revealTL.fromTo(
        stage1Ref.current,
        { opacity: 0, y: 36, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power2.out' },
        '-=0.35',
      )

      /* ════════════════════════════════════════════════════════════════
         PHASE 3: Typing effect — triggered when Stage 01 is in view
      ════════════════════════════════════════════════════════════════ */
      ScrollTrigger.create({
        trigger: stage1Ref.current,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          let currentLength = 0
          const typingInterval = setInterval(() => {
            if (currentLength <= FULL_PROMPT_TEXT.length) {
              setTypedPrompt(FULL_PROMPT_TEXT.slice(0, currentLength))
              currentLength++
            } else {
              clearInterval(typingInterval)
            }
          }, 30)
        },
      })

      /* ════════════════════════════════════════════════════════════════
         PHASE 4: Arrow 1 reveal — after Stage 01 has appeared
      ════════════════════════════════════════════════════════════════ */
      ScrollTrigger.create({
        trigger: stage1Ref.current,
        start: 'top 65%',
        once: true,
        onEnter: () => {
          gsap.to(arrow1Ref.current, {
            opacity: 1,
            x: 0,
            duration: 0.55,
            ease: 'power2.out',
            delay: 0.3,
          })
        },
      })

      /* ════════════════════════════════════════════════════════════════
         PHASE 5: Stage 02 entrance + processing sequence
      ════════════════════════════════════════════════════════════════ */
      ScrollTrigger.create({
        trigger: stage2Ref.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          /* Panel entrance */
          gsap.fromTo(
            stage2Ref.current,
            { opacity: 0, y: 36, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power2.out' },
          )

          /* Processing steps — one active at a time, 700ms each */
          let step = 1
          const processInterval = setInterval(() => {
            setActiveProcessingStep(step)
            step++
            if (step > PROCESS_STEPS.length + 1) {
              clearInterval(processInterval)
            }
          }, 700)
        },
      })

      /* ════════════════════════════════════════════════════════════════
         PHASE 6: Arrow 2 reveal
      ════════════════════════════════════════════════════════════════ */
      ScrollTrigger.create({
        trigger: stage2Ref.current,
        start: 'top 62%',
        once: true,
        onEnter: () => {
          gsap.to(arrow2Ref.current, {
            opacity: 1,
            x: 0,
            duration: 0.55,
            ease: 'power2.out',
            delay: 0.5,
          })
        },
      })

      /* ════════════════════════════════════════════════════════════════
         PHASE 7: Stage 03 entrance
      ════════════════════════════════════════════════════════════════ */
      ScrollTrigger.create({
        trigger: stage3Ref.current,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          gsap.fromTo(
            stage3Ref.current,
            { opacity: 0, y: 20, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power2.out' },
          )

          /* PHASE 8: Website Ready badge */
          gsap.to(badgeRef.current, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.55,
            ease: 'back.out(1.7)',
            delay: 0.55,
          })
        },
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full pt-20 md:pt-28 pb-10 md:pb-20 px-6 md:px-12 bg-[#F7F5F0] text-gray-900 overflow-hidden"
    >
      {/* ── Very subtle per-region atmospheric gradients ── */}
      {/* Gold — left (Describe) */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-0 w-[38%] h-[60%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(217,181,108,0.07) 0%, transparent 65%)',
        }}
      />
      {/* Cyan — center (Build) */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[40%] h-[70%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(98,185,224,0.06) 0%, transparent 65%)',
        }}
      />
      {/* Green — right (Live) */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 right-0 w-[38%] h-[60%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 80% 50%, rgba(74,186,120,0.06) 0%, transparent 65%)',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ════════════════════════════════════════════════════════
            SECTION HEADER
        ════════════════════════════════════════════════════════ */}
        <div
          ref={headingRef}
          className="text-center max-w-3xl mx-auto space-y-5 mb-20 md:mb-24"
          style={{ opacity: 0 }}
        >
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.12]">
            From{' '}
            <span className="text-[#b89158] italic font-serif">thought</span>{' '}
            to{' '}
            <span className="text-[#4b8ebc]">website</span>.
          </h2>

          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto font-normal leading-relaxed">
            Buildo turns your idea into a beautiful, live website automatically.
          </p>
        </div>

        {/* ════════════════════════════════════════════════════════
            THREE-STAGE STORYTELLING GRID
        ════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-5 lg:gap-8 items-stretch relative">

          {/* ─────────────────────────────────────────────────────
              STAGE 01 — DESCRIBE
          ───────────────────────────────────────────────────── */}
          <div
            ref={stage1Ref}
            className="flex flex-col gap-4"
            style={{ opacity: 0 }}
          >
            {/* Stage header */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#fef3c7] border border-[#fbbf24]/60 text-[#92400e] text-xs font-mono font-bold flex items-center justify-center shadow-sm">
                01
              </span>
              <div className="p-1.5 rounded-full bg-white border border-[#fbbf24]/30 text-amber-500 shadow-sm">
                <LightbulbIcon className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">Describe</h3>
                <p className="text-xs text-gray-400">Share your idea in your own words.</p>
              </div>
            </div>

            {/* Visual Panel 01 — Prompt Card */}
            <div className="relative flex-1 min-h-[300px] rounded-2xl overflow-hidden border border-[#e8c97a]/40 bg-[#fffdf7] shadow-sm flex items-center justify-center p-5">
              {/* Subtle background texture image */}
              <div className="absolute inset-0 opacity-[0.18] mix-blend-multiply pointer-events-none">
                <img
                  src="/background.png"
                  alt=""
                  className="w-full h-full object-cover object-left-bottom"
                />
              </div>

              {/* Very soft warm vignette */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 70% 80%, rgba(251,191,36,0.06) 0%, transparent 60%)',
                }}
              />

              {/* Prompt glass card */}
              <div className="relative z-10 w-full bg-white/90 border border-[#e8c97a]/50 rounded-xl p-5 shadow-md ring-1 ring-amber-200/30">
                <div className="flex items-start gap-2.5">
                  <SparklesIcon className="size-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-gray-800 leading-relaxed min-h-[88px]">
                    {typedPrompt}
                    {!isReducedMotion && (
                      <span className="inline-block w-0.5 h-4 ml-0.5 bg-amber-500/80 animate-pulse align-middle" />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────
              CONNECTING ARROW 1 — Desktop
          ───────────────────────────────────────────────────── */}
          <div
            ref={arrow1Ref}
            className="hidden md:flex absolute top-[calc(50%+2rem)] left-[33%] -translate-y-1/2 z-20 items-center pointer-events-none"
            aria-hidden="true"
          >
            <div className="flex items-center gap-1 bg-white/95 px-2.5 py-1 rounded-full border border-sky-200/70 shadow-sm text-sky-400 text-xs">
              <span className="block w-5 border-b border-dashed border-sky-300" />
              <ArrowRightIcon className="size-3.5" />
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────
              CONNECTING ARROW 1 — Mobile (vertical)
          ───────────────────────────────────────────────────── */}
          <div className="flex md:hidden justify-center" aria-hidden="true">
            <div className="flex flex-col items-center gap-1 text-sky-300">
              <span className="block h-5 border-l border-dashed border-sky-300" />
              <ArrowDownIcon className="size-3.5" />
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────
              STAGE 02 — BUILD
          ───────────────────────────────────────────────────── */}
          <div
            ref={stage2Ref}
            className="flex flex-col gap-4"
            style={{ opacity: 0 }}
          >
            {/* Stage header */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#e0f2fe] border border-[#7dd3fc]/60 text-[#0369a1] text-xs font-mono font-bold flex items-center justify-center shadow-sm">
                02
              </span>
              <div className="p-1.5 rounded-full bg-white border border-sky-200/50 text-sky-500 shadow-sm">
                <SparklesIcon className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">Build</h3>
                <p className="text-xs text-gray-400">Buildo crafts layout, content, and visuals.</p>
              </div>
            </div>

            {/* Visual Panel 02 — Processing */}
            <div className="relative flex-1 min-h-[300px] rounded-2xl border border-sky-200/50 bg-white shadow-sm p-5 flex flex-col justify-center gap-3">
              {/* Very subtle cyan atmosphere */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 0%, rgba(125,211,252,0.07) 0%, transparent 60%)',
                }}
              />

              <div className="relative z-10 flex flex-col gap-2.5">
                {PROCESS_STEPS.map((step, i) => (
                  <StepRow
                    key={step.label}
                    step={step}
                    status={getStepStatus(i, activeProcessingStep)}
                  />
                ))}
              </div>

              {/* "Buildo AI" label */}
              <div className="relative z-10 flex items-center gap-2 pt-1 mt-1 border-t border-gray-100">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">
                  Buildo AI · Processing
                </span>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────
              CONNECTING ARROW 2 — Desktop
          ───────────────────────────────────────────────────── */}
          <div
            ref={arrow2Ref}
            className="hidden md:flex absolute top-[calc(50%+2rem)] left-[66.5%] -translate-y-1/2 z-20 items-center pointer-events-none"
            aria-hidden="true"
          >
            <div className="flex items-center gap-1 bg-white/95 px-2.5 py-1 rounded-full border border-emerald-200/70 shadow-sm text-emerald-400 text-xs">
              <span className="block w-5 border-b border-dashed border-emerald-300" />
              <ArrowRightIcon className="size-3.5" />
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────
              CONNECTING ARROW 2 — Mobile (vertical)
          ───────────────────────────────────────────────────── */}
          <div className="flex md:hidden justify-center" aria-hidden="true">
            <div className="flex flex-col items-center gap-1 text-emerald-300">
              <span className="block h-5 border-l border-dashed border-emerald-300" />
              <ArrowDownIcon className="size-3.5" />
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────
              STAGE 03 — LIVE WEBSITE
          ───────────────────────────────────────────────────── */}
          <div
            ref={stage3Ref}
            className="flex flex-col gap-4"
            style={{ opacity: 0 }}
          >
            {/* Stage header */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#dcfce7] border border-[#86efac]/60 text-[#15803d] text-xs font-mono font-bold flex items-center justify-center shadow-sm">
                03
              </span>
              <div className="p-1.5 rounded-full bg-white border border-emerald-200/50 text-emerald-600 shadow-sm">
                <GlobeIcon className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">Live Website</h3>
                <p className="text-xs text-gray-400">Ready to edit, customize, and publish.</p>
              </div>
            </div>

            {/* Visual Panel 03 — Website Preview */}
            <div className="relative flex-1 min-h-[300px] rounded-2xl border border-emerald-200/50 bg-white shadow-sm flex flex-col overflow-hidden">
              {/* Subtle green glow top */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 0%, rgba(74,186,120,0.06) 0%, transparent 55%)',
                }}
              />

              <div className="relative z-10 flex flex-col h-full p-4 sm:p-5 gap-3">
                {/* Browser chrome */}
                <div className="w-full bg-white rounded-xl p-2.5 border border-gray-200/80 shadow-sm flex items-center justify-between gap-2">
                  {/* Traffic dots */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-300/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-300/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                  </div>
                  {/* URL bar */}
                  <div className="flex-1 mx-2 bg-gray-50 border border-gray-200 rounded-md px-2 py-0.5 text-[9px] text-gray-400 font-mono truncate">
                    aurora-portfolio.buildo.site
                  </div>
                  {/* Nav items */}
                  <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                    <span>Home</span>
                    <span>Work</span>
                    <span>Contact</span>
                  </div>
                </div>

                {/* Website hero preview */}
                <div className="flex-1 bg-gray-50/80 rounded-xl p-4 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 min-h-0">
                  <div className="space-y-2 text-left max-w-[200px]">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-gray-400">
                      Aurora Studio
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                      Design that moves people.
                    </h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Beautiful, functional digital experiences for ambitious brands.
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[9px] font-semibold bg-gray-900 text-white px-2.5 py-1 rounded-md">
                        View Work
                      </span>
                      <span className="text-[9px] font-medium text-gray-600 bg-white border border-gray-200 px-2 py-1 rounded-md">
                        About
                      </span>
                    </div>
                  </div>

                  <div className="w-24 h-24 rounded-xl overflow-hidden shadow border border-gray-200 shrink-0">
                    <img
                      src="/background.png"
                      alt="Generated website preview"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              </div>

              {/* Website Ready badge */}
              <div
                ref={badgeRef}
                className="absolute bottom-4 right-4 z-20 bg-white border border-emerald-400/60 text-emerald-800 text-[11px] font-semibold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5"
                style={{ opacity: 0 }}
              >
                <CheckCircle2Icon className="size-3.5 text-emerald-500 fill-emerald-50" />
                <span>Website Ready</span>
              </div>
            </div>
          </div>

        </div>
        {/* end grid */}

      </div>
      {/* end max-w container */}

    </section>
  )
}

export default FromThoughtToWebsiteSection


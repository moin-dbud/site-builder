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
  Wand2Icon,
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const FULL_PROMPT_TEXT =
  'Create a modern portfolio for a product designer with a clean, minimal style...'

/* ─── AI Processing Steps Definition ─────────────────────────────────────── */
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

/* ─── Processing Row Component ─────────────────────────────────────────────── */
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
        isDone   
          ? 'bg-white border-slate-200 text-slate-800 shadow-xs' 
          : '',
        isActive 
          ? 'bg-sky-50/70 border-sky-400 text-sky-950 font-bold shadow-md ring-2 ring-sky-400/20' 
          : '',
        !isDone && !isActive 
          ? 'bg-slate-50/60 border-slate-200/70 text-slate-400' 
          : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 text-xs sm:text-sm">
        <Icon
          className={[
            'size-4 shrink-0 transition-colors',
            isDone   ? 'text-sky-600' : '',
            isActive ? 'text-sky-600 animate-pulse' : '',
            !isDone && !isActive ? 'text-slate-300' : '',
          ].join(' ')}
        />
        <span>{step.label}</span>
      </div>

      {/* Status Indicators */}
      {isDone && <CheckIcon className="size-4 text-sky-600 shrink-0 stroke-[2.5]" />}
      {isActive && (
        <span className="size-2.5 rounded-full bg-sky-500 animate-ping shrink-0" />
      )}
      {!isDone && !isActive && (
        <span className="size-2 rounded-full bg-slate-300 shrink-0" />
      )}
    </div>
  )
}

/* ─── Main Section Component ───────────────────────────────────────────────────── */
export const FromThoughtToWebsiteSection: React.FC = () => {
  /* Refs */
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const stage1Ref  = useRef<HTMLDivElement>(null)
  const stage2Ref  = useRef<HTMLDivElement>(null)
  const stage3Ref  = useRef<HTMLDivElement>(null)
  const arrow1Ref  = useRef<HTMLDivElement>(null)
  const arrow2Ref  = useRef<HTMLDivElement>(null)
  const badgeRef   = useRef<HTMLDivElement>(null)

  /* State */
  const [typedPrompt,         setTypedPrompt]         = useState('')
  const [activeProcessingStep, setActiveProcessingStep] = useState(0)
  const [isReducedMotion,     setIsReducedMotion]     = useState(false)

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const reduced = motionQuery.matches
    setIsReducedMotion(reduced)

    /* Reduced motion: render final completed state immediately */
    if (reduced) {
      setTypedPrompt(FULL_PROMPT_TEXT)
      setActiveProcessingStep(PROCESS_STEPS.length + 1)
      if (badgeRef.current) {
        badgeRef.current.style.opacity = '1'
        badgeRef.current.style.transform = 'none'
      }
      return
    }

    /* Set initial hidden state for elements */
    gsap.set([arrow1Ref.current, arrow2Ref.current], { opacity: 0, x: -10 })
    if (badgeRef.current) {
      gsap.set(badgeRef.current, { opacity: 0, scale: 0.85, y: 12 })
    }

    const ctx = gsap.context(() => {
      /* ── Reveal Header & Section ── */
      const revealTL = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      })

      revealTL.fromTo(
        headingRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
      )

      /* Stage 01 panel reveal */
      revealTL.fromTo(
        stage1Ref.current,
        { opacity: 0, y: 32, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power2.out' },
        '-=0.35',
      )

      /* ── Stage 01: Typing animation ── */
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
          }, 32)
        },
      })

      /* ── Connector 1 (Left → Center) reveal ── */
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

      /* ── Stage 02: Processing sequence ── */
      ScrollTrigger.create({
        trigger: stage2Ref.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.fromTo(
            stage2Ref.current,
            { opacity: 0, y: 32, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power2.out' },
          )

          let step = 1
          const processInterval = setInterval(() => {
            setActiveProcessingStep(step)
            step++
            if (step > PROCESS_STEPS.length + 1) {
              clearInterval(processInterval)
            }
          }, 650)
        },
      })

      /* ── Connector 2 (Center → Right) reveal ── */
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

      /* ── Stage 03: Live Website preview reveal ── */
      ScrollTrigger.create({
        trigger: stage3Ref.current,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          gsap.fromTo(
            stage3Ref.current,
            { opacity: 0, y: 24, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power2.out' },
          )

          /* Website Ready badge pop */
          if (badgeRef.current) {
            gsap.to(badgeRef.current, {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.55,
              ease: 'back.out(1.7)',
              delay: 0.6,
            })
          }
        },
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full pt-20 md:pt-28 pb-16 md:pb-24 px-6 md:px-12 bg-[#F8F7F3] text-slate-900 overflow-hidden select-none"
    >
      {/* ── Soft Warm Ambient Lighting Gradients ── */}
      {/* Gold Ambient — Left */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-0 w-[40%] h-[60%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(233,185,73,0.08) 0%, transparent 65%)',
        }}
      />
      {/* Soft Blue Ambient — Center */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[45%] h-[70%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(77,168,232,0.08) 0%, transparent 65%)',
        }}
      />
      {/* Soft Green Ambient — Right */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 right-0 w-[40%] h-[60%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 80% 50%, rgba(76,203,145,0.08) 0%, transparent 65%)',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ════════════════════════════════════════════════════════
            SECTION HEADER
        ════════════════════════════════════════════════════════ */}
        <div
          ref={headingRef}
          className="text-center max-w-3xl mx-auto space-y-4 mb-16 md:mb-20"
          style={{ opacity: 0 }}
        >
          {/* Section 2 Badge */}
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-200/60 border border-slate-300/80 text-slate-600 font-mono text-[11px] font-bold uppercase tracking-widest shadow-2xs mb-1">
            SECTION 2
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0f172a] leading-[1.12]">
            From{' '}
            <span className="text-[#b89158] italic font-serif-italic font-normal">thought</span>{' '}
            to{' '}
            <span className="text-[#4DA8E8]">website</span>.
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto font-normal leading-relaxed">
            Buildo turns your idea into a beautiful, live website — automatically.
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
            {/* Stage Header */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#FDF6B2] border border-[#FACC15]/80 text-[#8E4B10] text-xs font-mono font-bold flex items-center justify-center shadow-xs">
                01
              </span>
              <div className="p-2 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs">
                <LightbulbIcon className="size-4 text-slate-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f172a] leading-tight">Describe</h3>
                <p className="text-xs text-slate-500">Share your idea in your own words.</p>
              </div>
            </div>

            {/* Visual Panel 01 — Environmental Landscape + Frosted Prompt Box */}
            <div className="relative flex-1 min-h-[320px] rounded-3xl overflow-hidden border border-amber-300/60 shadow-xl shadow-amber-500/10 flex items-center justify-center p-6 group">
              {/* Full Environmental Landscape Background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <img
                  src="/background.png"
                  alt="Buildo World"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                />
                {/* Soft warm lighting overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-transparent" />
              </div>

              {/* Frosted Glass Prompt Container */}
              <div className="relative z-10 w-full bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 shadow-2xl space-y-3 ring-1 ring-amber-400/30">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-amber-500/20 text-[#b89158] shrink-0 mt-0.5">
                    <SparklesIcon className="size-4 text-amber-600" />
                  </div>
                  <p className="text-sm font-semibold text-[#0f172a] leading-relaxed min-h-[90px]">
                    {typedPrompt}
                    {!isReducedMotion && (
                      <span className="inline-block w-0.5 h-4.5 ml-1 bg-amber-500 animate-pulse align-middle" />
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
            className="hidden md:flex absolute top-[calc(50%+1.5rem)] left-[33%] -translate-y-1/2 z-20 items-center pointer-events-none"
            aria-hidden="true"
          >
            <div className="flex items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-full border border-sky-300/80 shadow-md text-sky-500 text-xs font-bold">
              <span className="block w-6 border-t-2 border-dashed border-sky-400/80" />
              <ArrowRightIcon className="size-4" />
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────
              CONNECTING ARROW 1 — Mobile (vertical)
          ───────────────────────────────────────────────────── */}
          <div className="flex md:hidden justify-center" aria-hidden="true">
            <div className="flex flex-col items-center gap-1 text-sky-500">
              <span className="block h-6 border-l-2 border-dashed border-sky-400/80" />
              <ArrowDownIcon className="size-4" />
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
            {/* Stage Header */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#E0F2FE] border border-[#38BDF8]/80 text-[#0369A1] text-xs font-mono font-bold flex items-center justify-center shadow-xs">
                02
              </span>
              <div className="p-2 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs">
                <Wand2Icon className="size-4 text-slate-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f172a] leading-tight">Build</h3>
                <p className="text-xs text-slate-500">Buildo crafts the layout, content, and visuals.</p>
              </div>
            </div>

            {/* Visual Panel 02 — Processing Rows */}
            <div className="relative flex-1 min-h-[320px] rounded-3xl border border-sky-300/60 bg-white/80 backdrop-blur-2xl shadow-xl shadow-sky-500/10 p-5 sm:p-6 flex flex-col justify-center gap-3">
              {/* Soft atmosphere tint */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 0%, rgba(77,168,232,0.06) 0%, transparent 60%)',
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
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────
              CONNECTING ARROW 2 — Desktop
          ───────────────────────────────────────────────────── */}
          <div
            ref={arrow2Ref}
            className="hidden md:flex absolute top-[calc(50%+1.5rem)] left-[66.5%] -translate-y-1/2 z-20 items-center pointer-events-none"
            aria-hidden="true"
          >
            <div className="flex items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-full border border-emerald-300/80 shadow-md text-emerald-600 text-xs font-bold">
              <span className="block w-6 border-t-2 border-dashed border-emerald-400/80" />
              <ArrowRightIcon className="size-4" />
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────
              CONNECTING ARROW 2 — Mobile (vertical)
          ───────────────────────────────────────────────────── */}
          <div className="flex md:hidden justify-center" aria-hidden="true">
            <div className="flex flex-col items-center gap-1 text-emerald-500">
              <span className="block h-6 border-l-2 border-dashed border-emerald-400/80" />
              <ArrowDownIcon className="size-4" />
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
            {/* Stage Header */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#DCFCE7] border border-[#4ADE80]/80 text-[#15803D] text-xs font-mono font-bold flex items-center justify-center shadow-xs">
                03
              </span>
              <div className="p-2 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs">
                <GlobeIcon className="size-4 text-slate-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f172a] leading-tight">Live Website</h3>
                <p className="text-xs text-slate-500">Your website is ready to edit, customize, and publish.</p>
              </div>
            </div>

            {/* Visual Panel 03 — Website Preview Mockup */}
            <div className="relative flex-1 min-h-[320px] rounded-3xl border border-emerald-300/70 bg-[#F7FAF8] shadow-xl shadow-emerald-500/10 p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
              {/* Subtle green glow */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 0%, rgba(76,203,145,0.06) 0%, transparent 55%)',
                }}
              />

              <div className="relative z-10 flex flex-col gap-3.5">
                {/* Website Header Bar */}
                <div className="w-full bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
                  <span className="font-extrabold text-xs text-[#0f172a] tracking-wider uppercase">
                    AURORA
                  </span>

                  <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium text-slate-600">
                    <span className="text-[#0f172a] font-bold">Home</span>
                    <span>About</span>
                    <span>Work</span>
                    <span>Contact</span>
                  </div>

                  <button className="bg-[#0f172a] text-white text-[10px] font-bold px-3 py-1 rounded-full border border-slate-800 shadow-2xs">
                    Work With Me
                  </button>
                </div>

                {/* Main Website Hero Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-2.5 text-left flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-extrabold text-[#0f172a] leading-tight tracking-tight">
                      Design that moves people.
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">
                      I create beautiful, functional digital experiences for ambitious brands.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-bold bg-[#0f172a] text-white px-3 py-1.5 rounded-lg shadow-2xs">
                        View Work
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                        About Me
                      </span>
                    </div>
                  </div>

                  {/* Warm Interior Chair Photo */}
                  <div className="w-full sm:w-32 h-28 sm:h-32 rounded-xl overflow-hidden shadow-xs border border-slate-200/80 shrink-0">
                    <img
                      src="/aurora-preview.jpg"
                      alt="AURORA Design Studio"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              </div>

              {/* Floating Website Ready Badge */}
              <div
                ref={badgeRef}
                className="self-end mt-3 bg-white border border-emerald-500/70 text-emerald-900 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 z-20"
                style={{ opacity: 0 }}
              >
                <CheckCircle2Icon className="size-4 text-emerald-500 fill-emerald-50" />
                <span>Website Ready</span>
              </div>
            </div>
          </div>

        </div>
        {/* End grid */}

      </div>
      {/* End container */}

    </section>
  )
}

export default FromThoughtToWebsiteSection

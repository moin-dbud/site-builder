import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronDownIcon,
  ClockIcon,
  MoonIcon,
  PanelLeftIcon,
  PaperclipIcon,
  ArrowUpIcon,
  EyeIcon,
  Undo2Icon,
  Redo2Icon,
  PlusIcon,
  RefreshCwIcon,
  SettingsIcon,
  UsersIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  HomeIcon,
  CopyIcon,
  ExternalLinkIcon,
  SmartphoneIcon,
  LaptopIcon,
  SparklesIcon,
  BotIcon,
  UserIcon,
} from 'lucide-react'

/* Status steps that cycle on scroll entry */
const STATUS_STEPS = [
  'Understanding your idea...',
  'Designing layout...',
  'Adding content & visuals...',
  'Finalizing your website...',
  'Making code edits',
]

/* Preview Section */
const PreviewSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [statusIdx, setStatusIdx] = useState(0)
  const [hasFired, setHasFired] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(mq.matches)
    if (mq.matches) {
      setStatusIdx(STATUS_STEPS.length - 1)
      setHasFired(true)
    }
  }, [])

  /* Scroll-triggered status cycling */
  useEffect(() => {
    if (hasFired || isReducedMotion) return
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasFired) {
          setHasFired(true)
          let step = 0
          const interval = setInterval(() => {
            step++
            if (step >= STATUS_STEPS.length) {
              clearInterval(interval)
              return
            }
            setStatusIdx(step)
          }, 900)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasFired, isReducedMotion])

  const currentStatus = STATUS_STEPS[statusIdx]
  const isFinalStatus = statusIdx === STATUS_STEPS.length - 1

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-12 sm:py-16 md:py-24 px-3 sm:px-6 md:px-12 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #c9a45c 0%, #e8d5a8 25%, #d4c29a 40%, #a8c8d8 60%, #7fb5cc 80%, #4b8ebc 100%)',
      }}
    >
      {/* Organic hazy cloud shapes with subtle floating animation */}
      <motion.div
        aria-hidden="true"
        animate={isReducedMotion ? {} : { y: [-15, 15, -15], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[-8%] w-[55%] h-[70%] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.22) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <motion.div
        aria-hidden="true"
        animate={isReducedMotion ? {} : { y: [15, -15, 15], scale: [1, 1.07, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[15%] right-[-5%] w-[45%] h-[60%] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.18) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <motion.div
        aria-hidden="true"
        animate={isReducedMotion ? {} : { x: [-10, 10, -10], scale: [1, 1.04, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-15%] left-[20%] w-[50%] h-[55%] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, transparent 65%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Subtle noise/grain overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-2xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] text-[#1a1a2e] mb-8 sm:mb-12 md:mb-16 px-2"
        >
          Watch your idea{' '}
          <span className="font-serif-italic text-[#2a2a40]">come alive.</span>
        </motion.h2>

        {/* 
            MOCKUP CARD - Buildo Builder Dashboard
        */}
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#08080a] rounded-xl sm:rounded-2xl md:rounded-3xl border border-[#22242c] shadow-2xl shadow-black/40 overflow-hidden"
        >

          {/* Top nav bar */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-[#22242c] bg-[#08080a]">
            {/* Left: logo + project name */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="size-6 sm:size-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shrink-0">
                <div className="size-full bg-[#08080a] rounded-[5px] sm:rounded-[6px] flex items-center justify-center">
                  <SparklesIcon className="size-3 sm:size-3.5 text-indigo-400" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-semibold text-gray-200 truncate">Boutique Restaurant Site</p>
                <p className="text-[9px] sm:text-[10px] font-mono text-gray-500 truncate hidden xs:block">Draft · Previewing last save</p>
              </div>
            </div>

            {/* Middle: device switcher (Desktop/Tablet/Mobile) */}
            <div className="flex items-center gap-1 bg-[#111216] border border-[#22242c] p-0.5 sm:p-1 rounded-lg sm:rounded-xl">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setDevice('mobile')}
                className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg transition-all ${
                  device === 'mobile' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
                title="Mobile View"
              >
                <SmartphoneIcon className="size-3.5 sm:size-4" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setDevice('desktop')}
                className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg transition-all ${
                  device === 'desktop' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
                title="Desktop View"
              >
                <LaptopIcon className="size-3.5 sm:size-4" />
              </motion.button>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex bg-[#111216] hover:bg-[#181920] border border-[#22242c] text-gray-200 hover:text-white px-3 py-1.5 items-center gap-1.5 rounded-xl transition-all"
              >
                <SettingsIcon className="size-3.5 text-gray-400" />
                <span>Settings</span>
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 text-white font-semibold text-[11px] sm:text-xs px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/20 shadow-lg shadow-indigo-950/50 hover:from-indigo-500 hover:to-violet-500 transition-all shrink-0"
              >
                Publish
              </motion.button>
            </div>
          </div>

          {/* Main workspace area */}
          <div className="flex flex-col md:flex-row min-h-0 md:min-h-[520px]">

            {/* ─────────────── LEFT PANEL: Chat Sidebar ─────────────── */}
            <div className="w-full md:w-[300px] lg:w-[320px] shrink-0 border-b md:border-b-0 md:border-r border-[#22242c] bg-[#0b0c0e] flex flex-col">
              {/* Sidebar header */}
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#1c1e26] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <SparklesIcon className="size-3.5 text-indigo-400" />
                  <span className="font-mono text-xs font-semibold text-gray-200 tracking-wide">REVISION_ASSISTANT</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">V2.4</span>
              </div>

              {/* Icon row */}
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 border-b border-[#1c1e26] flex items-center gap-2">
                <button type="button" className="p-1 sm:p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors">
                  <ClockIcon className="size-3.5" />
                </button>
                <button type="button" className="p-1 sm:p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors">
                  <MoonIcon className="size-3.5" />
                </button>
                <button type="button" className="p-1 sm:p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors">
                  <PanelLeftIcon className="size-3.5" />
                </button>
              </div>

              {/* Chat messages */}
              <div className="max-h-[220px] sm:max-h-[260px] md:max-h-none md:flex-1 overflow-y-auto p-3 sm:p-3.5 flex flex-col gap-2.5 sm:gap-3 no-scrollbar">
                {/* User message */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="flex items-start gap-2"
                >
                  <div className="size-5 sm:size-6 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="size-2.5 sm:size-3 text-indigo-300" />
                  </div>
                  <div className="bg-[#111318] border border-[#22242c] rounded-xl rounded-tl-sm px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs text-gray-200 leading-relaxed">
                    Let's build a boutique restaurant site
                  </div>
                </motion.div>

                {/* AI response */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.45 }}
                  className="flex items-start gap-2"
                >
                  <div className="size-5 sm:size-6 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shrink-0 mt-0.5">
                    <BotIcon className="size-2.5 sm:size-3 text-white" />
                  </div>
                  <div className="bg-[#111318] border border-[#22242c] rounded-xl rounded-tl-sm px-2.5 sm:px-3 py-2 sm:py-2.5 text-[11px] sm:text-xs text-gray-300 leading-relaxed flex-1 space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                      <span>Buildo</span>
                      <span className="bg-indigo-600/20 text-indigo-300 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-semibold">v1</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-200">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                          isFinalStatus ? 'bg-emerald-400' : 'bg-sky-400 animate-pulse'
                        }`}
                      />
                      <span className={isFinalStatus ? '' : 'preview-shimmer'}>{currentStatus}</span>
                    </div>
                    <p className="text-gray-400 text-[10px] sm:text-[11px]">
                      {isFinalStatus ? 'Restaurant site scaffolded successfully.' : 'Scaffolding your project...'}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Chat input */}
              <div className="p-2.5 sm:p-3 border-t border-[#1c1e26]">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-[#111318] border border-[#22242c] rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2">
                  <PaperclipIcon className="size-3.5 text-gray-500 hover:text-gray-300 cursor-pointer transition-colors shrink-0" />
                  <input
                    type="text"
                    readOnly
                    placeholder="Add a contact form section"
                    className="bg-transparent outline-none text-[11px] sm:text-xs text-gray-400 placeholder:text-gray-500 flex-1 min-w-0 cursor-default"
                  />
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <span className="text-[9px] sm:text-[10px] font-mono text-gray-500 bg-[#0b0c0e] border border-[#22242c] px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-0.5 sm:gap-1 cursor-pointer hover:text-gray-300 transition-colors">
                      Buildo
                      <ChevronDownIcon className="size-2.5 sm:size-3" />
                    </span>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.9 }}
                      className="size-6 sm:size-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center transition-transform"
                    >
                      <ArrowUpIcon className="size-3 sm:size-3.5 text-white" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* ─────────────── RIGHT PANEL: Preview ─────────────── */}
            <div className="flex-1 flex flex-col bg-[#08080a] min-w-0">
              {/* Preview toolbar */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-[#22242c]">
                <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                  <EyeIcon className="size-3.5 text-indigo-400" />
                  <span>Preview</span>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" className="p-1 sm:p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors">
                    <Undo2Icon className="size-3.5" />
                  </button>
                  <button type="button" className="p-1 sm:p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors">
                    <Redo2Icon className="size-3.5" />
                  </button>
                  <button type="button" className="p-1 sm:p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors">
                    <PlusIcon className="size-3.5" />
                  </button>
                  <button type="button" className="p-1 sm:p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors">
                    <RefreshCwIcon className="size-3.5" />
                  </button>
                  <button type="button" className="p-1 sm:p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors hidden sm:block">
                    <UsersIcon className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 border-b border-[#22242c] bg-[#0b0c0e]">
                <div className="flex items-center gap-1 text-gray-500 shrink-0">
                  <ArrowLeftIcon className="size-3 sm:size-3.5 hover:text-gray-300 cursor-pointer transition-colors" />
                  <ArrowRightIcon className="size-3 sm:size-3.5 hover:text-gray-300 cursor-pointer transition-colors" />
                  <HomeIcon className="size-3 sm:size-3.5 hover:text-gray-300 cursor-pointer transition-colors ml-0.5" />
                </div>
                <div className="flex-1 bg-[#111318] border border-[#22242c] rounded-md px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] text-gray-500 font-mono truncate mx-0.5">
                  localhost:5173/preview/boutique-restaurant
                </div>
                <div className="flex items-center gap-1 text-gray-500 shrink-0">
                  <CopyIcon className="size-3 sm:size-3.5 hover:text-gray-300 cursor-pointer transition-colors" />
                  <ExternalLinkIcon className="size-3 sm:size-3.5 hover:text-gray-300 cursor-pointer transition-colors" />
                </div>
              </div>

              {/* Preview iframe area */}
              <div className="flex-1 flex items-start justify-center p-2.5 sm:p-4 md:p-6 overflow-x-auto bg-[#111318]">
                <motion.div
                  layout
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden w-full ${
                    device === 'mobile' ? 'max-w-[320px] sm:max-w-[340px]' : 'max-w-full'
                  }`}
                  style={{ maxHeight: '420px' }}
                >
                  {/* Mock restaurant website */}
                  <MockRestaurantSite device={device} />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Shimmer animation style */}
      <style>{`
        .preview-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.06) 40%,
            rgba(255,255,255,0.12) 50%,
            rgba(255,255,255,0.06) 60%,
            rgba(255,255,255,0) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          animation: shimmer-text 2.5s ease-in-out infinite;
        }
        @keyframes shimmer-text {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </section>
  )
}

/* Mock Restaurant Website (rendered inside the preview frame) */
const MockRestaurantSite: React.FC<{ device: string }> = ({ device }) => {
  const isMobile = device === 'mobile'

  return (
    <div className="font-sans text-gray-900 overflow-hidden">
      {/* Restaurant navbar */}
      <nav className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-amber-600 to-orange-400 shrink-0" />
          <span className={`font-bold tracking-tight text-gray-900 ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
            La Maison
          </span>
        </div>
        {!isMobile && (
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-gray-500 font-medium">
            <span className="hover:text-gray-900 cursor-pointer transition-colors">Menu</span>
            <span className="hover:text-gray-900 cursor-pointer transition-colors">About</span>
            <span className="hover:text-gray-900 cursor-pointer transition-colors">Gallery</span>
            <span className="hover:text-gray-900 cursor-pointer transition-colors">Contact</span>
          </div>
        )}
        <button type="button" className={`bg-gray-900 text-white font-semibold rounded-full shadow-sm ${isMobile ? 'text-[9px] px-2.5 py-1' : 'text-[9px] sm:text-[10px] px-2.5 sm:px-3 py-1 sm:py-1.5'}`}>
          Reserve
        </button>
      </nav>

      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div
          className={`bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex ${
            isMobile ? 'flex-col p-3.5 gap-3' : 'flex-col sm:flex-row items-center p-4 sm:p-6 md:p-8 gap-4 sm:gap-6'
          }`}
        >
          <div className={`${isMobile ? 'text-center' : 'flex-1'} space-y-1.5 sm:space-y-2`}>
            <p className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.2em] text-amber-700/70">Est. 2018 · Paris</p>
            <h1 className={`font-bold text-gray-900 leading-tight ${isMobile ? 'text-base' : 'text-lg sm:text-xl md:text-2xl'}`}>
              A taste of {isMobile ? '' : <br className="hidden sm:inline" />}
              <span className="italic text-amber-700"> French tradition.</span>
            </h1>
            <p className={`text-gray-500 leading-relaxed ${isMobile ? 'text-[10px]' : 'text-[10px] sm:text-[11px] max-w-xs'}`}>
              Seasonal menus crafted from locally-sourced ingredients in the heart of the city.
            </p>
            <div className={`flex items-center gap-2 pt-1 ${isMobile ? 'justify-center' : ''}`}>
              <button type="button" className={`bg-gray-900 text-white font-semibold rounded-md ${isMobile ? 'text-[9px] px-2.5 py-1' : 'text-[9px] sm:text-[10px] px-3 sm:px-4 py-1.5 sm:py-2'}`}>
                Reserve a Table
              </button>
              <button type="button" className={`text-gray-600 bg-white border border-gray-200 font-medium rounded-md ${isMobile ? 'text-[9px] px-2 py-1' : 'text-[9px] sm:text-[10px] px-2.5 sm:px-3 py-1.5 sm:py-2'}`}>
                View Menu
              </button>
            </div>
          </div>
          <div className={`${isMobile ? 'w-full h-28 sm:h-32' : 'w-full sm:w-36 sm:h-36 md:w-44 md:h-44 shrink-0'} rounded-xl overflow-hidden bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center`}>
            <img className="w-full h-full object-cover rounded-xl" src="/hero.png" alt="Restaurant interior" />
          </div>
        </div>

        {/* Stats row */}
        <div className={`border-t border-gray-100 bg-white grid ${isMobile ? 'grid-cols-2 gap-2 p-2.5' : 'grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 px-4 sm:px-8 py-2.5 sm:py-3'}`}>
          {[
            { num: '15+', label: 'Years' },
            { num: '200+', label: 'Dishes' },
            { num: '4.9', label: 'Rating' },
            { num: '50k+', label: 'Guests' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={`font-bold text-gray-900 ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>{s.num}</p>
              <p className="text-[8px] sm:text-[9px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PreviewSection

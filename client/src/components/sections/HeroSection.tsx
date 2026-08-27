import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '@/configs/axios'
import { authClient } from '@/lib/auth-client'
import { 
  Loader2Icon, 
  SparklesIcon, 
  ArrowRightIcon, 
  Code2Icon, 
  UtensilsIcon,
  BriefcaseIcon,
  StoreIcon,
  UserCheckIcon,
  CompassIcon,
  Wand2Icon,
  GlobeIcon
} from 'lucide-react'

export const PROMPT_EXAMPLES = [
  "a cafe website",
  "a portfolio",
  "a local shop site",
  "my personal brand page",
  "a boutique restaurant site",
  "a consulting portfolio"
];

export const BUILD_MODES = [
  { id: 'cafe', label: 'Cafe & Restaurant', icon: UtensilsIcon, template: 'Create a warm, welcoming website for an artisan cafe with menu, operating hours, location details, and table booking CTA.' },
  { id: 'portfolio', label: 'Portfolio', icon: BriefcaseIcon, template: 'Create a sleek personal portfolio featuring a work showcase grid, skills summary, about section, and contact form.' },
  { id: 'local-shop', label: 'Local Business', icon: StoreIcon, template: 'Create a clean website for a local shop featuring products & services list, store address, opening hours, and WhatsApp chat link.' },
  { id: 'personal-brand', label: 'Personal Brand', icon: UserCheckIcon, template: 'Create an engaging personal brand website with bio, featured highlights, social proof, and booking inquiry section.' },
  { id: 'services', label: 'Services & Studio', icon: CompassIcon, template: 'Create a professional services site featuring service packages, client testimonials, FAQ accordion, and consultation request CTA.' }
];

interface HeroSectionProps {
  input: string;
  setInput: (val: string) => void;
  loading?: boolean;
  isFocused: boolean;
  setIsFocused: (val: boolean) => void;
  selectedMode: string | null;
  placeholderText: string;
  showProfileNudge: boolean;
  onSubmitHandler?: (e: React.FormEvent) => void;
  handleSelectMode: (mode: typeof BUILD_MODES[0]) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  input,
  setInput,
  loading: externalLoading,
  isFocused,
  setIsFocused,
  selectedMode,
  placeholderText,
  showProfileNudge,
  onSubmitHandler,
  handleSelectMode,
}) => {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const [internalLoading, setInternalLoading] = useState(false)
  const loading = externalLoading ?? internalLoading

  const handleFormSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault()
    if (onSubmitHandler) {
      return onSubmitHandler(e as React.FormEvent)
    }
    try {
      if (!session?.user) {
        return toast.error('You must be logged in to create a project')
      } else if (!input.trim()) {
        return toast.error('Please enter a message')
      }
      setInternalLoading(true)
      const { data } = await api.post('/api/user/project', { initial_prompt: input })
      window.dispatchEvent(new Event('refresh-credits'))
      setInternalLoading(false)
      navigate(`/projects/${data.projectId}`)
    } catch (error: any) {
      setInternalLoading(false)
      toast.error(error.response?.data?.message || error.message)
      console.log(error)
    }
  }

  // Refined Mouse Parallax Logic
  // Desktop: ±12–18px max movement
  // Tablet: ±8–12px max movement
  // Mobile: Disabled
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
  const targetOffset = useRef({ x: 0, y: 0 })
  const animationFrameId = useRef<number | null>(null)
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const isTouch = window.innerWidth < 768 || 'ontouchstart' in window
    setIsReducedMotion(motionQuery.matches || isTouch)

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches || isTouch)
    }
    motionQuery.addEventListener('change', handleMotionChange)

    const handleMouseMove = (e: MouseEvent) => {
      if (motionQuery.matches || isTouch) return
      const { innerWidth, innerHeight } = window

      let factorX = 32 // Desktop ±16px max
      let factorY = 26 // Desktop ±13px max

      if (innerWidth < 1024) {
        factorX = 20 // Tablet ±10px max
        factorY = 16 // Tablet ±8px max
      }

      const x = ((e.clientX / innerWidth) - 0.5) * factorX
      const y = ((e.clientY / innerHeight) - 0.5) * factorY
      targetOffset.current = { x, y }
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Smooth Lerp Animation Loop
    const animate = () => {
      setMouseOffset(prev => {
        const dx = targetOffset.current.x - prev.x
        const dy = targetOffset.current.y - prev.y
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
          return targetOffset.current
        }
        return {
          x: prev.x + dx * 0.05,
          y: prev.y + dy * 0.05
        }
      })
      animationFrameId.current = requestAnimationFrame(animate)
    }

    animationFrameId.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      motionQuery.removeEventListener('change', handleMotionChange)
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
    }
  }, [])

  return (
    <section className="relative min-h-[92vh] sm:min-h-screen w-full flex flex-col justify-center items-start pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden bg-[#0a0c10] text-white">
      {/* ─── 1. Cinematic Landscape Background Image with Parallax & Slow Ambient Zoom ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] transition-transform duration-700 ease-out"
          style={{
            transform: !isReducedMotion
              ? `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`
              : 'none',
          }}
        >
          <img 
            src="/background.png" 
            alt="Buildo Creation World"
            className="w-full h-full object-cover object-[78%_center] sm:object-[82%_center] md:object-right-center animate-[slowAmbientZoom_16s_ease-in-out_infinite_alternate]"
          />
        </div>

        {/* Ambient CSS Keyframe Animation: Scale 1.00 -> 1.035 over 16 seconds */}
        <style>{`
          @keyframes slowAmbientZoom {
            0% { transform: scale(1.00); }
            100% { transform: scale(1.035); }
          }
        `}</style>

        {/* Atmospheric Subtle Readability Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090d]/85 via-[#08090d]/55 to-transparent max-w-4xl" />
        <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-[#08090d]/70 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/60 to-transparent" />
      </div>

      {/* ─── 2. Main Hero Body Content (With Generous Vertical Breathing Room) ─── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-start justify-center">
        <div className="max-w-3xl space-y-6">
          {/* Eyebrow Pill / Nudge */}
          {showProfileNudge ? (
            <button
              onClick={() => navigate('/account/settings', { state: { section: 'profile', scrollTo: 'profile-public' } })}
              className="group inline-flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-full p-1.5 pr-4 text-xs
                transition-all duration-300 shadow-xl shadow-black/30 hover:scale-[1.02] backdrop-blur-md"
            >
              <span className="bg-indigo-600/30 border border-indigo-400/40 text-indigo-200 text-[10px] font-mono-tech uppercase font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <GlobeIcon className="size-3" /> PUBLIC PROFILE
              </span>
              <span className="text-gray-200 font-medium group-hover:text-white transition-colors">
                Turn on public profile to showcase creations
              </span>
              <ArrowRightIcon className="size-3.5 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1 text-xs text-amber-200 font-medium shadow-sm">
              <SparklesIcon className="size-3.5 text-amber-300" />
              <span>Prompt → AI Generation → Live Website</span>
            </div>
          )}

          {/* Hero Editorial Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.06] text-white drop-shadow-md">
            Build websites at the <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-200 via-white to-cyan-200 bg-clip-text text-transparent">
              speed of thought.
            </span>
          </h1>

          {/* Concise Supporting Text */}
          <p className="text-base sm:text-lg text-gray-200/90 font-normal leading-relaxed max-w-xl drop-shadow">
            Describe your idea. Buildo turns it into a real website.
          </p>
        </div>

        {/* ─── 3. Refined Transparent Glass Command Dock ─── */}
        <div className="w-full max-w-2xl sm:max-w-3xl mt-8 sm:mt-10">
          <form
            onSubmit={handleFormSubmit}
            className={`bg-white/[0.06] backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all duration-300 shadow-2xl shadow-black/40 relative group ${
              isFocused
                ? 'border-white/40 ring-4 ring-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.25)]'
                : 'border-white/20 hover:border-white/30'
            }`}
          >
            {/* Input Area with Typewriter Placeholder */}
            <div className="relative min-h-[110px]">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="bg-transparent outline-none text-white placeholder:text-gray-300/60 resize-none w-full text-base sm:text-lg font-sans leading-relaxed min-h-[110px] relative z-10 drop-shadow-sm"
                placeholder={"e.g. Let's build " + placeholderText + (!isFocused && input.length === 0 ? "│" : "")}
                required
              />
            </div>

            {/* Bottom Row Actions & Synthesize CTA */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-1 border-t border-white/15">
              <div className="text-[11px] font-mono-tech text-gray-300/80 hidden sm:flex items-center gap-1.5">
                <Code2Icon className="size-3.5 text-amber-300" />
                <span>Press ↵ to generate website layout</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="ml-auto inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 hover:from-indigo-500 hover:to-violet-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-white font-semibold text-xs sm:text-sm rounded-xl px-5 py-2.5 transition-all duration-200 shadow-lg shadow-indigo-950/50 border border-white/20"
              >
                {!loading ? (
                  <>
                    <span>Build</span>
                    <Wand2Icon className="size-4 text-amber-200" />
                  </>
                ) : (
                  <>
                    <span>Building</span>
                    <Loader2Icon className="animate-spin size-4 text-white" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Category Chips below Prompt */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {BUILD_MODES.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleSelectMode(mode)}
                  className={`inline-flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'bg-white/25 text-white border-white/40 shadow-md shadow-black/30 font-semibold'
                      : 'bg-white/10 hover:bg-white/20 border-white/15 text-gray-200 hover:text-white'
                  }`}
                >
                  <Icon className={`size-3.5 ${isSelected ? 'text-amber-300' : 'text-gray-300'}`} />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

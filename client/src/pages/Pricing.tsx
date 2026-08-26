import React, { useState, useEffect, useRef } from 'react'
import { appPlans } from '../assets/assets'
import { CheckIcon, ZapIcon, Loader2Icon, SparklesIcon, ArrowRightIcon } from 'lucide-react'
import api from '@/configs/axios'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { useNavigate } from 'react-router-dom'
import { load } from '@cashfreepayments/cashfree-js'
import { motion } from 'framer-motion'

interface Plan {
  id: string
  name: string
  price: string
  credits: number
  description: string
  features: string[]
  originalPrice?: string
}

const ORIGINAL_PRICES: Record<string, string> = {
  basic: '$10',
  pro: '$35',
  enterprise: '$80',
}

const Pricing: React.FC = () => {
  const [plans] = useState<Plan[]>(appPlans)
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [creditsCost, setCreditsCost] = useState<number>(5)
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()

  // ── Parallax & Ambient Motion Logic ──
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
  const targetOffset = useRef({ x: 0, y: 0 })
  const animationFrameId = useRef<number | null>(null)
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  useEffect(() => {
    // Accessibility check for reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(motionQuery.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches)
    motionQuery.addEventListener('change', handleMotionChange)

    if (motionQuery.matches) return

    // Subtle parallax shift factor
    const factorX = 14
    const factorY = 10

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
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

  useEffect(() => {
    // Scroll to top on mount
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)

    api.get('/api/user/credits-config')
      .then(({ data }) => {
        if (data?.creditsPerGeneration) {
          setCreditsCost(data.creditsPerGeneration)
        }
      })
      .catch(console.error)
  }, [])

  const handlePurchase = async (planId: string) => {
    if (!session?.user) {
      toast.error('Please sign in to purchase credits')
      navigate('/auth/signin')
      return
    }

    try {
      setLoadingPlanId(planId)

      // 1. Create a Cashfree order on the backend
      const { data } = await api.post('/api/cashfree/create-order', { planId })
      const { payment_session_id } = data

      // 2. Load Cashfree JS SDK
      const cashfree = await load({
        mode: (import.meta.env.VITE_CASHFREE_ENV as 'sandbox' | 'production') || 'sandbox',
      })

      // 3. Launch hosted checkout
      const result = await cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: '_self',
      })

      if (result?.error) {
        toast.error(result.error.message || 'Payment was cancelled or failed')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message)
      console.error('[Pricing] purchase error:', error)
    } finally {
      setLoadingPlanId(null)
    }
  }

  const isRecommended = (planId: string) => planId === 'pro'

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-hidden bg-[#08090d]">
      {/* ── Background Image with Parallax & Slow Ambient Zoom ── */}
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
            src="/price.png" 
            alt="Buildo Pricing World"
            className="w-full h-full object-cover animate-[slowAmbientZoom_16s_ease-in-out_infinite_alternate]"
          />
        </div>

        {/* Ambient CSS Keyframe Animation: Scale 1.00 -> 1.035 over 16 seconds */}
        <style>{`
          @keyframes slowAmbientZoom {
            0% { transform: scale(1.00); }
            100% { transform: scale(1.035); }
          }
        `}</style>
      </div>

      {/* Soft atmospheric overlays */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-sky-900/10 via-transparent to-sky-950/20 pointer-events-none z-0" />
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-[#08090d]/70 to-transparent pointer-events-none z-0" />

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto pt-24 sm:pt-32 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-gray-900 text-xs font-mono tracking-wider uppercase font-semibold shadow-sm mb-4"
          >
            <ZapIcon className="size-3.5 text-amber-600" />
            <span>FLEXIBLE CREDIT PACKS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]"
          >
            Build faster.{' '}
            <span className="font-serif-italic text-gray-800">Scale effortless.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="text-sm sm:text-base text-gray-800 max-w-xl mx-auto mt-4 font-medium leading-relaxed"
          >
            Choose the perfect credit plan for your workflow. Build, revise, and launch your websites — 1 Creation or Revision = {creditsCost} Credits.
          </motion.p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pb-20 items-stretch">
          {plans.map((plan, idx) => {
            const highlighted = isRecommended(plan.id)
            const originalPrice = ORIGINAL_PRICES[plan.id] || '$10'

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.15 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-gray-900 transition-all duration-300 backdrop-blur-2xl border shadow-2xl shadow-sky-950/10 ${
                  highlighted
                    ? 'bg-white/60 border-white/80 ring-2 ring-indigo-500/30'
                    : 'bg-white/45 border-white/60 hover:bg-white/55'
                }`}
              >
                <div>
                  {/* Card Header & Title */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900">{plan.name}</h3>
                    {highlighted && (
                      <span className="bg-indigo-600/15 border border-indigo-500/30 text-indigo-700 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <SparklesIcon className="size-3 text-indigo-600" /> RECOMMENDED
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 font-normal leading-relaxed min-h-[40px]">
                    {plan.description}
                  </p>

                  {/* Pricing Row */}
                  <div className="my-6 pb-6 border-b border-gray-900/10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                        {plan.price}
                      </span>
                      {originalPrice && (
                        <span className="text-base text-gray-500 line-through font-normal">
                          {originalPrice}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-gray-600">/one-time</span>
                    </div>

                    <p className="text-xs text-gray-800 font-semibold mt-2">
                      Includes <strong className="text-gray-900 font-extrabold">{plan.credits.toLocaleString()} credits</strong>
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={loadingPlanId === plan.id}
                    className={`w-full py-3.5 px-5 text-xs sm:text-sm font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 mb-8 shadow-sm ${
                      highlighted
                        ? 'bg-[#181920] hover:bg-black text-white shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-95'
                        : 'bg-white/80 hover:bg-white border border-gray-300/80 text-gray-900 hover:scale-[1.02] active:scale-95'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {loadingPlanId === plan.id ? (
                      <>
                        <Loader2Icon className="size-4 animate-spin" />
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <>
                        <span>Get started</span>
                        <ArrowRightIcon className="size-4" />
                      </>
                    )}
                  </button>

                  {/* Features List */}
                  <ul className="space-y-3 text-xs sm:text-sm font-medium">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-800 gap-2.5">
                        <div className="size-4 rounded-full bg-indigo-600/15 text-indigo-700 flex items-center justify-center shrink-0">
                          <CheckIcon className="size-3 stroke-[3]" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </motion.div>
            )
          })}
        </div>

        <p className="text-center text-xs font-medium text-white/80 max-w-md mx-auto pb-16 leading-relaxed">
          Project creation and revisions consume {creditsCost} credits each. Purchased credits never expire.
        </p>

      </div>
    </div>
  )
}

export default Pricing

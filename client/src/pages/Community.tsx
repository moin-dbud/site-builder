import React, { useEffect, useRef, useState } from 'react'
import type { Project } from '../types'
import {
  ExternalLinkIcon,
  GlobeIcon,
  Loader2Icon,
  SparklesIcon,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/configs/axios'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

const Community: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // ── Parallax & Ambient Motion Logic ──
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
  const targetOffset = useRef({ x: 0, y: 0 })
  const animationFrameId = useRef<number | null>(null)
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(motionQuery.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches)
    motionQuery.addEventListener('change', handleMotionChange)

    if (motionQuery.matches) return

    const factorX = 14
    const factorY = 10

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      const x = ((e.clientX / innerWidth) - 0.5) * factorX
      const y = ((e.clientY / innerHeight) - 0.5) * factorY
      targetOffset.current = { x, y }
    }

    window.addEventListener('mousemove', handleMouseMove)

    const animate = () => {
      setMouseOffset(prev => {
        const dx = targetOffset.current.x - prev.x
        const dy = targetOffset.current.y - prev.y
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
          return targetOffset.current
        }
        return {
          x: prev.x + dx * 0.05,
          y: prev.y + dy * 0.05,
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

  // Force scroll to top on mount
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [])

  const fetchPublishedProjects = async () => {
    try {
      const { data } = await api.get('/api/project/published')
      setProjects(data.projects)
      setLoading(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message)
      console.log(error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPublishedProjects()
  }, [])

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
            alt="Buildo Community World"
            className="w-full h-full object-cover animate-[slowAmbientZoom_16s_ease-in-out_infinite_alternate]"
          />
        </div>

        <style>{`
          @keyframes slowAmbientZoom {
            0% { transform: scale(1.00); }
            100% { transform: scale(1.035); }
          }
        `}</style>
      </div>

      {/* Atmospheric Overlays */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-sky-900/10 via-transparent to-sky-950/20 pointer-events-none z-0" />
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-[#08090d]/70 to-transparent pointer-events-none z-0" />

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto pt-24 sm:pt-32 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-gray-900 text-xs font-mono tracking-wider uppercase font-semibold shadow-sm mb-4"
          >
            <GlobeIcon className="size-3.5 text-cyan-600" />
            <span>COMMUNITY SHOWCASE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]"
          >
            Explore Creations.{' '}
            <span className="font-serif-italic text-gray-800">Made by creators.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="text-sm sm:text-base text-gray-800 max-w-xl mx-auto mt-4 font-medium leading-relaxed"
          >
            Discover modern, responsive websites built with Buildo AI and published by creators worldwide.
          </motion.p>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-800 gap-3">
            <Loader2Icon className="size-8 animate-spin text-cyan-600" />
            <span className="font-mono text-xs font-semibold">FETCHING_COMMUNITY_CREATIONS...</span>
          </div>
        ) : projects.length > 0 ? (
          <div className="pb-24">
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
              {projects.map((project, idx) => {
                const targetUrl = project.user?.username && project.slug 
                  ? `/@${project.user.username}/${project.slug}` 
                  : `/view/${project.id}`

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 32, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.55, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="group relative bg-white/45 hover:bg-white/60 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-sky-950/10 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
                  >
                    <Link to={targetUrl} className="flex-1 flex flex-col justify-between">
                      {/* Browser Dots Bar */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-white/30 backdrop-blur-md border-b border-gray-900/10 text-xs font-mono text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <span className="size-2.5 rounded-full bg-rose-500/80" />
                          <span className="size-2.5 rounded-full bg-amber-500/80" />
                          <span className="size-2.5 rounded-full bg-emerald-500/80" />
                        </div>
                        <span className="text-[10px] text-gray-700 font-semibold uppercase tracking-wider truncate max-w-[160px]">
                          {project.name}
                        </span>
                      </div>

                      {/* Scaled Preview Frame */}
                      <div className="relative w-full h-48 bg-[#0c0d12] overflow-hidden border-b border-gray-900/10">
                        {project.current_code ? (
                          <iframe
                            srcDoc={project.current_code}
                            className="absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none"
                            sandbox="allow-scripts"
                            style={{ transform: 'scale(0.3)' }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs font-mono gap-2">
                            <SparklesIcon className="size-6 text-cyan-400 animate-pulse" />
                            <span>Live View...</span>
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-center justify-center">
                          <span className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105">
                            <ExternalLinkIcon className="size-3.5" /> Visit Site
                          </span>
                        </div>
                      </div>

                      {/* Card Content & Metadata */}
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h2 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-cyan-700 transition-colors">
                              {project.name}
                            </h2>
                            {project.featured ? (
                              <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-800 flex items-center gap-1 shrink-0">
                                <SparklesIcon className="size-3 text-amber-600" /> Featured
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-800 shrink-0">
                                Website
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-700 mt-2 line-clamp-2 leading-relaxed font-normal">
                            {project.initial_prompt}
                          </p>
                        </div>

                        {/* Creator Pill & Date */}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-900/10 text-xs text-gray-600 font-medium">
                          <span>{new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>

                          <div
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (project.user?.username) {
                                navigate(`/@${project.user.username}`)
                              }
                            }}
                            className="flex items-center gap-1.5 bg-white/70 hover:bg-white border border-gray-300/80 px-2.5 py-1 rounded-full text-gray-900 transition-colors cursor-pointer shadow-sm"
                          >
                            <span className="bg-indigo-600 size-4 rounded-full text-white font-bold flex items-center justify-center text-[9px] shrink-0">
                              {project.user?.name?.slice(0, 1) || 'A'}
                            </span>
                            <span className="text-[11px] font-semibold truncate max-w-[100px]">
                              {project.user?.username ? `@${project.user.username}` : project.user?.name || 'Creator'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center pb-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-3xl bg-white/50 backdrop-blur-2xl border border-white/60 shadow-xl max-w-md w-full flex flex-col items-center gap-4 text-gray-900"
            >
              <div className="size-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-700">
                <GlobeIcon className="size-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">No published websites yet</h2>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                Be the first creator to build and publish a website to the community showcase.
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-2 inline-flex items-center gap-2 bg-[#181920] hover:bg-black text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <SparklesIcon className="size-4" />
                <span>Create & Publish</span>
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Community


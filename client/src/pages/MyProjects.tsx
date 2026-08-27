import React, { useEffect, useRef, useState } from 'react'
import type { Project } from '../types'
import {
  ExternalLinkIcon,
  FolderKanbanIcon,
  Loader2Icon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
  LaptopIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '@/configs/axios'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { motion } from 'framer-motion'

const MyProjects: React.FC = () => {
  const { data: session, isPending: isSessionPending } = authClient.useSession()
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

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/api/user/projects')
      setProjects(data.projects)
      setLoading(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message)
      console.log(error)
      setLoading(false)
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this project?')
      if (!confirmDelete) return
      const { data } = await api.delete(`/api/project/${id}`)
      toast.success(data.message)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message)
      console.log(error)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchProjects()
    } else if (!isSessionPending && !session?.user) {
      navigate('/')
      toast('Please login to view your projects')
    }
  }, [session?.user, isSessionPending])

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
            alt="Buildo Projects World"
            className="w-full h-full object-cover animate-slow-ambient-zoom"
          />
        </div>
      </div>

      {/* Stronger overlays — projects are the focus, background recedes */}
      <div aria-hidden="true" className="absolute inset-0 bg-[#08090d]/55 pointer-events-none z-0" />
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#08090d]/80 to-transparent pointer-events-none z-0" />
      <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#08090d]/65 to-transparent pointer-events-none z-0" />

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto pt-24 sm:pt-32 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-gray-900 text-xs font-mono tracking-wider uppercase font-semibold shadow-sm mb-4"
          >
            <FolderKanbanIcon className="size-3.5 text-indigo-600" />
            <span>MY WORKSPACE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]"
          >
            Your Websites.{' '}
            <span className="font-serif-italic text-gray-800">Built with Buildo.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="text-sm sm:text-base text-gray-800 max-w-xl mx-auto mt-4 font-medium leading-relaxed"
          >
            Manage, customize, and preview all your AI-generated website projects in one place.
          </motion.p>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-800 gap-3">
            <Loader2Icon className="size-8 animate-spin text-indigo-600" />
            <span className="font-mono text-xs font-semibold">LOADING_YOUR_PROJECTS...</span>
          </div>
        ) : projects.length > 0 ? (
          <div className="pb-24">
            {/* Action Bar */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 bg-white/40 backdrop-blur-md border border-white/50 px-3.5 py-1.5 rounded-full shadow-sm">
                  {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
                </span>
              </div>
              <button
                onClick={() => navigate('/')}
                className="group inline-flex items-center gap-2 bg-[#181920] hover:bg-black text-white font-semibold text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl transition-all shadow-lg hover:scale-[1.03] active:scale-95"
              >
                <PlusIcon className="size-4 group-hover:rotate-90 transition-transform duration-300" />
                <span>Create New Project</span>
              </button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
              {projects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 32, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.55, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="group relative bg-white/45 hover:bg-white/60 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-sky-950/10 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between"
                >
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
                        <SparklesIcon className="size-6 text-indigo-400 animate-pulse" />
                        <span>Synthesizing Code...</span>
                      </div>
                    )}

                    {/* Hover Overlay Actions */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/preview/${project.id}`)
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white text-gray-900 text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                      >
                        <ExternalLinkIcon className="size-3.5" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/projects/${project.id}`)
                        }}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                      >
                        <LaptopIcon className="size-3.5" />
                        <span>Workspace</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Content & Metadata */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-700 transition-colors">
                          {project.name}
                        </h2>
                        <span className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full shrink-0 border ${
                          project.isPublished
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800'
                            : 'bg-gray-500/15 border-gray-400/30 text-gray-700'
                        }`}>
                          {project.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 mt-2 line-clamp-2 leading-relaxed font-normal">
                        {project.initial_prompt}
                      </p>
                    </div>

                    {/* Bottom Metadata & Delete Action */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex justify-between items-center pt-3 border-t border-gray-900/10 text-xs text-gray-600 font-medium"
                    >
                      <span>{new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>

                      <button
                        type="button"
                        onClick={() => deleteProject(project.id)}
                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-500/15 rounded-lg transition-all"
                        title="Delete Project"
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
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
              <div className="size-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-700">
                <FolderKanbanIcon className="size-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">You haven't created a website yet.</h2>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                Describe your business or brand idea in plain English, and Buildo AI will generate your first website in seconds.
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-2 inline-flex items-center gap-2 bg-[#181920] hover:bg-black text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <PlusIcon className="size-4" />
                <span>Create Your First Project</span>
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyProjects


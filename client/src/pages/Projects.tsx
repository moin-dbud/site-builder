import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import type { Project } from '../types'
import {
  ArrowBigDownDashIcon,
  EyeIcon,
  EyeOffIcon,
  FullscreenIcon,
  LaptopIcon,
  Loader2Icon,
  MessageSquareIcon,
  SaveIcon,
  SmartphoneIcon,
  TabletIcon,
  XIcon,
  ArrowLeftIcon,
  SettingsIcon,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ProjectPreview, { type ProjectPreviewRef } from '../components/ProjectPreview'
import { SettingsModal } from '../components/SettingsModal'
import api from '@/configs/axios'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { motion } from 'framer-motion'

const Projects = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(true)
  const [device, setDevice] = useState<'phone' | 'tablet' | 'desktop'>('desktop')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const previewRef = useRef<ProjectPreviewRef>(null)

  // Force scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [])

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/api/user/project/${projectId}`)
      setProject(data.project)
      setIsGenerating(data.project.current_code ? false : true)
      setLoading(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message)
      console.log(error)
      setLoading(false)
    }
  }

  const saveProject = async () => {
    if (!previewRef.current) return
    const code = previewRef.current.getCode()
    if (!code) return
    setIsSaving(true)
    try {
      const { data } = await api.post(`/api/project/save/${projectId}`, { code })
      toast.success(data.message)
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message)
      console.log(error)
    } finally {
      setIsSaving(false)
    }
  }

  const downloadCode = () => {
    const code = previewRef.current?.getCode() || project?.current_code
    if (!code) return
    const element = document.createElement('a')
    const file = new Blob([code], { type: 'text/html' })
    element.href = URL.createObjectURL(file)
    element.download = `${project?.name || 'index'}.html`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const togglePublish = async () => {
    try {
      let name = project?.name
      if (!project?.isPublished && (!name || name === 'Untitled Project' || name.trim() === '')) {
        const inputName = window.prompt('Enter a name for your published project:', project?.name || '')
        if (inputName !== null && inputName.trim()) {
          name = inputName.trim()
        }
      }

      const { data } = await api.get(`/api/user/publish-toggle/${projectId}?name=${encodeURIComponent(name || '')}`)
      toast.success(data.message)
      if (data.publicUrl) {
        toast.info(`Public URL: ${window.location.origin}${data.publicUrl}`, {
          action: {
            label: 'Open',
            onClick: () => window.open(`${window.location.origin}${data.publicUrl}`, '_blank'),
          },
        })
      }
      setProject(prev => prev ? ({ ...prev, isPublished: data.isPublished, slug: data.slug, name: name || prev.name }) : null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message)
      console.log(error)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchProject()
    } else if (!isPending && !session?.user) {
      navigate('/')
      toast('Please login to view your projects')
    }
  }, [session?.user, isPending])

  useEffect(() => {
    if (project && !project.current_code) {
      const intervalId = setInterval(fetchProject, 10000)
      return () => clearInterval(intervalId)
    }
  }, [project])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F7F5F0] text-[#1a1a2e]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white border border-[#E6E2D8] shadow-xl"
        >
          <div className="size-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
            <Loader2Icon className="size-6 animate-spin text-indigo-600" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-[#1a1a2e]">Loading Buildo Studio</p>
            <p className="text-xs font-mono text-gray-500">PREPARING_CREATIVE_WORKSPACE...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return project ? (
    <div className="flex flex-col h-screen w-full bg-[#F4F2EC] text-[#1a1a2e] font-sans overflow-hidden">
      {/* ── Top Studio Toolbar ── */}
      <div className="flex max-sm:flex-col sm:items-center justify-between gap-3 px-4 py-2.5 bg-[#F7F5F0]/95 backdrop-blur-xl border-b border-[#E5E0D5] z-30 shrink-0 shadow-sm">
        {/* Left Info Section */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/projects')}
            className="size-8 rounded-xl bg-white hover:bg-gray-100 border border-[#E5E0D5] flex items-center justify-center text-gray-700 hover:text-black transition-all shrink-0 active:scale-95 shadow-sm"
            title="Back to My Projects"
          >
            <ArrowLeftIcon className="size-4" />
          </button>

          <div className="min-w-0 max-w-64 sm:max-w-xs">
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm font-bold capitalize text-[#1a1a2e] truncate">{project.name}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`size-1.5 rounded-full shrink-0 ${project.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <p className="text-[10px] font-mono text-gray-500 truncate">
                {project.isPublished ? 'Live & Published' : 'Draft · Saved recently'}
              </p>
            </div>
          </div>

          <div className="sm:hidden flex-1 flex justify-end">
            {isMenuOpen ? (
              <XIcon onClick={() => setIsMenuOpen(false)} className="size-5 text-gray-600 cursor-pointer" />
            ) : (
              <MessageSquareIcon onClick={() => setIsMenuOpen(true)} className="size-5 text-gray-600 cursor-pointer" />
            )}
          </div>
        </div>

        {/* Middle Device View Switcher (Segmented Control) */}
        <div className="hidden sm:flex items-center gap-1 bg-[#EAE6DD]/70 backdrop-blur-md border border-[#E0DBCF] p-1 rounded-xl text-xs">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setDevice('phone')}
            className={`p-1.5 rounded-lg transition-all ${
              device === 'phone' ? 'bg-indigo-600 text-white shadow-sm font-semibold' : 'text-gray-600 hover:text-[#1a1a2e] hover:bg-white/60'
            }`}
            title="Mobile View"
          >
            <SmartphoneIcon className="size-4" />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setDevice('tablet')}
            className={`p-1.5 rounded-lg transition-all ${
              device === 'tablet' ? 'bg-indigo-600 text-white shadow-sm font-semibold' : 'text-gray-600 hover:text-[#1a1a2e] hover:bg-white/60'
            }`}
            title="Tablet View"
          >
            <TabletIcon className="size-4" />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded-lg transition-all ${
              device === 'desktop' ? 'bg-indigo-600 text-white shadow-sm font-semibold' : 'text-gray-600 hover:text-[#1a1a2e] hover:bg-white/60'
            }`}
            title="Desktop View"
          >
            <LaptopIcon className="size-4" />
          </motion.button>
        </div>

        {/* Right Action Controls Hierarchy */}
        <div className="flex items-center justify-end gap-2 text-xs font-medium">
          {/* Secondary Action: Save */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveProject}
            disabled={isSaving}
            className="max-sm:hidden bg-white hover:bg-gray-50 border border-[#E5E0D5] text-gray-700 hover:text-[#1a1a2e] px-3 py-1.5 flex items-center gap-1.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {isSaving ? <Loader2Icon className="animate-spin size-3.5 text-indigo-600" /> : <SaveIcon className="size-3.5 text-indigo-600" />}
            <span>Save</span>
          </motion.button>

          {/* Secondary Action: Preview */}
          <Link
            target="_blank"
            to={`/preview/${projectId}`}
            className="bg-white hover:bg-gray-50 border border-[#E5E0D5] text-gray-700 hover:text-[#1a1a2e] px-3 py-1.5 flex items-center gap-1.5 rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95"
          >
            <FullscreenIcon className="size-3.5 text-sky-600" />
            <span>Preview</span>
          </Link>

          {/* Secondary Action: Download */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadCode}
            className="bg-white hover:bg-gray-50 border border-[#E5E0D5] text-gray-700 hover:text-[#1a1a2e] px-3 py-1.5 flex items-center gap-1.5 rounded-xl transition-all shadow-sm"
          >
            <ArrowBigDownDashIcon className="size-3.5 text-emerald-600" />
            <span>Download</span>
          </motion.button>

          {/* Secondary Action: Settings Modal Trigger */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSettingsOpen(true)}
            className="bg-white hover:bg-gray-50 border border-[#E5E0D5] text-gray-700 hover:text-[#1a1a2e] px-3 py-1.5 flex items-center gap-1.5 rounded-xl transition-all shadow-sm"
            title="Open Buildo Settings"
          >
            <SettingsIcon className="size-3.5 text-indigo-600" />
            <span>Settings</span>
          </motion.button>

          {/* Primary Action: Publish */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePublish}
            className={`px-4 py-1.5 flex items-center gap-1.5 rounded-xl font-semibold transition-all shadow-sm ${
              project.isPublished
                ? 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 hover:from-indigo-500 hover:to-violet-500 text-white border border-white/20 shadow-md shadow-indigo-950/20'
            }`}
          >
            {project.isPublished ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
            <span>{project.isPublished ? 'Unpublish' : 'Publish'}</span>
          </motion.button>
        </div>
      </div>

      {/* ── Studio Workspace Layout ── */}
      <div className={`flex flex-1 overflow-hidden p-2 sm:p-3 gap-3 bg-[#F4F2EC] transition-all duration-300 ${isSettingsOpen ? 'blur-[2px] opacity-90 pointer-events-none select-none' : ''}`}>
        <Sidebar
          isMenuOpen={isMenuOpen}
          project={project}
          setProject={(p) => setProject(p)}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />

        <div className="flex-1 h-full overflow-hidden">
          <ProjectPreview
            ref={previewRef}
            device={device}
            isGenerating={isGenerating}
            project={project}
          />
        </div>
      </div>

      {/* Settings Modal Floating Overlay */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen bg-[#F7F5F0] text-[#1a1a2e] gap-4 p-6 text-center">
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600">
        <XIcon className="size-8" />
      </div>
      <div className="space-y-1">
        <p className="font-bold text-[#1a1a2e] text-lg">Unable to load project workspace</p>
        <p className="text-xs font-mono text-gray-500">The requested project could not be retrieved.</p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="text-xs font-semibold px-5 py-2.5 bg-[#1a1a2e] text-white rounded-xl hover:bg-black transition-all shadow-md active:scale-95"
      >
        Return to Home
      </button>
    </div>
  )
}

export default Projects

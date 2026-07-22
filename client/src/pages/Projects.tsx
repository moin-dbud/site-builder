import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import type { Project } from '../types'
import { ArrowBigDownDashIcon, EyeIcon, EyeOffIcon, FullscreenIcon, LaptopIcon, Loader2Icon, MessageSquareIcon, SaveIcon, SmartphoneIcon, TabletIcon, XIcon, SparklesIcon } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ProjectPreview, { type ProjectPreviewRef } from '../components/ProjectPreview'
import api from '@/configs/axios'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'

const Projects = () => {
    const { projectId } = useParams()
    const navigate = useNavigate()
    const {data: session, isPending} = authClient.useSession()

    const [project, setProject] = useState<Project | null>(null)

    const [loading, setLoading] = useState(true)

    const [isGenerating, setIsGenerating] = useState(true)
    const [device, setDevice] = useState<'phone' | 'tablet' | 'desktop'>('desktop')
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const previewRef = useRef<ProjectPreviewRef>(null)

    const fetchProject = async () => {
        try {
            const {data} = await api.get(`/api/user/project/${projectId}`);
            setProject(data.project)
            setIsGenerating(data.project.current_code ? false : true)
            setLoading(false)
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message);
            console.log(error);
        }
    }

    const saveProject = async () => {
        if (!previewRef.current) return;
        const code = previewRef.current.getCode();
        if(!code) return;
        setIsSaving(true);
        try {
            const {data} = await api.post(`/api/project/save/${projectId}`, {code});
            toast.success(data.message);
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message);
            console.log(error);
        } finally {
            setIsSaving(false);
        }
    }

    const downloadCode = ()=> {
        const code = previewRef.current?.getCode() || project?.current_code;
        if (!code) {
            if (isGenerating) {
                return  
            }
            return
        }
        const element = document.createElement('a')
        const file = new Blob([code], {type: "text/html"})
        element.href = URL.createObjectURL(file)
        element.download = "index.html"
        document.body.appendChild(element)
        element.click();
    }

    const togglePublish = async () => {
        try {
            const {data} = await api.get(`/api/user/publish-toggle/${projectId}`);
            toast.success(data.message);
            setProject((prev)=> prev ? ({...prev, isPublished: !prev.isPublished}) : null)
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message);
            console.log(error);
        }
    }

    useEffect(()=>{
        if (session?.user) {
            fetchProject();
        }else if(!isPending && !session?.user) {
            navigate('/')
            toast("Please login to view your projects")
        }
    }, [session?.user])

    useEffect(()=>{
        if (project && !project.current_code) {
            const intervalId = setInterval(fetchProject, 10000);
            return ()=> clearInterval(intervalId);
        }
    },[project])

    if (loading){
        return(
            <div className='flex items-center justify-center h-screen bg-[#08080a] text-white'>
                <div className='flex flex-col items-center gap-3 font-mono-tech text-xs text-indigo-400'>
                    <Loader2Icon className='size-8 animate-spin text-indigo-500' />
                    <span>LOADING_WORKSPACE...</span>
                </div>
            </div>
        )
    }

  return project ? (
    <div className='flex flex-col h-screen w-full bg-[#08080a] text-white font-sans overflow-hidden'>
        {/* Builder Navigation Bar */}
        <div className='flex max-sm:flex-col sm:items-center justify-between gap-3 px-4 py-2.5 bg-[#08080a] border-b border-[#22242c] no-scrollbar z-30'>
             {/* Left Info Section */}
             <div className='flex items-center gap-3 sm:min-w-80 text-nowrap'>
                <div 
                    onClick={()=>navigate('/')} 
                    className="flex items-center gap-2 cursor-pointer group"
                >
                    <div className="size-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 group-hover:scale-105 transition-transform">
                        <div className="size-full bg-[#08080a] rounded-[6px] flex items-center justify-center">
                            <SparklesIcon className="size-3.5 text-indigo-400" />
                        </div>
                    </div>
                </div>

                <div className='max-w-64 sm:max-w-xs'>
                    <p className='text-xs font-semibold capitalize text-gray-200 truncate'>{project.name}</p>
                    <p className='text-[10px] font-mono-tech text-gray-500 truncate'>
                        {project.isPublished ? 'Live & Published' : 'Draft • Previewing last save'}
                    </p>
                </div>

                <div className='sm:hidden flex-1 flex justify-end'>
                    {isMenuOpen ? <MessageSquareIcon onClick={()=>setIsMenuOpen(false)} className='size-5 text-gray-400 cursor-pointer'/> 
                    : <XIcon onClick={()=>setIsMenuOpen(true)} className='size-5 text-gray-400 cursor-pointer'/>}                    
                </div>
             </div>

             {/* Middle Device Switcher */}
             <div className='hidden sm:flex items-center gap-1 bg-[#111216] border border-[#22242c] p-1 rounded-xl text-xs'>
                <button
                    onClick={()=> setDevice('phone')} 
                    className={`p-1.5 rounded-lg transition-all ${device === 'phone' ? "bg-indigo-600 text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
                    title="Phone View"
                >
                    <SmartphoneIcon className="size-4"/>
                </button>
                <button
                    onClick={()=> setDevice('tablet')} 
                    className={`p-1.5 rounded-lg transition-all ${device === 'tablet' ? "bg-indigo-600 text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
                    title="Tablet View"
                >
                    <TabletIcon className="size-4"/>
                </button>
                <button
                    onClick={()=> setDevice('desktop')} 
                    className={`p-1.5 rounded-lg transition-all ${device === 'desktop' ? "bg-indigo-600 text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
                    title="Desktop View"
                >
                    <LaptopIcon className="size-4"/>
                </button>
             </div>

             {/* Right Action Controls */}
             <div className='flex items-center justify-end gap-2 text-xs font-medium'>
                <button 
                    onClick={saveProject} 
                    disabled={isSaving} 
                    className='max-sm:hidden bg-[#111216] hover:bg-[#181920] border border-[#22242c] text-gray-200 hover:text-white px-3 py-1.5 flex items-center gap-1.5 rounded-xl transition-all active:scale-95 disabled:opacity-50'
                >
                    {isSaving ? <Loader2Icon className="animate-spin size-3.5 text-indigo-400" /> : <SaveIcon className="size-3.5 text-indigo-400" />}
                    <span>Save</span>
                </button>

                <Link 
                    target='_blank' 
                    to={`/preview/${projectId}`} 
                    className="bg-[#111216] hover:bg-[#181920] border border-[#22242c] text-gray-200 hover:text-white px-3 py-1.5 flex items-center gap-1.5 rounded-xl transition-all active:scale-95"
                >
                    <FullscreenIcon className="size-3.5 text-cyan-400" />
                    <span>Preview</span>
                </Link>

                <button 
                    onClick={downloadCode} 
                    className='bg-[#111216] hover:bg-[#181920] border border-[#22242c] text-gray-200 hover:text-white px-3 py-1.5 flex items-center gap-1.5 rounded-xl transition-all active:scale-95'
                >
                    <ArrowBigDownDashIcon className="size-3.5 text-emerald-400" />
                    <span>Download</span>
                </button>

                <button 
                    onClick={togglePublish} 
                    className={`px-3.5 py-1.5 flex items-center gap-1.5 rounded-xl text-white font-medium transition-all active:scale-95 shadow-md ${
                        project.isPublished 
                            ? 'bg-rose-950/80 border border-rose-500/40 text-rose-300 hover:bg-rose-900' 
                            : 'bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30'
                    }`}
                >
                    {project.isPublished ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
                    <span>{project.isPublished ? 'Unpublish' : 'Publish'}</span>
                </button>
             </div>
        </div>

        {/* Builder Workspace Layout */}
        <div className='flex flex-1 overflow-hidden p-2 gap-2'>
            <Sidebar isMenuOpen={isMenuOpen} project={project} setProject={(p)=> setProject(p)} isGenerating={isGenerating} setIsGenerating={setIsGenerating}/>

            <div className='flex-1 h-full overflow-hidden'>
                <ProjectPreview ref={previewRef} device={device} isGenerating={isGenerating} project={project}/> 
            </div>
        </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-screen bg-[#08080a] text-white gap-3'>
        <p className='font-semibold text-gray-200 text-xl font-mono-tech'>UNABLE_TO_LOAD_PROJECT</p>
        <button onClick={()=> navigate('/')} className="text-xs px-4 py-2 bg-indigo-600 text-white rounded-xl">
            Return Home
        </button>
    </div>
  )
}

export default Projects
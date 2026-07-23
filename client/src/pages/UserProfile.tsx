import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Loader2Icon, GlobeIcon, ExternalLinkIcon, CalendarIcon, ArrowLeftIcon, SparklesIcon } from 'lucide-react'
import api from '@/configs/axios'
import { toast } from 'sonner'
import Footer from '../components/Footer'

interface UserProfileData {
    id: string
    name: string
    username: string
    createdAt: string
}

interface ProjectData {
    id: string
    name: string
    slug: string | null
    initial_prompt: string
    current_code: string | null
    isPublished: boolean
    createdAt: string
    updatedAt: string
}

const UserProfile = () => {
    const { username } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<UserProfileData | null>(null)
    const [projects, setProjects] = useState<ProjectData[]>([])

    const cleanUsername = username?.startsWith('@') ? username.slice(1) : username

    const fetchProfile = async () => {
        try {
            if (!cleanUsername) return
            const { data } = await api.get(`/api/user/profile/${cleanUsername}`)
            setUser(data.user)
            setProjects(data.projects || [])
            setLoading(false)
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message)
            console.log(error)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [cleanUsername])

    if (loading) {
        return (
            <div className='flex items-center justify-center h-screen bg-[#08080a] text-white'>
                <div className="flex flex-col items-center gap-3 font-mono-tech text-xs text-indigo-400">
                    <Loader2Icon className='size-8 animate-spin text-indigo-500' />
                    <span>FETCHING_USER_PROFILE...</span>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className='flex flex-col items-center justify-center h-[80vh] bg-[#08080a] text-white p-4 text-center'>
                <div className="p-4 rounded-2xl bg-[#111216] border border-[#22242c] text-rose-400 mb-4">
                    <GlobeIcon className="size-8" />
                </div>
                <h1 className='text-xl font-semibold text-gray-200'>User not found</h1>
                <p className="text-xs text-gray-400 mt-1.5 max-w-sm font-mono-tech">
                    The user @{cleanUsername} does not exist or has been removed.
                </p>
                <button 
                    onClick={() => navigate('/')} 
                    className='inline-flex items-center gap-2 text-xs font-medium text-white px-5 py-2.5 mt-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-md'
                >
                    <ArrowLeftIcon className="size-4" />
                    <span>Back to Home</span>
                </button>
            </div>
        )
    }

    return (
        <>
            <div className='px-4 md:px-16 lg:px-24 xl:px-32 bg-[#08080a] min-h-[85vh] text-white font-sans py-12'>
                {/* Profile Header Banner */}
                <div className='bg-[#111216] border border-[#22242c] rounded-2xl p-6 sm:p-8 mb-10 shadow-xl relative overflow-hidden'>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10'>
                        {/* Avatar */}
                        <div className='size-20 sm:size-24 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 p-1 shrink-0 shadow-lg shadow-indigo-950/50'>
                            <div className='w-full h-full rounded-full bg-[#171920] flex items-center justify-center text-2xl font-bold text-white'>
                                {user.name?.slice(0, 1).toUpperCase() || 'U'}
                            </div>
                        </div>

                        {/* Info */}
                        <div className='flex-1 text-center sm:text-left'>
                            <div className='flex flex-col sm:flex-row sm:items-center gap-2 justify-between'>
                                <div>
                                    <h1 className='text-2xl font-bold text-gray-100 tracking-tight'>{user.name}</h1>
                                    <p className='text-sm font-mono-tech text-indigo-400 mt-0.5'>@{user.username}</p>
                                </div>
                                <span className='inline-flex items-center gap-1.5 text-xs font-mono-tech text-gray-400 bg-[#171920] border border-[#22242c] px-3 py-1.5 rounded-full shrink-0 self-center sm:self-auto mt-2 sm:mt-0'>
                                    <CalendarIcon className='size-3.5 text-gray-500' />
                                    <span>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                </span>
                            </div>

                            <p className='text-xs text-gray-400 mt-3 font-mono-tech max-w-xl line-clamp-2'>
                                Web developer & creator crafting AI-synthesized web experiences on Buildo.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section Title */}
                <div className='flex items-center justify-between mb-8 pb-3 border-b border-[#22242c]'>
                    <div className="flex items-center gap-2">
                        <h2 className='text-lg font-semibold text-gray-100 tracking-tight'>Published Projects</h2>
                        <span className="text-xs font-mono-tech px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                            {projects.length}
                        </span>
                    </div>
                </div>

                {/* Projects Grid */}
                {projects.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {projects.map((project) => {
                            const projectUrl = project.slug ? `/@${user.username}/${project.slug}` : `/view/${project.id}`
                            return (
                                <Link 
                                    key={project.id} 
                                    to={projectUrl}
                                    target='_blank'
                                    className='relative group cursor-pointer bg-[#111216] border border-[#22242c] rounded-2xl overflow-hidden shadow-xl hover:border-indigo-500/50 hover:shadow-indigo-950/20 transition-all duration-300 flex flex-col justify-between'
                                >
                                    {/* Top Browser Header */}
                                    <div className="flex items-center justify-between px-3.5 py-2 bg-[#0c0d10] border-b border-[#1c1e26] text-xs font-mono-tech text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-rose-500/60" />
                                            <span className="size-2 rounded-full bg-amber-500/60" />
                                            <span className="size-2 rounded-full bg-emerald-500/60" />
                                        </div>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider truncate max-w-[150px]">
                                            {project.name}
                                        </span>
                                    </div>

                                    {/* Scaled Preview */}
                                    <div className='relative w-full h-44 bg-[#08080a] overflow-hidden border-b border-[#1c1e26]'>
                                        {project.current_code ? (
                                            <iframe 
                                                srcDoc={project.current_code}
                                                className='absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none'
                                                sandbox='allow-scripts allow-same-origin'
                                                style={{ transform: 'scale(0.28)' }}
                                            />
                                        ) : (
                                            <div className='flex flex-col items-center justify-center h-full text-gray-500 text-xs font-mono-tech gap-1'>
                                                <SparklesIcon className="size-5 text-indigo-400 animate-pulse" />
                                                <span>Live View...</span>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                            <span className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
                                                <ExternalLinkIcon size={14} /> Visit Site
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className='p-4 flex-1 flex flex-col justify-between gap-3'>
                                        <div>
                                            <h3 className='text-sm font-semibold text-gray-100 line-clamp-1 group-hover:text-indigo-400 transition-colors'>
                                                {project.name}
                                            </h3>
                                            <p className='text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed'>
                                                {project.initial_prompt}
                                            </p>
                                        </div>

                                        <div className='flex justify-between items-center pt-2.5 border-t border-[#1c1e26] text-[11px] font-mono-tech text-gray-500'>
                                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                            <span className="text-indigo-400 hover:underline">
                                                /@{user.username}/{project.slug || 'view'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center py-16 text-center bg-[#111216] border border-[#22242c] rounded-2xl p-6'>
                        <GlobeIcon className="size-8 text-gray-500 mb-3" />
                        <h3 className='text-base font-semibold text-gray-300'>No published projects yet</h3>
                        <p className="text-xs text-gray-500 mt-1 font-mono-tech">
                            @{user.username} hasn't published any public websites to Buildo yet.
                        </p>
                    </div>
                )}
            </div>
            <Footer />
        </>
    )
}

export default UserProfile

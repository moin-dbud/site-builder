import { useEffect, useState } from 'react'
import type { Project } from '../types';
import { Loader2Icon, PlusIcon, TrashIcon, SparklesIcon, ExternalLinkIcon, FolderKanbanIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import api from '@/configs/axios';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

const MyProjects = () => {

    const {data: session, isPending} = authClient.useSession();

    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([])
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            const {data} = await api.get('/api/user/projects');
            setProjects(data.projects);
            setLoading(false);
        } catch (error: any) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message);
        }
    }

    useEffect(() => {
        if (session?.user && !isPending) {
            fetchProjects()
        }else if (!isPending && !session?.user) {
            navigate('/');
            toast("Please login to view your projects")
        }
    }, [session?.user, isPending])

    const deleteProject = async (projectId: string) => {
        try {
            const confirm = window.confirm('Are you sure you want to delete this project?');
            if (!confirm) return;
            const {data} = await api.delete(`/api/project/${projectId}`);
            toast.success(data.message);
            fetchProjects();
        } catch (error: any) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message);
        }
    }

    return (
        <>
            <div className='px-4 md:px-16 lg:px-24 xl:px-32 bg-[#08080a] min-h-[85vh] text-white font-sans'>
                {loading ? (
                    <div className='flex items-center justify-center h-[80vh]'>
                        <div className="flex flex-col items-center gap-3 font-mono-tech text-xs text-indigo-400">
                            <Loader2Icon className='size-8 animate-spin text-indigo-500' />
                            <span>FETCHING_PROJECTS...</span>
                        </div>
                    </div>
                ) : projects.length > 0 ? (
                    <div className='py-12'>
                        {/* Section Title */}
                        <div className='flex items-center justify-between mb-10 pb-4 border-b border-[#22242c]'>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className='text-2xl font-semibold text-gray-100 tracking-tight'>My Projects</h1>
                                    <span className="text-xs font-mono-tech px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300">
                                        {projects.length} Total
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 font-mono-tech">
                                    Manage, edit, and publish your generated website projects
                                </p>
                            </div>

                            <button 
                                onClick={()=> navigate('/')} 
                                className='flex items-center gap-2 text-xs font-semibold text-white px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 shadow-md shadow-indigo-950/40 active:scale-95 transition-all'
                            >
                                <PlusIcon size={16} /> Create New Project
                            </button>
                        </div>

                        {/* Projects Grid */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {projects.map((project)=>(
                                <div 
                                    onClick={()=> navigate(`/projects/${project.id}`)} 
                                    key={project.id} 
                                    className='relative group cursor-pointer bg-[#111216] border border-[#22242c] rounded-2xl overflow-hidden shadow-xl hover:border-indigo-500/50 hover:shadow-indigo-950/20 transition-all duration-300 flex flex-col justify-between'
                                >
                                    {/* Top Browser Dots Bar */}
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

                                    {/* Scaled Preview Frame */}
                                    <div className='relative w-full h-44 bg-[#08080a] overflow-hidden border-b border-[#1c1e26]'>
                                        {project.current_code ? (
                                            <iframe 
                                                srcDoc={project.current_code}
                                                className='absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none'
                                                sandbox='allow-scripts allow-same-origin'
                                                style={{transform: 'scale(0.28)'}}
                                            />
                                        ) : (
                                            <div className='flex flex-col items-center justify-center h-full text-gray-500 text-xs font-mono-tech gap-1'>
                                                <SparklesIcon className="size-5 text-indigo-400 animate-pulse" />
                                                <span>Synthesizing Code...</span>
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                                            <button 
                                                onClick={(e)=>{ e.stopPropagation(); navigate(`/preview/${project.id}`); }}
                                                className="p-2 rounded-xl bg-[#111216]/90 border border-[#22242c] text-gray-200 hover:text-white hover:border-indigo-500/50 transition-all text-xs font-medium flex items-center gap-1.5"
                                            >
                                                <ExternalLinkIcon size={14} /> Preview
                                            </button>
                                            <button 
                                                onClick={(e)=>{ e.stopPropagation(); navigate(`/projects/${project.id}`); }}
                                                className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all text-xs font-medium"
                                            >
                                                Open Workspace
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className='p-4.5 flex-1 flex flex-col justify-between gap-3'>
                                        <div>
                                            <div className='flex items-start justify-between gap-2'>
                                                <h2 className='text-sm font-semibold text-gray-100 line-clamp-1 group-hover:text-indigo-300 transition-colors'>
                                                    {project.name}
                                                </h2>
                                                <span className='px-2 py-0.5 text-[10px] font-mono-tech bg-[#171920] border border-[#22242c] text-gray-400 rounded-full shrink-0'>
                                                    {project.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            </div>
                                            <p className='text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed'>
                                                {project.initial_prompt}
                                            </p>
                                        </div>

                                        {/* Bottom Metadata & Delete Action */}
                                        <div onClick={(e)=>e.stopPropagation()} className='flex justify-between items-center pt-3 border-t border-[#1c1e26] text-xs font-mono-tech text-gray-500'>
                                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                            
                                            <button 
                                                onClick={()=> deleteProject(project.id)} 
                                                className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-all"
                                                title="Delete Project"
                                            >
                                                <TrashIcon size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center h-[75vh] text-center'>
                        <div className="p-4 rounded-2xl bg-[#111216] border border-[#22242c] text-indigo-400 mb-4">
                            <FolderKanbanIcon className="size-8" />
                        </div>
                        <h1 className='text-xl font-semibold text-gray-200'>No projects synthesized yet</h1>
                        <p className="text-xs text-gray-400 mt-1.5 max-w-sm font-mono-tech">
                            Describe your idea in the command dock and Buildo will build your first responsive website.
                        </p>
                        <button 
                            onClick={()=> navigate('/')} 
                            className='text-xs font-medium text-white px-5 py-2.5 mt-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-md shadow-indigo-950/50'
                        >
                            Create First Project
                        </button>
                    </div>
                )}
            </div>
            <Footer/>
        </>
    )
}

export default MyProjects
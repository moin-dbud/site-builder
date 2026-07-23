import { useEffect, useState } from 'react'
import type { Project } from '../types';
import { Loader2Icon, GlobeIcon, SparklesIcon, ExternalLinkIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/configs/axios';
import { toast } from 'sonner';
import Footer from '../components/Footer';

const Community = () => {

    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([])
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            const {data} = await api.get('/api/project/published');
            setProjects(data.projects);
            setLoading(false);
        } catch (error: any) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message);
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    return (
        <>
            <div className='px-4 md:px-16 lg:px-24 xl:px-32 bg-[#08080a] min-h-[85vh] text-white font-sans'>
                {loading ? (
                    <div className='flex items-center justify-center h-[80vh]'>
                        <div className="flex flex-col items-center gap-3 font-mono-tech text-xs text-indigo-400">
                            <Loader2Icon className='size-8 animate-spin text-indigo-500' />
                            <span>FETCHING_COMMUNITY_PROJECTS...</span>
                        </div>
                    </div>
                ) : projects.length > 0 ? (
                    <div className='py-12'>
                        {/* Section Header */}
                        <div className='flex items-center justify-between mb-10 pb-4 border-b border-[#22242c]'>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className='text-2xl font-semibold text-gray-100 tracking-tight'>Community Showcase</h1>
                                    <span className="text-xs font-mono-tech px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                                        {projects.length} Published
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 font-mono-tech">
                                    Explore live websites synthesized by creator developers using Buildo AI
                                </p>
                            </div>
                        </div>

                        {/* Projects Grid */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {projects.map((project)=>{
                                const projectUrl = project.user?.username && project.slug ? `/@${project.user.username}/${project.slug}` : `/view/${project.id}`;
                                return (
                                <Link 
                                    key={project.id} 
                                    to={projectUrl}
                                    target='_blank'
                                    className='relative group cursor-pointer bg-[#111216] border border-[#22242c] rounded-2xl overflow-hidden shadow-xl hover:border-cyan-500/50 hover:shadow-cyan-950/20 transition-all duration-300 flex flex-col justify-between'
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
                                                style={{transform: 'scale(0.28)'}}
                                            />
                                        ) : (
                                            <div className='flex flex-col items-center justify-center h-full text-gray-500 text-xs font-mono-tech gap-1'>
                                                <SparklesIcon className="size-5 text-cyan-400 animate-pulse" />
                                                <span>Live View...</span>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                            <span className="px-3.5 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
                                                <ExternalLinkIcon size={14} /> Visit Site
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className='p-4.5 flex-1 flex flex-col justify-between gap-3'>
                                        <div>
                                            <div className='flex items-start justify-between gap-2'>
                                                <h2 className='text-sm font-semibold text-gray-100 line-clamp-1 group-hover:text-cyan-300 transition-colors'>
                                                    {project.name}
                                                </h2>
                                                <span className='px-2 py-0.5 text-[10px] font-mono-tech bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 rounded-full shrink-0'>
                                                    Website
                                                </span>
                                            </div>
                                            <p className='text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed'>
                                                {project.initial_prompt}
                                            </p>
                                        </div>

                                        {/* Author & Date */}
                                        <div className='flex justify-between items-center pt-3 border-t border-[#1c1e26] text-xs font-mono-tech text-gray-500'>
                                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                            <div 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (project.user?.username) {
                                                        navigate(`/@${project.user.username}`);
                                                    }
                                                }}
                                                className='flex items-center gap-1.5 bg-[#171920] border border-[#22242c] hover:border-cyan-500/50 hover:bg-[#1c1e26] px-2.5 py-1 rounded-full text-gray-300 transition-colors cursor-pointer'
                                            >
                                                <span className='bg-indigo-600 size-4 rounded-full text-white font-semibold flex items-center justify-center text-[10px]'>
                                                    {project.user?.name?.slice(0,1) || 'A'}
                                                </span>
                                                <span className="text-[11px] truncate max-w-[100px]">
                                                    {project.user?.username ? `@${project.user.username}` : project.user?.name || 'Creator'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )})}
                        </div>
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center h-[75vh] text-center'>
                        <div className="p-4 rounded-2xl bg-[#111216] border border-[#22242c] text-cyan-400 mb-4">
                            <GlobeIcon className="size-8" />
                        </div>
                        <h1 className='text-xl font-semibold text-gray-200'>No published websites yet</h1>
                        <p className="text-xs text-gray-400 mt-1.5 max-w-sm font-mono-tech">
                            Be the first creator to build and publish a website to the community showcase.
                        </p>
                        <button 
                            onClick={()=> navigate('/')} 
                            className='text-xs font-medium text-white px-5 py-2.5 mt-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 transition-all shadow-md'
                        >
                            Synthesize & Publish
                        </button>
                    </div>
                )}
            </div>
            <Footer/>
        </>
    )
}

export default Community
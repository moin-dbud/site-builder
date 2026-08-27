import React, { useEffect, useRef, useState } from 'react'
import type { Message, Project, Version } from '../types';
import { BotIcon, EyeIcon, Loader2Icon, SendIcon, UserIcon, GitCommitIcon, SparklesIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/configs/axios';
import { toast } from 'sonner';

interface SidebarProps {
    isMenuOpen: boolean;
    project: Project,
    setProject: (project: Project) => void;
    isGenerating: boolean;
    setIsGenerating: (isGenerating: boolean) => void;
}

const Sidebar = ({ isMenuOpen, project, setProject, isGenerating, setIsGenerating }
    : SidebarProps
) => {
    const messageRef = useRef<HTMLDivElement>(null)
    const [input, setInput] = useState('')

    const fetchProject = async () => {
        try {
            const {data} = await api.get(`/api/user/project/${project.id}`)
            setProject(data.project);
        } catch (error:any) {
            toast.error(error?.response?.data?.message || error.message);
            console.log(error);
        }
    }

    const handleRollBack = async (versionId: string) => {
        try {
            const confirm = window.confirm('Are you sure you want to roll back to this version?')
            if (!confirm) return;
            setIsGenerating(true)
            const {data} = await api.get(`/api/project/rollback/${project.id}/${versionId}`)
            const {data: data2} = await api.get(`/api/user/project/${project.id}`)
            toast.success(data.message)
            setProject(data2.project)
            setIsGenerating(false)
        } catch (error:any) {
            setIsGenerating(false)
            toast.error(error?.response?.data?.message || error.message);
            console.log(error);
        }

    }

    const handleRevisions = async (e:React.FormEvent) => {
        e.preventDefault()
        let interval: number | undefined;
        try {
            setIsGenerating(true);
            interval = setInterval(()=>{
                fetchProject();
            },10000)
            const {data} = await api.post(`/api/project/revision/${project.id}`,{message:input})
            window.dispatchEvent(new Event('refresh-credits'));
            fetchProject();
            toast.success(data.message);
            setInput('')
            clearInterval(interval)
            setIsGenerating(false)
        } catch (error: any) {
            setIsGenerating(false);
            toast.error(error?.response?.data?.message || error.message);
            console.log(error); 
            clearInterval(interval)
        }

    }

    useEffect(()=>{
        if(messageRef.current){
            messageRef.current.scrollIntoView({behavior:'smooth'})
        }
    },[project.conversation.length,isGenerating])   

    return (
        <div className={`h-full sm:max-w-sm rounded-2xl bg-[#FAF9F5] border border-[#E6E2D8] shadow-sm transition-all duration-300 ${isMenuOpen ? 'max-sm:w-0 overflow-hidden' : 'w-full'}`}>
            <div className='flex flex-col h-full text-[#1a1a2e] font-sans'>
                {/* Assistant Header */}
                <div className='px-4 py-3 border-b border-[#E6E2D8] flex items-center justify-between text-xs text-gray-600 bg-[#F7F5F0]/60 rounded-t-2xl'>
                    <div className='flex items-center gap-1.5'>
                        <SparklesIcon className='size-3.5 text-[#b89158]' />
                        <span className='font-bold text-[#1a1a2e] tracking-tight'>Buildo Assistant</span>
                    </div>
                    <span className='text-[10px] text-gray-500 font-mono'>AI Studio v2.4</span>
                </div>

                {/* Message Container */}
                <div className='flex-1 overflow-y-auto no-scrollbar p-3.5 flex flex-col gap-3.5'>
                    {[...project.conversation, ...project.versions]
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((message) => {
                            const isMessage = 'content' in message;

                            if (isMessage) {
                                const msg = message as Message;
                                const isUser = msg.role === 'user';
                                return (
                                    <div key={msg.id} className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
                                        {!isUser && (
                                            <div className='size-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm'>
                                                <BotIcon className='size-3.5 text-indigo-600' />
                                            </div>
                                        )}
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${isUser ? "bg-[#1a1a2e] text-white rounded-tr-none shadow-md" : "bg-white border border-[#E6E2D8] rounded-tl-none text-[#1a1a2e] shadow-sm font-sans"}`}>
                                            {msg.content}
                                        </div>
                                        {isUser && (
                                            <div className='size-7 rounded-lg bg-[#1a1a2e] border border-gray-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm'>
                                                <UserIcon className='size-3.5 text-white' />
                                            </div>
                                        )}
                                    </div>
                                )
                            } else {
                                const ver = message as Version;
                                return (
                                    <div key={ver.id} className='w-full my-1 p-3 rounded-xl bg-white border border-[#E6E2D8] text-[#1a1a2e] shadow-sm flex flex-col gap-2'>
                                        <div className='flex items-center gap-2 text-xs font-semibold text-gray-800'>
                                            <GitCommitIcon className='size-3.5 text-cyan-600' />
                                            <span>Code snapshot updated</span>
                                        </div>
                                        <span className='text-[10px] text-gray-500 font-mono'>
                                            {new Date(ver.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <div className='flex items-center justify-between pt-1.5 border-t border-gray-100'>
                                            {project.current_version_index === ver.id ? (
                                                <span className='text-[11px] text-emerald-700 font-semibold px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-md'>
                                                    Current Version
                                                </span>
                                            ): (
                                                <button onClick={()=> handleRollBack(ver.id)} className='px-2.5 py-1 rounded-lg text-xs bg-gray-100 hover:bg-indigo-600 border border-gray-200 hover:border-indigo-500 text-gray-700 hover:text-white transition-all font-medium'>
                                                    Roll back
                                                </button>
                                            )}
                                            <Link target='_blank' to={`/preview/${project.id}/${ver.id}`}>
                                                <EyeIcon className='size-7 p-1.5 bg-gray-50 hover:bg-indigo-600 text-gray-600 hover:text-white transition-colors rounded-lg border border-gray-200'/> 
                                            </Link>
                                        </div>
                                    </div>
                                )
                            }
                        })}
                        {
                            isGenerating && (
                                <div className='flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#E6E2D8] shadow-sm'>
                                    <div className='size-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0'>
                                        <BotIcon className='size-3.5 text-indigo-600 animate-pulse'/>
                                    </div>
                                    <span className='text-xs font-medium text-gray-600'>Buildo is revising your website...</span>
                                    <Loader2Icon className='size-3.5 animate-spin text-indigo-600 ml-auto' />
                                </div>
                            )
                        }
                        <div ref={messageRef}/>
                </div>

                {/* Input Area */}
                <form className='p-3 border-t border-[#E6E2D8] bg-[#F7F5F0]/80 rounded-b-2xl' onSubmit={handleRevisions}>
                    <div className='relative flex items-center'>
                        <textarea 
                            onChange={(e)=> setInput(e.target.value)} 
                            value={input} 
                            rows={3} 
                            placeholder='Describe revisions or request UI changes...' 
                            className='w-full p-3 pr-10 rounded-xl resize-none text-xs outline-none border border-[#E6E2D8] focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 bg-white text-[#1a1a2e] placeholder-gray-400 transition-all font-sans shadow-sm' 
                            disabled={isGenerating}
                        />
                        <button 
                            disabled={isGenerating || !input.trim()} 
                            className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-[#1a1a2e] hover:bg-black text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95"
                            title="Send prompt"
                        >
                            {isGenerating ? <Loader2Icon className='size-4 animate-spin text-white'/> : <SendIcon className='size-4 text-white'/>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Sidebar
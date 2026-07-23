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
        <div className={`h-full sm:max-w-sm rounded-2xl bg-[#0b0c0e] border border-[#22242c] transition-all duration-300 ${isMenuOpen ? 'max-sm:w-0 overflow-hidden' : 'w-full'}`}>
            <div className='flex flex-col h-full'>
                {/* Drawer Header */}
                <div className='px-4 py-3 border-b border-[#1c1e26] flex items-center justify-between font-mono-tech text-xs text-gray-400'>
                    <div className='flex items-center gap-1.5'>
                        <SparklesIcon className='size-3.5 text-indigo-400' />
                        <span className='font-semibold text-gray-200'>REVISION_ASSISTANT</span>
                    </div>
                    <span className='text-[10px] text-gray-500'>V2.4</span>
                </div>

                {/* Message Container */}
                <div className='flex-1 overflow-y-auto no-scrollbar p-3.5 flex flex-col gap-4'>
                    {[...project.conversation, ...project.versions]
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((message) => {
                            const isMessage = 'content' in message;

                            if (isMessage) {
                                const msg = message as Message;
                                const isUser = msg.role === 'user';
                                return (
                                    <div key={msg.id} className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
                                        {!isUser && (
                                            <div className='size-7 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-1'>
                                                <BotIcon className='size-3.5 text-indigo-400' />
                                            </div>
                                        )}
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${isUser ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-950/40" : "bg-[#16171d] border border-[#22242c] rounded-tl-none text-gray-200 font-sans"}`}>
                                            {msg.content}
                                        </div>
                                        {isUser && (
                                            <div className='size-7 rounded-lg bg-[#1c1e26] border border-[#2d303b] flex items-center justify-center shrink-0 mt-1'>
                                                <UserIcon className='size-4 text-gray-300' />
                                            </div>
                                        )}
                                    </div>
                                )
                            } else {
                                const ver = message as Version;
                                return (
                                    <div key={ver.id} className='w-full my-1 p-3 rounded-xl bg-[#111216] border border-[#22242c] text-gray-200 shadow-lg flex flex-col gap-2.5 font-mono-tech'>
                                        <div className='flex items-center gap-2 text-xs font-medium text-gray-300'>
                                            <GitCommitIcon className='size-3.5 text-cyan-400' />
                                            <span>Code snapshot updated</span>
                                        </div>
                                        <span className='text-[10px] text-gray-500'>
                                            {new Date(ver.timestamp).toLocaleString()}
                                        </span>
                                        <div className='flex items-center justify-between pt-1 border-t border-[#1c1e26]'>
                                            {project.current_version_index === ver.id ? (
                                                <span className='text-[11px] text-emerald-400 font-medium px-2 py-0.5 bg-emerald-950/40 border border-emerald-500/30 rounded-md'>
                                                    Current Version
                                                </span>
                                            ): (
                                                <button onClick={()=> handleRollBack(ver.id)} className='px-2.5 py-1 rounded-lg text-xs bg-[#171920] hover:bg-indigo-600 border border-[#262833] hover:border-indigo-500 text-gray-300 hover:text-white transition-all'>
                                                    Roll back
                                                </button>
                                            )}
                                            <Link target='_blank' to={`/preview/${project.id}/${ver.id}`}>
                                                <EyeIcon className='size-7 p-1.5 bg-[#171920] hover:bg-indigo-600 text-gray-400 hover:text-white transition-colors rounded-lg border border-[#262833]'/> 
                                            </Link>
                                        </div>
                                    </div>
                                )
                            }
                        })}
                        {
                            isGenerating && (
                                <div className='flex items-center gap-2.5 p-3 rounded-xl bg-[#111216] border border-[#22242c]'>
                                    <div className='size-7 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center shrink-0'>
                                        <BotIcon className='size-3.5 text-indigo-400 animate-pulse'/>
                                    </div>
                                    <span className='text-xs font-mono-tech text-gray-400'>Synthesizing code changes...</span>
                                    <Loader2Icon className='size-3.5 animate-spin text-indigo-400 ml-auto' />
                                </div>
                            )
                        }
                        <div ref={messageRef}/>
                </div>

                {/* Input Area */}
                <form className='p-3 border-t border-[#1c1e26] bg-[#08080a]' onSubmit={handleRevisions}>
                    <div className='relative flex items-center'>
                        <textarea 
                            onChange={(e)=> setInput(e.target.value)} 
                            value={input} 
                            rows={3} 
                            placeholder='Describe revisions or request UI changes...' 
                            className='w-full p-3 pr-10 rounded-xl resize-none text-xs outline-none border border-[#22242c] focus:border-indigo-500/70 bg-[#111216] text-gray-100 placeholder-gray-500 transition-all font-sans' 
                            disabled={isGenerating}
                        />
                        <button 
                            disabled={isGenerating || !input.trim()} 
                            className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
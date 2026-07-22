import api from '@/configs/axios';
import { authClient } from '@/lib/auth-client';
import { Loader2Icon, SparklesIcon, ArrowRightIcon, Code2Icon, TerminalIcon, CpuIcon, LayersIcon } from 'lucide-react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SAMPLE_PROMPTS = [
  "Modern SaaS landing page for an AI analytics platform with dark theme & pricing table",
  "Developer portfolio showcasing full-stack projects, interactive timeline, and contact modal",
  "Minimalist agency studio site with hero showcase, client logos, and service cards",
  "E-commerce storefront for a premium streetwear brand with product grid and cart preview"
];

const Home = () => {
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()

  const [input, setInput] = React.useState('');
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!session?.user) {
        return toast.error('You must be logged in to create a project')
      } else if (!input.trim()) {
        return toast.error('Please enter a message')
      }
      setLoading(true)
      const { data } = await api.post('/api/user/project', { initial_prompt: input });
      setLoading(false);
      navigate(`/projects/${data.projectId}`)
    } catch (error: any) {
      setLoading(false);
      toast.error(error.response?.data?.message || error.message)
      console.log(error);
    }
  }

  const handleSelectPrompt = (prompt: string) => {
    setInput(prompt);
  }

  return (
    <section className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-start text-white pb-24 px-4 sm:px-6 relative overflow-hidden bg-[#08080a]">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#171920_1px,transparent_1px),linear-gradient(to_bottom,#171920_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Top Release Eyebrow Pill */}
      <a 
        href="/pricing" 
        className="group inline-flex items-center gap-2.5 bg-[#111216] border border-[#22242c] hover:border-indigo-500/50 rounded-full p-1.5 pr-4 text-xs mt-12 sm:mt-16 transition-all duration-300 shadow-lg shadow-black/40 hover:scale-105"
      >
        <span className="bg-indigo-600 text-white text-[10px] font-mono-tech uppercase font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <SparklesIcon className="size-3" /> V2.4 RELEASE
        </span>
        <span className="text-gray-300 font-medium group-hover:text-white transition-colors">
          Try 30 days free trial option
        </span>
        <ArrowRightIcon className="size-3.5 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
      </a>

      {/* Hero Headline */}
      <h1 className="text-center text-3xl sm:text-5xl md:text-6xl lg:text-7xl mt-6 font-semibold tracking-tight max-w-4xl leading-[1.1] text-gray-100">
        Describe your vision. <br />
        <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Buildo synthesizes the website.
        </span>
      </h1>

      {/* Subtext */}
      <p className="text-center text-sm sm:text-base max-w-lg mt-4 text-gray-400 font-normal leading-relaxed">
        Turn raw ideas into production-ready responsive web apps instantly with our architectural AI builder engine.
      </p>

      {/* Centerpiece Tactile Command Dock AI Prompt Form */}
      <div className="w-full max-w-3xl mt-10 relative z-10">
        <form 
          onSubmit={onSubmitHandler} 
          className="bg-[#111216] rounded-2xl p-4 sm:p-5 border border-[#22242c] focus-within:border-indigo-500/70 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300 shadow-2xl shadow-black/60 relative group"
        >
          {/* Top Command Status Bar */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1c1e26] text-xs font-mono-tech text-gray-500">
            <div className="flex items-center gap-2">
              <TerminalIcon className="size-3.5 text-indigo-400" />
              <span>PROMPT_COMMAND_DOCK</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <CpuIcon className="size-3 text-emerald-400 animate-pulse" />
              <span>ENGINE: BUILDO-V2.4</span>
            </div>
          </div>

          {/* Main Textarea Input */}
          <textarea 
            value={input}
            onChange={e => setInput(e.target.value)} 
            className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 resize-none w-full text-sm sm:text-base min-h-[100px] font-sans leading-relaxed" 
            placeholder="Describe your site in detail (e.g. 'Create a modern developer portfolio with a dark theme, project grid, interactive tech stack tags, and contact form')..." 
            required 
          />

          {/* Bottom Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-1 border-t border-[#1c1e26]">
            <div className="text-[11px] font-mono-tech text-gray-500 hidden sm:flex items-center gap-1.5">
              <Code2Icon className="size-3.5 text-cyan-400" />
              <span>Press ↵ to generate full layout</span>
            </div>

            <button 
              disabled={loading || !input.trim()}
              className="ml-auto inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-white font-medium text-xs sm:text-sm rounded-xl px-5 py-2.5 transition-all duration-200 shadow-lg shadow-indigo-950/50 border border-indigo-400/30"
            >
              {!loading ? (
                <>
                  <span>Synthesize Website</span>
                  <SparklesIcon className="size-4" />
                </>
              ) : (
                <>
                  <span>Building</span>
                  <Loader2Icon className="animate-spin size-4 text-white" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 justify-center">
          <span className="text-[11px] font-mono-tech text-gray-500 flex items-center gap-1 mr-1">
            <LayersIcon className="size-3 text-indigo-400" /> TRY A TEMPLATE:
          </span>
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPrompt(prompt)}
              className="text-xs bg-[#111216] hover:bg-[#181920] border border-[#22242c] hover:border-indigo-500/40 text-gray-400 hover:text-gray-200 px-3 py-1 rounded-full transition-all duration-200 text-left truncate max-w-[240px] sm:max-w-xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Highlights Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full mt-20 z-10">
        <div className="bg-[#111216] border border-[#22242c] p-5 rounded-2xl flex flex-col items-start gap-3 hover:border-indigo-500/30 transition-colors">
          <div className="p-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
            <TerminalIcon className="size-5" />
          </div>
          <h3 className="text-sm font-semibold text-gray-200">Natural Prompt Synthesis</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Turn high-level concepts into semantic HTML & Tailwind structure in seconds.</p>
        </div>

        <div className="bg-[#111216] border border-[#22242c] p-5 rounded-2xl flex flex-col items-start gap-3 hover:border-cyan-500/30 transition-colors">
          <div className="p-2.5 rounded-xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400">
            <Code2Icon className="size-5" />
          </div>
          <h3 className="text-sm font-semibold text-gray-200">Live Visual Editor</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Inspect and tweak text, styles, and classes directly inside the live viewport.</p>
        </div>

        <div className="bg-[#111216] border border-[#22242c] p-5 rounded-2xl flex flex-col items-start gap-3 hover:border-emerald-500/30 transition-colors">
          <div className="p-2.5 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400">
            <CpuIcon className="size-5" />
          </div>
          <h3 className="text-sm font-semibold text-gray-200">Instant Publishing</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Publish your generated website with one click and share your custom URL live.</p>
        </div>
      </div>
    </section>
  )
}

export default Home
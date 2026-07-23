import api from '@/configs/axios';
import { authClient } from '@/lib/auth-client';
import { 
  Loader2Icon, 
  SparklesIcon, 
  ArrowRightIcon, 
  Code2Icon, 
  TerminalIcon, 
  CpuIcon, 
  GlobeIcon, 
  RocketIcon, 
  BriefcaseIcon, 
  LayoutDashboardIcon, 
  ShoppingBagIcon, 
  Wand2Icon,
  LayersIcon
} from 'lucide-react';
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PROMPT_EXAMPLES = [
  "an app",
  "a landing page",
  "a data visualization tool",
  "an enterprise solution",
  "a developer portfolio",
  "an e-commerce storefront"
];

const SAMPLE_PROMPTS = [
  "Modern SaaS landing page for an AI analytics platform with dark theme & pricing table",
  "Developer portfolio showcasing full-stack projects, interactive timeline, and contact modal",
  "Minimalist agency studio site with hero showcase, client logos, and service cards",
  "E-commerce storefront for a premium streetwear brand with product grid and cart preview"
];

const BUILD_MODES = [
  { id: 'website', label: 'Website', icon: GlobeIcon, template: 'Create a modern, responsive website with hero section, features grid, and footer.' },
  { id: 'landing', label: 'Landing Page', icon: RocketIcon, template: 'Create a high-converting SaaS landing page with dark theme, feature showcase, testimonials, and pricing.' },
  { id: 'portfolio', label: 'Portfolio', icon: BriefcaseIcon, template: 'Create a developer portfolio featuring an interactive project gallery, tech stack icons, and contact section.' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon, template: 'Create an analytics dashboard layout with sidebar navigation, metric cards, data charts, and recent activity list.' },
  { id: 'ecommerce', label: 'Storefront', icon: ShoppingBagIcon, template: 'Create a modern e-commerce storefront with hero banner, product grid, category filters, and cart preview.' }
];

const Home = () => {
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()

  const [input, setInput] = React.useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  // Typewriter effect state for placeholder
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isFocused || input.trim().length > 0) {
      setPlaceholderText("Describe your site in detail (e.g. 'Create a modern SaaS landing page with dark theme, pricing table, and testimonials')...");
      return;
    }

    const targetText = PROMPT_EXAMPLES[currentExampleIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && placeholderText === targetText) {
      timeout = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && placeholderText === "") {
      setIsDeleting(false);
      setCurrentExampleIndex((prev) => (prev + 1) % PROMPT_EXAMPLES.length);
    } else {
      const speed = isDeleting ? 30 : 60;
      timeout = setTimeout(() => {
        setPlaceholderText((prev) =>
          isDeleting
            ? targetText.substring(0, prev.length - 1)
            : targetText.substring(0, prev.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [placeholderText, isDeleting, currentExampleIndex, isFocused, input]);

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
      window.dispatchEvent(new Event('refresh-credits'));
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

  const handleSelectMode = (mode: typeof BUILD_MODES[0]) => {
    setSelectedMode(mode.id);
    setInput(mode.template);
  }

  return (
    <section className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-start text-white pb-24 px-4 sm:px-6 relative overflow-hidden bg-[#08080a]">
      {/* Background Depth Treatments */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#171920_1px,transparent_1px),linear-gradient(to_bottom,#171920_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_15%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      {/* Top Release Eyebrow Pill */}
      <a 
        href="/pricing" 
        className="group inline-flex items-center gap-2.5 bg-[#111216]/90 border border-[#22242c] hover:border-indigo-500/50 rounded-full p-1.5 pr-4 text-xs mt-10 sm:mt-14 transition-all duration-300 shadow-xl shadow-black/50 hover:scale-105 backdrop-blur-md z-10"
      >
        <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-[10px] font-mono-tech uppercase font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
          <SparklesIcon className="size-3" /> V2.4 ENGINE
        </span>
        <span className="text-gray-300 font-medium group-hover:text-white transition-colors">
          Experience instant AI web synthesis
        </span>
        <ArrowRightIcon className="size-3.5 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
      </a>

      {/* Hero Headline */}
      <div className="mt-8 max-w-4xl text-center z-10">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-gray-100">
          What do you want to <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
            build today?
          </span>
        </h1>
        <p className="text-center text-sm sm:text-base max-w-xl mx-auto mt-4 text-gray-400 font-normal leading-relaxed">
          Prompt, generate, and customize responsive web applications instantly with Buildo’s AI architectural engine.
        </p>
      </div>

      {/* Centerpiece Tactile Command Dock AI Prompt Form */}
      <div className="w-full max-w-3xl mt-10 relative z-10">
        <form 
          onSubmit={onSubmitHandler} 
          className={`bg-[#111216]/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all duration-300 shadow-2xl shadow-black/80 relative group ${
            isFocused 
              ? 'border-indigo-500/70 ring-4 ring-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.2)]' 
              : 'border-[#22242c] hover:border-[#2d303b]'
          }`}
        >
          {/* Main Textarea Input with Typewriter Placeholder */}
          <div className="relative min-h-[110px]">
            <textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 resize-none w-full text-base sm:text-lg font-sans leading-relaxed min-h-[110px] relative z-10" 
              placeholder= {  "Lets build " +placeholderText + (!isFocused && input.length === 0 ? "│" : "")} 
              required 
            />
          </div>

          {/* Bottom Actions & Mode Selector Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-1 border-t border-[#1c1e26]">
            <div className="text-[11px] font-mono-tech text-gray-500 hidden sm:flex items-center gap-1.5">
              <Code2Icon className="size-3.5 text-indigo-400" />
              <span>Press ↵ to generate full layout</span>
            </div>

            <button 
              disabled={loading || !input.trim()}
              className="ml-auto inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-violet-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-white font-medium text-xs sm:text-sm rounded-xl px-5 py-2.5 transition-all duration-200 shadow-lg shadow-indigo-950/60 border border-indigo-400/30"
            >
              {!loading ? (
                <>
                  <span>Synthesize Website</span>
                  <Wand2Icon className="size-4" />
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

        {/* Category / Mode Selection Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {BUILD_MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleSelectMode(mode)}
                className={`inline-flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded-xl border transition-all duration-200 ${
                  isSelected 
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-md shadow-indigo-950/30' 
                    : 'bg-[#111216] hover:bg-[#181920] border-[#22242c] hover:border-gray-700 text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className={`size-3.5 ${isSelected ? 'text-indigo-400' : 'text-gray-400'}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 justify-center">
          <span className="text-[11px] font-mono-tech text-gray-500 flex items-center gap-1 mr-1">
            <LayersIcon className="size-3 text-indigo-400" /> STARTER PROMPTS:
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
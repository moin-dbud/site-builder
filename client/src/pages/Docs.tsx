import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchIcon, BookOpenIcon, SparklesIcon, ChevronRightIcon, MenuIcon, XIcon, CodeIcon, LayersIcon, HelpCircleIcon } from 'lucide-react'
import Footer from '../components/Footer'

interface DocSection {
  id: string
  title: string
  category: string
  description: string
  content: React.ReactNode
}

export const Docs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSectionId, setActiveSectionId] = useState('introduction')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  // SEO Title & Scroll position reset
  useEffect(() => {
    document.title = 'Buildo Docs — Build Websites with AI'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Learn how to use Buildo to turn ideas into beautiful websites with AI.')
    }
    window.scrollTo(0, 0)
  }, [])

  // Parallax & motion handling
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(motionQuery.matches)
    const handleMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches)
    motionQuery.addEventListener('change', handleMotionChange)

    if (motionQuery.matches) return

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return
      const { innerWidth, innerHeight } = window
      const x = ((e.clientX / innerWidth) - 0.5) * 20
      const y = ((e.clientY / innerHeight) - 0.5) * 15
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      motionQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  const docSections: DocSection[] = useMemo(() => [
    {
      id: 'introduction',
      category: 'Overview',
      title: '1. Introduction',
      description: 'Understand the vision, architecture, and capabilities of Buildo.',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            Welcome to <strong>Buildo</strong> — the intelligent website generation platform designed for creators, developers, designers, and entrepreneurs. Buildo converts natural language prompts into full-featured, responsive, production-ready websites in seconds.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-amber-950 font-medium leading-relaxed flex items-start gap-3">
            <SparklesIcon className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>What makes Buildo different?</strong> Unlike simple site templates or static wireframe tools, Buildo outputs complete HTML, CSS, JavaScript, and interactive application code that you can inspect, edit, preview live, and publish immediately.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'getting-started',
      category: 'Overview',
      title: '2. Getting Started',
      description: 'From your first prompt to a live published website in 4 steps.',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            Starting a new project with Buildo takes less than 60 seconds. Follow these primary steps:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
            {[
              { step: '01', title: 'Describe Your Idea', text: 'Enter a detailed prompt in the workspace bar outlining your website concept, style, and structure.' },
              { step: '02', title: 'AI Code Generation', text: 'Buildo generates full code structure, design elements, navigation, and visual layouts live.' },
              { step: '03', title: 'Edit & Refine', text: 'Use the code editor or prompt Buildo AI for instant revisions and custom tweaks.' },
              { step: '04', title: 'Publish & Share', text: 'Publish your project to a unique public domain link with one click.' }
            ].map(item => (
              <div key={item.step} className="bg-white border border-[#E5E0D5] rounded-2xl p-4 shadow-sm">
                <span className="text-xs font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">{item.step}</span>
                <h4 className="font-bold text-gray-900 text-sm mt-2">{item.title}</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'creating-website',
      category: 'Core Workflows',
      title: '3. Creating Your First Website',
      description: 'How to initiate a project from the Home prompt interface.',
      content: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            Navigate to the <strong>Buildo Home Page</strong>. You will find the primary prompt bar where you can describe what website you want to build. You can also pick from curated starter suggestions (e.g. Portfolio, SaaS Landing Page, Restaurant, E-Commerce).
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
            <li>Ensure you are signed in so your project is saved to your account.</li>
            <li>Each website creation consumes <strong>5 credits</strong> from your account balance.</li>
            <li>Once submitted, Buildo routes you directly into the interactive workspace.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'prompting-guide',
      category: 'Core Workflows',
      title: '4. Writing Effective Prompts',
      description: 'Master the art of AI website prompt engineering for superior designs.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            The quality of your generated website directly correlates with the details provided in your prompt. Include target audience, desired color themes, required pages/sections, and visual aesthetic.
          </p>
          
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs">
              <span className="font-bold text-red-700 block mb-1">❌ Weak Prompt:</span>
              <code className="text-red-900 font-mono-tech">"Make me a portfolio."</code>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs">
              <span className="font-bold text-emerald-800 block mb-1">✅ Powerful Prompt:</span>
              <code className="text-emerald-950 font-mono-tech leading-relaxed block">
                "Create a modern portfolio for a senior product designer with a minimal editorial aesthetic. Include a dark header, interactive case studies grid, client testimonials carousel, skill badges, and a bold contact call-to-action."
              </code>
            </div>
          </div>

          <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 text-xs text-gray-700 space-y-2">
            <h5 className="font-bold text-gray-900">Key Elements of a Great Prompt:</h5>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
              <li>• <strong>Context:</strong> Who is the site for?</li>
              <li>• <strong>Style:</strong> Minimal, luxury, dark mode, glassmorphism</li>
              <li>• <strong>Structure:</strong> Hero, Features, Pricing, Testimonials</li>
              <li>• <strong>Functionality:</strong> Forms, search, filters, modals</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'ai-generation',
      category: 'Core Workflows',
      title: '5. AI Website Generation',
      description: 'How Buildo processes prompt tokens and builds live components.',
      content: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            When you launch a generation, Buildo's neural architecture decomposes your description into semantic UI components, layout structures, styling rules, and responsive behavior.
          </p>
          <p>
            You can observe live progress as components are streamed into the editor and preview frame simultaneously.
          </p>
        </div>
      )
    },
    {
      id: 'workspace',
      category: 'Studio & Editing',
      title: '6. Workspace',
      description: 'Overview of the code editor, live canvas, device previews, and toolbar.',
      content: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            The Buildo Workspace is split into two primary view modes:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-gray-200 rounded-xl p-3.5 bg-white">
              <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CodeIcon className="size-4 text-sky-600" /> Code View
              </h5>
              <p className="text-xs text-gray-600">Directly inspect and modify raw HTML, CSS, and JS code in real time.</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-3.5 bg-white">
              <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <LayersIcon className="size-4 text-sky-600" /> Live Preview
              </h5>
              <p className="text-xs text-gray-600">Interactive sandbox viewport supporting desktop, tablet, and mobile device frames.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'editing',
      category: 'Studio & Editing',
      title: '7. Editing Your Website',
      description: 'Manual code modifications vs conversational AI adjustments.',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Buildo gives you complete freedom: edit raw code directly in the code view tab or use conversational AI instructions in the side panel to request targeted updates (e.g. "Change primary accent color to emerald green" or "Add a search bar to navbar").
          </p>
        </div>
      )
    },
    {
      id: 'ai-revisions',
      category: 'Studio & Editing',
      title: '8. AI Revisions',
      description: 'Iterate effortlessly using follow-up prompt prompts.',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            AI revisions allow you to refine any existing project version without starting over. Each revision prompt consumes <strong>5 credits</strong> and creates a new immutable version checkpoint in your history.
          </p>
        </div>
      )
    },
    {
      id: 'version-history',
      category: 'Studio & Editing',
      title: '9. Version History',
      description: 'Time-travel between previous builds and restore past code states.',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Every iteration you make creates a version snapshot. Access the version selector in the project toolbar to inspect previous states or restore a previous version cleanly with zero data loss.
          </p>
        </div>
      )
    },
    {
      id: 'previewing',
      category: 'Publishing & Sharing',
      title: '10. Previewing Your Website',
      description: 'Full-screen isolated preview and device responsive testing.',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Click <strong>Preview</strong> in the workspace to launch a dedicated full-browser preview mode. Test custom JavaScript scripts, responsive breakpoint behaviors, and animations exactly as visitors will see them.
          </p>
        </div>
      )
    },
    {
      id: 'publishing',
      category: 'Publishing & Sharing',
      title: '11. Publishing',
      description: 'Make your project public with instant shareable links.',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Publishing makes your project instantly accessible online under a unique public route (e.g. <code className="font-mono-tech bg-gray-100 px-2 py-0.5 rounded text-xs text-sky-800">/view/:projectId</code> or <code className="font-mono-tech bg-gray-100 px-2 py-0.5 rounded text-xs text-sky-800">/@username/project-slug</code>).
          </p>
          <p>
            You can toggle project visibility (Public / Private) at any time from project settings or the Community page.
          </p>
        </div>
      )
    },
    {
      id: 'projects',
      category: 'Publishing & Sharing',
      title: '12. Projects Workspace',
      description: 'Manage all your created sites from the My Projects gallery.',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Visit <strong className="text-gray-900">My Projects</strong> (<code className="font-mono-tech text-xs bg-gray-100 px-1.5 py-0.5 rounded">/projects</code>) to view all your created websites. Search by project title, duplicate existing sites, edit existing code, or delete unused projects.
          </p>
        </div>
      )
    },
    {
      id: 'community',
      category: 'Community & Ecosystem',
      title: '13. Community',
      description: 'Discover, like, remix, and share public Buildo creations.',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Explore the <strong className="text-gray-900">Community Showcase</strong> (<code className="font-mono-tech text-xs bg-gray-100 px-1.5 py-0.5 rounded">/community</code>) to see outstanding websites built by other Buildo creators. Get inspired, inspect prompt strategies, and save favorites.
          </p>
        </div>
      )
    },
    {
      id: 'credits',
      category: 'Account & Billing',
      title: '14. Credits',
      description: 'Understanding how Buildo credits work and how to reload.',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
            <li>1 New Project Creation = <strong>5 Credits</strong></li>
            <li>1 AI Revision / Prompt Update = <strong>5 Credits</strong></li>
            <li>Manual code edits and live preview tests are <strong>100% Free</strong>.</li>
            <li>Purchased credits never expire and remain tied to your account.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'pricing',
      category: 'Account & Billing',
      title: '15. Pricing',
      description: 'Credit packages and purchasing options.',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Buildo uses transparent credit packs available on the <a href="/pricing" className="text-sky-700 font-bold hover:underline">Pricing Page</a>. Pay securely via Cashfree with support for card payments, UPI, and net banking.
          </p>
        </div>
      )
    },
    {
      id: 'account-settings',
      category: 'Account & Billing',
      title: '16. Account & Settings',
      description: 'Manage profile details, username, email verification, and billing.',
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Access account settings via the avatar menu. Customize your public profile username (<code className="font-mono-tech text-xs bg-gray-100 px-1.5 py-0.5 rounded">/@username</code>), verify your email address via OTP, and view credit transactions.
          </p>
        </div>
      )
    },
    {
      id: 'faq',
      category: 'Support',
      title: '17. Frequently Asked Questions',
      description: 'Answers to common questions about Buildo.',
      content: (
        <div className="space-y-4">
          {[
            { q: 'Can I export the code generated by Buildo?', a: 'Yes! Buildo generates raw HTML, CSS, and JS code. You can copy the code directly or view source code anytime.' },
            { q: 'Do purchased credits expire?', a: 'No. All purchased credits remain in your account balance until consumed.' },
            { q: 'Can I connect a custom domain?', a: 'Public project links can be shared directly. Custom domain binding is supported in pro projects.' },
            { q: 'How do I contact support if I run into an issue?', a: 'Reach out to our team via the /contact page for prompt assistance.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-[#E5E0D5] rounded-xl p-4 text-xs sm:text-sm">
              <h5 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                <HelpCircleIcon className="size-4 text-sky-600 shrink-0" />
                {item.q}
              </h5>
              <p className="text-gray-600 pl-6 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      )
    }
  ], [])

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return docSections
    const q = searchQuery.toLowerCase().trim()
    return docSections.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    )
  }, [searchQuery, docSections])

  const scrollToSection = (id: string) => {
    setActiveSectionId(id)
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top: topOffset, behavior: 'smooth' })
    }
  }

  // Categories group
  const categories = useMemo(() => {
    const map = new Map<string, DocSection[]>()
    docSections.forEach(s => {
      const list = map.get(s.category) || []
      list.push(s)
      map.set(s.category, list)
    })
    return Array.from(map.entries())
  }, [docSections])

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#0e0f14] flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Subtle non-image ambient motion background element */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-40 right-0 size-[600px] rounded-full bg-gradient-to-br from-sky-200/40 via-indigo-100/30 to-amber-100/20 blur-3xl transition-transform duration-700 ease-out"
          style={{
            transform: !isReducedMotion
              ? `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`
              : 'none'
          }}
        />
        <div
          className="absolute top-1/2 -left-40 size-[500px] rounded-full bg-gradient-to-tr from-amber-100/40 via-sky-100/30 to-transparent blur-3xl transition-transform duration-700 ease-out"
          style={{
            transform: !isReducedMotion
              ? `translate3d(${-mousePos.x * 0.8}px, ${-mousePos.y * 0.8}px, 0)`
              : 'none'
          }}
        />
      </div>

      <div className="relative z-10 pt-28 sm:pt-36 pb-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full flex-1">
        
        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-800 text-xs font-mono tracking-wider uppercase font-semibold mb-4"
          >
            <BookOpenIcon className="size-3.5 text-sky-600" />
            <span>DOCUMENTATION & GUIDE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight"
          >
            Buildo <span className="font-serif-italic text-sky-900 font-normal">Documentation</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-gray-600 mt-3 font-medium max-w-xl mx-auto leading-relaxed"
          >
            Learn how to turn your ideas into full-featured websites with Buildo's AI engine, workspace editor, and instant publishing.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-8 max-w-xl mx-auto relative"
          >
            <div className="relative flex items-center">
              <SearchIcon className="size-4 text-gray-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search documentation (e.g. Prompting, Revisions, Credits)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-[#E5E0D5] text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Clear search"
                >
                  <XIcon className="size-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-left text-xs text-gray-500 mt-2 px-1 font-mono-tech">
                Found {filteredSections.length} result{filteredSections.length === 1 ? '' : 's'} matching "{searchQuery}"
              </p>
            )}
          </motion.div>
        </div>

        {/* Mobile Navigation Trigger Button */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[#E5E0D5] rounded-xl text-sm font-semibold text-gray-900 shadow-sm"
          >
            <span className="flex items-center gap-2">
              <MenuIcon className="size-4 text-sky-700" />
              <span>Table of Contents ({docSections.length} Sections)</span>
            </span>
            <ChevronRightIcon className={`size-4 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden bg-white border border-[#E5E0D5] rounded-xl mt-2 p-4 shadow-lg space-y-4"
              >
                {categories.map(([category, items]) => (
                  <div key={category} className="space-y-1.5">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-800 block px-2">
                      {category}
                    </span>
                    {items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          activeSectionId === item.id ? 'bg-sky-100 text-sky-900 font-bold' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Content Grid: Left Sidebar + Right Main Articles */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* Desktop Left Sticky Navigation Sidebar */}
          <aside className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-28 bg-white/80 backdrop-blur-md border border-[#E5E0D5] rounded-2xl p-5 shadow-sm max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center justify-between">
              <span>Navigation</span>
              <span className="text-[10px] text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full font-bold">{filteredSections.length}</span>
            </h3>

            <div className="space-y-5">
              {categories.map(([category, items]) => {
                const categoryFilteredItems = items.filter(item => filteredSections.some(fs => fs.id === item.id))
                if (categoryFilteredItems.length === 0) return null

                return (
                  <div key={category} className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 block px-2 mb-1">
                      {category}
                    </span>
                    {categoryFilteredItems.map(item => {
                      const isActive = activeSectionId === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-all flex items-center justify-between group ${
                            isActive
                              ? 'bg-sky-900 text-white font-semibold shadow-sm'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          <span className="truncate">{item.title}</span>
                          <ChevronRightIcon className={`size-3 transition-transform ${isActive ? 'text-white' : 'opacity-0 group-hover:opacity-100 text-gray-400'}`} />
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </aside>

          {/* Right Main Articles Section */}
          <main className="col-span-1 md:col-span-8 lg:col-span-9 space-y-8 sm:space-y-12">
            {filteredSections.length === 0 ? (
              <div className="bg-white border border-[#E5E0D5] rounded-3xl p-10 text-center space-y-3">
                <SearchIcon className="size-8 text-gray-400 mx-auto" />
                <h3 className="font-bold text-gray-900 text-lg">No documentation topics found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  We couldn't find any documentation sections matching "{searchQuery}". Try searching for terms like "prompt", "revision", or "credits".
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-sky-900 text-white rounded-xl text-xs font-semibold hover:bg-sky-950 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              filteredSections.map(section => (
                <section
                  key={section.id}
                  id={section.id}
                  ref={el => { sectionRefs.current[section.id] = el }}
                  className="bg-white/90 border border-[#E5E0D5] rounded-3xl p-6 sm:p-8 shadow-sm transition-all hover:border-gray-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                      {section.category}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-2">
                    {section.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-500 font-medium mb-6 pb-4 border-b border-gray-100">
                    {section.description}
                  </p>

                  <div className="prose prose-sm max-w-none">
                    {section.content}
                  </div>
                </section>
              ))
            )}
          </main>

        </div>

      </div>

      <Footer />
    </div>
  )
}

export default Docs

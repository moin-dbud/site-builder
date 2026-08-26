import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '@/configs/axios'
import { authClient } from '@/lib/auth-client'
import { HeroSection, PROMPT_EXAMPLES, BUILD_MODES } from '@/components/sections/HeroSection'
import { FromThoughtToWebsiteSection } from '@/components/sections/FromThoughtToWebsiteSection'
import PreviewSection from '@/components/sections/PreviewSection'

const Home = () => {
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [selectedMode, setSelectedMode] = useState<string | null>(null)

  // Profile public state — fetched from /api/user/me
  const [profilePublic, setProfilePublic] = useState<boolean | null>(null)

  // Typewriter effect state for placeholder
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0)
  const [placeholderText, setPlaceholderText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch profile public status when user is logged in
  useEffect(() => {
    if (!session?.user) {
      setProfilePublic(null)
      return
    }
    api.get('/api/user/me')
      .then(({ data }) => {
        if (data?.user) {
          setProfilePublic(data.user.profilePublic ?? true)
        }
      })
      .catch(() => setProfilePublic(null))
  }, [session?.user?.id])

  useEffect(() => {
    if (isFocused || input.trim().length > 0) {
      setPlaceholderText("Describe your business or brand (e.g. 'Artisan coffee shop with daily menu, location, and warm organic design')...")
      return
    }

    const targetText = PROMPT_EXAMPLES[currentExampleIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting && placeholderText === targetText) {
      timeout = setTimeout(() => setIsDeleting(true), 2200)
    } else if (isDeleting && placeholderText === '') {
      setIsDeleting(false)
      setCurrentExampleIndex((prev) => (prev + 1) % PROMPT_EXAMPLES.length)
    } else {
      const speed = isDeleting ? 30 : 60
      timeout = setTimeout(() => {
        setPlaceholderText((prev) =>
          isDeleting
            ? targetText.substring(0, prev.length - 1)
            : targetText.substring(0, prev.length + 1)
        )
      }, speed)
    }

    return () => clearTimeout(timeout)
  }, [placeholderText, isDeleting, currentExampleIndex, isFocused, input])

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!session?.user) {
        return toast.error('You must be logged in to create a project')
      } else if (!input.trim()) {
        return toast.error('Please enter a message')
      }
      setLoading(true)
      const { data } = await api.post('/api/user/project', { initial_prompt: input })
      window.dispatchEvent(new Event('refresh-credits'))
      setLoading(false)
      navigate(`/projects/${data.projectId}`)
    } catch (error: any) {
      setLoading(false)
      toast.error(error.response?.data?.message || error.message)
      console.log(error)
    }
  }

  const handleSelectMode = (mode: typeof BUILD_MODES[0]) => {
    setSelectedMode(mode.id)
    setInput(mode.template)
  }

  const showProfileNudge = session?.user && profilePublic === false

  return (
    <div className="w-full bg-[#0a0c10] flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection
        input={input}
        setInput={setInput}
        loading={loading}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
        selectedMode={selectedMode}
        placeholderText={placeholderText}
        showProfileNudge={Boolean(showProfileNudge)}
        onSubmitHandler={onSubmitHandler}
        handleSelectMode={handleSelectMode}
      />

      <FromThoughtToWebsiteSection />

      <PreviewSection />
    </div>
  )
}

export default Home


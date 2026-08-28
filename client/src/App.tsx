import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Community from './pages/Community'
import Projects from './pages/Projects'
import Preview from './pages/Preview'
import View from './pages/View'
import MyProjects from './pages/MyProjects'
import UserProfile from './pages/UserProfile'
import Navbar from './components/Navbar'
import { Toaster, toast } from 'sonner'
import AuthPage from './pages/auth/AuthPage.tsx'
import Setting from './pages/Setting.tsx'
import PaymentVerify from './pages/PaymentVerify.tsx'
import Docs from './pages/Docs'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import { useParams } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react';

import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth-client'
import api from '@/configs/axios'
import { SetUsernameModal } from './components/SetUsernameModal'
import { SettingsModal } from './components/SettingsModal'
import { AlertCircleIcon, XIcon } from 'lucide-react'

const UserProfileRoute = () => {
  const { username } = useParams()
  if (!username?.startsWith('@')) return <div className="p-12 text-center text-gray-400 bg-[#08080a] min-h-screen font-mono-tech">404_PAGE_NOT_FOUND</div>
  return <UserProfile />
}

const ViewRoute = () => {
  const { username } = useParams()
  if (!username?.startsWith('@')) return <div className="p-12 text-center text-gray-400 bg-[#08080a] min-h-screen font-mono-tech">404_PAGE_NOT_FOUND</div>
  return <View />
}

const App = () => {
  const { pathname } = useLocation()
  const { data: session } = authClient.useSession()
  const [userData, setUserData] = useState<{ emailVerified: boolean; username: string | null; profilePublic: boolean } | null>(null)
  // Fetched from /api/public-settings — defaults to true (verification required) until server responds
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(true)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsConfig, setSettingsConfig] = useState<{ section?: string; scrollTo?: string }>({})

  // Global Settings Modal Open Listener
  useEffect(() => {
    const handleOpenSettings = (e: any) => {
      const detail = e?.detail || {}
      setSettingsConfig({
        section: detail.section || 'profile',
        scrollTo: detail.scrollTo || undefined
      })
      setIsSettingsOpen(true)
    }

    window.addEventListener('open-settings', handleOpenSettings)
    return () => window.removeEventListener('open-settings', handleOpenSettings)
  }, [])

  // Force scroll to top on refresh and route change
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [pathname])

  // Fetch public settings once on mount so we know if email verification is enabled
  useEffect(() => {
    api.get('/api/public-settings')
      .then(({ data }) => {
        if (typeof data.emailVerificationRequired === 'boolean') {
          setEmailVerificationRequired(data.emailVerificationRequired)
        }
      })
      .catch(() => {
        // Default to true (safe) if request fails
        setEmailVerificationRequired(true)
      })
  }, [])

  const fetchUserData = async () => {
    try {
      if (!session?.user) {
        setUserData(null)
        return
      }
      const { data } = await api.get('/api/user/me')
      if (data?.user) {
        setUserData({
          emailVerified: data.user.emailVerified,
          username: data.user.username,
          profilePublic: data.user.profilePublic ?? true,
        })
      }
      if (data?.notifications && Array.isArray(data.notifications)) {
        data.notifications.forEach((n: { title: string; message: string }) => {
          toast.info(n.title || 'Notification', {
            description: n.message,
            duration: 8000,
          })
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchUserData()
    } else {
      setUserData(null)
    }
  }, [session?.user?.id])

  // Listen for custom event from Settings page after successful verification
  useEffect(() => {
    const handleVerified = () => fetchUserData()
    window.addEventListener('email-verified', handleVerified)
    return () => window.removeEventListener('email-verified', handleVerified)
  }, [session?.user?.id])

  const isUserProjectSlugRoute = pathname.startsWith('/@') && pathname.split('/').filter(Boolean).length > 1
  const hideNavbar = (pathname.startsWith('/projects/') && pathname !== '/projects')
                      || pathname.startsWith('/view/') 
                      || pathname.startsWith('/preview/')
                      || pathname.startsWith('/payment/') 
                      || isUserProjectSlugRoute

  const showUnverifiedBanner = session?.user 
    && userData 
    && emailVerificationRequired 
    && !userData.emailVerified 
    && !bannerDismissed 
    && !hideNavbar

  return (
    <div>
      <Toaster />
      {!hideNavbar && <Navbar />}

      {/* Unverified Email Banner */}
      {showUnverifiedBanner && (
        <div className="sticky top-16 z-40 bg-amber-950/90 border-b border-amber-500/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-settings', { detail: { section: 'profile' } }))}
              className="flex items-center gap-2.5 text-xs text-amber-200 hover:text-amber-100 transition-colors group flex-1 min-w-0"
            >
              <AlertCircleIcon className="size-4 text-amber-400 shrink-0" />
              <span className="font-medium truncate">
                Your email is not verified.
                <span className="text-amber-400 group-hover:underline ml-1">
                  Click here to verify →
                </span>
              </span>
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="p-1 rounded-md text-amber-400/60 hover:text-amber-300 hover:bg-amber-900/50 transition-all shrink-0"
              aria-label="Dismiss banner"
            >
              <XIcon className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Username Modal — shown after email step (or immediately if verification is disabled) */}
      {session?.user && userData && (!emailVerificationRequired || userData.emailVerified) && !userData.username && (
        <SetUsernameModal 
          onUsernameSet={() => fetchUserData()} 
        />
      )}

      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/pricing' element={<Pricing/>}/>
        <Route path='/projects/:projectId' element={<Projects/>}/>
        <Route path='/projects' element={<MyProjects/>}/>
        <Route path='/preview/:projectId' element={<Preview/>}/>
        <Route path='/preview/:projectId/:versionId' element={<Preview/>}/>
        <Route path='/community' element={<Community/>}/>
        <Route path='/view/:projectId' element={<View/>}/>
        <Route path='/auth/:pathname' element={<AuthPage/>} />
        <Route path='/account/settings' element={<Setting/>} />
        <Route path='/payment/verify' element={<PaymentVerify/>} />
        <Route path='/docs' element={<Docs/>} />
        <Route path='/contact' element={<Contact/>} />
        <Route path='/privacy' element={<Privacy/>} />
        <Route path='/terms' element={<Terms/>} />
        <Route path='/:username' element={<UserProfileRoute />} />
        <Route path='/:username/:slug' element={<ViewRoute />} />
      </Routes>

      {/* Global Settings Modal Overlay */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialSection={settingsConfig.section}
        scrollTo={settingsConfig.scrollTo}
      />

      <Analytics />
    </div>
  )
}

export default App

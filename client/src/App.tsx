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
import { Toaster } from 'sonner'
import AuthPage from './pages/auth/AuthPage.tsx'
import Setting from './pages/Setting.tsx'
import PaymentVerify from './pages/PaymentVerify.tsx'
import { useParams } from 'react-router-dom'


import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth-client'
import api from '@/configs/axios'
import { EmailVerificationModal } from './components/EmailVerificationModal'
import { SetUsernameModal } from './components/SetUsernameModal'

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
  const {pathname} = useLocation()
  const { data: session } = authClient.useSession()
  const [userData, setUserData] = useState<{ emailVerified: boolean; username: string | null } | null>(null)

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

  const isUserProjectSlugRoute = pathname.startsWith('/@') && pathname.split('/').filter(Boolean).length > 1
  const hideNavbar = (pathname.startsWith('/projects/') && pathname !== '/projects')
                      || pathname.startsWith('/view/') 
                      || pathname.startsWith('/preview/')
                      || pathname.startsWith('/payment/') 
                      || isUserProjectSlugRoute
  return (
    <div>
      <Toaster />
      {!hideNavbar && <Navbar />}

      {/* Account Gating Modals */}
      {session?.user && userData && !userData.emailVerified && (
        <EmailVerificationModal 
          email={session.user.email} 
          onVerified={() => fetchUserData()} 
        />
      )}

      {session?.user && userData && userData.emailVerified && !userData.username && (
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
        <Route path='/:username' element={<UserProfileRoute />} />
        <Route path='/:username/:slug' element={<ViewRoute />} />
      </Routes>
    </div>
  )
}

export default App
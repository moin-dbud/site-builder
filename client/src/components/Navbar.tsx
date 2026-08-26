import { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'
import { UserButton } from '@daveyplate/better-auth-ui'
import api from '@/configs/axios'
import { MenuIcon, XIcon, ZapIcon } from 'lucide-react'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [credits, setCredits] = useState<number | null>(null)

  const { data: session } = authClient.useSession()
  const isHomePage = location.pathname === '/'

  const getCredits = async () => {
    try {
      const { data } = await api.get('/api/user/credits')
      setCredits(data.credits)
    } catch (error: any) {
      console.log('Error fetching credits:', error)
    }
  }

  useEffect(() => {
    if (session?.user) {
      getCredits()
    }
  }, [session?.user, location.pathname])

  useEffect(() => {
    const handleRefresh = () => {
      if (session?.user) {
        getCredits()
      }
    }
    window.addEventListener('refresh-credits', handleRefresh)
    return () => window.removeEventListener('refresh-credits', handleRefresh)
  }, [session?.user])

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <header 
        className={`${
          isHomePage
            ? 'absolute top-0 inset-x-0 z-50 px-6 md:px-12 pt-6 flex items-center justify-between pointer-events-auto'
            : 'sticky top-0 z-50 w-full px-6 md:px-12 py-3.5 bg-[#08090d]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between transition-all duration-300'
        }`}
      >
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={assets.logo}
            alt="Buildo Logo"
            className="h-8 sm:h-9 w-auto drop-shadow-md group-hover:scale-105 transition-transform duration-200"
          />
        </Link>

        {/* Center Floating Glass Nav Pill */}
        <nav className="hidden md:flex items-center gap-1 bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl shadow-black/20 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              isActive('/')
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Home
          </Link>
          <Link
            to="/projects"
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              isActive('/projects')
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            My Projects
          </Link>
          <Link
            to="/community"
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              isActive('/community')
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Community
          </Link>
          <Link
            to="/pricing"
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              isActive('/pricing')
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Pricing
          </Link>
        </nav>

        {/* Right Action / Auth Control */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-2 px-1">
              {credits !== null && (
                <button
                  onClick={() => navigate('/account/settings?section=billing', { state: { section: 'billing' } })}
                  className="flex items-center gap-1.5 text-xs font-mono-tech text-amber-200 font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 hover:bg-amber-500/30 transition-colors"
                >
                  <ZapIcon className="size-3 text-amber-300" />
                  <span>{credits}</span>
                </button>
              )}
              <div className='bg-white/10 backdrop-blur-xl border border-white/40 rounded-full'>
                <UserButton size="icon" />
              </div>
            </div>
          ) : (
            <Link
              to="/auth/signin"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-full px-5 py-2 transition-all duration-300 shadow-lg shadow-indigo-950/40 hover:scale-[1.04] active:scale-95 border border-white/20"
            >
              <span>Get Started</span>
              <span className="text-amber-200">→</span>
            </Link>
          )}

          {/* Mobile Menu Trigger */}
          <button
            id="open-menu"
            className="md:hidden p-2 rounded-full bg-white/10 border border-white/20 text-white/90 hover:text-white backdrop-blur-md active:scale-95 transition-all"
            onClick={() => setMenuOpen(true)}
            aria-label="Open Menu"
          >
            <MenuIcon className="size-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-[#08080a]/95 text-white backdrop-blur-2xl flex flex-col justify-between p-6 md:hidden">
          <div className="flex items-center justify-between">
            <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
              <img src={assets.logo} alt="Buildo Logo" className="h-7 w-auto" />
            </Link>
            <button
              className="p-2 rounded-full bg-white/10 border border-white/20 text-gray-300 hover:text-white transition-all"
              onClick={() => setMenuOpen(false)}
            >
              <XIcon className="size-5" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-5 my-auto text-lg font-medium">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className={`w-full text-center py-2.5 rounded-full transition-all ${
                isActive('/') ? 'bg-white/20 text-white font-semibold border border-white/30' : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/projects"
              onClick={() => setMenuOpen(false)}
              className={`w-full text-center py-2.5 rounded-full transition-all ${
                isActive('/projects') ? 'bg-white/20 text-white font-semibold border border-white/30' : 'text-gray-300 hover:text-white'
              }`}
            >
              My Projects
            </Link>
            <Link
              to="/community"
              onClick={() => setMenuOpen(false)}
              className={`w-full text-center py-2.5 rounded-full transition-all ${
                isActive('/community') ? 'bg-white/20 text-white font-semibold border border-white/30' : 'text-gray-300 hover:text-white'
              }`}
            >
              Community
            </Link>
            <Link
              to="/pricing"
              onClick={() => setMenuOpen(false)}
              className={`w-full text-center py-2.5 rounded-full transition-all ${
                isActive('/pricing') ? 'bg-white/20 text-white font-semibold border border-white/30' : 'text-gray-300 hover:text-white'
              }`}
            >
              Pricing
            </Link>
          </div>

          <div className="pt-4 border-t border-white/15 text-center">
            {!session?.user ? (
              <Link
                to="/auth/signin"
                onClick={() => setMenuOpen(false)}
                className="block w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 rounded-full transition-all shadow-lg shadow-indigo-950/50 text-center"
              >
                Get Started →
              </Link>
            ) : (
              <p className="text-xs text-gray-400 font-mono-tech">Signed in as {session.user.email}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar

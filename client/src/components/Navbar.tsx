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
  const [scrolled, setScrolled] = useState(false)

  const { data: session } = authClient.useSession()

  // Detect whether we are on the home page or auth page
  const isHome = location.pathname === '/'
  const isAuthPage = location.pathname.startsWith('/auth')

  // Scroll listener — marks navbar as "scrolled" after 60px
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    setScrolled(window.scrollY > 60)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // On route change, reset scroll state immediately
  useEffect(() => {
    setScrolled(window.scrollY > 60)
  }, [location.pathname])

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

  // ── Contextual nav pill styling ──────────────────────────────────────────────
  // Home + at top (y < 60px): fully glass / white text — over cinematic hero
  // Home + scrolled OR any other page: dark semi-opaque — readable over ivory sections
  const isAtHeroTop = isHome && !scrolled
  const navPillClass = isAtHeroTop
    ? 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl shadow-black/20'
    : 'bg-[#0e0f14]/80 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40'
  const navLinkActive = isAtHeroTop
    ? 'bg-white/20 text-white font-semibold shadow-sm'
    : 'bg-white/15 text-white font-semibold shadow-sm'
  const navLinkInactive = isAtHeroTop
    ? 'text-white/80 hover:text-white hover:bg-white/10'
    : 'text-gray-300 hover:text-white hover:bg-white/10'

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 px-6 md:px-12 pt-6 flex items-center justify-between pointer-events-auto transition-all duration-300">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={assets.logo}
            alt="Buildo Logo"
            className="h-8 sm:h-9 w-auto drop-shadow-md group-hover:scale-105 transition-transform duration-200"
          />
        </Link>

        {/* Center Floating Glass Nav Pill */}
        <nav
          className={`hidden md:flex items-center gap-1 ${navPillClass} rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all duration-500`}
          aria-label="Main navigation"
        >
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              isActive('/') ? navLinkActive : navLinkInactive
            }`}
          >
            Home
          </Link>
          <Link
            to="/projects"
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              isActive('/projects') ? navLinkActive : navLinkInactive
            }`}
          >
            My Projects
          </Link>
          <Link
            to="/community"
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              isActive('/community') ? navLinkActive : navLinkInactive
            }`}
          >
            Community
          </Link>
          <Link
            to="/pricing"
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              isActive('/pricing') ? navLinkActive : navLinkInactive
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
                <div className="bg-white/10 backdrop-blur-xl border border-white/40 rounded-full">
                  <UserButton size="icon" />
                </div>
              </div>
            ) : isAuthPage ? (
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 bg-white/90 hover:bg-white text-[#1a1a2e] font-semibold text-xs sm:text-sm rounded-full px-4.5 py-2 transition-all duration-200 shadow-md hover:scale-[1.03] active:scale-95 border border-[#E5E0D5]"
              >
                <span>← Back to Home</span>
              </Link>
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
              aria-label="Close menu"
            >
              <XIcon className="size-5" />
            </button>
          </div>

          <nav className="flex flex-col items-center gap-5 my-auto text-lg font-medium" aria-label="Mobile navigation">
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
          </nav>

          <div className="pt-4 border-t border-white/15 text-center">
            {!session?.user ? (
              isAuthPage ? (
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full py-3 text-sm font-semibold text-[#1a1a2e] bg-white rounded-full transition-all shadow-md text-center border border-[#E5E0D5]"
                >
                  ← Back to Home
                </Link>
              ) : (
                <Link
                  to="/auth/signin"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 rounded-full transition-all shadow-lg shadow-indigo-950/50 text-center"
                >
                  Get Started →
                </Link>
              )
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

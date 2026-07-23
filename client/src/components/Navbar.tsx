import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authClient } from '@/lib/auth-client';
import { UserButton } from '@daveyplate/better-auth-ui'
import api from '@/configs/axios';
import { toast } from 'sonner';
import { SparklesIcon, MenuIcon, XIcon, ZapIcon } from 'lucide-react';

const Navbar = () => {

  const [menuOpen, setMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const [credits, setCredits] = useState(0);

  const { data: sessions } = authClient.useSession()

  const getCredits = async () => {
    try {
      const { data } = await api.get('/api/user/credits');
      setCredits(data.credits);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
      console.log(error);
    }
  }

  const location = useLocation();

  useEffect(() => {
    if (sessions?.user) {
      getCredits();
    }
  }, [sessions?.user, location.pathname])

  useEffect(() => {
    const handleRefresh = () => {
      if (sessions?.user) {
        getCredits();
      }
    };
    window.addEventListener('refresh-credits', handleRefresh);
    return () => window.removeEventListener('refresh-credits', handleRefresh);
  }, [sessions?.user])

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-6 md:px-12 bg-[#08080a]/80 backdrop-blur-xl border-b border-[#1c1e26] transition-all duration-300">
        {/* Brand Logo & Identifier */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src={assets.logo} alt="Buildo Logo" className="h-7 w-auto group-hover:scale-105 transition-transform" />
        </Link>

        {/* Navigation Links - Flat Layout */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            to="/"
            className={`transition-colors duration-200 py-1.5 relative ${
              isActive('/') 
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-indigo-500 after:rounded-full' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Home
          </Link>
          <Link
            to="/projects"
            className={`transition-colors duration-200 py-1.5 relative ${
              isActive('/projects') 
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-indigo-500 after:rounded-full' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            My Projects
          </Link>
          <Link
            to="/community"
            className={`transition-colors duration-200 py-1.5 relative ${
              isActive('/community') 
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-indigo-500 after:rounded-full' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Community
          </Link>
          <Link
            to="/pricing"
            className={`transition-colors duration-200 py-1.5 relative ${
              isActive('/pricing') 
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-indigo-500 after:rounded-full' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Pricing
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {!sessions?.user ? (
            <button
              onClick={() => navigate('/auth/signin')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all duration-200 rounded-xl border border-indigo-400/30 shadow-lg shadow-indigo-950/50"
            >
              <span>Get started</span>
              <SparklesIcon className="size-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/account/settings?section=billing', { state: { section: 'billing' } })}
                className="flex items-center gap-2 bg-[#111216] hover:bg-[#181920] px-3.5 py-1.5 text-xs border border-[#22242c] hover:border-indigo-500/40 text-gray-300 hover:text-white rounded-xl transition-all duration-200 font-mono-tech"
              >
                <ZapIcon className="size-3.5 text-indigo-400 fill-indigo-400/20" />
                <span>Credits:</span>
                <span className="text-indigo-400 font-semibold">{credits}</span>
              </button>
              <UserButton size="icon" />
            </>
          )}

          <button
            id="open-menu"
            className="md:hidden p-2 rounded-xl bg-[#111216] border border-[#22242c] text-gray-300 hover:text-white active:scale-95 transition-all"
            onClick={() => setMenuOpen(true)}
            aria-label="Open Menu"
          >
            <MenuIcon className="size-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-[#08080a]/95 text-white backdrop-blur-2xl flex flex-col justify-between p-6 md:hidden animate-kinetic-fade">
          <div className="flex items-center justify-between">
            <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
              <img src={assets.logo} alt="logo" className="h-6 w-auto" />
            </Link>
            <button
              className="p-2 rounded-xl bg-[#111216] border border-[#22242c] text-gray-300 hover:text-white transition-all"
              onClick={() => setMenuOpen(false)}
            >
              <XIcon className="size-5" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-6 my-auto text-lg font-medium">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className={`w-full text-center py-2.5 rounded-xl transition-all ${isActive('/') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-300 hover:text-white'}`}
            >
              Home
            </Link>
            <Link
              to="/projects"
              onClick={() => setMenuOpen(false)}
              className={`w-full text-center py-2.5 rounded-xl transition-all ${isActive('/projects') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-300 hover:text-white'}`}
            >
              My Projects
            </Link>
            <Link
              to="/community"
              onClick={() => setMenuOpen(false)}
              className={`w-full text-center py-2.5 rounded-xl transition-all ${isActive('/community') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-300 hover:text-white'}`}
            >
              Community
            </Link>
            <Link
              to="/pricing"
              onClick={() => setMenuOpen(false)}
              className={`w-full text-center py-2.5 rounded-xl transition-all ${isActive('/pricing') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-300 hover:text-white'}`}
            >
              Pricing
            </Link>
          </div>

          <div className="pt-4 border-t border-[#1c1e26] text-center">
            {!sessions?.user ? (
              <button
                onClick={() => { setMenuOpen(false); navigate('/auth/signin'); }}
                className="w-full py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-950/50"
              >
                Get Started
              </button>
            ) : (
              <p className="text-xs text-gray-500 font-mono-tech">Signed in as {sessions.user.email}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
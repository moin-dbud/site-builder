import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authClient } from '@/lib/auth-client';
import { UserButton } from '@daveyplate/better-auth-ui'
import api from '@/configs/axios';
import { toast } from 'sonner';

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

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between w-full py-3.5 px-6 md:px-16 lg:px-24 bg-[#08080a]/90 backdrop-blur-md border-b border-[#22242c]">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src={assets.logo} alt="logo" className='w-24' />
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-[#111216] border border-[#22242c] p-1 rounded-full text-xs font-medium">
          <Link
            to="/"
            className={`px-4 py-1.5 rounded-full transition-all duration-200 ${isActive('/')
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            Home
          </Link>
          <Link
            to="/projects"
            className={`px-4 py-1.5 rounded-full transition-all duration-200 ${isActive('/projects')
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            My Projects
          </Link>
          <Link
            to="/community"
            className={`px-4 py-1.5 rounded-full transition-all duration-200 ${isActive('/community')
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            Community
          </Link>
          <Link
            to="/pricing"
            className={`px-4 py-1.5 rounded-full transition-all duration-200 ${isActive('/pricing')
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
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
              className="px-5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all duration-200 rounded-full border border-indigo-500/50 shadow-md shadow-indigo-900/30"
            >
              Get started
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/pricing')}
                className="flex items-center gap-1.5 bg-[#111216] hover:bg-[#171920] px-3.5 py-1.5 text-xs border border-[#22242c] hover:border-indigo-500/40 text-gray-300 hover:text-white rounded-full transition-all duration-200 font-mono-tech"
              >
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Credits:</span>
                <span className="text-indigo-400 font-semibold">{credits}</span>
              </button>
              <UserButton size='icon' />
            </>
          )}

          <button
            id="open-menu"
            className="md:hidden p-2 rounded-lg bg-[#111216] border border-[#22242c] text-gray-300 hover:text-white active:scale-90 transition-all"
            onClick={() => setMenuOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h16" /></svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-[#08080a]/95 text-white backdrop-blur-xl flex flex-col items-center justify-center text-base gap-6 md:hidden animate-kinetic-fade">
          <Link
            to='/'
            onClick={() => setMenuOpen(false)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${isActive('/') ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}
          >
            Home
          </Link>
          <Link
            to='/projects'
            onClick={() => setMenuOpen(false)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${isActive('/projects') ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}
          >
            My Projects
          </Link>
          <Link
            to='/community'
            onClick={() => setMenuOpen(false)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${isActive('/community') ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}
          >
            Community
          </Link>
          <Link
            to='/pricing'
            onClick={() => setMenuOpen(false)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${isActive('/pricing') ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}
          >
            Pricing
          </Link>

          <button
            className="mt-4 p-3 rounded-full bg-[#111216] border border-[#22242c] hover:bg-[#171920] text-gray-300 hover:text-white transition-all"
            onClick={() => setMenuOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
      )}
    </>
  )
}

export default Navbar
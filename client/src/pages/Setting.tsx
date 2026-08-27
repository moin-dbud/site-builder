import { useLocation, useNavigate } from 'react-router-dom'
import { SettingsModal } from '@/components/SettingsModal'
import { ArrowLeftIcon, SmartphoneIcon, TabletIcon, LaptopIcon, SaveIcon, FullscreenIcon, ArrowBigDownDashIcon, SettingsIcon, EyeIcon } from 'lucide-react'

const Setting = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const targetSection = (location.state as any)?.section || queryParams.get('section') || 'profile'
  const scrollTo = (location.state as any)?.scrollTo || queryParams.get('scrollTo') || undefined

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="w-full h-screen bg-[#F4F2EC] relative overflow-hidden flex flex-col font-sans select-none">
      {/* ── Studio Workspace Background (Visible through the frosted modal backdrop) ── */}
      <div className="flex flex-col h-full w-full pointer-events-none filter blur-[3px] saturate-[0.85]">
        {/* Mock Top Workspace Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#F7F5F0] border-b border-[#E5E0D5] text-[#1a1a2e] shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-white border border-[#E5E0D5] flex items-center justify-center text-gray-700">
              <ArrowLeftIcon className="size-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#1a1a2e]">Buildo Studio Workspace</p>
              <p className="text-[10px] font-mono text-gray-500">● Workspace Active</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-[#EAE6DD]/70 border border-[#E0DBCF] p-1 rounded-xl text-xs">
            <div className="p-1.5 text-gray-500"><SmartphoneIcon className="size-4" /></div>
            <div className="p-1.5 text-gray-500"><TabletIcon className="size-4" /></div>
            <div className="p-1.5 bg-indigo-600 text-white rounded-lg"><LaptopIcon className="size-4" /></div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <div className="bg-white border border-[#E5E0D5] text-gray-700 px-3 py-1.5 flex items-center gap-1.5 rounded-xl"><SaveIcon className="size-3.5" /><span>Save</span></div>
            <div className="bg-white border border-[#E5E0D5] text-gray-700 px-3 py-1.5 flex items-center gap-1.5 rounded-xl"><FullscreenIcon className="size-3.5" /><span>Preview</span></div>
            <div className="bg-white border border-[#E5E0D5] text-gray-700 px-3 py-1.5 flex items-center gap-1.5 rounded-xl"><ArrowBigDownDashIcon className="size-3.5" /><span>Download</span></div>
            <div className="bg-white border border-[#E5E0D5] text-gray-700 px-3 py-1.5 flex items-center gap-1.5 rounded-xl"><SettingsIcon className="size-3.5" /><span>Settings</span></div>
            <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl font-semibold flex items-center gap-1.5"><EyeIcon className="size-3.5" /><span>Publish</span></div>
          </div>
        </div>

        {/* Mock Workspace Body */}
        <div className="flex flex-1 p-3 gap-3 bg-[#F4F2EC] overflow-hidden">
          {/* Mock Sidebar */}
          <div className="w-80 rounded-2xl bg-[#FAF9F5] border border-[#E6E2D8] p-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-6 w-32 bg-gray-200 rounded-md" />
              <div className="h-16 w-full bg-white border border-[#E6E2D8] rounded-xl" />
              <div className="h-12 w-full bg-[#1a1a2e] rounded-xl" />
            </div>
            <div className="h-10 w-full bg-white border border-[#E6E2D8] rounded-xl" />
          </div>

          {/* Mock Preview Frame */}
          <div className="flex-1 bg-white rounded-2xl border border-[#E5E0D5] p-6 flex flex-col items-center justify-center space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded-lg" />
            <div className="h-40 w-3/4 bg-gray-100 rounded-xl" />
            <div className="grid grid-cols-3 gap-4 w-3/4">
              <div className="h-20 bg-gray-100 rounded-xl" />
              <div className="h-20 bg-gray-100 rounded-xl" />
              <div className="h-20 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Settings Modal Floating Over the Workspace ── */}
      <SettingsModal
        isOpen={true}
        onClose={handleClose}
        initialSection={targetSection}
        scrollTo={scrollTo}
      />
    </div>
  )
}

export default Setting
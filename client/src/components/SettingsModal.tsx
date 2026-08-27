import { useState, useEffect, useRef } from 'react'
import { AccountSettingsCards, ChangePasswordCard, DeleteAccountCard } from '@daveyplate/better-auth-ui'
import { 
  UserIcon, 
  KeyRoundIcon, 
  ShieldAlertIcon, 
  SparklesIcon, 
  CheckCircle2Icon, 
  AlertCircleIcon, 
  ShieldCheckIcon, 
  CoinsIcon, 
  ArrowUpRightIcon, 
  Loader2Icon, 
  ClockIcon, 
  ReceiptIcon, 
  GlobeIcon, 
  EyeOffIcon, 
  MailIcon,
  XIcon
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '@/configs/axios'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { EmailVerificationModal } from '@/components/EmailVerificationModal'

interface TransactionItem {
  id: string
  gatewayOrderId: string
  gatewayProvider: string
  status: string
  isPaid: boolean
  planId: string
  amount: number
  credits: number
  createdAt: string
}

const SETTING_SECTIONS = [
  { id: 'profile', label: 'Profile Details', icon: UserIcon },
  { id: 'billing', label: 'Billing & Credits', icon: CoinsIcon },
  { id: 'security', label: 'Security & Password', icon: KeyRoundIcon },
  { id: 'danger', label: 'Danger Zone', icon: ShieldAlertIcon }
]

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  initialSection?: string
  scrollTo?: string
}

export const SettingsModal = ({ isOpen, onClose, initialSection = 'profile', scrollTo }: SettingsModalProps) => {
  const navigate = useNavigate()
  
  const [activeSection, setActiveSection] = useState(initialSection)
  const { data: session } = authClient.useSession()

  const [userInfo, setUserInfo] = useState<{ emailVerified: boolean; username: string | null; profilePublic: boolean } | null>(null)
  const [togglingProfile, setTogglingProfile] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)

  // Billing & Transactions state
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [userCredits, setUserCredits] = useState<number>(0)
  const [loadingTx, setLoadingTx] = useState(false)
  const [creditsCost, setCreditsCost] = useState<number>(5)

  // Ref for the public profile toggle (for scroll-into-view)
  const profileToggleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection)
    }
  }, [initialSection, isOpen])

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    api.get('/api/user/credits-config')
      .then(({ data }) => {
        if (data?.creditsPerGeneration) setCreditsCost(data.creditsPerGeneration)
      })
      .catch(console.error)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    if (scrollTo === 'profile-public') {
      setTimeout(() => {
        profileToggleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 250)
    }
  }, [scrollTo, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const fetchUser = async () => {
      try {
        if (!session?.user) return
        const { data } = await api.get('/api/user/me')
        if (data?.user) {
          setUserInfo({
            emailVerified: data.user.emailVerified,
            username: data.user.username,
            profilePublic: data.user.profilePublic ?? true,
          })
          setUserCredits(data.user.credits || 0)
        }
      } catch (err) {
        console.log(err)
      }
    }
    fetchUser()
  }, [session?.user?.id, isOpen])

  useEffect(() => {
    if (!isOpen) return
    if (activeSection === 'billing' && session?.user) {
      const fetchTransactions = async () => {
        setLoadingTx(true)
        try {
          const { data } = await api.get('/api/user/transactions')
          setTransactions(data.transactions || [])
          if (typeof data.credits === 'number') {
            setUserCredits(data.credits)
          }
        } catch (err) {
          console.log(err)
        } finally {
          setLoadingTx(false)
        }
      }
      fetchTransactions()
    }
  }, [activeSection, session?.user?.id, isOpen])

  const handleToggleProfilePublic = async () => {
    if (!userInfo) return
    const newVal = !userInfo.profilePublic
    setTogglingProfile(true)
    try {
      await api.patch('/api/user/profile-public', { profilePublic: newVal })
      setUserInfo(prev => prev ? { ...prev, profilePublic: newVal } : prev)
      toast.success(newVal ? 'Profile is now public — your projects are visible!' : 'Profile set to private')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile visibility')
    } finally {
      setTogglingProfile(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 animate-kinetic-fade">
      {/* ── Translucent Frosted Glass Backdrop Overlay ── */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#0a0f1d]/40 backdrop-blur-md transition-opacity duration-300 cursor-pointer" 
      />

      {/* ── Main Glass Settings Modal ── */}
      <div className="relative z-10 w-full max-w-5xl h-[85vh] max-h-[740px] bg-[#FAF9F5] border border-[#CBD5E1] rounded-3xl shadow-2xl shadow-slate-900/15 flex flex-col overflow-hidden text-[#0f172a]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F1F5F9]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[#b89158] shadow-xs">
              <SparklesIcon className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[#0f172a]">Buildo Settings</h2>
              <p className="text-xs text-slate-600 font-normal">Manage your Buildo account, profile, credits, and security</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-transparent hover:border-slate-300 hover:bg-slate-200/70 text-slate-600 hover:text-black transition-all active:scale-95"
            title="Close Settings (Esc)"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Modal Body: 2-Column Desktop Layout / Mobile Responsive */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Left Navigation Rail */}
          <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-[#E2E8F0] p-3.5 flex md:flex-col gap-1.5 bg-[#F8FAFC]/70 shrink-0 overflow-x-auto no-scrollbar">
            {SETTING_SECTIONS.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all text-left whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#0f172a] border border-[#CBD5E1] shadow-sm font-bold'
                      : 'text-slate-600 hover:text-[#0f172a] hover:bg-white/80 border border-transparent hover:border-slate-200 font-medium'
                  }`}
                >
                  <Icon className={`size-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span>{section.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8 space-y-6">
            
            {/* ── Section 1: Profile Details ── */}
            {activeSection === 'profile' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-extrabold text-[#0f172a]">Profile Details</h3>
                  <p className="text-xs text-slate-600">Manage your public identity and account details</p>
                </div>

                {/* Verification + Username Card */}
                <div className="p-5 bg-white border border-[#CBD5E1] rounded-2xl shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="size-4 text-indigo-600" />
                      <span className="text-xs font-bold text-[#0f172a]">Account Verification</span>
                    </div>
                    {userInfo?.emailVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-xs w-fit">
                        <CheckCircle2Icon className="size-3.5 text-emerald-600" />
                        <span>Email Verified</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 border border-amber-300 text-amber-800 shadow-xs">
                          <AlertCircleIcon className="size-3.5 text-amber-600" />
                          <span>Unverified Email</span>
                        </span>
                        <button
                          onClick={() => setShowVerifyModal(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0f172a] hover:bg-black text-white border border-slate-700 transition-all shadow-sm active:scale-95"
                        >
                          <MailIcon className="size-3.5" />
                          <span>Verify</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#E2E8F0] pt-3.5 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-800">Username</label>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">Permanent (Read-only)</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-700 text-sm font-mono font-bold">@</span>
                      <input 
                        type="text"
                        readOnly
                        value={userInfo?.username || (session?.user as any)?.username || ''}
                        className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#94A3B8] rounded-xl text-[#0f172a] font-mono font-semibold cursor-not-allowed select-none outline-none shadow-xs"
                      />
                    </div>
                    {(userInfo?.username || (session?.user as any)?.username) && (
                      <p className="text-[11px] text-slate-600 font-mono mt-1">
                        Public profile URL: <span className="text-indigo-700 font-bold">/@{userInfo?.username || (session?.user as any)?.username}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Public Profile Toggle Card */}
                <div
                  ref={profileToggleRef}
                  id="profile-public-toggle"
                  className="p-5 bg-white border border-[#CBD5E1] rounded-2xl shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl border shrink-0 transition-colors ${
                        userInfo?.profilePublic
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-slate-100 border-slate-300 text-slate-500'
                      }`}>
                        {userInfo?.profilePublic ? <GlobeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0f172a]">Public Creator Profile</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed max-w-md font-normal">
                          {userInfo?.profilePublic
                            ? 'Your profile and published creations are visible to creators worldwide at your public URL.'
                            : 'Your profile is private. Visitors will see a private profile notice instead of your projects.'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      id="profile-public-switch"
                      onClick={handleToggleProfilePublic}
                      disabled={togglingProfile || userInfo === null}
                      aria-label="Toggle public profile"
                      className={`relative shrink-0 w-12 h-6.5 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed ${
                        userInfo?.profilePublic
                          ? 'bg-emerald-600 border-emerald-700'
                          : 'bg-slate-300 border-slate-400'
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md border border-slate-200 transition-transform duration-300 flex items-center justify-center ${
                        userInfo?.profilePublic ? 'translate-x-5.5' : 'translate-x-0'
                      }`}>
                        {togglingProfile && <Loader2Icon className="size-3 text-slate-500 animate-spin" />}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 border-t border-[#E2E8F0] pt-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold ${
                      userInfo?.profilePublic
                        ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                        : 'bg-slate-100 border border-slate-300 text-slate-700'
                    }`}>
                      <span className={`size-1.5 rounded-full ${userInfo?.profilePublic ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {userInfo?.profilePublic ? 'PROFILE PUBLIC' : 'PROFILE PRIVATE'}
                    </span>
                  </div>
                </div>

                {/* Email Verification Popup */}
                {showVerifyModal && session?.user && (
                  <EmailVerificationModal
                    email={session.user.email}
                    onClose={() => setShowVerifyModal(false)}
                    onVerified={() => {
                      setShowVerifyModal(false)
                      setUserInfo(prev => prev ? { ...prev, emailVerified: true } : prev)
                      window.dispatchEvent(new Event('email-verified'))
                    }}
                  />
                )}

                {/* Better Auth Cards */}
                <AccountSettingsCards 
                  classNames={{
                    card: {
                      base: 'bg-white border border-[#CBD5E1] rounded-2xl w-full text-[#0f172a] shadow-sm p-5',
                      footer: 'bg-[#F8FAFC] border-t border-[#E2E8F0] rounded-b-2xl p-4'
                    }
                  }}
                />
              </div>
            )}

            {/* ── Section 2: Billing & Credits ── */}
            {activeSection === 'billing' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-extrabold text-[#0f172a]">Billing & Credits</h3>
                  <p className="text-xs text-slate-600">View credit balance and payment history</p>
                </div>

                {/* Credits Balance Card */}
                <div className="bg-white border border-[#CBD5E1] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
                  <div className="flex items-center gap-4 z-10">
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-[#b89158] shrink-0 shadow-xs">
                      <CoinsIcon className="size-8" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-slate-600 font-bold uppercase tracking-wider">Available Credits Balance</p>
                      <h4 className="text-3xl font-extrabold text-[#0f172a] mt-0.5">{userCredits} Credits</h4>
                      <p className="text-[11px] text-slate-600 font-mono mt-1">Each AI generation consumes {creditsCost} credits</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose()
                      navigate('/pricing')
                    }}
                    className="z-10 px-4.5 py-2.5 rounded-xl bg-[#0f172a] hover:bg-black active:scale-95 text-xs font-bold text-white border border-slate-800 transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <span>Get More Credits</span>
                    <ArrowUpRightIcon className="size-4" />
                  </button>
                </div>

                {/* Transactions Table */}
                <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ReceiptIcon className="size-4 text-indigo-600" />
                      <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Payment History</h4>
                    </div>
                    <span className="text-xs font-mono text-slate-600 font-medium">{transactions.length} transactions</span>
                  </div>

                  {loadingTx ? (
                    <div className="flex flex-col items-center justify-center p-10 text-slate-600 font-mono text-xs gap-2">
                      <Loader2Icon className="size-6 animate-spin text-indigo-600" />
                      <span>FETCHING_TRANSACTION_HISTORY...</span>
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="divide-y divide-[#E2E8F0]">
                      {transactions.map((tx) => {
                        const isCompleted = tx.isPaid || tx.status === 'completed'
                        const isFailed = tx.status === 'failed'
                        const isAdminAdjust = tx.planId === 'admin_adjustment' || tx.gatewayProvider === 'Admin Adjustment'
                        return (
                          <div key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAFC] transition-colors">
                            <div className="flex items-center gap-3.5">
                              <div className={`p-2.5 rounded-xl border shrink-0 ${
                                isCompleted 
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                  : isFailed
                                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                                  : 'bg-amber-50 border-amber-300 text-amber-700'
                              }`}>
                                <CoinsIcon className="size-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="text-sm font-bold text-[#0f172a]">
                                    {isAdminAdjust 
                                      ? `${tx.credits > 0 ? '+' : ''}${tx.credits} Credits (Admin Adjustment)`
                                      : `+${tx.credits} Credits Pack`
                                    }
                                  </h5>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                    isCompleted 
                                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                                      : isFailed
                                      ? 'bg-rose-50 border border-rose-300 text-rose-800'
                                      : 'bg-amber-50 border border-amber-300 text-amber-800'
                                  }`}>
                                    {isCompleted ? 'COMPLETED' : isFailed ? 'FAILED' : 'PENDING'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 font-mono mt-0.5 flex items-center gap-2 font-normal">
                                  <span>Ref: <strong className="text-slate-800 font-semibold">{tx.gatewayOrderId || tx.id.slice(0, 12)}</strong></span>
                                  <span>•</span>
                                  <span className="capitalize">{tx.gatewayProvider || 'Cashfree'}</span>
                                </p>
                              </div>
                            </div>

                            <div className="sm:text-right flex sm:flex-col justify-between sm:justify-center items-end text-xs">
                              <span className="text-sm font-extrabold text-[#0f172a]">{tx.amount > 0 ? `₹${tx.amount}` : 'Admin Action'}</span>
                              <span className="text-[11px] text-slate-600 font-mono flex items-center gap-1 mt-0.5 font-medium">
                                <ClockIcon className="size-3" />
                                <span>{new Date(tx.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-10 text-center">
                      <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 mb-3">
                        <ReceiptIcon className="size-7" />
                      </div>
                      <h5 className="text-sm font-bold text-[#0f172a]">No Transactions Yet</h5>
                      <p className="text-xs text-slate-600 font-mono mt-1 max-w-sm">
                        You haven't purchased any credit packs yet. When you buy credits, your receipts will show up here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Section 3: Security & Password ── */}
            {activeSection === 'security' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-extrabold text-[#0f172a]">Security & Password</h3>
                  <p className="text-xs text-slate-600">Change password and manage auth credentials</p>
                </div>
                <ChangePasswordCard 
                  classNames={{
                    base: 'bg-white border border-[#CBD5E1] rounded-2xl w-full text-[#0f172a] shadow-sm p-5',
                    footer: 'bg-[#F8FAFC] border-t border-[#E2E8F0] rounded-b-2xl p-4'
                  }}
                />
              </div>
            )}

            {/* ── Section 4: Danger Zone ── */}
            {activeSection === 'danger' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-extrabold text-rose-700">Danger Zone</h3>
                  <p className="text-xs text-slate-600">Irreversible actions regarding your Buildo account</p>
                </div>
                <DeleteAccountCard 
                  classNames={{
                    base: 'bg-white border border-rose-300 rounded-2xl w-full text-[#0f172a] shadow-sm p-5',
                    footer: 'bg-rose-50/70 border-t border-rose-200 rounded-b-2xl p-4'
                  }}
                />
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC] shrink-0 text-xs">
          <div className="text-slate-600 font-mono text-[11px] font-medium flex items-center gap-1.5">
            <span>Press</span>
            <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-800">Esc</kbd>
            <span>to close</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0f172a] hover:bg-black text-white font-bold rounded-xl border border-slate-800 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  )
}

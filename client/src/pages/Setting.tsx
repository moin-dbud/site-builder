import { useState, useEffect } from 'react'
import { AccountSettingsCards, ChangePasswordCard, DeleteAccountCard } from '@daveyplate/better-auth-ui'
import { UserIcon, KeyRoundIcon, ShieldAlertIcon, SparklesIcon, CheckCircle2Icon, AlertCircleIcon, ShieldCheckIcon, CoinsIcon, ArrowUpRightIcon, Loader2Icon, ClockIcon, ReceiptIcon } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '@/configs/axios'
import { authClient } from '@/lib/auth-client'

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

const Setting = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const targetSection = (location.state as any)?.section || queryParams.get('section') || 'profile'

  const [activeSection, setActiveSection] = useState(targetSection)
  const { data: session } = authClient.useSession()

  const [userInfo, setUserInfo] = useState<{ emailVerified: boolean; username: string | null } | null>(null)
  
  // Billing & Transactions state
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [userCredits, setUserCredits] = useState<number>(0)
  const [loadingTx, setLoadingTx] = useState(false)

  useEffect(() => {
    const sec = (location.state as any)?.section || queryParams.get('section')
    if (sec) {
      setActiveSection(sec)
    }
  }, [location.search, location.state])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!session?.user) return
        const { data } = await api.get('/api/user/me')
        if (data?.user) {
          setUserInfo({
            emailVerified: data.user.emailVerified,
            username: data.user.username,
          })
          setUserCredits(data.user.credits || 0)
        }
      } catch (err) {
        console.log(err)
      }
    }
    fetchUser()
  }, [session?.user?.id])

  useEffect(() => {
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
  }, [activeSection, session?.user?.id])

  return (
    <div className='w-full min-h-[90vh] bg-[#08080a] text-white font-sans py-10 px-4 md:px-12 lg:px-24'>
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 pb-4 border-b border-[#22242c]">
          <h1 className="text-2xl font-bold tracking-tight text-gray-100 flex items-center gap-2.5">
            <SparklesIcon className="size-6 text-indigo-400" />
            <span>Account Settings</span>
          </h1>
          <p className="text-xs text-gray-400 font-mono-tech mt-1">
            Manage your Buildo account profile, credit transactions, and security settings
          </p>
        </div>

        {/* 2-Column Sidebar Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Navigation */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-1.5 bg-[#111216] border border-[#22242c] p-2.5 rounded-2xl shadow-xl">
            {SETTING_SECTIONS.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all text-left ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-md font-semibold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#171920]'
                  }`}
                >
                  <Icon className={`size-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-500'}`} />
                  <span>{section.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right Main Panel */}
          <div className="md:col-span-8 lg:col-span-9">
            {activeSection === 'profile' && (
              <div className="flex flex-col gap-4">
                <div className="mb-2">
                  <h2 className="text-base font-semibold text-gray-200">Profile Details</h2>
                  <p className="text-xs text-gray-400 font-mono-tech">Update your account display details</p>
                </div>

                <div className="p-5 bg-[#111216] border border-[#22242c] rounded-2xl w-full text-white shadow-xl flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="size-4 text-indigo-400" />
                      <span className="text-xs font-semibold text-gray-300">Account Verification</span>
                    </div>
                    {userInfo?.emailVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-tech font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-sm">
                        <CheckCircle2Icon className="size-3.5 text-emerald-400" />
                        <span>Email Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-tech font-semibold bg-amber-950/80 border border-amber-500/40 text-amber-300 shadow-sm">
                        <AlertCircleIcon className="size-3.5 text-amber-400" />
                        <span>Unverified Email</span>
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t border-[#1c1e26] pt-3">
                    <label className="text-xs font-semibold text-gray-300">Username</label>
                    <span className="text-[10px] text-gray-500 font-mono-tech">Permanent (Read-only)</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 text-sm font-mono-tech font-bold">@</span>
                    <input 
                      type="text"
                      readOnly
                      value={userInfo?.username || (session?.user as any)?.username || ''}
                      className="w-full pl-8 pr-3.5 py-2 text-sm bg-[#08080a] border border-[#22242c] rounded-xl text-gray-300 font-mono-tech cursor-not-allowed select-none outline-none"
                    />
                  </div>
                  {(userInfo?.username || (session?.user as any)?.username) && (
                    <p className="text-[11px] text-gray-500 font-mono-tech mt-0.5">
                      Your public profile is available at <span className="text-indigo-400 font-medium">/@{userInfo?.username || (session?.user as any)?.username}</span>
                    </p>
                  )}
                </div>

                <AccountSettingsCards 
                  classNames={{
                    card: {
                      base: 'bg-[#111216] border border-[#22242c] rounded-2xl w-full text-white shadow-xl',
                      footer: 'bg-[#0c0d10] border-t border-[#1c1e26] rounded-b-2xl'
                    }
                  }}
                />
              </div>
            )}

            {activeSection === 'billing' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-base font-semibold text-gray-200">Billing & Credit Transactions</h2>
                  <p className="text-xs text-gray-400 font-mono-tech">View your available credits balance and purchase history</p>
                </div>

                {/* Credits Summary Card */}
                <div className="bg-[#111216] border border-[#22242c] p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center gap-4 z-10">
                    <div className="p-3.5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                      <CoinsIcon className="size-8" />
                    </div>
                    <div>
                      <p className="text-xs font-mono-tech text-gray-400 uppercase tracking-wider">Available Credits Balance</p>
                      <h3 className="text-2xl font-bold text-gray-100 mt-0.5">{userCredits} Credits</h3>
                      <p className="text-[11px] text-gray-500 font-mono-tech mt-1">Each AI generation consumes 5 credits</p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/pricing')}
                    className="z-10 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-semibold text-white transition-all shadow-md flex items-center gap-1.5 shrink-0"
                  >
                    <span>Get More Credits</span>
                    <ArrowUpRightIcon className="size-4" />
                  </button>
                </div>

                {/* Transactions History */}
                <div className="bg-[#111216] border border-[#22242c] rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-4 bg-[#0c0d10] border-b border-[#1c1e26] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ReceiptIcon className="size-4 text-indigo-400" />
                      <h3 className="text-sm font-semibold text-gray-200">Payment History</h3>
                    </div>
                    <span className="text-xs font-mono-tech text-gray-500">{transactions.length} transactions</span>
                  </div>

                  {loadingTx ? (
                    <div className="flex flex-col items-center justify-center p-12 text-gray-400 font-mono-tech text-xs gap-2">
                      <Loader2Icon className="size-6 animate-spin text-indigo-400" />
                      <span>FETCHING_TRANSACTION_HISTORY...</span>
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="divide-y divide-[#1c1e26]">
                      {transactions.map((tx) => {
                        const isCompleted = tx.isPaid || tx.status === 'completed'
                        const isFailed = tx.status === 'failed'
                        return (
                          <div key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#15171d] transition-colors">
                            <div className="flex items-center gap-3.5">
                              <div className={`p-2.5 rounded-xl border shrink-0 ${
                                isCompleted 
                                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                                  : isFailed
                                  ? 'bg-rose-950/40 border-rose-500/30 text-rose-400'
                                  : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                              }`}>
                                <CoinsIcon className="size-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold text-gray-200">
                                    +{tx.credits} Credits Pack
                                  </h4>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono-tech font-semibold ${
                                    isCompleted 
                                      ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400'
                                      : isFailed
                                      ? 'bg-rose-950/80 border border-rose-500/40 text-rose-400'
                                      : 'bg-amber-950/80 border border-amber-500/40 text-amber-300'
                                  }`}>
                                    {isCompleted ? 'COMPLETED' : isFailed ? 'FAILED' : 'PENDING'}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 font-mono-tech mt-0.5 flex items-center gap-2">
                                  <span>Order ID: <strong className="text-gray-300">{tx.gatewayOrderId || tx.id.slice(0, 12)}</strong></span>
                                  <span>•</span>
                                  <span className="capitalize">{tx.gatewayProvider || 'Cashfree'}</span>
                                </p>
                              </div>
                            </div>

                            <div className="sm:text-right flex sm:flex-col justify-between sm:justify-center items-end text-xs">
                              <span className="text-sm font-bold text-gray-100">₹{tx.amount}</span>
                              <span className="text-[11px] text-gray-500 font-mono-tech flex items-center gap-1 mt-0.5">
                                <ClockIcon className="size-3" />
                                <span>{new Date(tx.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <div className="p-3.5 rounded-2xl bg-[#171920] border border-[#22242c] text-gray-500 mb-3">
                        <ReceiptIcon className="size-8" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-300">No Transactions Yet</h4>
                      <p className="text-xs text-gray-500 font-mono-tech mt-1 max-w-sm">
                        You haven't purchased any credit packs yet. When you buy credits, your receipts will show up here.
                      </p>
                      <button
                        onClick={() => navigate('/pricing')}
                        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
                      >
                        View Credit Plans
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="flex flex-col gap-4">
                <div className="mb-2">
                  <h2 className="text-base font-semibold text-gray-200">Security & Password</h2>
                  <p className="text-xs text-gray-400 font-mono-tech">Change password and manage auth credentials</p>
                </div>
                <ChangePasswordCard 
                  classNames={{
                    base: 'bg-[#111216] border border-[#22242c] rounded-2xl w-full text-white shadow-xl',
                    footer: 'bg-[#0c0d10] border-t border-[#1c1e26] rounded-b-2xl'
                  }}
                />
              </div>
            )}

            {activeSection === 'danger' && (
              <div className="flex flex-col gap-4">
                <div className="mb-2">
                  <h2 className="text-base font-semibold text-rose-300">Danger Zone</h2>
                  <p className="text-xs text-gray-400 font-mono-tech">Irreversible actions regarding your account</p>
                </div>
                <DeleteAccountCard 
                  classNames={{
                    base: 'bg-[#111216] border border-rose-900/40 rounded-2xl w-full text-white shadow-xl',
                    footer: 'bg-[#0c0d10] border-t border-[#1c1e26] rounded-b-2xl'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Setting
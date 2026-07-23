import React, { useState, useEffect } from 'react'
import { AtSignIcon, Loader2Icon, CheckCircle2Icon, XCircleIcon, SparklesIcon } from 'lucide-react'
import api from '@/configs/axios'
import { toast } from 'sonner'

interface SetUsernameModalProps {
  onUsernameSet: (username: string) => void
}

export const SetUsernameModal: React.FC<SetUsernameModalProps> = ({ onUsernameSet }) => {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<{ available: boolean; message: string } | null>(null)

  // Debounce username check (~400ms)
  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus(null)
      setUsernameChecking(false)
      return
    }

    setUsernameChecking(true)
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/api/user/check-username?username=${encodeURIComponent(username.trim())}`)
        setUsernameStatus(data)
      } catch (err: any) {
        setUsernameStatus({ available: false, message: 'Error checking username availability' })
      } finally {
        setUsernameChecking(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usernameStatus?.available) {
      toast.error(usernameStatus?.message || 'Please choose a valid unique username')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/api/user/set-username', { username: username.trim().toLowerCase() })
      toast.success(data.message || 'Username set successfully!')
      onUsernameSet(data.username)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to set username')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111216] border border-[#22242c] rounded-2xl p-6 shadow-2xl text-white font-sans relative overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 mb-3">
            <AtSignIcon className="size-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-100 tracking-tight">Choose Your Username</h2>
          <p className="text-xs text-gray-400 mt-1 font-mono-tech max-w-xs">
            To publish sites and share public links on Buildo, your account requires a unique username.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-medium text-gray-300">Username</label>
              <span className="text-[10px] text-gray-500 font-mono-tech">Permanent once set</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-mono-tech">@</span>
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                placeholder="alexmercer"
                className="w-full pl-8 pr-10 py-2.5 text-sm bg-[#08080a] border border-[#22242c] focus:border-cyan-500 rounded-xl outline-none transition-colors text-white placeholder:text-gray-600 font-mono-tech"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                {usernameChecking && <Loader2Icon className="size-4 animate-spin text-cyan-400" />}
                {!usernameChecking && usernameStatus && usernameStatus.available && (
                  <CheckCircle2Icon className="size-4 text-emerald-400" />
                )}
                {!usernameChecking && usernameStatus && !usernameStatus.available && (
                  <XCircleIcon className="size-4 text-rose-400" />
                )}
              </div>
            </div>
            {usernameStatus && (
              <p className={`text-[11px] mt-1.5 font-mono-tech ${usernameStatus.available ? 'text-emerald-400' : 'text-rose-400'}`}>
                {usernameStatus.available ? '✓ Username is available' : `✕ ${usernameStatus.message}`}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || usernameChecking || (usernameStatus !== null && !usernameStatus.available)}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2Icon className="size-4 animate-spin" /> : <SparklesIcon className="size-4" />}
            <span>Set Username & Continue</span>
          </button>
        </form>
      </div>
    </div>
  )
}

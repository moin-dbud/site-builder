import React, { useState, useEffect } from 'react'
import { MailIcon, Loader2Icon, RefreshCwIcon, CheckCircle2Icon } from 'lucide-react'
import api from '@/configs/axios'
import { toast } from 'sonner'

interface EmailVerificationModalProps {
  email: string
  onVerified: () => void
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ email, onVerified }) => {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // Send initial OTP on mount
  const handleSendOtp = async () => {
    if (cooldown > 0 || sendingOtp) return
    setSendingOtp(true)
    try {
      const { data } = await api.post('/api/user/send-otp')
      toast.success(data.message || `Verification OTP code sent to ${email}`)
      setCooldown(45)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP code')
    } finally {
      setSendingOtp(false)
    }
  }

  useEffect(() => {
    handleSendOtp()
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.trim().length !== 6) {
      toast.error('Please enter the full 6-digit OTP code')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/api/user/verify-otp', { otp: otp.trim() })
      toast.success(data.message || 'Email verified successfully!')
      onVerified()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111216] border border-[#22242c] rounded-2xl p-6 shadow-2xl text-white font-sans relative overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-3">
            <MailIcon className="size-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-100 tracking-tight">Verify Your Email Address</h2>
          <p className="text-xs text-gray-400 mt-1 font-mono-tech max-w-xs">
            We sent a 6-digit code to <span className="text-indigo-300 font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2 text-center">
              Enter 6-Digit Verification Code
            </label>
            <input 
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full text-center tracking-[0.5em] text-xl font-mono-tech py-3 bg-[#08080a] border border-[#22242c] focus:border-indigo-500 rounded-xl outline-none text-white placeholder:text-gray-700 transition-all"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <CheckCircle2Icon className="size-4" />
            )}
            <span>Verify & Continue</span>
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[#1c1e26] flex items-center justify-between text-xs text-gray-400">
          <span>Didn't receive code?</span>
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={cooldown > 0 || sendingOtp}
            className="text-indigo-400 hover:text-indigo-300 disabled:text-gray-600 disabled:cursor-not-allowed font-medium font-mono-tech flex items-center gap-1.5 transition-colors"
          >
            {sendingOtp ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <RefreshCwIcon className="size-3.5" />
            )}
            <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

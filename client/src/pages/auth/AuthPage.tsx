import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { AuthView } from "@daveyplate/better-auth-ui"
import { signUp } from "@/lib/auth-client"
import api from "@/configs/axios"
import { toast } from "sonner"
import { Loader2Icon, CheckCircle2Icon, XCircleIcon, SparklesIcon } from "lucide-react"

export default function AuthPage() {
    const { pathname } = useParams()
    const navigate = useNavigate()

    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    // Username check state
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
                setUsernameStatus({ available: false, message: "Error checking username" })
            } finally {
                setUsernameChecking(false)
            }
        }, 400)

        return () => clearTimeout(timer)
    }, [username])

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!usernameStatus?.available) {
            toast.error(usernameStatus?.message || "Please choose a valid username")
            return
        }

        setLoading(true)
        try {
            const { error } = await signUp.email({
                email,
                password,
                name,
                username: username.trim().toLowerCase(),
            })

            if (error) {
                toast.error(error.message || "Failed to sign up")
            } else {
                toast.success("Account created successfully!")
                navigate("/")
            }
        } catch (err: any) {
            toast.error(err.message || "An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    if (pathname === "signup") {
        return (
            <main className="p-6 flex flex-col justify-center items-center min-h-[85vh] bg-[#08080a] text-white font-sans">
                <div className="w-full max-w-md p-6 rounded-2xl bg-[#111216] border border-[#22242c] shadow-2xl">
                    <div className="flex flex-col items-center mb-6 text-center">
                        <div className="p-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-3">
                            <SparklesIcon className="size-6" />
                        </div>
                        <h1 className="text-xl font-semibold text-gray-100">Create your Buildo account</h1>
                        <p className="text-xs text-gray-400 mt-1 font-mono-tech">Join creators building AI-powered websites</p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1.5">Full Name</label>
                            <input 
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Alex Mercer"
                                className="w-full px-3.5 py-2.5 text-sm bg-[#08080a] border border-[#22242c] focus:border-indigo-500 rounded-xl outline-none transition-colors text-white placeholder:text-gray-600"
                            />
                        </div>

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
                                    className="w-full pl-8 pr-10 py-2.5 text-sm bg-[#08080a] border border-[#22242c] focus:border-indigo-500 rounded-xl outline-none transition-colors text-white placeholder:text-gray-600 font-mono-tech"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                                    {usernameChecking && <Loader2Icon className="size-4 animate-spin text-indigo-400" />}
                                    {!usernameChecking && usernameStatus && usernameStatus.available && (
                                        <CheckCircle2Icon className="size-4 text-emerald-400" />
                                    )}
                                    {!usernameChecking && usernameStatus && !usernameStatus.available && (
                                        <XCircleIcon className="size-4 text-rose-400" />
                                    )}
                                </div>
                            </div>
                            {usernameStatus && (
                                <p className={`text-[11px] mt-1.5 font-mono-tech ${usernameStatus.available ? "text-emerald-400" : "text-rose-400"}`}>
                                    {usernameStatus.available ? "✓ Username is available" : `✕ ${usernameStatus.message}`}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1.5">Email address</label>
                            <input 
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="alex@example.com"
                                className="w-full px-3.5 py-2.5 text-sm bg-[#08080a] border border-[#22242c] focus:border-indigo-500 rounded-xl outline-none transition-colors text-white placeholder:text-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
                            <input 
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3.5 py-2.5 text-sm bg-[#08080a] border border-[#22242c] focus:border-indigo-500 rounded-xl outline-none transition-colors text-white placeholder:text-gray-600"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || usernameChecking || (usernameStatus !== null && !usernameStatus.available)}
                            className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2Icon className="size-4 animate-spin" />}
                            <span>Create account</span>
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-[#1c1e26] text-center text-xs text-gray-400">
                        Already have an account?{" "}
                        <Link to="/auth/signin" className="text-indigo-400 hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="p-6 flex flex-col justify-center items-center min-h-[80vh] bg-[#08080a]">
            <div className="w-full max-w-md p-2 rounded-2xl bg-[#111216] border border-[#22242c] shadow-2xl">
                <AuthView 
                    pathname={pathname} 
                    classNames={{ 
                        base: 'bg-transparent text-white border-none shadow-none font-sans',
                    }} 
                />
            </div>
        </main>
    )
}
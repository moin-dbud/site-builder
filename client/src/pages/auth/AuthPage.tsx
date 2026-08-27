import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { authClient, signIn, signUp } from "@/lib/auth-client"
import api from "@/configs/axios"
import { toast } from "sonner"
import { Loader2Icon, CheckCircle2Icon, XCircleIcon, SparklesIcon, ArrowRightIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import { assets } from "@/assets/assets"

export default function AuthPage() {
    const { pathname } = useParams()
    const navigate = useNavigate()
    const { data: session, isPending } = authClient.useSession()

    // Handle sign-out route
    useEffect(() => {
        if (pathname === "sign-out") {
            authClient.signOut().then(() => {
                localStorage.removeItem("bearer_token")
                navigate("/", { replace: true })
            })
        }
    }, [pathname, navigate])

    // Redirect logged-in users away from auth pages
    useEffect(() => {
        if (!isPending && session?.user && pathname !== "sign-out") {
            navigate("/", { replace: true })
        }
    }, [session, isPending, pathname, navigate])

    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    // Username check state
    const [usernameChecking, setUsernameChecking] = useState(false)
    const [usernameStatus, setUsernameStatus] = useState<{ available: boolean; message: string } | null>(null)

    // Parallax logic for split-screen background
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
    const targetOffset = useRef({ x: 0, y: 0 })
    const animationFrameId = useRef<number | null>(null)
    const [isReducedMotion, setIsReducedMotion] = useState(false)

    useEffect(() => {
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        setIsReducedMotion(motionQuery.matches)

        if (motionQuery.matches) return

        const factorX = 12
        const factorY = 8

        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window
            const x = ((e.clientX / innerWidth) - 0.5) * factorX
            const y = ((e.clientY / innerHeight) - 0.5) * factorY
            targetOffset.current = { x, y }
        }

        window.addEventListener('mousemove', handleMouseMove)

        const animate = () => {
            setMouseOffset(prev => {
                const dx = targetOffset.current.x - prev.x
                const dy = targetOffset.current.y - prev.y
                if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
                    return targetOffset.current
                }
                return {
                    x: prev.x + dx * 0.05,
                    y: prev.y + dy * 0.05
                }
            })
            animationFrameId.current = requestAnimationFrame(animate)
        }

        animationFrameId.current = requestAnimationFrame(animate)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
        }
    }, [])

    // Debounce username check (~400ms)
    useEffect(() => {
        if (!username.trim() || pathname !== "signup") {
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
    }, [username, pathname])

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
            } as any)

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

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { error } = await signIn.email({
                email,
                password,
            })

            if (error) {
                toast.error(error.message || "Failed to sign in")
            } else {
                toast.success("Signed in successfully!")
                navigate("/")
            }
        } catch (err: any) {
            toast.error(err.message || "An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    // Show loader while signing out
    if (pathname === "sign-out") {
        return (
            <main className="flex flex-col justify-center items-center min-h-screen bg-[#F7F5F0] text-[#1a1a2e]">
                <Loader2Icon className="size-8 animate-spin text-indigo-600 mb-2" />
                <span className="text-xs font-mono tracking-wider text-gray-500">SIGNING_OUT...</span>
            </main>
        )
    }

    // Show loader while checking session / redirecting logged-in user
    if (isPending || session?.user) {
        return (
            <main className="flex flex-col justify-center items-center min-h-screen bg-[#F7F5F0] text-[#1a1a2e]">
                <Loader2Icon className="size-8 animate-spin text-indigo-600 mb-2" />
                <span className="text-xs font-mono tracking-wider text-gray-500">INITIALIZING_SESSION...</span>
            </main>
        )
    }

    const isSignUp = pathname === "signup"

    return (
        <main className="min-h-screen w-full bg-[#F7F5F0] flex overflow-hidden font-sans text-[#1a1a2e]">
            {/* ── Left Cinematic Visual Panel (Desktop Only) ── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0c10]">
                {/* Background Environmental Image with Subtle Parallax */}
                <div
                    className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] transition-transform duration-700 ease-out"
                    style={{
                        transform: !isReducedMotion
                            ? `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`
                            : 'none',
                    }}
                >
                    <img
                        src="/background.png"
                        alt="Buildo World"
                        className="w-full h-full object-cover animate-slow-ambient-zoom opacity-90"
                    />
                </div>

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#08090d]/90 via-[#08090d]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-transparent" />

                {/* Content Overlay */}
                <div className="relative z-10 w-full p-12 pt-24 flex flex-col justify-between text-white">
                    {/* <Link to="/" className="inline-flex items-center gap-2.5 group">
                        <img
                            src={assets.logo}
                            alt="Buildo Logo"
                            className="h-8 w-auto drop-shadow group-hover:scale-105 transition-transform"
                        />
                    </Link> */}

                    <div className="max-w-md space-y-4 mb-8">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1 text-xs text-amber-200 font-medium">
                            <SparklesIcon className="size-3.5 text-amber-300" />
                            <span>AI Web Studio</span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
                            Build websites at the <br />
                            <span className="font-serif-italic text-amber-200">speed of thought.</span>
                        </h2>
                        <p className="text-sm text-gray-300 leading-relaxed font-normal">
                            Describe your idea. Buildo turns it into a responsive, live website ready to publish.
                        </p>
                    </div>

                    <div className="text-xs text-gray-400 font-mono tracking-wider">
                        © 2026 Buildo Inc. All rights reserved.
                    </div>
                </div>
            </div>

            {/* ── Right Form Container Panel ── */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-16 pt-24 sm:pt-28 lg:pt-16 relative z-10 bg-[#F7F5F0] overflow-y-auto">
                {/* Mobile Top Brand Header */}
                <div className="flex lg:hidden items-center justify-between mb-6">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={assets.logo} alt="Buildo Logo" className="h-7 w-auto" />
                    </Link>
                </div>

                {/* Form Card Area */}
                <div className="w-full max-w-md mx-auto my-auto py-4">
                    {/* Header */}
                    <div className="mb-8 space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1a1a2e]">
                            {isSignUp ? (
                                <>
                                    Create your <span className="font-serif-italic text-[#b89158]">Buildo</span> account
                                </>
                            ) : (
                                <>
                                    Welcome back to <span className="font-serif-italic text-[#b89158]">Buildo</span>
                                </>
                            )}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-600 font-normal leading-relaxed">
                            {isSignUp
                                ? "Turn your ideas into live websites with AI."
                                : "Sign in to continue building and managing your websites."}
                        </p>
                    </div>

                    {/* Auth Form */}
                    {isSignUp ? (
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Alex Mercer"
                                    className="w-full px-4 py-3 text-sm bg-white border border-[#E5E0D5] focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl outline-none transition-all text-[#1a1a2e] placeholder:text-gray-400 shadow-sm"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-xs font-semibold text-gray-700">Username</label>
                                    <span className="text-[10px] text-gray-500 font-mono">Permanent once set</span>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">@</span>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                                        placeholder="alexmercer"
                                        className="w-full pl-9 pr-10 py-3 text-sm bg-white border border-[#E5E0D5] focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl outline-none transition-all text-[#1a1a2e] placeholder:text-gray-400 font-mono shadow-sm"
                                    />
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                                        {usernameChecking && <Loader2Icon className="size-4 animate-spin text-indigo-600" />}
                                        {!usernameChecking && usernameStatus && usernameStatus.available && (
                                            <CheckCircle2Icon className="size-4 text-emerald-600" />
                                        )}
                                        {!usernameChecking && usernameStatus && !usernameStatus.available && (
                                            <XCircleIcon className="size-4 text-rose-500" />
                                        )}
                                    </div>
                                </div>
                                {usernameStatus && (
                                    <p className={`text-[11px] mt-1.5 font-mono ${usernameStatus.available ? "text-emerald-700" : "text-rose-600"}`}>
                                        {usernameStatus.available ? "✓ Username is available" : `✕ ${usernameStatus.message}`}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="alex@example.com"
                                    className="w-full px-4 py-3 text-sm bg-white border border-[#E5E0D5] focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl outline-none transition-all text-[#1a1a2e] placeholder:text-gray-400 shadow-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="auth-signup-password" className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        id="auth-signup-password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        minLength={8}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Minimum 8 characters"
                                        aria-label="Password"
                                        className="w-full pl-4 pr-11 py-3 text-sm bg-white border border-[#E5E0D5] focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl outline-none transition-all text-[#1a1a2e] placeholder:text-gray-400 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors rounded-lg"
                                    >
                                        {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || usernameChecking || (usernameStatus !== null && !usernameStatus.available)}
                                className="w-full mt-3 py-3.5 px-5 bg-[#1a1a2e] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-2xl transition-all shadow-lg hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2Icon className="size-4 animate-spin text-white" />
                                        <span>Creating account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create account</span>
                                        <ArrowRightIcon className="size-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="alex@example.com"
                                    className="w-full px-4 py-3 text-sm bg-white border border-[#E5E0D5] focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl outline-none transition-all text-[#1a1a2e] placeholder:text-gray-400 shadow-sm"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label htmlFor="auth-password-input" className="block text-xs font-semibold text-gray-700">Password</label>
                                    {!isSignUp && (
                                        <button
                                            type="button"
                                            onClick={() => toast.info("Password Reset", { description: "Please contact support or check your email settings to reset your password." })}
                                            className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        id="auth-password-input"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        minLength={isSignUp ? 8 : 1}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        aria-label="Password"
                                        className="w-full pl-4 pr-11 py-3 text-sm bg-white border border-[#E5E0D5] focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl outline-none transition-all text-[#1a1a2e] placeholder:text-gray-400 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors rounded-lg"
                                    >
                                        {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-3 py-3.5 px-5 bg-[#1a1a2e] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-2xl transition-all shadow-lg hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2Icon className="size-4 animate-spin text-white" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign in</span>
                                        <ArrowRightIcon className="size-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Switch Auth Mode Footnote */}
                    <div className="mt-8 pt-6 border-t border-[#E5E0D5] text-center text-xs text-gray-600 font-medium">
                        {isSignUp ? (
                            <>
                                Already have an account?{" "}
                                <Link to="/auth/signin" className="text-indigo-700 hover:text-indigo-900 font-semibold underline underline-offset-2">
                                    Sign in
                                </Link>
                            </>
                        ) : (
                            <>
                                Don't have an account yet?{" "}
                                <Link to="/auth/signup" className="text-indigo-700 hover:text-indigo-900 font-semibold underline underline-offset-2">
                                    Create account
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer note */}
                <div className="text-center text-[11px] text-gray-400 pt-4 font-mono">
                    Protected by Buildo Auth & Edge Security
                </div>
            </div>
        </main>
    )
}
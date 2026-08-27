import { CircleIcon, ScanLineIcon, SquareIcon, TriangleIcon, SparklesIcon } from "lucide-react"
import { useEffect, useState } from "react"

const steps = [
    { icon: ScanLineIcon, label: "Understanding your idea & design system...", accent: "text-[#b89158]" },
    { icon: SquareIcon, label: "Architecting layout hierarchy & grid...", accent: "text-[#4b8ebc]" },
    { icon: TriangleIcon, label: "Synthesizing UI components & responsive code...", accent: "text-indigo-600" },
    { icon: CircleIcon, label: "Compiling assets & publishing live preview...", accent: "text-emerald-600" },
]

const STEP_DURATION = 45000

const LoaderSteps = () => {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((s) => (s + 1) % steps.length)
        }, STEP_DURATION)

        return () => clearInterval(interval)
    }, [])

    const Icon = steps[current].icon

    return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-[#FAF9F5] relative overflow-hidden text-[#1a1a2e] rounded-2xl border border-[#E6E2D8] shadow-sm">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#E5E0D5_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />

            {/* Corner Crosshair Accents */}
            <div className="absolute top-4 left-4 font-mono text-[10px] text-gray-500 flex items-center gap-1.5 font-semibold">
                <SparklesIcon className="size-3 text-[#b89158]" /> BUILDO_AI
            </div>
            <div className="absolute top-4 right-4 font-mono text-[10px] text-indigo-600 flex items-center gap-1 font-semibold">
                <span className="size-1.5 rounded-full bg-indigo-600 animate-ping" /> BUILDING_WEBSITE
            </div>
            <div className="absolute bottom-4 left-4 font-mono text-[10px] text-gray-500">
                STAGE 0{current + 1} // 04
            </div>
            <div className="absolute bottom-4 right-4 font-mono text-[10px] text-gray-500">
                STUDIO_SYNTHESIS
            </div>

            {/* Kinetic Scanner Core */}
            <div className="relative z-10 w-36 h-36 flex items-center justify-center my-6">
                {/* Outer Rotating Radar Ring */}
                <div className="absolute inset-0 rounded-full border border-indigo-500/30 border-t-indigo-600 animate-spin [animation-duration:4s]" />
                <div className="absolute inset-2 rounded-full border border-dashed border-sky-400/40 animate-spin [animation-duration:8s] [animation-direction:reverse]" />
                
                {/* Inner Glow Center */}
                <div className="absolute inset-7 rounded-full bg-white border border-[#E6E2D8] flex items-center justify-center shadow-md">
                    <div className="relative flex items-center justify-center">
                        <Icon className={`w-8 h-8 ${steps[current].accent} animate-pulse`} />
                    </div>
                </div>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-2 mb-6 z-10">
                {steps.map((_, index) => (
                    <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                            index === current
                                ? "w-8 bg-gradient-to-r from-amber-500 via-indigo-600 to-emerald-500 shadow-sm"
                                : index < current
                                ? "w-2 bg-emerald-500"
                                : "w-2 bg-gray-300"
                        }`}
                    />
                ))}
            </div>

            {/* Step Label */}
            <div className="z-10 text-center px-6 max-w-lg space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full shadow-sm">
                    <SparklesIcon className="size-3 text-[#b89158]" />
                    <span>Buildo is building your website</span>
                </div>
                <p 
                    key={current} 
                    className="text-base sm:text-lg font-bold text-[#1a1a2e] tracking-tight animate-kinetic-fade font-sans leading-snug"
                >
                    {steps[current].label}
                </p>

                <p className="text-xs text-gray-500 font-mono">
                    Estimated synthesis time ~ 1-2 minutes
                </p>
            </div>
        </div>
    )
}

export default LoaderSteps
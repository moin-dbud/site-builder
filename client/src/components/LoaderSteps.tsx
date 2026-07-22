import { CircleIcon, ScanLineIcon, SquareIcon, TriangleIcon } from "lucide-react"
import { useEffect, useState } from "react"

const steps = [
    { icon: ScanLineIcon, label: "Analyzing requirements & design system..." },
    { icon: SquareIcon, label: "Architecting layout hierarchy & grid..." },
    { icon: TriangleIcon, label: "Synthesizing UI components & responsive code..." },
    { icon: CircleIcon, label: "Compiling assets & publishing live preview..." },
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
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-[#08080a] relative overflow-hidden text-white rounded-xl border border-[#22242c]">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#22242c_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

            {/* Corner Crosshair Accents */}
            <div className="absolute top-4 left-4 font-mono-tech text-[10px] text-gray-600 flex items-center gap-1">
                <span>+</span> SYS_GEN_V2
            </div>
            <div className="absolute top-4 right-4 font-mono-tech text-[10px] text-indigo-400/80 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-indigo-500 animate-ping" /> PROCESSING
            </div>
            <div className="absolute bottom-4 left-4 font-mono-tech text-[10px] text-gray-600">
                04 // STAGES
            </div>
            <div className="absolute bottom-4 right-4 font-mono-tech text-[10px] text-gray-600">
                BUILDO_AI
            </div>

            {/* Kinetic Scanner Core */}
            <div className="relative z-10 w-40 h-40 flex items-center justify-center my-6">
                {/* Outer Rotating Radar Ring */}
                <div className="absolute inset-0 rounded-full border border-indigo-500/20 border-t-indigo-500 animate-spin [animation-duration:4s]" />
                <div className="absolute inset-2 rounded-full border border-dashed border-cyan-500/30 animate-spin [animation-duration:8s] [animation-direction:reverse]" />
                
                {/* Inner Glow Center */}
                <div className="absolute inset-8 rounded-full bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center backdrop-blur-sm">
                    <div className="relative flex items-center justify-center">
                        <Icon className="w-8 h-8 text-indigo-400 animate-pulse" />
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
                                ? "w-8 bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-sm shadow-indigo-500/50"
                                : index < current
                                ? "w-2 bg-indigo-900/60"
                                : "w-2 bg-gray-800"
                        }`}
                    />
                ))}
            </div>

            {/* Step Label */}
            <div className="z-10 text-center px-6 max-w-lg">
                <p 
                    key={current} 
                    className="text-base sm:text-lg font-medium text-gray-100 tracking-tight animate-kinetic-fade font-sans"
                >
                    {steps[current].label}
                </p>

                <p className="text-xs text-gray-500 mt-2.5 font-mono-tech">
                    Estimated synthesis time ~ 2-3 minutes
                </p>
            </div>
        </div>
    )
}

export default LoaderSteps
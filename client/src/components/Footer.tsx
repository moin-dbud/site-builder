
const Footer = () => {
    return (
        <footer className='w-full py-8 text-center text-xs text-gray-500 border-t border-[#22242c] mt-24 bg-[#08080a] font-mono-tech'>
            <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-indigo-500 inline-block" />
                    <p className="text-gray-400">Buildo AI Engine — Architectural Web Generator</p>
                </div>
                <p className="text-gray-500">© 2026 Buildo. All rights reserved.</p>
            </div>
        </footer>
    )
}

export default Footer
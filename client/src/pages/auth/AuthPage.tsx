import { useParams } from "react-router-dom"
import { AuthView } from "@daveyplate/better-auth-ui"

export default function AuthPage() {
    const { pathname } = useParams()

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
import { AccountSettingsCards, ChangePasswordCard, DeleteAccountCard } from '@daveyplate/better-auth-ui'

const Setting = () => {
  return (
    <div className='w-full p-4 flex flex-col gap-6 py-12 justify-center items-center min-h-[90vh] bg-[#08080a] text-white font-sans'>
        <div className="w-full max-w-xl">
            <h1 className="text-xl font-semibold mb-6 tracking-tight text-gray-100 pb-3 border-b border-[#22242c]">
                Account Settings
            </h1>

            <div className="flex flex-col gap-6">
                <AccountSettingsCards 
                    classNames={{
                        card: {
                            base: 'bg-[#111216] border border-[#22242c] rounded-2xl max-w-xl mx-auto text-white shadow-xl',
                            footer: 'bg-[#0c0d10] border-t border-[#1c1e26] rounded-b-2xl'
                        }
                    }}
                />

                <ChangePasswordCard 
                    classNames={{
                        base: 'bg-[#111216] border border-[#22242c] rounded-2xl max-w-xl mx-auto text-white shadow-xl',
                        footer: 'bg-[#0c0d10] border-t border-[#1c1e26] rounded-b-2xl'
                    }}
                />

                <DeleteAccountCard 
                    classNames={{
                        base: 'bg-[#111216] border border-rose-900/40 rounded-2xl max-w-xl mx-auto text-white shadow-xl',
                        footer: 'bg-[#0c0d10] border-t border-[#1c1e26] rounded-b-2xl'
                    }}
                />
            </div>
        </div>
    </div>
  )
}

export default Setting
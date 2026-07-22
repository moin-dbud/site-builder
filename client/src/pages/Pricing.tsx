import { useState } from 'react'
import { appPlans } from '../assets/assets';
import Footer from '../components/Footer';
import { toast } from 'sonner';
import { Loader2Icon, CheckIcon, SparklesIcon, ZapIcon } from 'lucide-react';
import api from '@/configs/axios';
import { authClient } from '@/lib/auth-client';
import { useNavigate } from 'react-router-dom';
import { load } from '@cashfreepayments/cashfree-js';

interface Plan {
    id: string;
    name: string;
    price: string;
    credits: number;
    description: string;
    features: string[];
}

const Pricing = () => {
    const [plans] = useState<Plan[]>(appPlans)
    const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
    const { data: session } = authClient.useSession();
    const navigate = useNavigate();

    const handlePurchase = async (planId: string) => {
        if (!session?.user) {
            toast.error('Please sign in to purchase credits');
            navigate('/auth/signin');
            return;
        }

        try {
            setLoadingPlanId(planId);

            // 1. Create a Cashfree order on the backend
            const { data } = await api.post('/api/cashfree/create-order', { planId });
            const { payment_session_id } = data;

            // 2. Load Cashfree JS SDK
            const cashfree = await load({
                mode: (import.meta.env.VITE_CASHFREE_ENV as 'sandbox' | 'production') || 'sandbox',
            });

            // 3. Launch hosted checkout
            const result = await cashfree.checkout({
                paymentSessionId: payment_session_id,
                redirectTarget: '_self',
            });

            if (result?.error) {
                toast.error(result.error.message || 'Payment was cancelled or failed');
            }

        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message);
            console.error('[Pricing] purchase error:', error);
        } finally {
            setLoadingPlanId(null);
        }
    };

    const isRecommended = (planId: string) => planId === 'pro';

    return (
        <>
            <div className='w-full max-w-6xl mx-auto z-20 px-4 md:px-8 min-h-[85vh] text-white font-sans bg-[#08080a] py-12'>
                <div className='text-center max-w-xl mx-auto mt-6'>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-mono-tech mb-4">
                        <ZapIcon size={13} /> FLEXIBLE CREDIT PACKS
                    </div>
                    <h2 className='text-3xl sm:text-4xl font-semibold tracking-tight text-gray-100'>Choose Your Synthesis Plan</h2>
                    <p className='text-gray-400 text-xs sm:text-sm mt-2.5 leading-relaxed font-mono-tech'>
                        Scale your website creations effortlessly. 1 Creation or Revision = 5 Credits.
                    </p>
                </div>

                <div className='pt-12 pb-6'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch'>
                        {plans.map((plan, idx) => {
                            const highlighted = isRecommended(plan.id);
                            return (
                                <div
                                    key={idx}
                                    className={`relative p-6 sm:p-8 bg-[#111216] rounded-2xl text-white transition-all duration-300 flex flex-col justify-between border ${
                                        highlighted
                                            ? 'border-indigo-500/80 shadow-2xl shadow-indigo-950/50 bg-gradient-to-b from-[#161722] to-[#111216]'
                                            : 'border-[#22242c] hover:border-[#2d303b]'
                                    }`}
                                >
                                    {highlighted && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-mono-tech uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-3 py-1 rounded-full font-semibold shadow-md flex items-center gap-1">
                                            <SparklesIcon size={12} /> Recommended
                                        </div>
                                    )}

                                    <div>
                                        <h3 className='text-lg font-semibold text-gray-100'>{plan.name}</h3>
                                        <p className='text-xs text-gray-400 mt-1 font-mono-tech'>{plan.description}</p>

                                        <div className='my-6 pb-6 border-b border-[#1c1e26]'>
                                            <div className="flex items-baseline gap-1">
                                                <span className='text-4xl sm:text-5xl font-bold tracking-tight text-gray-100'>{plan.price}</span>
                                                <span className='text-xs font-mono-tech text-indigo-400 font-semibold'>INR</span>
                                            </div>
                                            <span className='inline-block text-xs font-mono-tech text-gray-400 mt-1'>
                                                Includes <strong className="text-gray-200">{plan.credits} credits</strong>
                                            </span>
                                        </div>

                                        <ul className='space-y-2.5 mb-8 text-xs font-sans'>
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className='flex items-center text-gray-300 gap-2.5'>
                                                    <div className={`p-0.5 rounded-full ${highlighted ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-400'}`}>
                                                        <CheckIcon size={13} />
                                                    </div>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => handlePurchase(plan.id)}
                                        disabled={loadingPlanId === plan.id}
                                        className={`w-full py-3 px-4 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                                            highlighted
                                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/50 border border-indigo-400/30 active:scale-95'
                                                : 'bg-[#181920] hover:bg-indigo-600 border border-[#22242c] hover:border-indigo-500 text-gray-200 hover:text-white active:scale-95'
                                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                                    >
                                        {loadingPlanId === plan.id ? (
                                            <><Loader2Icon size={14} className='animate-spin' /> Processing Order...</>
                                        ) : (
                                            'Acquire Plan'
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <p className='text-center text-xs mt-8 font-mono-tech text-gray-500 max-w-md mx-auto leading-relaxed'>
                    Project creation and revisions consume 5 credits each. Purchased credits never expire.
                </p>
            </div>
            <Footer />
        </>
    )
}

export default Pricing
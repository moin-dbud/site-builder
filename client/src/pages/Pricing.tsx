import React, { useState } from 'react'
import { appPlans } from '../assets/assets';
import Footer from '../components/Footer';
import { toast } from 'sonner';
import { Loader2Icon } from 'lucide-react';
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
            const { payment_session_id, order_id } = data;

            // 2. Load Cashfree JS SDK
            // DEPLOY NOTE: Change mode to "production" when going live.
            // The SDK URL also changes — swap sdk.cashfree.com/js/v3/cashfree.sandbox.js
            // for sdk.cashfree.com/js/v3/cashfree.js in your index.html script tag.
            const cashfree = await load({
                mode: (import.meta.env.VITE_CASHFREE_ENV as 'sandbox' | 'production') || 'sandbox',
            });

            // 3. Launch hosted checkout (redirects to return_url after payment)
            const result = await cashfree.checkout({
                paymentSessionId: payment_session_id,
                redirectTarget: '_self',  // redirect in the same tab
            });

            // result.error is set if the user cancelled or checkout failed before redirect
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

    // "Pro" is the recommended / highlighted plan
    const isRecommended = (planId: string) => planId === 'pro';

    return (
        <>
            <div className='w-full max-w-5xl mx-auto z-20 max-md:px-4 min-h-[80vh]'>
                <div className='text-center mt-16'>
                    <h2 className='text-gray-100 text-3xl font-medium'>Choose Your Plan</h2>
                    <p className='text-gray-400 text-sm max-w-md mx-auto mt-2'>
                        Start for free and scale up as you grow. Find the perfect plan for your content creation needs.
                    </p>
                </div>

                <div className='pt-14 py-4 px-4'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        {plans.map((plan, idx) => (
                            <div
                                key={idx}
                                className={`p-6 bg-black/20 mx-auto w-full max-w-sm rounded-lg text-white transition-all duration-300 ${
                                    isRecommended(plan.id)
                                        ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-900/30'
                                        : 'ring ring-indigo-950 hover:ring-indigo-500'
                                }`}
                            >
                                {isRecommended(plan.id) && (
                                    <span className='inline-block text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full mb-3 font-medium'>
                                        Recommended
                                    </span>
                                )}
                                <h3 className='text-xl font-bold'>{plan.name}</h3>
                                <div className='my-2'>
                                    <span className='text-4xl font-bold'>{plan.price}</span>
                                    <span className='text-gray-300'> / {plan.credits} credits</span>
                                </div>

                                <p className='text-gray-300 mb-6'>{plan.description}</p>

                                <ul className='space-y-1.5 mb-6 text-sm'>
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className='flex items-center'>
                                            <svg className='h-5 w-5 text-indigo-300 mr-2 shrink-0' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                                            </svg>
                                            <span className='text-gray-400'>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handlePurchase(plan.id)}
                                    disabled={loadingPlanId === plan.id}
                                    className={`w-full py-2 px-4 text-sm rounded-md transition-all flex items-center justify-center gap-2 ${
                                        isRecommended(plan.id)
                                            ? 'bg-indigo-500 hover:bg-indigo-600 active:scale-95'
                                            : 'bg-indigo-900/60 hover:bg-indigo-600 active:scale-95'
                                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                                >
                                    {loadingPlanId === plan.id ? (
                                        <><Loader2Icon size={14} className='animate-spin' /> Processing...</>
                                    ) : (
                                        'Buy Now'
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <p className='text-center text-sm mt-10 mx-auto max-w-md text-white/60 font-light'>
                    Project <span className='text-white'>Creation / Revision</span> consume{' '}
                    <span className='text-white'>5 credits</span>. You can purchase more credits to create more projects.
                </p>
            </div>
            <Footer />
        </>
    )
}

export default Pricing
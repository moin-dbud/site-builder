import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2Icon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import api from '@/configs/axios';
import { ZapIcon } from 'lucide-react';
import { assets } from '@/assets/assets';

// Cashfree redirects the user here after payment with ?order_id=...
// We poll the backend every 1.5 seconds (up to ~15 seconds) to confirm the
// webhook has processed the payment, then redirect home.

const POLL_INTERVAL_MS = 1500;
const MAX_POLLS = 10; // 10 × 1.5s = 15 seconds max wait

type Status = 'polling' | 'completed' | 'failed' | 'timeout';

const PaymentVerify = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('order_id');

    const [status, setStatus] = useState<Status>('polling');
    const [message, setMessage] = useState('Verifying your payment…');
    const pollCount = useRef(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        if (!orderId) {
            setStatus('failed');
            setMessage('No order ID found. Please contact support.');
            return;
        }

        const poll = async () => {
            try {
                pollCount.current += 1;
                const { data } = await api.get(`/api/cashfree/order-status/${orderId}`);

                if (data.status === 'completed') {
                    stopPolling();
                    setStatus('completed');
                    setMessage('Payment successful! Credits have been added to your account.');
                    setTimeout(() => navigate('/'), 2500);
                    return;
                }

                if (data.status === 'failed') {
                    stopPolling();
                    setStatus('failed');
                    setMessage('Payment was not successful. No credits were added. Please try again.');
                    return;
                }

                // Still pending — check if we've hit max polls
                if (pollCount.current >= MAX_POLLS) {
                    stopPolling();
                    setStatus('timeout');
                    setMessage(
                        'Payment verification is taking longer than expected. ' +
                        'Your credits will appear once confirmed. Check back in a minute.'
                    );
                }

            } catch (error: any) {
                console.error('[PaymentVerify] poll error:', error.message);
                // Don't stop polling on network errors — keep trying
            }
        };

        // Poll immediately, then on interval
        poll();
        intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

        return () => stopPolling();
    }, [orderId]);

    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center"
            style={{ backgroundColor: '#0a0a0a', color: '#f2f2f2' }}
        >
            {/* Logo */}
            <div className="flex items-center justify-center w-full">
                <span
                    className="flex items-center justify-center w-full rounded-[6px]"
                >
                    <Link to="/">
                        <img src={assets.logo} alt="logo" className='h-6 sm:h-8' />
                    </Link>
                </span>
            </div>

            {/* Status icon */}
            {status === 'polling' && (
                <Loader2Icon
                    size={40}
                    className="animate-spin"
                    style={{ color: '#7F77DD' }}
                />
            )}
            {status === 'completed' && (
                <CheckCircle2Icon size={40} style={{ color: '#4ade80' }} />
            )}
            {(status === 'failed' || status === 'timeout') && (
                <XCircleIcon size={40} style={{ color: '#f87171' }} />
            )}

            {/* Title */}
            <div>
                <h1 className="text-xl font-medium mb-2">
                    {status === 'polling' && 'Verifying payment'}
                    {status === 'completed' && 'Payment confirmed'}
                    {status === 'failed' && 'Payment unsuccessful'}
                    {status === 'timeout' && 'Still processing'}
                </h1>
                <p className="text-sm max-w-sm" style={{ color: '#888' }}>
                    {message}
                </p>
            </div>

            {/* Polling dots */}
            {status === 'polling' && (
                <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                        <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full animate-bounce"
                            style={{ backgroundColor: '#555', animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>
            )}

            {/* Action buttons for non-polling states */}
            {status === 'failed' && (
                <button
                    onClick={() => navigate('/pricing')}
                    className="mt-2 px-5 py-2 text-sm rounded-[6px] transition-opacity hover:opacity-80"
                    style={{ backgroundColor: '#f2f2f2', color: '#0a0a0a' }}
                >
                    Try again
                </button>
            )}
            {status === 'timeout' && (
                <button
                    onClick={() => navigate('/')}
                    className="mt-2 px-5 py-2 text-sm rounded-[6px] transition-opacity hover:opacity-80"
                    style={{ backgroundColor: '#f2f2f2', color: '#0a0a0a' }}
                >
                    Go home
                </button>
            )}

            {/* Order ID for reference */}
            {orderId && (
                <p className="text-xs font-mono mt-4" style={{ color: '#555' }}>
                    Order: {orderId}
                </p>
            )}
        </div>
    );
};

export default PaymentVerify;

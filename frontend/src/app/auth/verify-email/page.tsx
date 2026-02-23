
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

const BACKGROUND_IMAGE =
    'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';

function VerifyEmailContent() {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const { verifyEmail, resendOTP } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!email) {
                toast.error('Email parameter missing');
                router.push('/auth/login');
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [email, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            await verifyEmail(email, otp);
            toast.success('Email verified successfully! Please login.');
            router.push('/auth/login');
        } catch (error: any) {
            toast.error(error.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!email) return;

        setResending(true);
        try {
            await resendOTP(email);
            toast.success('New verification code sent to your email.');
        } catch (error: any) {
            toast.error(error.message || 'Failed to resend code');
        } finally {
            setResending(false);
        }
    };

    if (!email) return null;

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <div className="lg:hidden mb-8">
                    <img src="/logo.png" alt="CustConnect" className="h-12 w-auto mx-auto" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Verify your email
                </h2>
                <p className="mt-3 text-slate-500 font-medium">
                    We sent a verification code to <br />
                    <span className="text-blue-600 font-bold">{email}</span>
                </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="relative group">
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            required
                            maxLength={6}
                            autoFocus
                            className="w-full px-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 text-center text-3xl font-black tracking-[0.5em] placeholder:text-slate-200"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setOtp(val);
                            }}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resending}
                        className="w-full text-sm font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 transition ml-1"
                    >
                        {resending ? 'Sending...' : "Didn't receive code? Resend"}
                    </button>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
                    >
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                </div>

                <div className="text-center">
                    <Link
                        href="/auth/register"
                        className="text-sm font-bold text-slate-500 hover:text-slate-700 transition"
                    >
                        Use a different email address
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side: Premium Video Backdrop */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-16 overflow-hidden bg-slate-950 text-left">
                {/* Animated Campus Video */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
                >
                    <source
                        src="https://assets.mixkit.co/videos/preview/mixkit-group-of-students-walking-in-a-university-campus-41221-large.mp4"
                        type="video/mp4"
                    />
                </video>
                {/* Deep Professional Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-slate-900/80 to-slate-950/90" />

                <div className="relative z-10 w-full max-w-sm text-white">
                    <div className="bg-white p-4 rounded-2xl shadow-xl inline-block mb-10">
                        <img src="/logo.png" alt="CustConnect" className="h-14 w-auto object-contain" />
                    </div>
                    <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight tracking-tight text-white">
                        Secure your account <br />
                        with verification.
                    </h2>
                    <p className="text-lg text-slate-300 leading-relaxed font-medium">
                        One more step to unlock your digital campus hub. Check your inbox for the code.
                    </p>
                </div>
            </div>

            {/* Right Side: Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 bg-white relative">
                <div className="absolute top-8 left-8">
                    <Link
                        href="/auth/login"
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-all group"
                    >
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </div>
                        Return to Login
                    </Link>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                    <VerifyEmailContent />
                </Suspense>
            </div>
        </div>
    );
}

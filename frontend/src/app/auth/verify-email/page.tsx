
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import Image from 'next/image';

const BACKGROUND_IMAGE =
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80';

function VerifyEmailContent() {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const { verifyEmail, resendOTP } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    useEffect(() => {
        if (!email) {
            toast.error('Email parameter missing');
            router.push('/auth/login');
        }
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
        <div className="max-w-md w-full space-y-8">
            <div>
                <div className="mt-6 text-center">
                    <Image
                        src="/logo.png"
                        alt="CustConnect"
                        width={180}
                        height={50}
                        className="h-12 w-auto object-contain mx-auto mb-2"
                        priority
                    />
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Verify your email
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        We sent a verification code to <span className="font-semibold">{email}</span>
                    </p>
                </div>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label htmlFor="otp" className="sr-only">
                            Verification Code
                        </label>
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            required
                            maxLength={6}
                            className="appearance-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-center text-2xl tracking-widest"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => {
                                // Only allow numbers
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setOtp(val);
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col space-y-4">
                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <LoadingSpinner size="sm" /> : 'Verify Email'}
                    </button>

                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resending}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                    >
                        {resending ? 'Sending...' : 'Resend Code'}
                    </button>
                </div>

                <div className="text-center">
                    <span className="text-sm text-gray-600">
                        <a
                            href="/auth/register"
                            className="font-medium text-gray-600 hover:text-gray-500"
                        >
                            Back to Register
                        </a>
                    </span>
                </div>
            </form>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex bg-gray-900">
            <div className="hidden lg:block relative w-1/2 bg-blue-900">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
                />
                <div className="absolute inset-0 bg-blue-900/70" />
                <div className="relative z-10 flex h-full flex-col justify-center p-12 text-white">
                    <div className="mb-6">
                        <Image
                            src="/logo.png"
                            alt="CustConnect"
                            width={200}
                            height={60}
                            className="h-16 w-auto object-contain"
                            priority
                        />
                    </div>
                    <p className="text-lg text-blue-100 max-w-lg">
                        Join our community and get verified access to exclusive student resources and events.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <Suspense fallback={<LoadingSpinner />}>
                    <VerifyEmailContent />
                </Suspense>
            </div>
        </div>
    );
}

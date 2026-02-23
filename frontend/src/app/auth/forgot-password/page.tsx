'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=1600&q=80';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await forgotPassword(email);
            setSubmitted(true);
            toast.success('Reset link sent to your email!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-900">
            <div className="hidden lg:block relative w-1/2 bg-red-900">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
                />
                <div className="absolute inset-0 bg-red-950/70" />
                <div className="relative z-10 flex h-full flex-col justify-center p-12 text-white">
                    <div className="mb-14">
                        <Image
                            src="/logo.png"
                            alt="CustConnect"
                            width={300}
                            height={100}
                            className="h-24 w-auto object-contain brightness-110 drop-shadow-2xl"
                            priority
                        />
                    </div>
                    <h1 className="text-5xl font-black mb-6">Recover your access.</h1>
                    <p className="text-lg text-red-100 max-w-lg">
                        University life is busy. We'll help you get back into your account in no time.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8F7F4]">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <Link href="/auth/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#A51C30] mb-8 transition-colors">
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to login
                        </Link>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
                            Forgot password?
                        </h2>
                        <p className="text-gray-500 font-medium">
                            Enter your email and we'll send you a recovery link.
                        </p>
                    </div>

                    {!submitted ? (
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="rounded-2xl bg-white p-1 shadow-sm border border-gray-100">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-11 pr-4 py-4 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 sm:text-sm font-bold"
                                        placeholder="Enter your university email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-sm font-bold text-white bg-[#A51C30] hover:bg-[#821626] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A51C30] transition-all transform active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? <LoadingSpinner size="sm" /> : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : (
                        <div className="mt-8 p-8 bg-green-50 rounded-[32px] border border-green-100 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <EnvelopeIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-green-900 mb-2">Check your email</h3>
                            <p className="text-green-700 text-sm">
                                We've sent a recovery link to <span className="font-bold">{email}</span>. Click the link in the email to reset your password.
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="mt-6 text-sm font-bold text-green-800 hover:text-green-900 underline"
                            >
                                Didn't receive it? Try again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1434030216411-0bb7c3f3dfad?auto=format&fit=crop&w=1600&q=80';

function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            toast.error('Invalid or missing reset token');
            router.push('/auth/login');
        }
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        if (!token) return;

        setLoading(true);
        try {
            await resetPassword(token, password);
            toast.success('Password reset successful! Please login.');
            router.push('/auth/login');
        } catch (error: any) {
            toast.error(error.message || 'Failed to reset password. Link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-900">
            <div className="hidden lg:block relative w-1/2 bg-[#1a2744]">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
                />
                <div className="absolute inset-0 bg-[#0f172a]/70" />
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
                    <h1 className="text-5xl font-black mb-6">New beginnings.</h1>
                    <p className="text-lg text-blue-100 max-w-lg">
                        Secure your account with a strong password. You're just one step away from getting back to campus.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8F7F4]">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
                            Reset Password
                        </h2>
                        <p className="text-gray-500 font-medium">
                            Set a new secure password for your account.
                        </p>
                    </div>

                    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="rounded-2xl bg-white p-1 shadow-sm border border-gray-100 relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="block w-full pl-11 pr-12 py-4 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 sm:text-sm font-bold"
                                    placeholder="New Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>

                            <div className="rounded-2xl bg-white p-1 shadow-sm border border-gray-100 relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="block w-full pl-11 pr-4 py-4 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 sm:text-sm font-bold"
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-sm font-bold text-white bg-[#1a2744] hover:bg-[#0f172a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a2744] transition-all transform active:scale-[0.98] disabled:opacity-50 mt-4"
                        >
                            {loading ? <LoadingSpinner size="sm" /> : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}

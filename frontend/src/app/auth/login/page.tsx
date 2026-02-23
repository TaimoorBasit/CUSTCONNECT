'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error: any) {
      if (error.data?.isVerified === false) {
        toast.error('Email not verified. Redirecting…');
        setTimeout(() => router.push(`/auth/verify-email?email=${encodeURIComponent(error.data.email)}`), 1500);
      } else {
        toast.error(error.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row bg-white font-sans selection:bg-indigo-100 transition-opacity duration-1000 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-fade-up { animation: slideIn 0.8s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        
        .hero-gradient {
          background: linear-gradient(135deg, rgba(30, 27, 75, 0.85) 0%, rgba(49, 46, 129, 0.7) 100%);
        }
        .noise-bg {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.05;
        }
      `}</style>

      {/* Left Side: Professional Campus Hero */}
      <div className="relative lg:w-[55%] xl:w-[60%] flex flex-col items-center justify-center p-8 lg:p-20 overflow-hidden min-h-[50vh] lg:min-h-screen">
        {/* Visible Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-out"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756ebafe3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
            transform: isMounted ? 'scale(1)' : 'scale(1.1)'
          }}
        />

        {/* Semi-Transparent Indigo Overlay for Readability & Premium feel */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 noise-bg mix-blend-overlay" />

        {/* Floating Elements */}
        <div className="absolute top-[10%] left-[10%] w-32 h-32 bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 animate-float shadow-2xl hidden lg:block" />
        <div className="absolute bottom-[15%] right-[10%] w-48 h-48 bg-indigo-500/10 backdrop-blur-2xl rounded-full border border-white/5 animate-float delay-1000 shadow-2xl hidden lg:block" />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-xl text-left space-y-8 animate-fade-up">
          <div className="inline-block p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl mb-4">
            <div className="bg-white p-4 rounded-xl shadow-inner">
              <img src="/logo.png" alt="CustConnect" className="h-10 w-auto object-contain" />
            </div>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
            Your all-in-one <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              digital hub
            </span> <br />
            for campus life.
          </h1>

          <p className="text-xl lg:text-2xl text-slate-200/90 leading-relaxed font-medium">
            Connect, thrive, and manage your academic journey with Silicon Valley grade precision.
          </p>


        </div>
      </div>

      {/* Right Side: Clean Login Card */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-slate-50 lg:bg-white relative z-20">
        <div className="w-full max-w-[440px] animate-fade-up delay-200">

          <div className="bg-white rounded-[40px] p-8 lg:p-14 shadow-[0_20px_70px_rgba(0,0,0,0.06)] border border-slate-100 relative group transition-all duration-500 hover:shadow-[0_25px_80px_rgba(0,0,0,0.09)]">

            {/* Header */}
            <div className="mb-12 text-center lg:text-left">
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
                Welcome back
              </h2>
              <p className="text-slate-500 font-medium text-lg">Sign in to your student account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Email / Username */}
              <div className="space-y-2.5">
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 ml-1">
                  Email or Username
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@custconnect.com"
                    className="w-full pl-12 pr-5 py-4.5 bg-slate-50 border border-slate-200 rounded-[22px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 hover:bg-white transition-all duration-200 shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between ml-1">
                  <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                    Password
                  </label>
                  <Link href="/auth/forgot-password" title="Forgot Password" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4.5 bg-slate-50 border border-slate-200 rounded-[22px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 hover:bg-white transition-all duration-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-4.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors outline-none"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full group overflow-hidden rounded-[22px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 transition-all duration-500 group-hover:scale-105 group-hover:brightness-110" />
                  <div className="relative px-8 py-[19px] flex items-center justify-center gap-3 text-white font-bold tracking-wide shadow-[0_10px_30px_rgba(79,70,229,0.3)] group-hover:shadow-[0_15px_40px_rgba(79,70,229,0.4)] transition-all active:scale-[0.98]">
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">Sign In</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-500 font-medium text-lg">
                New to CustConnect?{' '}
                <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-800 font-black transition-colors ml-1">
                  Create account
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Batch / Floating Bottom Footer */}
          <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 hidden lg:flex">
            {/* Simple icons representing security/trust */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-[9px]">AES-256 Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-[9px]">ISO 27001 Hub</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

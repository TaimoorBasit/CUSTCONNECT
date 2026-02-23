'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', year: '', studentId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        ...(formData.year ? { year: parseInt(formData.year, 10) } : {}),
        ...(formData.studentId.trim() ? { studentId: formData.studentId.trim() } : {}),
      });
      toast.success('Check your email for the verification code.');
      setTimeout(() => router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email.trim())}`), 1500);
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 text-sm bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition";
  const labelClass = "block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Side: Premium Video Backdrop */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-16 overflow-hidden bg-slate-950">
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

        <div className="relative z-10 w-full max-w-sm text-white text-left">
          <div className="bg-white p-4 rounded-2xl shadow-xl inline-block mb-10">
            <img src="/logo.png" alt="CustConnect" className="h-14 w-auto object-contain" />
          </div>
          <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight tracking-tight text-white">
            Create your account <br />
            and start connecting.
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed font-medium">
            Join thousands of students and access all the campus resources you need in one place.
          </p>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="lg:hidden mb-6">
              <img src="/logo.png" alt="CustConnect" className="h-10 w-auto" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2">
              Join CustConnect
            </h1>
            <p className="text-slate-500 font-medium">Create your digital campus hub profile</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="block text-sm font-bold text-slate-700 ml-1">First Name</label>
                <input id="firstName" name="firstName" type="text" required value={formData.firstName} onChange={handleChange} placeholder="Ali" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="lastName" className="block text-sm font-bold text-slate-700 ml-1">Last Name</label>
                <input id="lastName" name="lastName" type="text" required value={formData.lastName} onChange={handleChange} placeholder="Khan" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 ml-1">University Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} placeholder="you@university.edu" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600" />
            </div>

            {/* Semester + Student ID */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="year" className="block text-sm font-bold text-slate-700 ml-1">Semester</label>
                <select id="year" name="year" value={formData.year} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 cursor-pointer">
                  <option value="">Select</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="studentId" className="block text-sm font-bold text-slate-700 ml-1">Student ID</label>
                <input id="studentId" name="studentId" type="text" value={formData.studentId} onChange={handleChange} placeholder="F22-001" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3.5 flex items-center text-slate-400 hover:text-slate-600 transition">
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
              <div className="relative">
                <input id="confirmPassword" name="confirmPassword" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 px-3.5 flex items-center text-slate-400 hover:text-slate-600 transition">
                  {showConfirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-[0.98] mt-6">
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Register'}
            </button>
          </form>

          <div className="mt-8 text-center text-slate-500 font-medium">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 font-black hover:text-blue-700 transition ml-1">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-10">
      {/* Wordmark */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Cust<span className="text-indigo-700">Connect</span>
        </h1>
        <p className="mt-1 text-sm text-neutral-500">Create your campus account</p>
      </div>

      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className={labelClass}>First Name</label>
              <input id="firstName" name="firstName" type="text" required value={formData.firstName} onChange={handleChange} placeholder="Ali" className={inputClass} />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>Last Name</label>
              <input id="lastName" name="lastName" type="text" required value={formData.lastName} onChange={handleChange} placeholder="Khan" className={inputClass} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} placeholder="you@university.edu" className={inputClass} />
            <p className="mt-1 text-xs text-neutral-400">Use an email where you can receive the verification code</p>
          </div>

          {/* Semester + Student ID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="year" className={labelClass}>Semester</label>
              <select id="year" name="year" value={formData.year} onChange={handleChange} className={inputClass + " cursor-pointer"}>
                <option value="">Select</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="studentId" className={labelClass}>Student ID</label>
              <input id="studentId" name="studentId" type="text" value={formData.studentId} onChange={handleChange} placeholder="F22-001" className={inputClass} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className={inputClass + " pr-11"} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3.5 flex items-center text-neutral-400 hover:text-neutral-600 transition">
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
            <div className="relative">
              <input id="confirmPassword" name="confirmPassword" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className={inputClass + " pr-11"} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 px-3.5 flex items-center text-neutral-400 hover:text-neutral-600 transition">
                {showConfirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition active:scale-[0.98]">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account…
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-indigo-700 font-semibold hover:text-indigo-900 transition">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
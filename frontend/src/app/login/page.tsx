'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, role, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  // If already authenticated, redirect to role-specific dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated && role) {
      router.push(`/dashboard/${role}`);
    }
  }, [authLoading, isAuthenticated, role, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client-side validation
    if (!email.trim() || !password) {
      setFormError('Please fill in both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    const result = await login({
      email: email.trim(),
      password,
    });

    if (result.success && result.user) {
      // Redirect to role dashboard
      router.push(`/dashboard/${result.user.role}`);
    } else {
      setFormError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-brand-500/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Card Container */}
          <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
            {/* Header / Brand */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-brand-500/25">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Portal Sign In
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Single sign-on for students, faculty &amp; administration
              </p>
            </div>

            {/* Quick 1-Click Demo Login Selector */}
            <div className="mt-6 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1">
                <span>⚡ 1-Click Quick Demo Login:</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('student@apex.edu');
                    setPassword('Student@123456');
                    setFormError(null);
                  }}
                  className="py-2 px-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-brand-50 dark:hover:bg-brand-950/60 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-600 shadow-2xs transition-all active:scale-95 text-center"
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('teacher@apex.edu');
                    setPassword('Teacher@123456');
                    setFormError(null);
                  }}
                  className="py-2 px-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-brand-50 dark:hover:bg-brand-950/60 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-600 shadow-2xs transition-all active:scale-95 text-center"
                >
                  👨‍🏫 Teacher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@apex.edu');
                    setPassword('Admin@123456');
                    setFormError(null);
                  }}
                  className="py-2 px-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-brand-50 dark:hover:bg-brand-950/60 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-600 shadow-2xs transition-all active:scale-95 text-center"
                >
                  ⚡ Admin
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {formError && (
              <div className="mt-5 flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/80 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                <div className="leading-snug">{formError}</div>
              </div>
            )}

            {/* Forgot Password Notice Modal / Banner */}
            {forgotPasswordNotice && (
              <div className="mt-5 flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/80 text-amber-800 dark:text-amber-300 text-xs">
                <HelpCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-bold">Password Reset Assistance</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                    For password recovery, please contact IT Helpdesk at <span className="font-semibold text-slate-900 dark:text-white">support@apex.edu.pk</span> or reach out to the Registrar Office.
                  </p>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordNotice(false)}
                    className="mt-2 font-bold text-brand-600 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@apex.edu"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors font-medium"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordNotice(true)}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me UI */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center cursor-pointer">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <span className="ml-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                    Stay logged in
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25 transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer / Register Link */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                New candidate applying for admission?{' '}
                <Link
                  href="/register"
                  className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Create Student Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

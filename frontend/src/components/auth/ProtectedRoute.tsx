'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Verifying security session...
        </p>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated || !user) {
    return null;
  }

  // Role validation check
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center border border-rose-200 dark:border-rose-900">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Access Restricted
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Your current account role is{' '}
            <span className="font-bold text-slate-900 dark:text-white uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
              {role}
            </span>
            . You do not possess the required credentials to access this section (Authorized: [
            {allowedRoles.join(', ')}]).
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/dashboard/${role}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to My Dashboard</span>
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

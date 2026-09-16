'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push('/login');
      } else {
        router.push(`/dashboard/${user.role}`);
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 space-y-4">
      <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Redirecting to your role dashboard...
      </p>
    </div>
  );
}

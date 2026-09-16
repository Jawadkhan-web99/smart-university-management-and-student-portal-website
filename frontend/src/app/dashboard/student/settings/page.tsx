'use client';

import React from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { Settings, Shield, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../../../components/providers/ThemeProvider';
import { useAuth } from '../../../../context/AuthContext';

export default function StudentSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardShell role="student" title="Account & Portal Settings">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-600" />
              <span>Portal Preferences</span>
            </h2>

            {/* Theme Preference */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Interface Color Scheme
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize appearance between light and dark modes
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-colors ${
                    theme === 'light'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-colors ${
                    theme === 'dark'
                      ? 'border-brand-500 bg-brand-950 text-brand-300'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            {/* Security Overview */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Security & Credentials</span>
              </h3>
              <p className="text-xs text-slate-500">
                Logged in as <strong>{user?.email}</strong>. Session secured by JWT bearer encryption.
              </p>
            </div>
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

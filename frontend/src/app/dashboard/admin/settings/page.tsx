'use client';

import React from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { Settings, Shield, Database, Bell, Lock } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardShell role="admin" title="Admin Settings">
        <div className="max-w-4xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-7 h-7 text-rose-600 dark:text-rose-400" />
              System & Console Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure university system parameters, administrative privileges, and security options
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Admin Credentials</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Authenticated administrator profile</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Name</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Email</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{user?.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Role</span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 uppercase">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Environment & Services</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Database and system runtime health</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Backend API</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Database Engine</span>
                  <span className="font-medium text-gray-900 dark:text-white">MongoDB / Mongoose</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Portal Version</span>
                  <span className="font-medium text-gray-900 dark:text-white">v3.0.0 (Core System)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

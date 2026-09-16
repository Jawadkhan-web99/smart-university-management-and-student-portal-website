'use client';

import React from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { Bell, Clock } from 'lucide-react';

export default function TeacherNotificationsPlaceholder() {
  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardShell role="teacher" title="Faculty Notifications">
        <div className="max-w-xl mx-auto my-12 p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
            <Bell className="w-8 h-8" />
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" /> Upcoming Module
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Institutional Notifications & Alerts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Administrative circulars, departmental meeting requests, and FYP milestone notifications
            will appear here in future updates.
          </p>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

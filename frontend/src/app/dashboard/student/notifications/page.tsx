'use client';

import React from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { Bell, Clock } from 'lucide-react';

export default function StudentNotificationsPlaceholder() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardShell role="student" title="Student Notifications">
        <div className="max-w-xl mx-auto my-12 p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
            <Bell className="w-8 h-8" />
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" /> Coming Soon
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Campus Alerts & Systemic Broadcasts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Real-time notifications regarding timetable revisions, exam schedules, and department
            circulars will be integrated into this inbox module.
          </p>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

'use client';

import React from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { CalendarCheck, Clock } from 'lucide-react';

export default function AdminAttendancePage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardShell role="admin" title="University-wide Attendance">
        <div className="max-w-xl mx-auto my-12 p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 dark:bg-sky-950/60 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" /> Upcoming Module
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Institutional Attendance Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Administrative attendance audits, campus-wide threshold warning triggers,
            and instructor attendance compliance reports will be enabled in Phase 4.
          </p>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

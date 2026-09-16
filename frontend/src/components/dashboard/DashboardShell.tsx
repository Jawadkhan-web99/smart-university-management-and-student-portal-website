'use client';

import React, { useState } from 'react';
import { StudentSidebar } from './StudentSidebar';
import { AdminSidebar } from './AdminSidebar';
import { TeacherSidebar } from './TeacherSidebar';
import { DashboardHeader } from './DashboardHeader';
import { UserRole } from '../../types/auth';

interface DashboardShellProps {
  role: UserRole;
  title?: string;
  children: React.ReactNode;
}

export function DashboardShell({ role, title = '', children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar */}
      {role === 'admin' ? (
        <AdminSidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
      ) : role === 'teacher' ? (
        <TeacherSidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
      ) : (
        <StudentSidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          title={title}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

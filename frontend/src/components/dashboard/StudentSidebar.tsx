'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  LayoutDashboard,
  User,
  BookOpen,
  Calendar,
  CalendarCheck,
  Award,
  FileText,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StudentSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const studentNavItems = [
  { name: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
  { name: 'My Profile', href: '/dashboard/student/profile', icon: User },
  { name: 'My Courses', href: '/dashboard/student/courses', icon: BookOpen },
  { name: 'Semester', href: '/dashboard/student/semester', icon: Calendar },
  { name: 'Attendance', href: '/dashboard/student/attendance', icon: CalendarCheck },
  { name: 'Results', href: '/dashboard/student/results', icon: Award },
  { name: 'Assignments', href: '/dashboard/student/assignments', icon: FileText },
  { name: 'Fees', href: '/dashboard/student/fees', icon: CreditCard },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function StudentSidebar({ mobileOpen = false, onCloseMobile }: StudentSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      {/* Brand Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800">
          <Link href="/dashboard/student" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                Apex<span className="text-brand-600 dark:text-brand-400">Portal</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Student Desk
              </span>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav Links */}
        <div className="px-3 py-4 space-y-1">
          {studentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : ''}`} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800">
        {navContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl transition-transform animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}

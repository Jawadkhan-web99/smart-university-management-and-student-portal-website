'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  UserCheck,
  Building,
  BookOpen,
  Calendar,
  CalendarCheck,
  Award,
  FileText,
  CreditCard,
  Megaphone,
  BarChart3,
  Activity,
  Mail,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const adminNavItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { name: 'Departments', href: '/dashboard/admin/departments', icon: Building },
  { name: 'Courses', href: '/dashboard/admin/courses', icon: BookOpen },
  { name: 'Semesters', href: '/dashboard/admin/semesters', icon: Calendar },
  { name: 'Students', href: '/dashboard/admin/students', icon: Users },
  { name: 'Teachers', href: '/dashboard/admin/teachers', icon: UserCheck },
  { name: 'Attendance', href: '/dashboard/admin/attendance', icon: CalendarCheck },
  { name: 'Results', href: '/dashboard/admin/results', icon: Award },
  { name: 'Assignments', href: '/dashboard/admin/assignments', icon: FileText },
  { name: 'Fees', href: '/dashboard/admin/fees', icon: CreditCard },
  { name: 'Announcements', href: '/dashboard/admin/announcements', icon: Megaphone },
  { name: 'Reports', href: '/dashboard/admin/reports', icon: BarChart3 },
  { name: 'Activity Logs', href: '/dashboard/admin/activity', icon: Activity },
  { name: 'Inquiries', href: '/dashboard/admin/messages', icon: Mail },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      {/* Brand Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800">
          <Link href="/dashboard/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-rose-600 text-white flex items-center justify-center shadow-md">
              <ShieldAlert className="w-5 h-5 text-rose-400 dark:text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                Apex<span className="text-rose-600 dark:text-rose-400">Admin</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Central Console
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
        <div className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600 dark:text-rose-400' : ''}`} />
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

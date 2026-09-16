'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  LayoutDashboard,
  UserCheck,
  BookOpen,
  Users,
  CalendarCheck,
  FileText,
  Award,
  Megaphone,
  Bell,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TeacherSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const teacherNavItems = [
  { name: 'Dashboard', href: '/dashboard/teacher', icon: LayoutDashboard },
  { name: 'My Profile', href: '/dashboard/teacher/profile', icon: UserCheck },
  { name: 'My Courses', href: '/dashboard/teacher/courses', icon: BookOpen },
  { name: 'Students', href: '/dashboard/teacher/students', icon: Users },
  { name: 'Attendance', href: '/dashboard/teacher/attendance', icon: CalendarCheck },
  { name: 'Assignments', href: '/dashboard/teacher/assignments', icon: FileText },
  { name: 'Results', href: '/dashboard/teacher/results', icon: Award },
  { name: 'Announcements', href: '/dashboard/teacher/announcements', icon: Megaphone },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function TeacherSidebar({ mobileOpen = false, onCloseMobile }: TeacherSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      {/* Brand Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800">
          <Link href="/dashboard/teacher" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                Apex<span className="text-indigo-600 dark:text-indigo-400">Faculty</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Teacher Portal
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
          {teacherNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard/teacher'
                ? pathname === '/dashboard/teacher'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : ''
                    }`}
                  />
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

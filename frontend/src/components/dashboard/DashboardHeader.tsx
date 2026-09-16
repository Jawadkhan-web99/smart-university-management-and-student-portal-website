'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, LogOut, GraduationCap, Home } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { GlobalSearchModal } from './GlobalSearchModal';

interface DashboardHeaderProps {
  onToggleMobileMenu: () => void;
  title?: string;
}

export function DashboardHeader({ onToggleMobileMenu, title = 'Portal' }: DashboardHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-4 sm:px-6 backdrop-blur-md">
      {/* Left Title & Mobile Menu Trigger */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            title="Return to Public Website"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Website</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
            {title}
          </h2>
        </div>
      </div>

      {/* Right User Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        <GlobalSearchModal />
        <NotificationBell />
        <ThemeToggle />

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user.firstName[0]}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                {user.fullName}
              </span>
              <span className="text-[10px] font-semibold uppercase text-brand-600 dark:text-brand-400">
                {user.role}
              </span>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

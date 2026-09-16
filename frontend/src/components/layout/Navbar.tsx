'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  User,
  ChevronRight,
} from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/#about' },
  { name: 'Programs', href: '/#programs' },
  { name: 'Departments', href: '/#departments' },
  { name: 'Faculty', href: '/#faculty' },
  { name: 'Admissions', href: '/#admissions' },
  { name: 'Events', href: '/#events' },
  { name: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-sm border-b border-slate-200/80 dark:border-slate-800/80 py-3'
          : 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-200/40 dark:border-slate-800/40 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & University Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Apex<span className="text-brand-600 dark:text-brand-400">Uni</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Science & Tech
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />

            {/* When Logged In: Show User Name, Dashboard & Logout */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs">
                  <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[11px]">
                    {user.firstName[0]}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                      {user.firstName}
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-brand-600 dark:text-brand-400">
                      {user.role}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/dashboard/${user.role}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.98] shadow-sm transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  title="Log out"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* When Logged Out: Show Login and Register */
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Login</span>
                </Link>

                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.98] shadow-sm transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-800/80 transition-colors"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                  <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.firstName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {user.fullName}
                    </p>
                    <p className="text-xs uppercase font-semibold text-brand-600 dark:text-brand-400">
                      {user.role} &bull; {user.email}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/dashboard/${user.role}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to My Dashboard</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-brand-600" />
                  <span>Login</span>
                </Link>

                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

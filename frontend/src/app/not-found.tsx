'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Home, ArrowLeft, GraduationCap, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-20">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto shadow-inner border border-brand-100 dark:border-brand-900">
            <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '15s' }} />
          </div>

          <div className="space-y-2">
            <span className="text-5xl sm:text-6xl font-black tracking-tight text-brand-600 dark:text-brand-400">
              404
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Academic Resource Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              The page, syllabus, or portal route you are attempting to access does not exist or may have been relocated in the latest academic catalog update.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 shadow-xs transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student / Staff Portal</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

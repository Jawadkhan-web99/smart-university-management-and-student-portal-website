'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Users,
  BookOpen,
  Award,
  Laptop,
  CheckCircle2,
  GraduationCap,
  FileText,
  Clock,
  TrendingUp,
  Activity,
} from 'lucide-react';

export function HeroSection() {
  const [activePreview, setActivePreview] = useState<'student' | 'teacher' | 'admin'>('student');

  return (
    <section
      id="home"
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-[#070e24] bg-gradient-to-br from-[#060c1d] via-[#0c183a] to-[#040816] text-white"
    >
      {/* Background Decorative Pattern & Radiant Mesh Orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-brand-500/30 to-blue-600/25 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-sky-400/20 to-indigo-600/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Headline & Action Buttons (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Admissions Banner Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-500/15 text-brand-300 border border-brand-400/30 shadow-xs backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Fall Admissions 2026 Now Open</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>

            {/* University Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              Empowering Minds,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-300">
                Engineering
              </span>{' '}
              the Future.
            </h1>

            {/* Short Description */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Apex University of Science & Technology combines accredited undergraduate computing
              curriculums with a unified campus management ecosystem for students, faculty, and administration.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#programs"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 active:scale-[0.98] shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all duration-200"
              >
                <span>Explore Programs</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white bg-white/10 hover:bg-white/15 border border-white/20 active:scale-[0.98] transition-all duration-200 shadow-sm backdrop-blur-sm"
              >
                <Laptop className="w-4 h-4 text-sky-400" />
                <span>Portal Login</span>
              </Link>
            </div>

            {/* Key Highlights */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-y-2.5 gap-x-6 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                HEC & NCEAC Accredited
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                100% Merit Scholarships
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Silicon Valley Industry Tie-ups
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Live Portal Showcase (5 cols) */}
          <div className="lg:col-span-5 relative">
            {/* Top Floating Badge */}
            <div className="hidden sm:flex absolute -top-6 -left-6 z-20 items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md animate-float">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">98.4% Employability</p>
                <p className="text-[10px] text-slate-400">Leading Tech Companies</p>
              </div>
            </div>

            {/* Bottom Floating Badge */}
            <div className="hidden sm:flex absolute -bottom-6 -right-6 z-20 items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md animate-float-delayed">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Fall 2026 Batch</p>
                <p className="text-[10px] text-emerald-400 font-semibold">Admissions Active</p>
              </div>
            </div>

            {/* Interactive Preview Container */}
            <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
              {/* Portal Switcher Tabs */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      Live Portal Simulation
                    </h4>
                    <p className="text-[10px] text-slate-400">Click role to preview</p>
                  </div>
                </div>

                {/* Role Switcher Pills */}
                <div className="flex items-center bg-slate-950/80 border border-slate-800 p-1 rounded-xl text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setActivePreview('student')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activePreview === 'student'
                        ? 'bg-brand-600 text-white shadow-xs font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreview('teacher')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activePreview === 'teacher'
                        ? 'bg-brand-600 text-white shadow-xs font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Teacher
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreview('admin')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activePreview === 'admin'
                        ? 'bg-brand-600 text-white shadow-xs font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Dynamic View: Student */}
              {activePreview === 'student' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-semibold">Current CGPA</span>
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="text-xl font-black text-white">3.88</div>
                      <span className="text-[10px] text-emerald-400 font-semibold">Top 5% of Dean&apos;s List</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-semibold">Attendance</span>
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-xl font-black text-white">94.2%</div>
                      <span className="text-[10px] text-sky-400 font-semibold">Safe Standing</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Enrolled Courses Today</span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">CS</div>
                        <div>
                          <p className="text-xs font-bold text-white">Distributed Cloud Systems</p>
                          <p className="text-[10px] text-slate-400">Dr. Tariq Mahmood &bull; Lab 4</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">Present</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">AI</div>
                        <div>
                          <p className="text-xs font-bold text-white">Deep Transformer Networks</p>
                          <p className="text-[10px] text-slate-400">Auditorium 2 &bull; Due Today</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-md">Due Soon</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic View: Teacher */}
              {activePreview === 'teacher' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-semibold">Active Classes</span>
                        <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                      </div>
                      <div className="text-xl font-black text-white">4 Sections</div>
                      <span className="text-[10px] text-sky-400 font-semibold">184 Total Students</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-semibold">Submissions</span>
                        <FileText className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div className="text-xl font-black text-white">42 Pending</div>
                      <span className="text-[10px] text-amber-400 font-semibold">Needs Review</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quick Faculty Actions</span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">ATT</div>
                        <div>
                          <p className="text-xs font-bold text-white">Mark CS-401 Attendance</p>
                          <p className="text-[10px] text-slate-400">Section A &bull; Room 302</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-sky-400">Launch &rarr;</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">RES</div>
                        <div>
                          <p className="text-xs font-bold text-white">Upload Midterm Exam Grades</p>
                          <p className="text-[10px] text-slate-400">Automated GPA calculation</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-sky-400">Enter &rarr;</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic View: Admin */}
              {activePreview === 'admin' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-semibold">Campus Students</span>
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                      </div>
                      <div className="text-xl font-black text-white">12,450+</div>
                      <span className="text-[10px] text-emerald-400 font-semibold">+14% Year-over-Year</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-semibold">Fee Recovery</span>
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-xl font-black text-white">96.8%</div>
                      <span className="text-[10px] text-slate-400">Automated Challans</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">University Control Stats</span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold">DEP</div>
                        <div>
                          <p className="text-xs font-bold text-white">4 Academic Departments</p>
                          <p className="text-[10px] text-slate-400">CS, SE, IT, Management Sciences</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400">All Active</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-bold">SEC</div>
                        <div>
                          <p className="text-xs font-bold text-white">Audit & System Logs</p>
                          <p className="text-[10px] text-slate-400">Real-time security monitoring</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-sky-400">Secure</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Verified Bar */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  Apex Enterprise Cloud
                </span>
                <Link
                  href="/login"
                  className="font-bold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1"
                >
                  Access Now &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


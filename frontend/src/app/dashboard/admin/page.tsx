'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../utils/api';
import { ComprehensiveAdminStatsData } from '../../../types/university';
import {
  Users,
  UserCheck,
  Building,
  BookOpen,
  Calendar,
  ShieldAlert,
  ArrowRight,
  Loader2,
  Award,
  FileText,
  CreditCard,
  Megaphone,
  BarChart3,
  Activity,
  History,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<ComprehensiveAdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const res = await apiFetch<ComprehensiveAdminStatsData>('/admin/analytics');
      if (res.success && res.data) {
        setStats(res.data);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardShell role="admin" title="Administrator Control Console">
        {loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
            <p className="text-xs text-slate-500">Aggregating comprehensive institutional metrics...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. Header Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-black text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Apex Central Academic Governance</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  University Master Console
                </h1>
                <p className="text-sm text-slate-300 max-w-2xl">
                  Real-time analytics for students, faculty, academic assessments, fee collections, and institutional audit trails.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/dashboard/admin/students"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Students</span>
                </Link>
                <Link
                  href="/dashboard/admin/teachers"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Faculty</span>
                </Link>
                <Link
                  href="/dashboard/admin/reports"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Reports</span>
                </Link>
              </div>
            </div>

            {/* 2. Overview Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Students */}
              <Link
                href="/dashboard/admin/students"
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider group-hover:text-brand-600 transition-colors">
                    Students
                  </span>
                  <Users className="w-5 h-5 text-brand-600" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {stats?.totalStudents ?? 0}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Active: {stats?.activeStudents ?? 0}</span>
                  <span className="text-brand-600 dark:text-brand-400 font-semibold inline-flex items-center gap-0.5">
                    Manage <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>

              {/* Total Teachers */}
              <Link
                href="/dashboard/admin/teachers"
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-indigo-500/40 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                    Faculty Members
                  </span>
                  <UserCheck className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {stats?.totalTeachers ?? 0}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Active: {stats?.activeTeachers ?? 0}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold inline-flex items-center gap-0.5">
                    Manage <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>

              {/* Total Departments */}
              <Link
                href="/dashboard/admin/departments"
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-amber-500/40 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider group-hover:text-amber-600 transition-colors">
                    Departments
                  </span>
                  <Building className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {stats?.totalDepartments ?? 0}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Curriculum branches</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-0.5">
                    Manage <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>

              {/* Total Courses */}
              <Link
                href="/dashboard/admin/courses"
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
                    Courses
                  </span>
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {stats?.totalCourses ?? 0}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Degree courses</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-0.5">
                    Manage <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            </div>

            {/* 3. Secondary Analytics KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Coursework Assignments */}
              <Link
                href="/dashboard/admin/assignments"
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-1"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Assignments</span>
                  <FileText className="w-4 h-4 text-cyan-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats?.totalAssignments ?? 0}
                </div>
                <p className="text-xs text-slate-500">
                  {stats?.totalSubmissions ?? 0} submissions recorded
                </p>
              </Link>

              {/* Results Recorded */}
              <Link
                href="/dashboard/admin/results"
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-1"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Academic Results</span>
                  <Award className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats?.totalResults ?? 0}
                </div>
                <p className="text-xs text-slate-500">
                  {stats?.publishedResults ?? 0} official published
                </p>
              </Link>

              {/* Fee Revenue */}
              <Link
                href="/dashboard/admin/fees"
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-1"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Fee Collections</span>
                  <CreditCard className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  ${(stats?.fees?.totalPaid ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-slate-500">
                  Outstanding: ${(stats?.fees?.totalOutstanding ?? 0).toLocaleString()}
                </p>
              </Link>

              {/* Terms & Semesters */}
              <Link
                href="/dashboard/admin/semesters"
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-1"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Semesters</span>
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats?.totalSemesters ?? 0}
                </div>
                <p className="text-xs text-slate-500">Configured academic terms</p>
              </Link>
            </div>

            {/* 4. Analytics Breakdown Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grade Distribution */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Official Grade Distribution
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">Published Results</span>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {stats?.gradeDistribution &&
                    Object.entries(stats.gradeDistribution).map(([grade, count]) => (
                      <div
                        key={grade}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center space-y-1"
                      >
                        <span className="text-xs font-black text-slate-500">{grade}</span>
                        <p className="text-lg font-black text-slate-900 dark:text-white">
                          {count}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Department Enrollment */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Department Enrollment
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">Active Students</span>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {stats?.departmentDistribution && stats.departmentDistribution.length > 0 ? (
                    stats.departmentDistribution.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60"
                      >
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                          {d.departmentName}
                        </span>
                        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                          {d.count} Students
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-500">
                      No student department records yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Recent System Activity & Quick Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Audit Activities */}
              <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Live Audit Activities
                    </h3>
                  </div>
                  <Link
                    href="/dashboard/admin/activity"
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    View All Logs
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                    stats.recentLogs.map((log) => (
                      <div key={log._id} className="py-3 flex items-start justify-between gap-4 text-xs">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                              {log.action}
                            </span>
                            {log.user && (
                              <span className="text-slate-500 font-medium">
                                by {log.user.firstName} {log.user.lastName} ({log.user.role})
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 truncate">
                            {log.description}
                          </p>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {new Date(log.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No recent activities recorded.
                    </div>
                  )}
                </div>
              </div>

              {/* Governance Quick Hub */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Quick Navigation
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/dashboard/admin/announcements"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <Megaphone className="w-4 h-4 text-amber-500" />
                      <span>Campus Announcements</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    href="/dashboard/admin/reports"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <BarChart3 className="w-4 h-4 text-emerald-500" />
                      <span>Institutional Reports</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    href="/dashboard/admin/messages"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-brand-500" />
                      <span>Contact Inquiries</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    href="/dashboard/admin/activity"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <Activity className="w-4 h-4 text-rose-500" />
                      <span>Audit Activity Trail</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}

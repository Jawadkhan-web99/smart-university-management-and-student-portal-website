'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../components/dashboard/DashboardShell';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../utils/api';
import { TeacherStatsData } from '../../../types/university';
import {
  BookOpen,
  Users,
  CalendarCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  Loader2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TeacherStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const res = await apiFetch<TeacherStatsData>('/teachers/stats');
      if (res.success && res.data) {
        setStats(res.data);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardShell role="teacher" title="Faculty Console">
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 backdrop-blur-sm border border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Faculty Portal
                  </span>
                  <span className="text-xs text-indigo-300">Instructor Console</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {user?.fullName || 'Professor'}!
                </h1>
                <p className="text-sm text-indigo-100 leading-relaxed">
                  Manage your academic courses, record student attendance sessions, create and publish
                  assignments, and monitor enrolled student rosters.
                </p>
              </div>

              {/* Quick Actions in Header */}
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href="/dashboard/teacher/attendance"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Mark Attendance
                </Link>
                <Link
                  href="/dashboard/teacher/assignments/create"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/15 transition-all backdrop-blur-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Assignment
                </Link>
              </div>
            </div>
          </div>

          {/* KPI Metrics */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse p-4"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Assigned Courses */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Courses</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {stats?.assignedCourses ?? 0}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Assigned offerings</p>
                </div>
              </div>

              {/* Total Students */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Students</span>
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {stats?.totalStudents ?? 0}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enrolled across classes</p>
                </div>
              </div>

              {/* Today's Classes */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Classes</span>
                  <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {stats?.todayClasses ?? 0}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Scheduled sessions</p>
                </div>
              </div>

              {/* Pending Assignments */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Assignments</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {stats?.pendingAssignments ?? 0}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Active & upcoming</p>
                </div>
              </div>

              {/* Attendance Overview */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Attendance</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {stats?.attendanceOverview?.attendanceRate ?? 0}%
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {stats?.attendanceOverview?.totalRecords ?? 0} records logged
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/teacher/attendance"
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Mark Attendance
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Class roster session</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/dashboard/teacher/assignments/create"
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    Create Assignment
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Task & deadlines</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/dashboard/teacher/students"
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    View Students
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Class directories</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/dashboard/teacher/courses"
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    View Courses
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Curriculum catalog</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>

          {/* Recent Activity: Three Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Attendance Updates */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Attendance Updates
                  </h2>
                </div>
                <Link
                  href="/dashboard/teacher/attendance/history"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  History
                </Link>
              </div>

              {loading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : !stats?.recentActivity?.attendance || stats.recentActivity.attendance.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  No recent attendance updates logged yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.recentActivity.attendance.map((item) => (
                    <div key={item._id} className="py-3 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {item.student?.firstName} {item.student?.lastName}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">
                          {item.course?.courseCode} – {item.course?.title}
                        </p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-semibold capitalize ${
                            item.status === 'present'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : item.status === 'absent'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          {item.status}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {item.date ? new Date(item.date).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Assignments */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Assignments
                  </h2>
                </div>
                <Link
                  href="/dashboard/teacher/assignments"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : !stats?.recentActivity?.assignments || stats.recentActivity.assignments.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  No assignments created yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.recentActivity.assignments.map((item) => (
                    <div key={item._id} className="py-3 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">
                          {item.course?.courseCode}
                        </p>
                      </div>
                      <div className="text-right space-y-0.5 flex-shrink-0 ml-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-semibold capitalize ${
                            item.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : item.status === 'closed'
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          {item.status}
                        </span>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          Due {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Submissions Activity */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Submissions
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Upcoming
                </span>
              </div>

              <div className="py-10 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Submissions module scheduled
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Student document submissions and rubric grading evaluations will appear here once student turn-in is activated in the next phase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '../../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../../utils/api';
import { CourseItem, AttendanceSessionSummary } from '../../../../../types/university';
import {
  History,
  Calendar,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Inbox,
  Loader2,
  CalendarCheck,
  Percent,
} from 'lucide-react';

interface HistoryResponse {
  sessions: AttendanceSessionSummary[];
  total: number;
  page: number;
  totalPages: number;
}

export default function TeacherAttendanceHistoryPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [sessions, setSessions] = useState<AttendanceSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCourse, setSelectedCourse] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);

  // Load teacher courses
  useEffect(() => {
    async function loadCourses() {
      const res = await apiFetch<CourseItem[]>('/teachers/courses');
      if (res.success && res.data) {
        setCourses(res.data);
      }
    }
    loadCourses();
  }, []);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: String(page),
      limit: '10',
    });
    if (selectedCourse) query.set('courseId', selectedCourse);
    if (startDate) query.set('startDate', startDate);
    if (endDate) query.set('endDate', endDate);

    const res = await apiFetch<HistoryResponse>(`/attendance/history?${query.toString()}`);
    if (res.success && res.data) {
      setSessions(res.data.sessions);
      setTotalPages(res.data.totalPages);
      setTotalSessions(res.data.total);
    }
    setLoading(false);
  }, [page, selectedCourse, startDate, endDate]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardShell role="teacher" title="Attendance History">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                Lecture Attendance Session Logs
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Audit past lecture attendance records, view participation percentages, and update rosters
              </p>
            </div>
            <Link
              href="/dashboard/teacher/attendance"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <CalendarCheck className="w-4 h-4" />
              Take Attendance
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1">
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
              >
                <option value="">All My Courses</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.courseCode} – {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* History Sessions Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                <p className="text-sm">Loading attendance logs...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-7 h-7" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                  No attendance records found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {selectedCourse || startDate || endDate
                    ? 'No attendance sessions match the selected filters.'
                    : 'Start by taking your first lecture attendance session.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/40 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-6">Course</th>
                      <th className="py-4 px-4">Lecture Date</th>
                      <th className="py-4 px-4">Enrolled</th>
                      <th className="py-4 px-4 text-emerald-600">Present</th>
                      <th className="py-4 px-4 text-rose-600">Absent</th>
                      <th className="py-4 px-4 text-amber-600">Late</th>
                      <th className="py-4 px-4">Turnout %</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {sessions.map((sess, idx) => (
                      <tr
                        key={`${sess.courseId}-${sess.date}-${idx}`}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {sess.courseCode}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {sess.courseTitle}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {sess.date ? new Date(sess.date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                          {sess.totalStudents}
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {sess.presentCount}
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-rose-600 dark:text-rose-400">
                          {sess.absentCount}
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-amber-600 dark:text-amber-400">
                          {sess.lateCount}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              sess.percentage >= 75
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : sess.percentage >= 50
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}
                          >
                            {sess.percentage}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/dashboard/teacher/attendance?courseId=${sess.courseId}&date=${sess.date}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Open / Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalSessions > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Showing {sessions.length} of {totalSessions} recorded sessions
                </span>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

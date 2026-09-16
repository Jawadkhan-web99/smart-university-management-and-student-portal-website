'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { AttendanceSummaryData } from '../../../../types/university';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Inbox,
  Loader2,
  TrendingUp,
  Filter,
  BookOpen,
} from 'lucide-react';

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  useEffect(() => {
    async function loadAttendance() {
      setLoading(true);
      const res = await apiFetch<AttendanceSummaryData>('/attendance/me');
      if (res.success && res.data) {
        setAttendance(res.data);
      }
      setLoading(false);
    }
    loadAttendance();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Filtered course breakdown based on selected course
  const filteredBreakdown = useMemo(() => {
    if (!attendance) return [];
    if (selectedCourse === 'all') return attendance.courseBreakdown;
    return attendance.courseBreakdown.filter((c) => c.courseId === selectedCourse);
  }, [attendance, selectedCourse]);

  // Filtered records based on selected course
  const filteredRecords = useMemo(() => {
    if (!attendance) return [];
    if (selectedCourse === 'all') return attendance.records;
    return attendance.records.filter(
      (r) => r.course && (r.course._id === selectedCourse || r.course.courseCode === selectedCourse)
    );
  }, [attendance, selectedCourse]);

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardShell role="student" title="Attendance Records">
        {loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            <p className="text-xs text-slate-500">Retrieving attendance logs...</p>
          </div>
        ) : !attendance || attendance.totalSessions === 0 ? (
          /* Empty State */
          <div className="max-w-2xl mx-auto p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Inbox className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              No attendance records available.
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your instructors have not recorded attendance sessions for the ongoing semester yet.
              Once class sessions are conducted, daily and cumulative records will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-8 max-w-6xl mx-auto">
            {/* 1. Header & Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Overall Percentage */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-900 to-navy-900 text-white shadow-lg space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-200 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Overall Attendance
                </span>
                <div className="text-4xl font-extrabold tracking-tight">
                  {attendance.overallPercentage}%
                </div>
                <p className="text-xs text-brand-100">
                  {attendance.overallPercentage >= 75
                    ? 'Eligible for Final Examinations (>= 75%)'
                    : 'Attendance shortage alert (< 75%)'}
                </p>
              </div>

              {/* Present Count */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Present</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {attendance.presentCount}
                </div>
                <p className="text-xs text-slate-400">Class lectures attended</p>
              </div>

              {/* Absent Count */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Absent</span>
                  <XCircle className="w-5 h-5 text-rose-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {attendance.absentCount}
                </div>
                <p className="text-xs text-slate-400">Unexcused missed classes</p>
              </div>

              {/* Late Count */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Late Arrivals</span>
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {attendance.lateCount}
                </div>
                <p className="text-xs text-slate-400">Admitted past grace period</p>
              </div>
            </div>

            {/* Course Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Filter by Enrolled Course:
                </span>
              </div>

              <div className="w-full sm:w-72">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200 font-medium"
                >
                  <option value="all">All Enrolled Courses ({attendance.courseBreakdown.length})</option>
                  {attendance.courseBreakdown.map((c) => (
                    <option key={c.courseId} value={c.courseId}>
                      {c.courseCode} – {c.courseTitle}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Course-wise Breakdown Table with Progress Indicator */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-brand-600" />
                  <span>Course-wise Attendance Breakdown</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {filteredBreakdown.length} course{filteredBreakdown.length !== 1 ? 's' : ''} listed
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3 font-semibold">Course</th>
                      <th className="py-3 font-semibold text-center">Total Classes</th>
                      <th className="py-3 font-semibold text-center text-emerald-600">Present</th>
                      <th className="py-3 font-semibold text-center text-rose-600">Absent</th>
                      <th className="py-3 font-semibold text-center text-amber-600">Late</th>
                      <th className="py-3 font-semibold text-right">Attendance Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredBreakdown.map((item) => (
                      <tr key={item.courseId}>
                        <td className="py-4 pr-4">
                          <span className="font-extrabold text-brand-600 dark:text-brand-400 font-mono">
                            {item.courseCode}
                          </span>
                          <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                            {item.courseTitle}
                          </span>
                        </td>
                        <td className="py-4 text-center font-medium">{item.total}</td>
                        <td className="py-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                          {item.present}
                        </td>
                        <td className="py-4 text-center font-bold text-rose-600 dark:text-rose-400">
                          {item.absent}
                        </td>
                        <td className="py-4 text-center font-bold text-amber-600 dark:text-amber-400">
                          {item.late}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                item.percentage >= 75
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              }`}
                            >
                              {item.percentage}%
                            </span>
                            {/* Visual Progress Indicator */}
                            <div className="w-28 sm:w-36 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  item.percentage >= 75
                                    ? 'bg-emerald-500'
                                    : item.percentage >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, item.percentage)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Detailed Daily Session Log */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Lecture Attendance Logs
                </h3>
                <span className="text-xs text-slate-400">
                  Showing {Math.min(10, filteredRecords.length)} of {filteredRecords.length} sessions
                </span>
              </div>

              {filteredRecords.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No attendance logs found for the selected course filter.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredRecords.slice(0, 15).map((record) => (
                    <div
                      key={record._id}
                      className="py-3 flex items-center justify-between text-xs sm:text-sm"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {record.course?.courseCode} &mdash; {record.course?.title}
                        </span>
                        <span className="block text-xs text-slate-400 mt-0.5">
                          {formatDate(record.date)}
                        </span>
                      </div>

                      <div>
                        {record.status === 'present' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Present
                          </span>
                        )}
                        {record.status === 'absent' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full">
                            <XCircle className="w-3.5 h-3.5" /> Absent
                          </span>
                        )}
                        {record.status === 'late' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5" /> Late
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}

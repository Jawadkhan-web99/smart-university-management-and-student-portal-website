'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { CourseItem, AttendanceRosterStudent } from '../../../../types/university';
import {
  CalendarCheck,
  Calendar,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Save,
  AlertCircle,
  Loader2,
  History,
  Users,
} from 'lucide-react';

interface RosterResponse {
  course: {
    _id: string;
    courseCode: string;
    title: string;
  };
  date: string;
  isMarked: boolean;
  totalStudents: number;
  roster: AttendanceRosterStudent[];
}

function TeacherAttendanceContent() {
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get('courseId') || '';
  const initialDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const [roster, setRoster] = useState<AttendanceRosterStudent[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isPreviouslyMarked, setIsPreviouslyMarked] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load teacher courses
  useEffect(() => {
    async function loadCourses() {
      setLoadingCourses(true);
      const res = await apiFetch<CourseItem[]>('/teachers/courses');
      if (res.success && res.data) {
        setCourses(res.data);
        if (!selectedCourse && res.data.length > 0) {
          setSelectedCourse(res.data[0]._id);
        }
      }
      setLoadingCourses(false);
    }
    loadCourses();
  }, []);

  // Load roster when course and date are selected
  const loadRoster = async () => {
    if (!selectedCourse || !selectedDate) return;
    setLoadingRoster(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await apiFetch<RosterResponse>(
      `/attendance/course/${selectedCourse}?date=${selectedDate}`
    );
    if (res.success && res.data) {
      setRoster(res.data.roster);
      setIsPreviouslyMarked(res.data.isMarked);
    } else {
      setErrorMessage(res.message || 'Failed to load course roster.');
    }
    setLoadingRoster(false);
  };

  useEffect(() => {
    if (selectedCourse) {
      loadRoster();
    }
  }, [selectedCourse, selectedDate]);

  // Bulk status helpers
  const setAllStatus = (status: 'present' | 'absent' | 'late') => {
    setRoster((prev) => prev.map((s) => ({ ...s, status })));
  };

  const resetAllStatus = () => {
    setRoster((prev) => prev.map((s) => ({ ...s, status: null })));
  };

  const updateIndividualStatus = (
    studentUserId: string,
    status: 'present' | 'absent' | 'late'
  ) => {
    setRoster((prev) =>
      prev.map((s) => (s.studentUserId === studentUserId ? { ...s, status } : s))
    );
  };

  // Submit attendance
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !selectedDate) {
      setErrorMessage('Please select a course and date.');
      return;
    }

    const unassigned = roster.filter((s) => !s.status);
    if (unassigned.length > 0) {
      setErrorMessage(
        `Please select a status for all students (${unassigned.length} remaining unmarked).`
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const records = roster.map((s) => ({
      studentId: s.studentUserId,
      status: s.status,
    }));

    const res = await apiFetch('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({
        courseId: selectedCourse,
        date: selectedDate,
        records,
      }),
    });

    setSubmitting(false);

    if (res.success) {
      setSuccessMessage('Attendance submitted and recorded successfully!');
      setIsPreviouslyMarked(true);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(res.message || 'Failed to submit attendance.');
    }
  };

  // Tally counts
  const presentCount = roster.filter((s) => s.status === 'present').length;
  const absentCount = roster.filter((s) => s.status === 'absent').length;
  const lateCount = roster.filter((s) => s.status === 'late').length;

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardShell role="teacher" title="Mark Attendance">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                Lecture Attendance Recording
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Select your assigned course offering and mark student lecture presence
              </p>
            </div>
            <Link
              href="/dashboard/teacher/attendance/history"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-semibold rounded-xl transition-all"
            >
              <History className="w-4 h-4" />
              Attendance History
            </Link>
          </div>

          {/* Feedback alerts */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Step 1 & 2: Course & Date Selector */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  1. Select Course Allocation *
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    disabled={loadingCourses}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                  >
                    {courses.length === 0 ? (
                      <option value="">No courses assigned</option>
                    ) : (
                      courses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.courseCode} – {c.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  2. Lecture Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>
            </div>

            {isPreviouslyMarked && (
              <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-indigo-600" />
                <span>
                  Attendance for this date was previously recorded. Saving will update the existing session.
                </span>
              </div>
            )}
          </div>

          {/* Roster & Marking Table */}
          {selectedCourse && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              {/* Actions & Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Student Class Roster ({roster.length})
                    </h3>
                    <div className="flex items-center gap-3 text-xs mt-0.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Present: {presentCount}
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        Absent: {absentCount}
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        Late: {lateCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bulk controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAllStatus('present')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    Mark All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllStatus('absent')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                  >
                    Mark All Absent
                  </button>
                  <button
                    type="button"
                    onClick={resetAllStatus}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title="Reset all"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {loadingRoster ? (
                <div className="p-16 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                  <p className="text-sm">Loading students roster...</p>
                </div>
              ) : roster.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No enrolled students found for this course.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <th className="py-3 px-4">Student ID</th>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4">Program</th>
                          <th className="py-3 px-4 text-center">Attendance Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {roster.map((student) => (
                          <tr
                            key={student.studentUserId}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                              {student.studentId}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                              {student.firstName} {student.lastName}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                              {student.program}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateIndividualStatus(student.studentUserId, 'present')
                                  }
                                  className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1 ${
                                    student.status === 'present'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Present
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateIndividualStatus(student.studentUserId, 'late')
                                  }
                                  className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1 ${
                                    student.status === 'late'
                                      ? 'bg-amber-600 text-white shadow-sm'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  Late
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateIndividualStatus(student.studentUserId, 'absent')
                                  }
                                  className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1 ${
                                    student.status === 'absent'
                                      ? 'bg-rose-600 text-white shadow-sm'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Absent
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Attendance
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

export default function TeacherAttendancePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-500">Loading attendance console...</p>
          </div>
        </div>
      }
    >
      <TeacherAttendanceContent />
    </Suspense>
  );
}

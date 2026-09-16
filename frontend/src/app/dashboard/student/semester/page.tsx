'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { SemesterItem, CourseItem, StudentProfileData } from '../../../../types/university';
import {
  Calendar,
  Clock,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Loader2,
  CalendarDays,
  Sparkles,
} from 'lucide-react';

export default function StudentSemesterPage() {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [profileRes, semRes, coursesRes] = await Promise.all([
        apiFetch<StudentProfileData>('/students/me'),
        apiFetch<SemesterItem[]>('/semesters'),
        apiFetch<CourseItem[]>('/courses?isActive=true'),
      ]);

      if (profileRes.success && profileRes.data) setProfile(profileRes.data);
      if (semRes.success && semRes.data) setSemesters(semRes.data);
      if (coursesRes.success && coursesRes.data) setCourses(coursesRes.data);
      setLoading(false);
    }

    loadData();
  }, []);

  const activeSemester =
    semesters.find((s) => s.isActive) ||
    (semesters.length > 0 ? semesters[0] : null);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardShell role="student" title="Academic Semester Cycle">
        {loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            <p className="text-xs text-slate-500">Loading semester schedule...</p>
          </div>
        ) : (
          <div className="space-y-8 max-w-5xl mx-auto">
            {/* 1. Active Semester Hero Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Current Enrolled Cycle
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    {activeSemester?.name || 'Fall 2026'}
                  </h1>
                  <p className="text-sm text-indigo-100 max-w-2xl">
                    Academic Session: <strong>{activeSemester?.academicYear || '2026-2027'}</strong> &bull; Semester #{activeSemester?.semesterNumber || 7}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-emerald-400" />
                    <span>
                      Term Start: <strong>{formatDate(activeSemester?.startDate)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>
                      Term Conclusion: <strong>{formatDate(activeSemester?.endDate)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Semester Milestones Timeline */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-brand-600" />
                <span>Semester Progression & Key Milestones</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Week 1 - 2
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    Course Enrollment & Orientation
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Subject confirmation, lab allotments & timetable activation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Week 8 - 9
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    Midterm Examinations
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Centralized departmental assessments and early term feedback.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Week 14 - 15
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    Capstone & Project Reviews
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Final lab submissions, oral presentations, and demo evaluations.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Week 16 - 18
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    Final Examinations
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    End-semester written exams, transcript grade lock & recess.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Enrolled Courses for Current Semester */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-600" />
                  <span>Enrolled Courses for {activeSemester?.name || 'Active Semester'}</span>
                </h3>
                <span className="text-xs text-slate-500">
                  {courses.length} Courses Registered
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {courses.map((c) => (
                  <div
                    key={c._id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-brand-600 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded">
                          {c.courseCode}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {c.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Instructor:{' '}
                        {typeof c.teacher === 'object' && c.teacher
                          ? `${c.teacher.firstName} ${c.teacher.lastName}`
                          : 'Staff Faculty'}{' '}
                        &bull; {c.creditHours} Credit Hours
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40 w-fit">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Enrollment
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}

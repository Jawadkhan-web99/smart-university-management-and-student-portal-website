'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { StudentProfileData, CourseItem, SemesterItem } from '../../../../types/university';
import {
  Users,
  Search,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  Mail,
  GraduationCap,
} from 'lucide-react';

interface StudentsResponse {
  students: StudentProfileData[];
  total: number;
  page: number;
  totalPages: number;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<StudentProfileData[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Load courses & semesters for filter dropdowns
  useEffect(() => {
    async function loadMeta() {
      const [cRes, sRes] = await Promise.all([
        apiFetch<CourseItem[]>('/teachers/courses'),
        apiFetch<SemesterItem[]>('/semesters?isActive=true'),
      ]);
      if (cRes.success && cRes.data) setCourses(cRes.data);
      if (sRes.success && sRes.data) setSemesters(sRes.data);
    }
    loadMeta();
  }, []);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: String(page),
      limit: '10',
    });
    if (search) query.set('search', search);
    if (selectedCourse) query.set('courseId', selectedCourse);
    if (selectedSemester) query.set('semesterId', selectedSemester);

    const res = await apiFetch<StudentsResponse>(`/teachers/students?${query.toString()}`);
    if (res.success && res.data) {
      setStudents(res.data.students);
      setTotalPages(res.data.totalPages);
      setTotalStudents(res.data.total);
    }
    setLoading(false);
  }, [page, search, selectedCourse, selectedSemester]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardShell role="teacher" title="Student Directory">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-teal-600 dark:text-teal-400" />
              Assigned Students Directory
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Active student roster enrolled across your instructional course allocations
            </p>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by student name, ID, or email..."
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setPage(1);
                }}
                className="px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="">All My Courses</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.courseCode} - {c.title}
                  </option>
                ))}
              </select>

              <select
                value={selectedSemester}
                onChange={(e) => {
                  setSelectedSemester(e.target.value);
                  setPage(1);
                }}
                className="px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="">All Semesters</option>
                {semesters.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                <p className="text-sm">Loading student directory...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-7 h-7" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                  No students found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {search || selectedCourse || selectedSemester
                    ? 'Try clearing or changing your search filters.'
                    : 'No students are registered in your assigned courses yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/40 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-6">Student ID</th>
                      <th className="py-4 px-4">Student Name</th>
                      <th className="py-4 px-4">Email</th>
                      <th className="py-4 px-4">Program</th>
                      <th className="py-4 px-4">Semester</th>
                      <th className="py-4 px-4">Enrollment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {students.map((student) => {
                      const u = student.user as unknown as {
                        firstName?: string;
                        lastName?: string;
                        email?: string;
                      };
                      return (
                        <tr
                          key={student._id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white">
                            {student.studentId}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                            {u?.firstName} {u?.lastName}
                          </td>
                          <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-xs">
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {u?.email}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium text-xs">
                            {student.program}
                          </td>
                          <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-xs">
                            {student.semester && typeof student.semester === 'object'
                              ? student.semester.name
                              : 'Current Semester'}
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 capitalize">
                              {student.enrollmentStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalStudents > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Showing {students.length} of {totalStudents} students
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

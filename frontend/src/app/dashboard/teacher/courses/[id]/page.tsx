'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '../../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../../utils/api';
import { CourseItem, StudentProfileData } from '../../../../../types/university';
import {
  BookOpen,
  ArrowLeft,
  Users,
  Building,
  Calendar,
  Clock,
  CalendarCheck,
  Plus,
  ShieldAlert,
  Loader2,
  Search,
  Mail,
} from 'lucide-react';

interface CourseDetailsResponse {
  course: CourseItem;
  students: StudentProfileData[];
  studentCount: number;
}

export default function TeacherCourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [data, setData] = useState<CourseDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) return;
      setLoading(true);
      setError(null);
      const res = await apiFetch<CourseDetailsResponse>(`/teachers/courses/${courseId}`);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Unable to access course details.');
      }
      setLoading(false);
    }
    loadCourse();
  }, [courseId]);

  const filteredStudents = (data?.students || []).filter((s) => {
    const q = studentSearch.toLowerCase();
    const u = s.user as unknown as { firstName?: string; lastName?: string; email?: string };
    const fullName = `${u?.firstName || ''} ${u?.lastName || ''}`.toLowerCase();
    const sId = (s.studentId || '').toLowerCase();
    const email = (u?.email || '').toLowerCase();
    return fullName.includes(q) || sId.includes(q) || email.includes(q);
  });

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardShell role="teacher" title="Course Curriculum Console">
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => router.push('/dashboard/teacher/courses')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assigned Courses
          </button>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
              <p className="text-sm">Loading course details...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Course Access Restricted
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {error}
              </p>
              <button
                onClick={() => router.push('/dashboard/teacher/courses')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
              >
                Return to My Courses
              </button>
            </div>
          ) : data ? (
            <>
              {/* Course Overview Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                        {data.course.courseCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {data.course.creditHours} Credit Hours
                      </span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {data.course.title}
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      href={`/dashboard/teacher/attendance?courseId=${data.course._id}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      Mark Attendance
                    </Link>
                    <Link
                      href={`/dashboard/teacher/assignments/create?courseId=${data.course._id}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold rounded-xl transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Assignment
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-1">Academic Department</span>
                    <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-indigo-500" />
                      {typeof data.course.department === 'object'
                        ? data.course.department.name
                        : 'Department'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-1">Assigned Semester</span>
                    <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      {data.course.semester && typeof data.course.semester === 'object'
                        ? data.course.semester.name
                        : 'Current Semester'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-1">Total Enrolled</span>
                    <span className="font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1.5 text-sm">
                      <Users className="w-4 h-4 text-teal-500" />
                      {data.studentCount} Students
                    </span>
                  </div>
                </div>

                {data.course.description && (
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Syllabus & Course Description
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      {data.course.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Enrolled Students Section */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      Enrolled Student Roster ({data.students.length})
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Students registered in this course section
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Filter students..."
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No students match your search criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <th className="py-3 px-4">Student ID</th>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Program</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {filteredStudents.map((s) => {
                          const u = s.user as unknown as { firstName?: string; lastName?: string; email?: string };
                          return (
                            <tr
                              key={s._id}
                              className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                                {s.studentId}
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                                {u?.firstName} {u?.lastName}
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                                {u?.email}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                {s.program}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 capitalize">
                                  {s.enrollmentStatus}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

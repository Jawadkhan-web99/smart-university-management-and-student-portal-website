'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { CourseItem, DepartmentItem, SemesterItem } from '../../../../types/university';
import {
  BookOpen,
  Search,
  Users,
  Building,
  Calendar,
  Clock,
  ArrowRight,
  Inbox,
  Loader2,
  CalendarCheck,
  Plus,
} from 'lucide-react';

interface TeacherCourseWithCount extends CourseItem {
  studentCount?: number;
}

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<TeacherCourseWithCount[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [courseRes, deptRes, semRes] = await Promise.all([
        apiFetch<TeacherCourseWithCount[]>('/teachers/courses'),
        apiFetch<DepartmentItem[]>('/departments?isActive=true'),
        apiFetch<SemesterItem[]>('/semesters?isActive=true'),
      ]);

      if (courseRes.success && courseRes.data) setCourses(courseRes.data);
      if (deptRes.success && deptRes.data) setDepartments(deptRes.data);
      if (semRes.success && semRes.data) setSemesters(semRes.data);

      setLoading(false);
    }
    loadData();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

      const deptId = typeof c.department === 'object' ? c.department._id : c.department;
      const matchesDept = selectedDept ? deptId === selectedDept : true;

      const semId =
        c.semester && typeof c.semester === 'object' ? c.semester._id : c.semester;
      const matchesSem = selectedSem ? semId === selectedSem : true;

      return matchesSearch && matchesDept && matchesSem;
    });
  }, [courses, searchTerm, selectedDept, selectedSem]);

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardShell role="teacher" title="My Assigned Courses">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                Teaching Curriculum & Course Allocations
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                You have {courses.length} active course allocations assigned to your profile
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/teacher/attendance"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
              >
                <CalendarCheck className="w-4 h-4" />
                Mark Attendance
              </Link>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course code or title..."
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value)}
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

          {/* Courses Grid */}
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
              <p className="text-sm">Loading assigned courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
              <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                No courses found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {searchTerm || selectedDept || selectedSem
                  ? 'No allocated courses match your filter criteria.'
                  : 'You do not have any courses assigned to you yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const deptName =
                  typeof course.department === 'object'
                    ? course.department.name
                    : 'Computer Science';
                const semName =
                  course.semester && typeof course.semester === 'object'
                    ? course.semester.name
                    : 'Fall 2026';

                return (
                  <div
                    key={course._id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                          {course.courseCode}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          <Clock className="w-3 h-3" />
                          {course.creditHours} Credits
                        </span>
                      </div>

                      <h2 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                        {course.title}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {course.description ||
                          'Advanced curriculum syllabus and practical laboratories.'}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {deptName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {semName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                          <Users className="w-3.5 h-3.5 text-teal-500" />
                          {course.studentCount ?? 0} Enrolled Students
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <Link
                        href={`/dashboard/teacher/courses/${course._id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                        Course Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/dashboard/teacher/attendance?courseId=${course._id}`}
                        title="Mark Attendance for this course"
                        className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <CalendarCheck className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/teacher/assignments/create?courseId=${course._id}`}
                        title="Create Assignment for this course"
                        className="p-2 rounded-xl text-slate-500 hover:text-violet-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

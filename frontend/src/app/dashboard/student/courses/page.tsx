'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { CourseItem, DepartmentItem, SemesterItem } from '../../../../types/university';
import {
  BookOpen,
  Search,
  Filter,
  User as UserIcon,
  Building,
  Calendar,
  Clock,
  Inbox,
  Loader2,
  Award,
} from 'lucide-react';

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [courseRes, deptRes, semRes] = await Promise.all([
        apiFetch<CourseItem[]>('/courses?isActive=true'),
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

      const deptId =
        typeof c.department === 'object' ? c.department._id : c.department;
      const matchesDept = selectedDept ? deptId === selectedDept : true;

      const semId =
        typeof c.semester === 'object' && c.semester ? c.semester._id : c.semester;
      const matchesSem = selectedSem ? semId === selectedSem : true;

      return matchesSearch && matchesDept && matchesSem;
    });
  }, [courses, searchTerm, selectedDept, selectedSem]);

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardShell role="student" title="Enrolled & Available Courses">
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Course Catalog & Curriculum
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Browse academic courses, assigned professors, and credit allocations
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 bg-brand-50 dark:bg-brand-950/60 px-3.5 py-1.5 rounded-full border border-brand-200/60 dark:border-brand-800/40 w-fit">
              <Award className="w-4 h-4" />
              <span>{courses.length} Active Courses</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course code or title (e.g., CS-401)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Department Filter */}
            <div className="w-full md:w-56">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div className="w-full md:w-48">
              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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

          {/* Courses List */}
          {loading ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-xs text-slate-500">Loading course offerings...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
              <Inbox className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No matching courses found
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No courses matched your search query or department filter criteria. Try resetting the filters.
              </p>
              {(searchTerm || selectedDept || selectedSem) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDept('');
                    setSelectedSem('');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-brand-600 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCourses.map((course) => {
                const deptName =
                  typeof course.department === 'object' && course.department
                    ? course.department.name
                    : 'Unassigned';
                const deptCode =
                  typeof course.department === 'object' && course.department
                    ? course.department.code
                    : 'N/A';
                const semName =
                  typeof course.semester === 'object' && course.semester
                    ? course.semester.name
                    : 'Open';
                const teacherName =
                  typeof course.teacher === 'object' && course.teacher
                    ? `${course.teacher.firstName} ${course.teacher.lastName}`
                    : 'Staff Faculty';

                return (
                  <div
                    key={course._id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-lg border border-brand-200/60 dark:border-brand-900/60">
                          {course.courseCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          {course.creditHours} Credits
                        </span>
                      </div>

                      {/* Course Title */}
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {course.title}
                      </h3>

                      {/* Description */}
                      {course.description && (
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {course.description}
                        </p>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {deptCode} ({deptName})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {semName}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                          <UserIcon className="w-3.5 h-3.5 text-brand-500" />
                          {teacherName}
                        </span>
                      </div>
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

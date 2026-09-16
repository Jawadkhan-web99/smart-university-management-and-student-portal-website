'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { AssignmentItem, CourseItem } from '../../../../types/university';
import {
  FileText,
  Search,
  Calendar,
  Clock,
  Trash2,
  Eye,
  Loader2,
  BookOpen,
  User,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // View modal
  const [viewAssignment, setViewAssignment] = useState<AssignmentItem | null>(null);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      limit: '15',
      ...(courseFilter ? { courseId: courseFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    });

    const res = await apiFetch<{
      assignments: AssignmentItem[];
      total: number;
      totalPages: number;
    }>(`/assignments?${query.toString()}`);

    if (res.success && res.data) {
      let list = res.data.assignments || [];
      if (search) {
        list = list.filter(
          (a) =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.course?.courseCode?.toLowerCase().includes(search.toLowerCase())
        );
      }
      setAssignments(list);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
    }
    setLoading(false);
  }, [page, courseFilter, statusFilter, search]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  useEffect(() => {
    async function loadCourses() {
      const res = await apiFetch<CourseItem[]>('/courses');
      if (res.success && res.data) setCourses(res.data);
    }
    loadCourses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment? All associated student submissions will be affected.'))
      return;

    const res = await apiFetch(`/assignments/${id}`, { method: 'DELETE' });
    if (res.success) {
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardShell role="admin" title="University Coursework & Assignments">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-600" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Coursework Supervision
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  {totalCount} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Monitor university-wide assignments created by instructors, submissions, and deadlines.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assignments by title or course code..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 outline-hidden"
              >
                <option value="">All Courses</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.courseCode} - {c.title}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 outline-hidden"
              >
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                <p className="text-xs text-slate-500">Loading assignments directory...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No assignments found
                </p>
                <p className="text-xs text-slate-500">
                  Try clearing your search or filter parameters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">Assignment</th>
                      <th className="px-4 py-3.5">Course</th>
                      <th className="px-4 py-3.5">Instructor</th>
                      <th className="px-4 py-3.5">Due Date</th>
                      <th className="px-4 py-3.5 text-center">Marks</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {assignments.map((a) => (
                      <tr
                        key={a._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                            {a.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                            {a.description}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                            {a.course?.courseCode}
                          </span>
                          <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                            {a.course?.title}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                          {a.teacher?.firstName} {a.teacher?.lastName}
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {new Date(a.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                          {a.totalMarks}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                              a.status === 'published'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                                : a.status === 'closed'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setViewAssignment(a)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(a._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Delete assignment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* VIEW MODAL */}
          {viewAssignment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Assignment Details
                  </h3>
                  <button
                    type="button"
                    onClick={() => setViewAssignment(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Title</span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      {viewAssignment.title}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Description</span>
                    <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {viewAssignment.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-400 block">Course</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {viewAssignment.course?.courseCode} - {viewAssignment.course?.title}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-400 block">Instructor</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {viewAssignment.teacher?.firstName} {viewAssignment.teacher?.lastName}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-400 block">Due Date</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {new Date(viewAssignment.dueDate).toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-400 block">Total Marks</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {viewAssignment.totalMarks}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setViewAssignment(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

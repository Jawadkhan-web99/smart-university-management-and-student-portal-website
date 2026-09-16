'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { AssignmentItem, CourseItem } from '../../../../types/university';
import {
  FileText,
  Plus,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Check,
  X,
  Inbox,
  Lock,
  Users,
} from 'lucide-react';

interface AssignmentsResponse {
  assignments: AssignmentItem[];
  total: number;
  page: number;
  totalPages: number;
}

export default function TeacherAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAssignments, setTotalAssignments] = useState(0);

  // Action states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load teacher courses for filter
  useEffect(() => {
    async function loadCourses() {
      const res = await apiFetch<CourseItem[]>('/teachers/courses');
      if (res.success && res.data) {
        setCourses(res.data);
      }
    }
    loadCourses();
  }, []);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: String(page),
      limit: '10',
    });
    if (search) query.set('search', search);
    if (selectedCourse) query.set('courseId', selectedCourse);
    if (selectedStatus && selectedStatus !== 'all') query.set('status', selectedStatus);

    const res = await apiFetch<AssignmentsResponse>(`/assignments?${query.toString()}`);
    if (res.success && res.data) {
      setAssignments(res.data.assignments);
      setTotalPages(res.data.totalPages);
      setTotalAssignments(res.data.total);
    }
    setLoading(false);
  }, [page, search, selectedCourse, selectedStatus]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleStatusChange = async (id: string, newStatus: 'draft' | 'published' | 'closed') => {
    setActionLoading(true);
    const res = await apiFetch(`/assignments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
    setActionLoading(false);

    if (res.success) {
      setSuccessMessage(`Assignment status updated to "${newStatus}".`);
      loadAssignments();
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage(res.message || 'Failed to update status');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    const res = await apiFetch(`/assignments/${id}`, {
      method: 'DELETE',
    });
    setActionLoading(false);
    setDeleteId(null);

    if (res.success) {
      setSuccessMessage('Assignment deleted successfully.');
      loadAssignments();
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage(res.message || 'Failed to delete assignment');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardShell role="teacher" title="Assignments Management">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                Course Assignments & Projects
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Create, publish, and manage coursework deadlines for your instructional offerings
              </p>
            </div>
            <Link
              href="/dashboard/teacher/assignments/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Assignment
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

          {/* Filter Bar */}
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
                placeholder="Search assignments by title..."
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
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Drafts</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Assignments Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                <p className="text-sm">Loading assignments...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-14 h-14 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-7 h-7" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                  No assignments found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                  {search || selectedCourse || selectedStatus !== 'all'
                    ? 'No assignments match the selected filter criteria.'
                    : 'Get started by creating your first course assignment.'}
                </p>
                <Link
                  href="/dashboard/teacher/assignments/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  Create Assignment
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/40 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-6">Assignment Title</th>
                      <th className="py-4 px-4">Course</th>
                      <th className="py-4 px-4">Due Date</th>
                      <th className="py-4 px-4">Total Marks</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {assignments.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                          <div className="space-y-0.5">
                            <span className="font-bold block">{item.title}</span>
                            <span className="text-xs text-slate-400 line-clamp-1">
                              Created {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                            {item.course?.courseCode}
                          </span>
                          <span className="text-slate-400 line-clamp-1">{item.course?.title}</span>
                        </td>
                        <td className="py-4 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-900 dark:text-white">
                          {item.totalMarks} pts
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                              item.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : item.status === 'closed'
                                ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status === 'draft' ? (
                              <button
                                onClick={() => handleStatusChange(item._id, 'published')}
                                title="Publish Assignment"
                                className="px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Publish
                              </button>
                            ) : item.status === 'published' ? (
                              <button
                                onClick={() => handleStatusChange(item._id, 'closed')}
                                title="Close Assignment"
                                className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                Close
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(item._id, 'published')}
                                title="Reopen Assignment"
                                className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                              >
                                Reopen
                              </button>
                            )}

                            <Link
                              href={`/dashboard/teacher/assignments/${item._id}/submissions`}
                              title="Grade Submissions"
                              className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>Submissions</span>
                            </Link>

                            <Link
                              href={`/dashboard/teacher/assignments/${item._id}/edit`}
                              title="Edit Assignment"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => setDeleteId(item._id)}
                              title="Delete Assignment"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
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

          {/* Delete Confirmation Modal */}
          {deleteId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Delete Assignment?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Are you sure you want to permanently delete this assignment? Students will no
                    longer be able to view its coursework guidelines.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setDeleteId(null)}
                    disabled={actionLoading}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteId)}
                    disabled={actionLoading}
                    className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-2"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm Delete
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

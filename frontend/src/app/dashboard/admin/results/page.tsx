'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { ResultItem, CourseItem, SemesterItem } from '../../../../types/university';
import {
  Award,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Loader2,
  Eye,
  Edit2,
  Trash2,
  X,
  Save,
  CheckCheck,
} from 'lucide-react';

export default function AdminResultsPage() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Edit Modal
  const [editResult, setEditResult] = useState<ResultItem | null>(null);
  const [editMarks, setEditMarks] = useState<number>(0);
  const [editRemarks, setEditRemarks] = useState('');
  const [editStatus, setEditStatus] = useState<'draft' | 'published'>('draft');
  const [saving, setSaving] = useState(false);

  const loadResults = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      limit: '15',
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(courseFilter ? { courseId: courseFilter } : {}),
      ...(semesterFilter ? { semesterId: semesterFilter } : {}),
    });

    const res = await apiFetch<{
      results: ResultItem[];
      total: number;
      totalPages: number;
    }>(`/results?${query.toString()}`);

    if (res.success && res.data) {
      setResults(res.data.results || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
    }
    setLoading(false);
  }, [page, statusFilter, courseFilter, semesterFilter]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  useEffect(() => {
    async function loadMetadata() {
      const [coursesRes, semRes] = await Promise.all([
        apiFetch<CourseItem[]>('/courses'),
        apiFetch<SemesterItem[]>('/semesters'),
      ]);
      if (coursesRes.success && coursesRes.data) setCourses(coursesRes.data);
      if (semRes.success && semRes.data) setSemesters(semRes.data);
    }
    loadMetadata();
  }, []);

  const handleTogglePublish = async (result: ResultItem) => {
    const newStatus = result.status === 'published' ? 'draft' : 'published';
    const res = await apiFetch(`/results/${result._id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.success) {
      setResults((prev) =>
        prev.map((r) => (r._id === result._id ? { ...r, status: newStatus } : r))
      );
    }
  };

  const openEditModal = (result: ResultItem) => {
    setEditResult(result);
    setEditMarks(result.marks);
    setEditRemarks(result.remarks || '');
    setEditStatus(result.status);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editResult) return;
    setSaving(true);

    const res = await apiFetch(`/results/${editResult._id}`, {
      method: 'PUT',
      body: JSON.stringify({
        marks: editMarks,
        remarks: editRemarks,
        status: editStatus,
      }),
    });

    if (res.success) {
      setEditResult(null);
      loadResults();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result record?')) return;
    const res = await apiFetch(`/results/${id}`, { method: 'DELETE' });
    if (res.success) {
      setResults((prev) => prev.filter((r) => r._id !== id));
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardShell role="admin" title="Academic Examination & Grade Moderation">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Academic Results & Grading Moderation
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {totalCount} Recorded
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Moderate, verify, and publish course grades submitted by faculty across departments.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
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
            </select>

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
              value={semesterFilter}
              onChange={(e) => {
                setSemesterFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 outline-hidden"
            >
              <option value="">All Semesters</option>
              {semesters.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Results Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-xs text-slate-500">Loading academic results...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Award className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No academic results found
                </p>
                <p className="text-xs text-slate-500">
                  Select different filter criteria or wait for instructors to submit course marks.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">Student</th>
                      <th className="px-4 py-3.5">Course</th>
                      <th className="px-4 py-3.5">Semester</th>
                      <th className="px-4 py-3.5 text-center">Marks</th>
                      <th className="px-4 py-3.5 text-center">Grade</th>
                      <th className="px-4 py-3.5 text-center">GP</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {results.map((r) => (
                      <tr
                        key={r._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {r.student?.firstName} {r.student?.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400">{r.student?.email}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {r.course?.courseCode}
                          </span>
                          <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {r.course?.title}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                          {r.semester?.name}
                        </td>
                        <td className="px-4 py-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                          {r.marks} / {r.totalMarks}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md font-black text-xs ${
                              r.grade.startsWith('A')
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : r.grade.startsWith('B')
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                : r.grade.startsWith('C')
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {r.grade}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-mono text-slate-700 dark:text-slate-300">
                          {r.gradePoint.toFixed(2)}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(r)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              r.status === 'published'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                            }`}
                            title="Click to toggle status"
                          >
                            {r.status === 'published' ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            <span className="capitalize">{r.status}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(r)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40"
                              title="Edit result"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(r._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Delete result"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* EDIT MODAL */}
          {editResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Examination Marks
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditResult(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-slate-500">
                    Student:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {editResult.student?.firstName} {editResult.student?.lastName}
                    </strong>
                  </p>
                  <p className="text-slate-500">
                    Course:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {editResult.course?.courseCode} - {editResult.course?.title}
                    </strong>
                  </p>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Obtained Marks (out of {editResult.totalMarks})
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={editResult.totalMarks}
                      required
                      value={editMarks}
                      onChange={(e) => setEditMarks(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Publication Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as 'draft' | 'published')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden"
                    >
                      <option value="draft">Draft (Hidden from Student)</option>
                      <option value="published">Published (Visible on Transcript)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Remarks / Notes
                    </label>
                    <input
                      type="text"
                      value={editRemarks}
                      onChange={(e) => setEditRemarks(e.target.value)}
                      placeholder="Optional examiner remarks"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditResult(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors disabled:opacity-50"
                    >
                      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Save Grade</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '../../../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../../../utils/api';
import { AssignmentItem } from '../../../../../../types/university';
import {
  FileText,
  ArrowLeft,
  Calendar,
  Award,
  Link as LinkIcon,
  Save,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';

export default function EditAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseName, setCourseName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [attachment, setAttachment] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'closed'>('published');

  useEffect(() => {
    async function loadAssignment() {
      if (!assignmentId) return;
      setLoading(true);
      const res = await apiFetch<AssignmentItem>(`/assignments/${assignmentId}`);
      if (res.success && res.data) {
        setTitle(res.data.title);
        setDescription(res.data.description);
        setCourseName(
          `${res.data.course?.courseCode || ''} – ${res.data.course?.title || ''}`
        );
        setDueDate(
          res.data.dueDate ? new Date(res.data.dueDate).toISOString().split('T')[0] : ''
        );
        setTotalMarks(res.data.totalMarks);
        setAttachment(res.data.attachment || '');
        setStatus(res.data.status);
      } else {
        setErrorMessage(res.message || 'Unable to load assignment details.');
      }
      setLoading(false);
    }
    loadAssignment();
  }, [assignmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !dueDate) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (totalMarks <= 0) {
      setErrorMessage('Total marks must be at least 1.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      dueDate,
      totalMarks: Number(totalMarks),
      attachment: attachment.trim(),
      status,
    };

    const res = await apiFetch<AssignmentItem>(`/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (res.success) {
      router.push('/dashboard/teacher/assignments');
    } else {
      setErrorMessage(res.message || 'Failed to update assignment');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardShell role="teacher" title="Edit Assignment">
        <div className="max-w-3xl space-y-6">
          {/* Back button */}
          <Link
            href="/dashboard/teacher/assignments"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assignments
          </Link>

          {/* Form Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                Edit Course Assignment
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Modify instructions, deadline, grading points, and publishing status
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            )}

            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                <p className="text-sm">Loading assignment details...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                {/* Course (read-only) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Course Allocation (Locked)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={courseName}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Instructions & Guidelines *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white leading-relaxed"
                  />
                </div>

                {/* Due Date & Total Marks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Due Date *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        required
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Total Marks / Points *
                    </label>
                    <div className="relative">
                      <Award className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        required
                        min="1"
                        max="1000"
                        value={totalMarks}
                        onChange={(e) => setTotalMarks(parseInt(e.target.value) || 1)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Attachment */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Attachment / Reference Document URL
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={attachment}
                      onChange={(e) => setAttachment(e.target.value)}
                      placeholder="https://drive.google.com/... or /docs/specs.pdf"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Assignment Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as 'draft' | 'published' | 'closed')
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="published">Published (Visible to students)</option>
                    <option value="draft">Draft (Private, visible only to you)</option>
                    <option value="closed">Closed (Submissions closed)</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/dashboard/teacher/assignments"
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Update Assignment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

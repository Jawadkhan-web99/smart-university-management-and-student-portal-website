'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '../../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../../utils/api';
import { CourseItem, AssignmentItem } from '../../../../../types/university';
import {
  FileText,
  ArrowLeft,
  BookOpen,
  Calendar,
  Award,
  Link as LinkIcon,
  Save,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

function CreateAssignmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCourse = searchParams.get('courseId') || '';

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState(preselectedCourse);
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [attachment, setAttachment] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      setLoadingCourses(true);
      const res = await apiFetch<CourseItem[]>('/teachers/courses');
      if (res.success && res.data) {
        setCourses(res.data);
        if (!course && res.data.length > 0) {
          setCourse(res.data[0]._id);
        }
      }
      setLoadingCourses(false);
    }
    loadCourses();

    // Default due date: 7 days from now at 23:59
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const dateStr = d.toISOString().split('T')[0];
    setDueDate(dateStr);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !course || !dueDate) {
      setErrorMessage('Please fill in all required fields (Title, Description, Course, Due Date).');
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
      course,
      dueDate,
      totalMarks: Number(totalMarks),
      attachment: attachment.trim(),
      status,
    };

    const res = await apiFetch<AssignmentItem>('/assignments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (res.success) {
      router.push('/dashboard/teacher/assignments');
    } else {
      setErrorMessage(res.message || 'Failed to create assignment');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardShell role="teacher" title="Create Assignment">
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
                Create New Course Assignment
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Define coursework instructions, submission deadlines, and maximum grading points
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
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
                  placeholder="e.g. Assignment 1: Distributed Consensus Simulator"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Course Allocation */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Course Allocation *
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    required
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    disabled={loadingCourses}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                  >
                    {courses.length === 0 ? (
                      <option value="">No courses assigned to your profile</option>
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
                  placeholder="Provide comprehensive problem statements, technical requirements, and submission instructions..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              {/* Due Date & Total Marks Grid */}
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

              {/* Attachment URL */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Attachment / Reference Document URL (Optional)
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={attachment}
                    onChange={(e) => setAttachment(e.target.value)}
                    placeholder="https://drive.google.com/... or /docs/assignment-1-specs.pdf"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Initial Publishing Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                >
                  <option value="published">Published (Visible immediately to enrolled students)</option>
                  <option value="draft">Draft (Saved privately, visible only to you)</option>
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
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

export default function CreateAssignmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            <p className="text-xs text-slate-500">Loading assignment editor...</p>
          </div>
        </div>
      }
    >
      <CreateAssignmentForm />
    </Suspense>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '../../../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../../../utils/api';
import { SubmissionItem, AssignmentItem } from '../../../../../../types/university';
import {
  FileText,
  ArrowLeft,
  Download,
  CheckCircle2,
  Clock,
  Award,
  Loader2,
  X,
  Save,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export default function TeacherSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<AssignmentItem | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Grading modal
  const [activeSub, setActiveSub] = useState<SubmissionItem | null>(null);
  const [marks, setMarks] = useState<number | string>('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadSubmissions = useCallback(async () => {
    if (!assignmentId) return;
    setLoading(true);

    const res = await apiFetch<{
      assignment: AssignmentItem;
      submissions: SubmissionItem[];
    }>(`/submissions/assignment/${assignmentId}`);

    if (res.success && res.data) {
      setAssignment(res.data.assignment);
      setSubmissions(res.data.submissions || []);
    }
    setLoading(false);
  }, [assignmentId]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const openGradingModal = (sub: SubmissionItem) => {
    setActiveSub(sub);
    setMarks(sub.marks !== null && sub.marks !== undefined ? sub.marks : '');
    setFeedback(sub.feedback || '');
    setErrorMsg('');
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSub || !assignment) return;
    setGrading(true);
    setErrorMsg('');

    const numMarks = Number(marks);
    if (isNaN(numMarks) || numMarks < 0 || numMarks > assignment.totalMarks) {
      setErrorMsg(`Marks must be between 0 and ${assignment.totalMarks}`);
      setGrading(false);
      return;
    }

    const res = await apiFetch(`/submissions/${activeSub._id}/grade`, {
      method: 'PUT',
      body: JSON.stringify({ marks: numMarks, feedback }),
    });

    if (res.success) {
      setActiveSub(null);
      loadSubmissions();
    } else {
      setErrorMsg(res.message || 'Failed to record grade');
    }
    setGrading(false);
  };

  return (
    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
      <DashboardShell role="teacher" title="Coursework Grading & Submissions">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Back Navigation */}
          <Link
            href="/dashboard/teacher/assignments"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Assignments</span>
          </Link>

          {/* Header Card */}
          {assignment && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {assignment.course?.courseCode}
                  </span>
                  <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {assignment.title}
                  </h1>
                </div>
                <p className="text-xs text-slate-500">
                  Due:{' '}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {new Date(assignment.dueDate).toLocaleString()}
                  </strong>{' '}
                  • Total Marks: <strong>{assignment.totalMarks}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-center min-w-[100px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    Submissions
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {submissions.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submissions Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-xs text-slate-500">Loading student submissions...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No submissions recorded
                </p>
                <p className="text-xs text-slate-500">
                  Enrolled students have not submitted coursework for this assignment yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">Student</th>
                      <th className="px-4 py-3.5">Submitted File</th>
                      <th className="px-4 py-3.5">Submission Date</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-center">Score</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {submissions.map((sub) => (
                      <tr
                        key={sub._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {sub.student?.firstName} {sub.student?.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400">{sub.student?.email}</p>
                          {sub.comment && (
                            <p className="text-[11px] text-slate-500 italic mt-0.5">
                              &ldquo;{sub.comment}&rdquo;
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <a
                            href={`http://localhost:5000${sub.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[150px]">
                              {sub.fileName || 'View Submission'}
                            </span>
                          </a>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                              sub.status === 'graded'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                                : sub.status === 'late'
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                            }`}
                          >
                            {sub.status === 'graded' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {sub.status}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                          {sub.marks !== null && sub.marks !== undefined
                            ? `${sub.marks} / ${assignment?.totalMarks}`
                            : '-'}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openGradingModal(sub)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>{sub.status === 'graded' ? 'Regrade' : 'Grade'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* GRADING MODAL */}
          {activeSub && assignment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Grade Coursework Submission
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSub(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-slate-500">
                    Student:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {activeSub.student?.firstName} {activeSub.student?.lastName}
                    </strong>
                  </p>
                  <p className="text-slate-500">
                    Assignment:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {assignment.title}
                    </strong>
                  </p>
                  <a
                    href={`http://localhost:5000${activeSub.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline pt-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Student File ({activeSub.fileName})
                  </a>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleGradeSubmit} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Awarded Marks (Maximum: {assignment.totalMarks}) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={assignment.totalMarks}
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                      placeholder={`0 - ${assignment.totalMarks}`}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Instructor Feedback / Comments
                    </label>
                    <textarea
                      rows={4}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide detailed academic feedback on performance, strengths, and areas of improvement..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500 resize-y"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveSub(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={grading}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors disabled:opacity-50"
                    >
                      {grading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Save & Return Grade</span>
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

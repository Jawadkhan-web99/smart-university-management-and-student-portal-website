'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '../../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../../utils/api';
import { AssignmentItem, SubmissionItem } from '../../../../../types/university';
import {
  FileText,
  ArrowLeft,
  Calendar,
  Clock,
  Award,
  Download,
  ExternalLink,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  User,
  UploadCloud,
  FileCheck,
  MessageSquare,
  AlertCircle,
  File,
  Send,
  RefreshCw,
} from 'lucide-react';

export default function StudentAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params?.id as string;

  const [assignment, setAssignment] = useState<AssignmentItem | null>(null);
  const [submission, setSubmission] = useState<SubmissionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionLoading, setSubmissionLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submission Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showResubmitForm, setShowResubmitForm] = useState(false);

  const loadData = useCallback(async () => {
    if (!assignmentId) return;
    setLoading(true);
    setError(null);

    const [assignRes, subRes] = await Promise.all([
      apiFetch<AssignmentItem>(`/assignments/${assignmentId}`),
      apiFetch<SubmissionItem>(`/submissions/assignment/${assignmentId}/me`),
    ]);

    if (assignRes.success && assignRes.data) {
      setAssignment(assignRes.data);
    } else {
      setError(assignRes.message || 'Unable to access assignment.');
    }

    if (subRes.success) {
      setSubmission(subRes.data || null);
    }

    setLoading(false);
    setSubmissionLoading(false);
  }, [assignmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute countdown text
  const getCountdown = (dueDateStr?: string) => {
    if (!dueDateStr) return '';
    const now = new Date().getTime();
    const due = new Date(dueDateStr).getTime();
    const diff = due - now;

    if (diff <= 0) return 'Deadline has passed';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}, ${hours} hr${hours > 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}, ${minutes} min${minutes > 1 ? 's' : ''} remaining`;
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  };

  const getStatusBadge = (dynamicStatus?: string) => {
    switch (dynamicStatus) {
      case 'due_soon':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <Clock className="w-3.5 h-3.5" /> Due Soon
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
            <AlertTriangle className="w-3.5 h-3.5" /> Overdue
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Closed
          </span>
        );
      case 'published':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active & Upcoming
          </span>
        );
    }
  };

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Graded
          </span>
        );
      case 'late':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Submitted Late
          </span>
        );
      case 'returned':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
            Returned for Revision
          </span>
        );
      case 'submitted':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
          </span>
        );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setSubmitFeedback({
        type: 'error',
        message: 'File exceeds 15MB limit. Please upload a smaller file.',
      });
      return;
    }

    setSelectedFile(file);
    setSubmitFeedback(null);
  };

  const handleSubmitCoursework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setSubmitFeedback({ type: 'error', message: 'Please select a solution file to submit.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitFeedback(null);

    try {
      const formData = new FormData();
      formData.append('assignmentId', assignmentId);
      formData.append('file', selectedFile);
      if (comment.trim()) {
        formData.append('comment', comment.trim());
      }

      const res = await apiFetch<SubmissionItem>('/submissions', {
        method: 'POST',
        body: formData,
      });

      if (res.success && res.data) {
        setSubmission(res.data);
        setShowResubmitForm(false);
        setSelectedFile(null);
        setComment('');
        setSubmitFeedback({
          type: 'success',
          message: 'Your assignment coursework has been submitted successfully!',
        });
      } else {
        setSubmitFeedback({
          type: 'error',
          message: res.message || 'Failed to submit coursework. Please try again.',
        });
      }
    } catch {
      setSubmitFeedback({
        type: 'error',
        message: 'Network error occurred while submitting coursework.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardShell role="student" title="Assignment Details & Submission">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Back button */}
          <Link
            href="/dashboard/student/assignments"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Coursework List
          </Link>

          {loading ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-xs text-slate-500">Retrieving assignment guidelines...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Coursework Not Accessible
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{error}</p>
              <button
                onClick={() => router.push('/dashboard/student/assignments')}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl"
              >
                Return to Assignments
              </button>
            </div>
          ) : assignment ? (
            <>
              {/* Header Overview Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900/60">
                        {assignment.course?.courseCode}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {assignment.course?.title}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                      {assignment.title}
                    </h1>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {getStatusBadge(assignment.dynamicStatus)}
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      {getCountdown(assignment.dueDate)}
                    </span>
                  </div>
                </div>

                {/* Key Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-slate-400 block font-medium">Submission Deadline</span>
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                      <Calendar className="w-4 h-4 text-brand-600" />
                      {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-slate-400 block font-medium">Maximum Marks</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-sm">
                      <Award className="w-4 h-4 text-amber-500" />
                      {assignment.totalMarks} Points
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-slate-400 block font-medium">Course Instructor</span>
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                      <User className="w-4 h-4 text-brand-600" />
                      {assignment.teacher
                        ? `${assignment.teacher.firstName} ${assignment.teacher.lastName}`
                        : 'Faculty Member'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructions & Requirements */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-600" />
                  <span>Problem Statement & Assignment Instructions</span>
                </h3>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {assignment.description}
                  </p>
                </div>
              </div>

              {/* Attachments Section */}
              {assignment.attachment ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Download className="w-5 h-5 text-brand-600" />
                    <span>Reference Material & Attachments</span>
                  </h3>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Coursework Attachment Document
                        </p>
                        <p className="text-xs text-slate-400 line-clamp-1 max-w-sm">
                          {assignment.attachment}
                        </p>
                      </div>
                    </div>

                    <a
                      href={
                        assignment.attachment.startsWith('http')
                          ? assignment.attachment
                          : `http://localhost:5000${assignment.attachment}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
                    >
                      <span>Open Document</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : null}

              {/* Submission Portal Section */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Your Coursework Submission
                      </h3>
                      <p className="text-xs text-slate-500">
                        Upload and manage your digital coursework deliverables
                      </p>
                    </div>
                  </div>

                  {submission && (
                    <div>{getSubmissionStatusBadge(submission.status)}</div>
                  )}
                </div>

                {submitFeedback && (
                  <div
                    className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
                      submitFeedback.type === 'error'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                    }`}
                  >
                    {submitFeedback.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{submitFeedback.message}</span>
                  </div>
                )}

                {/* If already submitted */}
                {submission && !showResubmitForm ? (
                  <div className="space-y-6">
                    {/* Graded Result Banner */}
                    {submission.status === 'graded' && (
                      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-brand-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-900/60 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                              <Award className="w-4 h-4" /> Instructor Evaluation
                            </span>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                              Marks Awarded: {submission.marks} / {assignment.totalMarks}
                            </h4>
                          </div>

                          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-900/40">
                            {Math.round(((submission.marks || 0) / (assignment.totalMarks || 100)) * 100)}%
                          </div>
                        </div>

                        {submission.feedback && (
                          <div className="pt-3 border-t border-emerald-200/60 dark:border-emerald-900/60">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                              Instructor Feedback & Comments:
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                              {submission.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submission Metadata */}
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                            <File className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                              {submission.fileName || 'Submitted File'}
                            </h5>
                            <p className="text-xs text-slate-400">
                              {submission.fileSize
                                ? `${(submission.fileSize / 1024).toFixed(1)} KB`
                                : 'Uploaded document'}
                            </p>
                          </div>
                        </div>

                        <a
                          href={
                            submission.file.startsWith('http')
                              ? submission.file
                              : `http://localhost:5000${submission.file}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>View Submitted File</span>
                        </a>
                      </div>

                      <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 space-y-1">
                        <div>
                          Turned in on:{' '}
                          <strong className="text-slate-800 dark:text-slate-200">
                            {new Date(submission.submittedAt).toLocaleString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </strong>
                        </div>
                        {submission.comment && (
                          <div>
                            Submission Notes:{' '}
                            <span className="italic text-slate-700 dark:text-slate-300">
                              &quot;{submission.comment}&quot;
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Resubmit button if not graded or student wants revision */}
                    {submission.status !== 'graded' && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowResubmitForm(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Submit Revision / Replace Solution</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Upload Form */
                  <form onSubmit={handleSubmitCoursework} className="space-y-4">
                    {submission && (
                      <div className="flex items-center justify-between pb-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Submitting revised coursework:
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowResubmitForm(false)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Cancel revision
                        </button>
                      </div>
                    )}

                    {/* File Dropzone */}
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 rounded-3xl p-6 sm:p-8 text-center transition-colors bg-slate-50/50 dark:bg-slate-800/30 relative">
                      <input
                        type="file"
                        id="courseworkFile"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.doc,.docx,.zip,.rar,.txt,.png,.jpg,.jpeg,.py,.java,.cpp,.c"
                      />
                      <div className="space-y-2 pointer-events-none">
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        {selectedFile ? (
                          <div>
                            <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                              Selected: {selectedFile.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click to change
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              Choose a file or drag & drop here
                            </p>
                            <p className="text-xs text-slate-400">
                              PDF, DOCX, ZIP, or Code Files (Max 15MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Student notes */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Comments or Notes for Instructor (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add any context, links, or notes regarding your solution..."
                        className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white resize-none"
                      />
                    </div>

                    {/* Turn in button */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-400">
                        {new Date() > new Date(assignment.dueDate) ? (
                          <span className="text-rose-500 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Notice: Submitting past deadline
                          </span>
                        ) : (
                          'Your submission will be timestamped upon upload'
                        )}
                      </span>

                      <button
                        type="submit"
                        disabled={isSubmitting || !selectedFile}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>{submission ? 'Upload Revision' : 'Turn In Assignment'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          ) : null}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

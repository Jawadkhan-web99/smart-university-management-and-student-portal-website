'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { CourseItem } from '../../../../types/university';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Save,
  Send,
  Loader2,
  Users,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface RosterStudent {
  studentUserId: string;
  profileId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  marks: number | null;
  totalMarks: number;
  grade: string | null;
  gradePoint: number | null;
  status: 'draft' | 'published' | null;
  remarks: string;
  resultId: string | null;
}

export default function TeacherResultsPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [semesterId, setSemesterId] = useState('');
  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Local state for edits
  const [gradesInput, setGradesInput] = useState<
    Record<string, { marks: number | string; remarks: string }>
  >({});

  // Centralized Grade calculation preview
  const getGradePreview = (marks: number | string) => {
    const num = Number(marks);
    if (marks === '' || isNaN(num) || num < 0) return { grade: '-', gp: 0 };
    if (num >= 90) return { grade: 'A+', gp: 4.0 };
    if (num >= 85) return { grade: 'A', gp: 4.0 };
    if (num >= 80) return { grade: 'B+', gp: 3.5 };
    if (num >= 75) return { grade: 'B', gp: 3.0 };
    if (num >= 70) return { grade: 'C+', gp: 2.5 };
    if (num >= 65) return { grade: 'C', gp: 2.0 };
    if (num >= 60) return { grade: 'D', gp: 1.5 };
    return { grade: 'F', gp: 0.0 };
  };

  useEffect(() => {
    async function loadMyCourses() {
      setLoading(true);
      const res = await apiFetch<CourseItem[]>('/teachers/my-courses');
      if (res.success && res.data && res.data.length > 0) {
        setCourses(res.data);
        setSelectedCourseId(res.data[0]._id);
      }
      setLoading(false);
    }
    loadMyCourses();
  }, []);

  const loadRoster = useCallback(async () => {
    if (!selectedCourseId) return;
    setRosterLoading(true);
    setSaveMessage('');
    setErrorMessage('');

    const res = await apiFetch<{
      roster: RosterStudent[];
      semesterId: string;
    }>(`/results/course/${selectedCourseId}`);

    if (res.success && res.data) {
      setRoster(res.data.roster || []);
      setSemesterId(res.data.semesterId || '');

      const inputs: Record<string, { marks: number | string; remarks: string }> = {};
      for (const r of res.data.roster) {
        inputs[r.studentUserId] = {
          marks: r.marks !== null ? r.marks : '',
          remarks: r.remarks || '',
        };
      }
      setGradesInput(inputs);
    }
    setRosterLoading(false);
  }, [selectedCourseId]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  const handleMarksChange = (studentUserId: string, value: string) => {
    setGradesInput((prev) => ({
      ...prev,
      [studentUserId]: {
        ...prev[studentUserId],
        marks: value,
      },
    }));
  };

  const handleRemarksChange = (studentUserId: string, value: string) => {
    setGradesInput((prev) => ({
      ...prev,
      [studentUserId]: {
        ...prev[studentUserId],
        remarks: value,
      },
    }));
  };

  const handleSaveResults = async (status: 'draft' | 'published') => {
    if (!selectedCourseId || !semesterId) return;
    setSaving(true);
    setSaveMessage('');
    setErrorMessage('');

    const payload = {
      courseId: selectedCourseId,
      semesterId,
      status,
      results: Object.entries(gradesInput)
        .filter(([_, v]) => v.marks !== '' && !isNaN(Number(v.marks)))
        .map(([studentUserId, v]) => ({
          studentUserId,
          marks: Number(v.marks),
          totalMarks: 100,
          remarks: v.remarks,
        })),
    };

    if (payload.results.length === 0) {
      setErrorMessage('Please enter marks for at least one student before saving.');
      setSaving(false);
      return;
    }

    const res = await apiFetch('/results/batch', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success) {
      setSaveMessage(
        status === 'published'
          ? 'Results published officially to student transcripts.'
          : 'Draft results saved successfully.'
      );
      loadRoster();
    } else {
      setErrorMessage(res.message || 'Failed to save results.');
    }
    setSaving(false);
  };

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardShell role="teacher" title="Academic Grade Entry & Examination">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Semester Grade Entry
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter obtained exam marks (0-100). Grades and quality points are automatically calculated according to university grading policy.
              </p>
            </div>

            {/* Course Selector */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-500 shrink-0">Select Course:</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                disabled={loading || courses.length === 0}
                className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-hidden"
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.courseCode} - {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Feedback alerts */}
          {saveMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Roster Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            {rosterLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-xs text-slate-500">Loading student roster...</p>
              </div>
            ) : roster.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No enrolled students found
                </p>
                <p className="text-xs text-slate-500">
                  Students enrolled in this course will appear here for marks entry.
                </p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-6 py-3.5">Student</th>
                        <th className="px-4 py-3.5">Student ID</th>
                        <th className="px-4 py-3.5">Program</th>
                        <th className="px-4 py-3.5 text-center w-36">Marks (/100)</th>
                        <th className="px-4 py-3.5 text-center">Grade</th>
                        <th className="px-4 py-3.5 text-center">GPA</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {roster.map((st) => {
                        const currentVal = gradesInput[st.studentUserId]?.marks ?? '';
                        const { grade, gp } = getGradePreview(currentVal);

                        return (
                          <tr
                            key={st.studentUserId}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900 dark:text-white">
                                {st.firstName} {st.lastName}
                              </p>
                              <p className="text-[11px] text-slate-400">{st.email}</p>
                            </td>
                            <td className="px-4 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                              {st.studentId}
                            </td>
                            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                              {st.program}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={currentVal}
                                onChange={(e) =>
                                  handleMarksChange(st.studentUserId, e.target.value)
                                }
                                placeholder="0 - 100"
                                className="w-24 text-center font-mono font-bold px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-md font-black text-xs ${
                                  grade.startsWith('A')
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                    : grade.startsWith('B')
                                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                    : grade.startsWith('C')
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                    : grade === '-'
                                    ? 'text-slate-400'
                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                }`}
                              >
                                {grade}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                              {currentVal !== '' ? gp.toFixed(2) : '-'}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                                  st.status === 'published'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                    : st.status === 'draft'
                                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                    : 'text-slate-400'
                                }`}
                              >
                                {st.status || 'Not saved'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={gradesInput[st.studentUserId]?.remarks || ''}
                                onChange={(e) =>
                                  handleRemarksChange(st.studentUserId, e.target.value)
                                }
                                placeholder="Optional remarks"
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 outline-hidden"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer Submit Buttons */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Saving as draft allows further modifications prior to publishing.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveResults('draft')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Save Draft</span>
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveResults('published')}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Publish Results</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

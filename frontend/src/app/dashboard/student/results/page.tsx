'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { useAuth } from '../../../../context/AuthContext';
import { StudentResultsSummary } from '../../../../types/university';
import { jsPDF } from 'jspdf';
import {
  Award,
  BookOpen,
  Calendar,
  Download,
  GraduationCap,
  Loader2,
  TrendingUp,
  FileCheck2,
  AlertCircle,
  Clock,
  Sparkles,
  Printer,
  ChevronDown,
} from 'lucide-react';

export default function StudentResultsPage() {
  const { user } = useAuth();
  const [resultsData, setResultsData] = useState<StudentResultsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<StudentResultsSummary>('/results/student/me');
    if (res.success && res.data) {
      setResultsData(res.data);
    } else {
      setError(res.message || 'Unable to retrieve academic transcript.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const getStandingText = (cgpa: number) => {
    if (cgpa >= 3.8) return "Chancellor's Honor List";
    if (cgpa >= 3.5) return "Dean's Honor List";
    if (cgpa >= 3.0) return 'First Division / Good Standing';
    if (cgpa >= 2.0) return 'Satisfactory Standing';
    return 'Academic Warning / Probation';
  };

  const getGradeBadge = (grade: string) => {
    const g = grade.toUpperCase();
    if (g.startsWith('A')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
          {grade}
        </span>
      );
    }
    if (g.startsWith('B')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
          {grade}
        </span>
      );
    }
    if (g.startsWith('C')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
          {grade}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
        {grade}
      </span>
    );
  };

  const handleDownloadPDF = () => {
    if (!resultsData) return;
    setDownloadingPdf(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 18;

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 38, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('SMART UNIVERSITY MANAGEMENT SYSTEM', pageWidth / 2, y, { align: 'center' });

      y += 7;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL ACADEMIC TRANSCRIPT & MARKSHEET', pageWidth / 2, y, { align: 'center' });

      y += 6;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('Office of the Controller of Examinations', pageWidth / 2, y, { align: 'center' });

      y = 48;
      // Student Details Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, 'FD');

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`Student Name: ${user?.firstName || ''} ${user?.lastName || ''}`, 20, y + 8);
      doc.text(`Email Address: ${user?.email || 'N/A'}`, 20, y + 15);
      doc.text(`Academic Standing: ${getStandingText(resultsData.cgpa)}`, 20, y + 22);

      const issueDate = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      doc.text(`Date of Issue: ${issueDate}`, pageWidth - 70, y + 8);
      doc.text(`Total Credits: ${resultsData.totalCredits}`, pageWidth - 70, y + 15);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235); // brand blue
      doc.text(`Cumulative CGPA: ${resultsData.cgpa.toFixed(2)} / 4.00`, pageWidth - 70, y + 22);

      y += 34;

      // Semesters list
      if (!resultsData.semesters || resultsData.semesters.length === 0) {
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(10);
        doc.text('No published course examination results found.', 20, y + 10);
      } else {
        for (const sem of resultsData.semesters) {
          // Check page overflow
          if (y > 240) {
            doc.addPage();
            y = 20;
          }

          // Semester Heading
          doc.setFillColor(241, 245, 249);
          doc.setDrawColor(203, 213, 225);
          doc.rect(14, y, pageWidth - 28, 8, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          const semTitle = `${sem.semester.name || 'Semester'} (${sem.semester.academicYear || ''})`;
          doc.text(semTitle, 18, y + 5.5);

          const semMeta = `GPA: ${sem.gpa.toFixed(2)}  |  Credits: ${sem.totalCredits}  |  QP: ${sem.qualityPoints.toFixed(2)}`;
          doc.text(semMeta, pageWidth - 20, y + 5.5, { align: 'right' });

          y += 8;

          // Table Header
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, pageWidth - 28, 6, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);

          doc.text('Code', 18, y + 4.2);
          doc.text('Course Title', 42, y + 4.2);
          doc.text('Cr.Hr', 120, y + 4.2, { align: 'center' });
          doc.text('Marks', 140, y + 4.2, { align: 'center' });
          doc.text('Grade', 160, y + 4.2, { align: 'center' });
          doc.text('Points', 182, y + 4.2, { align: 'center' });

          y += 6;

          // Course Rows
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);

          for (const course of sem.courses) {
            if (y > 270) {
              doc.addPage();
              y = 20;
            }

            doc.setDrawColor(241, 245, 249);
            doc.line(14, y, pageWidth - 14, y);

            doc.text(course.courseCode || 'N/A', 18, y + 4.5);
            doc.text((course.title || 'N/A').substring(0, 42), 42, y + 4.5);
            doc.text(String(course.creditHours || 3), 120, y + 4.5, { align: 'center' });
            doc.text(`${course.marks}/${course.totalMarks}`, 140, y + 4.5, { align: 'center' });
            doc.text(course.grade || '-', 160, y + 4.5, { align: 'center' });
            doc.text(course.gradePoint.toFixed(2), 182, y + 4.5, { align: 'center' });

            y += 6;
          }

          y += 6;
        }
      }

      // Check bottom space for signature footer
      if (y > 235) {
        doc.addPage();
        y = 20;
      }

      y += 10;
      // Grading Scale Legend & Signatures
      doc.setDrawColor(226, 232, 240);
      doc.line(14, y, pageWidth - 14, y);
      y += 6;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'Grading Scale: A (85-100%, 4.00) | A- (80-84%, 3.67) | B+ (75-79%, 3.33) | B (70-74%, 3.00) | B- (65-69%, 2.67) | C+ (60-64%, 2.33) | C (55-59%, 2.00) | F (<50%, 0.00)',
        14,
        y
      );

      y += 18;
      // Signature boxes
      doc.line(20, y, 70, y);
      doc.line(pageWidth - 70, y, pageWidth - 20, y);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('Prepared By: Academic Office', 20, y + 4);
      doc.text('Controller of Examinations', pageWidth - 70, y + 4);

      // Save PDF
      const fileName = `${user?.firstName || 'Student'}_${user?.lastName || 'Transcript'}_Official_Marksheet.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('Error creating PDF:', err);
      alert('Failed to generate PDF marksheet. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardShell role="student" title="Academic Results & Transcript">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Top Title & Download Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-7 h-7 text-amber-500" />
                Examination Results & Marksheet
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Verified semester grades, quality points, and certified marksheet download
              </p>
            </div>

            {resultsData && resultsData.semesters.length > 0 && (
              <button
                onClick={handleDownloadPDF}
                disabled={downloadingPdf}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm self-start sm:self-auto"
              >
                {downloadingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download Marksheet (PDF)</span>
              </button>
            )}
          </div>

          {/* Loading / Error States */}
          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-xs text-slate-500">Retrieving official academic results...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-md mx-auto space-y-4">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Unable to Load Transcript
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{error}</p>
              <button
                onClick={loadResults}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl"
              >
                Try Again
              </button>
            </div>
          ) : resultsData ? (
            <>
              {/* Standings Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg space-y-2 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-15">
                    <GraduationCap className="w-32 h-32" />
                  </div>
                  <span className="text-xs font-medium text-brand-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Cumulative CGPA
                  </span>
                  <div className="text-3xl sm:text-4xl font-black">
                    {resultsData.cgpa.toFixed(2)}
                    <span className="text-base font-normal text-brand-200"> / 4.00</span>
                  </div>
                  <p className="text-xs text-brand-100 pt-1 font-medium">
                    {getStandingText(resultsData.cgpa)}
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                  <span className="text-xs font-semibold text-slate-400 block">Total Credits Earned</span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                    {resultsData.totalCredits}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Graduation requirement progress
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                  <span className="text-xs font-semibold text-slate-400 block">Completed Courses</span>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                    {resultsData.totalCompletedCourses}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Officially graded & published subjects
                  </p>
                </div>
              </div>

              {/* Semesters Results Breakdown */}
              {resultsData.semesters.length === 0 ? (
                <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    No Published Results Yet
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Your semester examination marks and final grades will appear here once submitted by
                    your professors and published by the administration.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {resultsData.semesters.map((sem, idx) => (
                    <div
                      key={sem.semester?._id || idx}
                      className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
                    >
                      {/* Semester Header */}
                      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-brand-600" />
                            {sem.semester?.name || `Semester ${idx + 1}`}
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Academic Year: {sem.semester?.academicYear || 'Current'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                            <span className="text-slate-400 mr-1.5">Credits:</span>
                            <strong className="text-slate-900 dark:text-white">
                              {sem.totalCredits}
                            </strong>
                          </div>

                          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                            <span className="text-slate-400 mr-1.5">Quality Points:</span>
                            <strong className="text-slate-900 dark:text-white">
                              {sem.qualityPoints.toFixed(2)}
                            </strong>
                          </div>

                          <div className="px-3.5 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-xs font-bold text-brand-700 dark:text-brand-300">
                            <span>Semester GPA: </span>
                            <span className="text-sm">{sem.gpa.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Course Results Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/30 dark:bg-slate-800/20">
                              <th className="py-3 px-6">Course</th>
                              <th className="py-3 px-6 text-center">Credit Hours</th>
                              <th className="py-3 px-6 text-center">Marks</th>
                              <th className="py-3 px-6 text-center">Letter Grade</th>
                              <th className="py-3 px-6 text-center">Grade Point</th>
                              <th className="py-3 px-6">Remarks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                            {sem.courses.map((c) => (
                              <tr
                                key={c.resultId}
                                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                              >
                                <td className="py-3.5 px-6">
                                  <div className="flex items-center gap-2.5">
                                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                      {c.courseCode}
                                    </span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                      {c.title}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-6 text-center text-slate-600 dark:text-slate-400">
                                  {c.creditHours}
                                </td>
                                <td className="py-3.5 px-6 text-center text-slate-900 dark:text-white font-semibold">
                                  {c.marks} / {c.totalMarks}
                                </td>
                                <td className="py-3.5 px-6 text-center">
                                  {getGradeBadge(c.grade)}
                                </td>
                                <td className="py-3.5 px-6 text-center font-bold text-slate-900 dark:text-white">
                                  {c.gradePoint.toFixed(2)}
                                </td>
                                <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400">
                                  {c.remarks || 'Normal'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

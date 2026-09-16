'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { AssignmentItem, CourseItem } from '../../../../types/university';
import {
  FileText,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Award,
  AlertCircle,
  Loader2,
  ArrowRight,
  Inbox,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface AssignmentsResponse {
  assignments: AssignmentItem[];
  total: number;
  page: number;
  totalPages: number;
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Load student's courses for filter
  useEffect(() => {
    async function loadCourses() {
      const res = await apiFetch<CourseItem[]>('/courses?isActive=true');
      if (res.success && res.data) {
        setCourses(res.data);
      }
    }
    loadCourses();
  }, []);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      limit: '50',
    });
    if (selectedCourse) query.set('courseId', selectedCourse);
    if (search) query.set('search', search);

    const res = await apiFetch<AssignmentsResponse>(`/assignments?${query.toString()}`);
    if (res.success && res.data) {
      setAssignments(res.data.assignments);
    }
    setLoading(false);
  }, [selectedCourse, search]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Client-side filtering for dynamic status
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (selectedStatus === 'all') return true;
      if (selectedStatus === 'upcoming') return a.dynamicStatus === 'published';
      if (selectedStatus === 'due_soon') return a.dynamicStatus === 'due_soon';
      if (selectedStatus === 'overdue') return a.dynamicStatus === 'overdue';
      if (selectedStatus === 'closed') return a.dynamicStatus === 'closed';
      return true;
    });
  }, [assignments, selectedStatus]);

  const getStatusBadge = (dynamicStatus?: string) => {
    switch (dynamicStatus) {
      case 'due_soon':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 animate-pulse">
            <Clock className="w-3 h-3" /> Due Soon
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
            <AlertTriangle className="w-3 h-3" /> Overdue
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Closed
          </span>
        );
      case 'published':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3" /> Upcoming
          </span>
        );
    }
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardShell role="student" title="Assignments & Coursework">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-7 h-7 text-brand-600 dark:text-brand-400" />
                Coursework & Homework Assignments
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                View required problem sets, submission instructions, and upcoming deadlines for your enrolled courses
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search coursework by title..."
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="">All Enrolled Courses</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.courseCode} – {c.title}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="all">All Deadlines</option>
                <option value="upcoming">Upcoming</option>
                <option value="due_soon">Due Soon (&le; 48 hrs)</option>
                <option value="overdue">Overdue</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Assignments Grid */}
          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-xs text-slate-500">Loading your coursework assignments...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
              <div className="w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                No assignments found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {search || selectedCourse || selectedStatus !== 'all'
                  ? 'No assignments match your search or status filters.'
                  : 'Your course instructors have not posted any assignments yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredAssignments.map((assignment) => {
                const dueDateObj = new Date(assignment.dueDate);
                const isPast = new Date() > dueDateObj;

                return (
                  <div
                    key={assignment._id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top bar with Course & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900/60">
                          {assignment.course?.courseCode}
                        </span>
                        {getStatusBadge(assignment.dynamicStatus)}
                      </div>

                      <h2 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                        {assignment.title}
                      </h2>
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-2 line-clamp-1">
                        {assignment.course?.title}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {assignment.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Due: {dueDateObj.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          {assignment.totalMarks} Points
                        </span>
                      </div>

                      {assignment.teacher && (
                        <p className="text-[11px] text-slate-400">
                          Instructor: {assignment.teacher.firstName} {assignment.teacher.lastName}
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                      <Link
                        href={`/dashboard/student/assignments/${assignment._id}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
                      >
                        <span>View Instructions & Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../components/dashboard/DashboardShell';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../utils/api';
import {
  StudentProfileData,
  AttendanceSummaryData,
  CourseItem,
} from '../../../types/university';
import {
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  Calendar,
  ArrowRight,
  Loader2,
  Clock,
  Sparkles,
  Inbox,
  User as UserIcon,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummaryData | null>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentData() {
      setLoading(true);
      try {
        const [profileRes, attendanceRes, coursesRes] = await Promise.all([
          apiFetch<StudentProfileData>('/students/me'),
          apiFetch<AttendanceSummaryData>('/attendance/me'),
          apiFetch<CourseItem[]>('/courses?isActive=true'),
        ]);

        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data);
        }
        if (attendanceRes.success && attendanceRes.data) {
          setAttendance(attendanceRes.data);
        }
        if (coursesRes.success && coursesRes.data) {
          setCourses(coursesRes.data);
        }
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStudentData();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardShell role="student" title="Student Dashboard">
        {loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            <p className="text-xs text-slate-500">Loading student records...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. Welcome Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-navy-900 text-white p-6 sm:p-8 shadow-xl">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Academic Portal Active</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Welcome, {user?.fullName || 'Student'}!
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-brand-100">
                    <span>
                      <strong>Student ID:</strong> {profile?.studentId || 'Pending Assignment'}
                    </span>
                    <span>&bull;</span>
                    <span>
                      <strong>Program:</strong> {profile?.program || 'BS Computer Science'}
                    </span>
                    <span>&bull;</span>
                    <span>
                      <strong>Current Semester:</strong>{' '}
                      {profile?.semester?.name || 'Fall 2026'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard/student/profile"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-brand-950 bg-white hover:bg-brand-50 shadow-md transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Link>

                  <Link
                    href="/dashboard/student/courses"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-sm transition-colors"
                  >
                    <span>View Courses</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Stat 1: Current Courses */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Current Courses
                  </span>
                  <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {courses.length > 0 ? courses.length : '0'}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {courses.length > 0
                    ? `${courses.reduce((acc, c) => acc + c.creditHours, 0)} Total Credit Hours`
                    : 'No registered courses'}
                </p>
              </div>

              {/* Stat 2: Attendance */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Attendance</span>
                  <CalendarCheck className="w-4 h-4 text-emerald-500" />
                </div>
                {attendance && attendance.totalSessions > 0 ? (
                  <>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {attendance.overallPercentage}%
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                      {attendance.presentCount} Present &bull; {attendance.absentCount} Absent
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-bold text-slate-400 dark:text-slate-500">
                      No Records
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Attendance not yet recorded</p>
                  </>
                )}
              </div>

              {/* Stat 3: Current Semester */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Current Semester
                  </span>
                  <Calendar className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white truncate">
                  {profile?.semester?.name || 'Fall 2026'}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Academic Year: {profile?.semester?.academicYear || '2026-2027'}
                </p>
              </div>

              {/* Stat 4: Academic Status */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Enrollment Status
                  </span>
                  <Award className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white capitalize">
                  {profile?.enrollmentStatus || 'Active'}
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  In Good Academic Standing
                </p>
              </div>
            </div>

            {/* 3. Enrolled Courses Preview */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Enrolled Courses
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Courses active for your curriculum this semester
                  </p>
                </div>

                <Link
                  href="/dashboard/student/courses"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <span>View All Courses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {courses.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
                  <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No active courses assigned
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Contact the academic advisor or department head for semester enrollment.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.slice(0, 4).map((course) => (
                    <div
                      key={course._id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-md border border-brand-100 dark:border-brand-900/60">
                            {course.courseCode}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {course.creditHours} Credit Hours
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {course.title}
                        </h4>
                        {course.description && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {course.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          Dept:{' '}
                          {typeof course.department === 'object'
                            ? course.department.code
                            : 'N/A'}
                        </span>
                        <span>
                          Teacher:{' '}
                          {typeof course.teacher === 'object' && course.teacher
                            ? `${course.teacher.firstName} ${course.teacher.lastName}`
                            : 'To be assigned'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}

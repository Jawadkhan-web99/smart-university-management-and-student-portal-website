'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { CourseItem, DepartmentItem, SemesterItem } from '../../../../types/university';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  Building,
  Calendar,
  Clock,
  Inbox,
} from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');

  // Modal & Edit states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCredits, setFormCredits] = useState(3);
  const [formDept, setFormDept] = useState('');
  const [formSem, setFormSem] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    const [courseRes, deptRes, semRes] = await Promise.all([
      apiFetch<CourseItem[]>('/courses'),
      apiFetch<DepartmentItem[]>('/departments'),
      apiFetch<SemesterItem[]>('/semesters'),
    ]);

    if (courseRes.success && courseRes.data) setCourses(courseRes.data);
    if (deptRes.success && deptRes.data) setDepartments(deptRes.data);
    if (semRes.success && semRes.data) setSemesters(semRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormCode('');
    setFormTitle('');
    setFormDesc('');
    setFormCredits(3);
    setFormDept(departments.length > 0 ? departments[0]._id : '');
    setFormSem(semesters.length > 0 ? semesters[0]._id : '');
    setFormIsActive(true);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (course: CourseItem) => {
    setEditingCourse(course);
    setFormCode(course.courseCode);
    setFormTitle(course.title);
    setFormDesc(course.description || '');
    setFormCredits(course.creditHours);
    setFormDept(
      typeof course.department === 'object' ? course.department._id : course.department
    );
    setFormSem(
      typeof course.semester === 'object' && course.semester
        ? course.semester._id
        : (course.semester as string) || ''
    );
    setFormIsActive(course.isActive);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formTitle.trim() || !formDept) {
      setErrorMessage('Course Code, Title, and Department are required.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const payload = {
      courseCode: formCode.trim().toUpperCase(),
      title: formTitle.trim(),
      description: formDesc.trim(),
      creditHours: Number(formCredits),
      department: formDept,
      semester: formSem || null,
      isActive: formIsActive,
    };

    let res;
    if (editingCourse) {
      res = await apiFetch<CourseItem>(`/courses/${editingCourse._id}`, {
        method: 'PUT',
        data: payload,
      });
    } else {
      res = await apiFetch<CourseItem>('/courses', {
        method: 'POST',
        data: payload,
      });
    }

    if (res.success) {
      setSuccessMessage(
        editingCourse ? 'Course updated successfully.' : 'New course created successfully.'
      );
      setModalOpen(false);
      await loadAll();
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(res.message || 'Operation failed.');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await apiFetch(`/courses/${id}`, {
      method: 'DELETE',
    });

    if (res.success) {
      setSuccessMessage('Course deleted successfully.');
      setDeleteId(null);
      await loadAll();
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(res.message || 'Failed to delete course.');
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (course: CourseItem) => {
    const res = await apiFetch<CourseItem>(`/courses/${course._id}`, {
      method: 'PUT',
      data: { isActive: !course.isActive },
    });

    if (res.success) {
      await loadAll();
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

      const deptId =
        typeof c.department === 'object' ? c.department._id : c.department;
      const matchesDept = selectedDept ? deptId === selectedDept : true;

      const semId =
        typeof c.semester === 'object' && c.semester ? c.semester._id : c.semester;
      const matchesSem = selectedSem ? semId === selectedSem : true;

      return matchesSearch && matchesDept && matchesSem;
    });
  }, [courses, searchTerm, selectedDept, selectedSem]);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardShell role="admin" title="Course Curriculum Management">
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Course Catalog Management
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Configure syllabus units, allocate credit hours, and assign academic departments
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] shadow-md transition-all w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Course</span>
            </button>
          </div>

          {/* Feedback Banners */}
          {successMessage && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Search & Filter */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses by code or title (e.g., CS-401)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="w-full md:w-56">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-48">
              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">All Semesters</option>
                {semesters.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Courses Table */}
          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
              <p className="text-xs text-slate-500">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
              <Inbox className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No courses found
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Add courses using the button above to begin populating academic schedules.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-6 font-semibold">Code</th>
                      <th className="py-3.5 px-6 font-semibold">Course Title</th>
                      <th className="py-3.5 px-6 font-semibold">Department</th>
                      <th className="py-3.5 px-6 font-semibold">Semester</th>
                      <th className="py-3.5 px-6 font-semibold text-center">Credits</th>
                      <th className="py-3.5 px-6 font-semibold text-center">Status</th>
                      <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredCourses.map((course) => {
                      const deptCode =
                        typeof course.department === 'object' && course.department
                          ? course.department.code
                          : 'N/A';
                      const semName =
                        typeof course.semester === 'object' && course.semester
                          ? course.semester.name
                          : 'Open';

                      return (
                        <tr key={course._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-4 px-6 font-bold text-rose-600 dark:text-rose-400">
                            {course.courseCode}
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                            <div>{course.title}</div>
                            {course.description && (
                              <div className="text-xs font-normal text-slate-400 line-clamp-1">
                                {course.description}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                            {deptCode}
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                            {semName}
                          </td>
                          <td className="py-4 px-6 text-center font-bold text-slate-800 dark:text-slate-200">
                            {course.creditHours}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(course)}
                              title="Click to toggle status"
                              className="inline-flex items-center gap-1 text-xs font-semibold"
                            >
                              {course.isActive ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                  <CheckCircle2 className="w-3 h-3" /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                  <XCircle className="w-3 h-3" /> Inactive
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(course)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Edit Course"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteId(course._id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Delete Course"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Create / Edit Modal */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingCourse ? 'Update Course' : 'Create New Course'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1">
                        Course Code (e.g. CS-401) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formCode}
                        onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                        placeholder="CS-401"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:outline-none uppercase"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Credit Hours (1-6)</label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        required
                        value={formCredits}
                        onChange={(e) => setFormCredits(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">
                      Course Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Advanced Distributed Systems"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1">
                        Department <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={formDept}
                        onChange={(e) => setFormDept(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      >
                        <option value="">Select Department</option>
                        {departments.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.code} - {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Semester Cycle</label>
                      <select
                        value={formSem}
                        onChange={(e) => setFormSem(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      >
                        <option value="">Open / Unassigned</option>
                        {semesters.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({s.academicYear})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Description / Syllabus Overview</label>
                    <textarea
                      rows={3}
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Course learning outcomes and syllabus summary..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      id="courseIsActive"
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <label htmlFor="courseIsActive" className="font-semibold cursor-pointer">
                      Active Course Offering
                    </label>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] transition-all disabled:opacity-60 shadow-md"
                    >
                      {saving ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4 animate-in zoom-in-95 duration-150 text-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Confirm Course Deletion
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you wish to delete this course from the university catalog? This
                  action cannot be reversed.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteId(null)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(deleteId)}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md"
                  >
                    Delete Course
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

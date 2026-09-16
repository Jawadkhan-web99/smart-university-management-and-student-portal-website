'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { SemesterItem } from '../../../../types/university';
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  Inbox,
  Clock,
} from 'lucide-react';

export default function AdminSemestersPage() {
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSem, setEditingSem] = useState<SemesterItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSemesterNumber, setFormSemesterNumber] = useState<number>(1);
  const [formAcademicYear, setFormAcademicYear] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSemesters = async () => {
    setLoading(true);
    const res = await apiFetch<SemesterItem[]>('/semesters');
    if (res.success && res.data) {
      setSemesters(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSemesters();
  }, []);

  const openCreateModal = () => {
    setEditingSem(null);
    setFormName('');
    setFormSemesterNumber(1);
    setFormAcademicYear(new Date().getFullYear() + '-' + (new Date().getFullYear() + 1));
    setFormStartDate(new Date().toISOString().split('T')[0]);
    // 4 months later default
    const fourMonths = new Date();
    fourMonths.setMonth(fourMonths.getMonth() + 4);
    setFormEndDate(fourMonths.toISOString().split('T')[0]);
    setFormIsActive(true);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (sem: SemesterItem) => {
    setEditingSem(sem);
    setFormName(sem.name);
    setFormSemesterNumber(sem.semesterNumber);
    setFormAcademicYear(sem.academicYear);
    setFormStartDate(sem.startDate ? new Date(sem.startDate).toISOString().split('T')[0] : '');
    setFormEndDate(sem.endDate ? new Date(sem.endDate).toISOString().split('T')[0] : '');
    setFormIsActive(sem.isActive);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAcademicYear.trim() || !formStartDate || !formEndDate) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (new Date(formStartDate) >= new Date(formEndDate)) {
      setErrorMessage('End date must be after start date.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const payload = {
      name: formName.trim(),
      semesterNumber: Number(formSemesterNumber),
      academicYear: formAcademicYear.trim(),
      startDate: formStartDate,
      endDate: formEndDate,
      isActive: formIsActive,
    };

    let res;
    if (editingSem) {
      res = await apiFetch<SemesterItem>(`/semesters/${editingSem._id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      res = await apiFetch<SemesterItem>('/semesters', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);

    if (res.success) {
      setSuccessMessage(
        editingSem ? 'Semester updated successfully.' : 'Semester created successfully.'
      );
      setModalOpen(false);
      loadSemesters();
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage(res.message || 'Failed to save semester');
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    const res = await apiFetch(`/semesters/${id}`, {
      method: 'DELETE',
    });
    setSaving(false);
    setDeleteId(null);

    if (res.success) {
      setSuccessMessage('Semester deleted successfully.');
      loadSemesters();
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage(res.message || 'Failed to delete semester');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const filteredSemesters = useMemo(() => {
    return semesters.filter((sem) => {
      const matchSearch =
        sem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sem.academicYear.toLowerCase().includes(searchTerm.toLowerCase());
      const matchActive =
        activeFilter === '' ? true : activeFilter === 'active' ? sem.isActive : !sem.isActive;
      return matchSearch && matchActive;
    });
  }, [semesters, searchTerm, activeFilter]);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardShell role="admin" title="Academic Semesters">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                Semesters Management
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Configure academic periods, semesters timeline, and terms
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              Add Semester
            </button>
          </div>

          {/* Alert notifications */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Filter and Search Bar */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by semester name or academic year..."
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-gray-200 font-medium"
              >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Semesters Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                <p className="text-sm">Loading semesters...</p>
              </div>
            ) : filteredSemesters.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mb-3">
                  <Inbox className="w-7 h-7" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  No semesters found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4">
                  {searchTerm || activeFilter
                    ? 'Try clearing your search query or filters.'
                    : 'Get started by configuring your first academic semester.'}
                </p>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
                >
                  Create Semester
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/75 dark:bg-gray-900/30 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      <th className="py-3.5 px-4 sm:px-6">Semester Name</th>
                      <th className="py-3.5 px-4">Level / Number</th>
                      <th className="py-3.5 px-4">Academic Year</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40 text-sm">
                    {filteredSemesters.map((sem) => {
                      const startStr = sem.startDate
                        ? new Date(sem.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'N/A';
                      const endStr = sem.endDate
                        ? new Date(sem.endDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'N/A';

                      return (
                        <tr
                          key={sem._id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition-colors"
                        >
                          <td className="py-4 px-4 sm:px-6 font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <span>{sem.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-medium">
                            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              Semester {sem.semesterNumber}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-300 font-medium">
                            {sem.academicYear}
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-xs">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>
                                {startStr} – {endStr}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {sem.isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                <XCircle className="w-3.5 h-3.5" />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(sem)}
                                title="Edit Semester"
                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteId(sem._id)}
                                title="Delete Semester"
                                className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
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
            )}
          </div>

          {/* CREATE / EDIT MODAL */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    {editingSem ? 'Edit Semester' : 'Create New Semester'}
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Semester Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fall 2026 or Spring 2027"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        Semester Number (1-12) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        required
                        value={formSemesterNumber}
                        onChange={(e) => setFormSemesterNumber(parseInt(e.target.value) || 1)}
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        Academic Year *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2026-2027"
                        value={formAcademicYear}
                        onChange={(e) => setFormAcademicYear(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        End Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsActive}
                        onChange={(e) => setFormIsActive(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-700"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mark as Active Academic Term
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      {editingSem ? 'Update Semester' : 'Create Semester'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* DELETE CONFIRMATION MODAL */}
          {deleteId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Delete Academic Semester?
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Are you sure you want to delete this semester? If any courses are linked to it, deletion will be blocked to maintain data integrity.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setDeleteId(null)}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteId)}
                    disabled={saving}
                    className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Confirm Delete
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

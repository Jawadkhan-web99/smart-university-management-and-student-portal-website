'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { DepartmentItem } from '../../../../types/university';
import {
  Building,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  ToggleLeft,
  ToggleRight,
  Inbox,
} from 'lucide-react';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formHod, setFormHod] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDepartments = async () => {
    setLoading(true);
    const res = await apiFetch<DepartmentItem[]>('/departments');
    if (res.success && res.data) {
      setDepartments(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setFormName('');
    setFormCode('');
    setFormDescription('');
    setFormHod('');
    setFormIsActive(true);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (dept: DepartmentItem) => {
    setEditingDept(dept);
    setFormName(dept.name);
    setFormCode(dept.code);
    setFormDescription(dept.description || '');
    setFormHod(dept.headOfDepartment || '');
    setFormIsActive(dept.isActive);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      setErrorMessage('Name and Code are required.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const payload = {
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      description: formDescription.trim(),
      headOfDepartment: formHod.trim(),
      isActive: formIsActive,
    };

    let res;
    if (editingDept) {
      res = await apiFetch<DepartmentItem>(`/departments/${editingDept._id}`, {
        method: 'PUT',
        data: payload,
      });
    } else {
      res = await apiFetch<DepartmentItem>('/departments', {
        method: 'POST',
        data: payload,
      });
    }

    if (res.success) {
      setSuccessMessage(
        editingDept
          ? 'Department updated successfully.'
          : 'New department created successfully.'
      );
      setModalOpen(false);
      await loadDepartments();
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(res.message || 'Operation failed.');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await apiFetch(`/departments/${id}`, {
      method: 'DELETE',
    });

    if (res.success) {
      setSuccessMessage('Department deleted successfully.');
      setDeleteId(null);
      await loadDepartments();
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(res.message || 'Failed to delete department.');
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (dept: DepartmentItem) => {
    const res = await apiFetch<DepartmentItem>(`/departments/${dept._id}`, {
      method: 'PUT',
      data: { isActive: !dept.isActive },
    });

    if (res.success) {
      await loadDepartments();
    }
  };

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesActive =
        activeFilter === '' ? true : d.isActive === (activeFilter === 'true');

      return matchesSearch && matchesActive;
    });
  }, [departments, searchTerm, activeFilter]);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardShell role="admin" title="Department Management">
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Academic Departments
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Create, update, activate, and manage institutional departments
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] shadow-md transition-all w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
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
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search departments by name or code (e.g., DCS)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="w-full sm:w-48">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">All Statuses</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Departments Table */}
          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
              <p className="text-xs text-slate-500">Loading departments...</p>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
              <Inbox className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No departments found
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Create a department using the button above to begin organizing academic faculties.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-6 font-semibold">Code</th>
                      <th className="py-3.5 px-6 font-semibold">Department Name</th>
                      <th className="py-3.5 px-6 font-semibold">Head of Department</th>
                      <th className="py-3.5 px-6 font-semibold text-center">Status</th>
                      <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredDepartments.map((dept) => (
                      <tr key={dept._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-4 px-6 font-bold text-rose-600 dark:text-rose-400">
                          {dept.code}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                          <div>{dept.name}</div>
                          {dept.description && (
                            <div className="text-xs font-normal text-slate-400 line-clamp-1">
                              {dept.description}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                          {dept.headOfDepartment || 'To be nominated'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(dept)}
                            title="Click to toggle status"
                            className="inline-flex items-center gap-1 text-xs font-semibold"
                          >
                            {dept.isActive ? (
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
                              onClick={() => openEditModal(dept)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Department"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteId(dept._id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete Department"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                    {editingDept ? 'Update Department' : 'Create New Department'}
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
                  <div>
                    <label className="block font-semibold mb-1">
                      Department Code (e.g., DCS) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                      placeholder="DCS"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">
                      Department Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Department of Computer Science"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Head of Department (HoD)</label>
                    <input
                      type="text"
                      value={formHod}
                      onChange={(e) => setFormHod(e.target.value)}
                      placeholder="Dr. John Doe, Ph.D."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Description / Mandate</label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Brief summary of department focus..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      id="formIsActive"
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <label htmlFor="formIsActive" className="font-semibold cursor-pointer">
                      Active Department Status
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
                      {saving ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
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
                  Confirm Department Deletion
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you wish to delete this department? This action is permanent. If
                  any active courses are linked to it, deletion will be rejected.
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
                    Delete Department
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

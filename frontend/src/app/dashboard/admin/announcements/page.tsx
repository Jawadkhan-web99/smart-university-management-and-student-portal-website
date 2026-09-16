'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { AnnouncementItem, DepartmentItem } from '../../../../types/university';
import {
  Megaphone,
  Plus,
  Search,
  Trash2,
  Eye,
  Loader2,
  Calendar,
  Users,
  Building,
  X,
  AlertCircle,
} from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewItem, setViewItem] = useState<AnnouncementItem | null>(null);

  // Create form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    audience: 'all' as 'all' | 'students' | 'teachers' | 'department',
    department: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      limit: '30',
      ...(search ? { search } : {}),
      ...(categoryFilter ? { category: categoryFilter } : {}),
      ...(audienceFilter ? { audience: audienceFilter } : {}),
    });

    const res = await apiFetch<{
      announcements: AnnouncementItem[];
    }>(`/announcements?${query.toString()}`);

    if (res.success && res.data) {
      setAnnouncements(res.data.announcements || []);
    }
    setLoading(false);
  }, [search, categoryFilter, audienceFilter]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  useEffect(() => {
    async function loadDepts() {
      const res = await apiFetch<DepartmentItem[]>('/departments');
      if (res.success && res.data) setDepartments(res.data);
    }
    loadDepts();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    const res = await apiFetch('/announcements', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (res.success) {
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'General',
        audience: 'all',
        department: '',
      });
      loadAnnouncements();
    } else {
      setFormError(res.message || 'Failed to create announcement');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campus announcement?')) return;
    const res = await apiFetch(`/announcements/${id}`, { method: 'DELETE' });
    if (res.success) {
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardShell role="admin" title="Campus Broadcast Announcements">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Campus Announcements
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  {announcements.length} Published
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Broadcast institutional circulars, academic notices, and targeted memos to university portals.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setFormError('');
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast Announcement</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search circulars by keyword..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 outline-hidden"
              >
                <option value="">All Categories</option>
                <option value="General">General</option>
                <option value="Academic">Academic</option>
                <option value="Examination">Examination</option>
                <option value="Holiday">Holiday</option>
                <option value="Admissions">Admissions</option>
              </select>

              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 outline-hidden"
              >
                <option value="">All Audiences</option>
                <option value="all">Everyone</option>
                <option value="students">Students Only</option>
                <option value="teachers">Faculty Only</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-xs text-slate-500">Loading campus announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <Megaphone className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No announcements found
              </p>
              <p className="text-xs text-slate-500">
                Click &quot;Broadcast Announcement&quot; to publish a new circular.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {announcements.map((a) => (
                <div
                  key={a._id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                        {a.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(a.publishDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {a.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {a.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="capitalize">{a.audience}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewItem(a)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Read full circular"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(a._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ADD MODAL */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Publish Campus Announcement
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {formError && (
                  <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Announcement Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Midterm Examination Schedule Fall 2026"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden"
                      >
                        <option value="General">General</option>
                        <option value="Academic">Academic</option>
                        <option value="Examination">Examination</option>
                        <option value="Holiday">Holiday</option>
                        <option value="Admissions">Admissions</option>
                        <option value="Sports">Sports</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Target Audience
                      </label>
                      <select
                        value={formData.audience}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            audience: e.target.value as 'all' | 'students' | 'teachers' | 'department',
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden"
                      >
                        <option value="all">Entire University (All)</option>
                        <option value="students">Students Only</option>
                        <option value="teachers">Faculty Only</option>
                        <option value="department">Specific Department</option>
                      </select>
                    </div>
                  </div>

                  {formData.audience === 'department' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Select Department
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden"
                      >
                        <option value="">Select a department...</option>
                        {departments.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Circular Content / Notice Description *
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Write the complete circular notification details..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-amber-500 resize-y"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-colors disabled:opacity-50"
                    >
                      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Publish & Broadcast</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* VIEW MODAL */}
          {viewItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      {viewItem.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(viewItem.publishDate).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewItem(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {viewItem.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Target: <strong className="capitalize">{viewItem.audience}</strong>
                  </p>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {viewItem.description}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setViewItem(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700"
                  >
                    Close
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

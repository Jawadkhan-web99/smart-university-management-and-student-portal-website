'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { useAuth } from '../../../../context/AuthContext';
import { AnnouncementItem, DepartmentItem } from '../../../../types/university';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Users,
  Building,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Send,
  AlertTriangle,
  Info,
} from 'lucide-react';

export default function TeacherAnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'academic',
    audience: 'students' as 'all' | 'students' | 'teachers' | 'department',
    department: '',
    isPublished: true,
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [annRes, deptRes] = await Promise.all([
      apiFetch<{ announcements: AnnouncementItem[] }>('/announcements?limit=50'),
      apiFetch<DepartmentItem[]>('/departments?isActive=true'),
    ]);

    if (annRes.success && annRes.data) {
      setAnnouncements(annRes.data.announcements || []);
    }
    if (deptRes.success && deptRes.data) {
      setDepartments(deptRes.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: 'academic',
      audience: 'students',
      department: '',
      isPublished: true,
    });
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: AnnouncementItem) => {
    setEditingId(ann._id);
    setFormData({
      title: ann.title,
      description: ann.description,
      category: ann.category,
      audience: ann.audience,
      department: ann.department?._id || '',
      isPublished: ann.isPublished,
    });
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setFeedback({ type: 'error', message: 'Title and description are required.' });
      return;
    }

    setActionLoading(true);
    setFeedback(null);

    const payload = {
      ...formData,
      department: formData.audience === 'department' && formData.department ? formData.department : undefined,
    };

    const endpoint = editingId ? `/announcements/${editingId}` : '/announcements';
    const method = editingId ? 'PUT' : 'POST';

    const res = await apiFetch<AnnouncementItem>(endpoint, {
      method,
      body: JSON.stringify(payload),
    });

    setActionLoading(false);

    if (res.success) {
      setIsModalOpen(false);
      loadData();
    } else {
      setFeedback({ type: 'error', message: res.message || 'Operation failed.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    const res = await apiFetch(`/announcements/${id}`, { method: 'DELETE' });
    if (res.success) {
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } else {
      alert(res.message || 'Failed to delete announcement');
    }
  };

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(search.toLowerCase()) ||
      ann.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || ann.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardShell role="teacher" title="Circulars & Announcements">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-7 h-7 text-brand-600 dark:text-brand-400" />
                Class Notices & Broadcasts
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Publish course circulars, schedule change alerts, and view institutional announcements
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast Notice</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search announcements by keyword..."
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="all">All Categories</option>
                <option value="academic">Academic</option>
                <option value="exam">Examination</option>
                <option value="notice">General Notice</option>
                <option value="event">Campus Event</option>
              </select>
            </div>
          </div>

          {/* Announcements List */}
          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-xs text-slate-500">Loading announcements...</p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
              <Megaphone className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                No circulars or notices found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {search || categoryFilter !== 'all'
                  ? 'No announcements match your search criteria.'
                  : 'You have not broadcast any announcements yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((ann) => {
                const isAuthor = ann.author?._id === user?._id || user?.role === 'admin';
                return (
                  <div
                    key={ann._id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900/60">
                            {ann.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Users className="w-3.5 h-3.5" />
                            Audience: <strong className="capitalize">{ann.audience}</strong>
                          </span>
                          {ann.department && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                              <Building className="w-3.5 h-3.5" />
                              {ann.department.name}
                            </span>
                          )}
                          {!ann.isPublished && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                              Draft
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          {ann.title}
                        </h2>
                      </div>

                      {/* Actions */}
                      {isAuthor && (
                        <div className="flex items-center gap-1 self-end sm:self-start">
                          <button
                            onClick={() => handleOpenEdit(ann)}
                            className="p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            title="Edit announcement"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ann._id)}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            title="Delete announcement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {ann.description}
                    </p>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span>
                        Posted by{' '}
                        <strong className="text-slate-600 dark:text-slate-300">
                          {ann.author?.firstName} {ann.author?.lastName}
                        </strong>{' '}
                        ({ann.author?.role})
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(ann.publishDate || ann.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create / Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
              <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {editingId ? 'Edit Announcement' : 'New Notice Broadcast'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Broadcast information to students and colleagues
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {feedback && (
                    <div
                      className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                        feedback.type === 'error'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Notice Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Midterm Examination Review Class Schedule"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                      >
                        <option value="academic">Academic</option>
                        <option value="exam">Examination</option>
                        <option value="notice">General Notice</option>
                        <option value="event">Campus Event</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                      >
                        <option value="students">Students Only</option>
                        <option value="all">Entire University</option>
                        <option value="teachers">Faculty Only</option>
                        <option value="department">Specific Department</option>
                      </select>
                    </div>
                  </div>

                  {formData.audience === 'department' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Select Department
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                      >
                        <option value="">Select a Department</option>
                        {departments.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Notice Content <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Write detailed announcements, room changes, or instructions..."
                      className="w-full p-3.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white leading-relaxed resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                    />
                    <label htmlFor="isPublished" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Publish immediately to target audience
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>{editingId ? 'Save Changes' : 'Broadcast Now'}</span>
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

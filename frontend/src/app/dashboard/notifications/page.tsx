'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../components/dashboard/DashboardShell';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../utils/api';
import { NotificationItem } from '../../../types/university';
import {
  Bell,
  Check,
  ExternalLink,
  Trash2,
  Loader2,
  CheckCheck,
  Megaphone,
  Award,
  FileText,
  CreditCard,
  BookOpen,
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    const res = await apiFetch<{
      notifications: NotificationItem[];
      unreadCount: number;
    }>('/notifications?limit=50');
    if (res.success && res.data) {
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    await apiFetch('/notifications/read-all', { method: 'PUT' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    setActionLoading(false);
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-amber-500" />;
      case 'result':
        return <Award className="w-4 h-4 text-emerald-500" />;
      case 'assignment':
        return <FileText className="w-4 h-4 text-brand-500" />;
      case 'fee':
        return <CreditCard className="w-4 h-4 text-purple-500" />;
      case 'course':
        return <BookOpen className="w-4 h-4 text-cyan-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
      <DashboardShell
        role={user?.role || 'student'}
        title="University Notification Center"
      >
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  All Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live alerts for assignments, academic results, fee vouchers, and campus announcements.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors disabled:opacity-50 self-start sm:self-auto"
              >
                {actionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5" />
                )}
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-xs text-slate-500">Loading your notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No notifications to display
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You are completely caught up! New campus activity and announcements will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    !n.isRead
                      ? 'bg-brand-50/30 dark:bg-brand-950/20 border-brand-200 dark:border-brand-900/60 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                      {getTypeIcon(n.type)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
                        )}
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {n.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(n._id)}
                        title="Mark as read"
                        className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {n.link && (
                      <Link
                        href={n.link}
                        title="Navigate to destination"
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(n._id)}
                      title="Delete notification"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

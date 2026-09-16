'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { ContactMessageItem } from '../../../../types/university';
import {
  Mail,
  CheckCircle,
  Eye,
  Loader2,
  Clock,
  X,
  Send,
} from 'lucide-react';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<ContactMessageItem[]>('/admin/messages');
    if (res.success && res.data) {
      setMessages(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleMarkAsRead = async (id: string) => {
    await apiFetch(`/admin/messages/${id}/read`, { method: 'PUT' });
    setMessages((prev) =>
      prev.map((m) => (m._id === id ? { ...m, isRead: true } : m))
    );
    if (selectedMessage?._id === id) {
      setSelectedMessage((prev) => (prev ? { ...prev, isRead: true } : null));
    }
  };

  const openViewModal = (msg: ContactMessageItem) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      handleMarkAsRead(msg._id);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardShell role="admin" title="Public Inquiries & Contact Messages">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-brand-600" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Prospective & Campus Inquiries
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {messages.length} Messages
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Inquiries submitted by prospective students, parents, and visitors through the public contact portal.
              </p>
            </div>
          </div>

          {/* Messages Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                <p className="text-xs text-slate-500">Loading incoming messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Mail className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No incoming inquiries yet
                </p>
                <p className="text-xs text-slate-500">
                  Messages submitted on the /contact page will appear here for review.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">Sender</th>
                      <th className="px-4 py-3.5">Subject</th>
                      <th className="px-6 py-3.5">Message Preview</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Date</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {messages.map((m) => (
                      <tr
                        key={m._id}
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                          !m.isRead ? 'bg-brand-50/20 dark:bg-brand-950/20 font-semibold' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">{m.name}</p>
                          <p className="text-[11px] text-slate-400 font-normal">{m.email}</p>
                        </td>
                        <td className="px-4 py-4 text-slate-900 dark:text-white max-w-[200px] truncate">
                          {m.subject}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-sm truncate">
                          {m.message}
                        </td>
                        <td className="px-4 py-4">
                          {m.isRead ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                              <CheckCircle className="w-3 h-3 text-emerald-500" /> Read
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                              <Clock className="w-3 h-3" /> New
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-400 whitespace-nowrap text-[11px]">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openViewModal(m)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Read</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* VIEW MODAL */}
          {selectedMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedMessage.subject}
                    </h3>
                    <p className="text-xs text-slate-400">
                      From: {selectedMessage.name} ({selectedMessage.email})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMessage(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedMessage.message}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Received: {new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject
                    )}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply via Email</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

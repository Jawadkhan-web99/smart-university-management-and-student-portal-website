'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { AuditLogItem } from '../../../../types/university';
import {
  Activity,
  History,
  ShieldAlert,
  Loader2,
  Filter,
  User,
  Calendar,
  Globe,
} from 'lucide-react';

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      limit: '25',
      ...(actionFilter ? { action: actionFilter } : {}),
    });

    const res = await apiFetch<{
      logs: AuditLogItem[];
      total: number;
      totalPages: number;
    }>(`/admin/activity?${query.toString()}`);

    if (res.success && res.data) {
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
    }
    setLoading(false);
  }, [page, actionFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const getActionColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('ENROLL'))
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
    if (action.includes('DELETE') || action.includes('DROP'))
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900';
    if (action.includes('PAY') || action.includes('FEE'))
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900';
    if (action.includes('GRADE') || action.includes('SUBMIT'))
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardShell role="admin" title="Security & Activity Audit Logs">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-600" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  System Audit Trail & Access Logs
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  {totalCount} Recorded
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Immutable security audit logging of student admissions, faculty operations, marks entry, and fee transactions.
              </p>
            </div>
          </div>

          {/* Action Filter */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 outline-hidden"
            >
              <option value="">All Action Types</option>
              <option value="CREATE_STUDENT">Student Enrolled</option>
              <option value="UPDATE_STUDENT">Student Updated</option>
              <option value="CREATE_TEACHER">Faculty Onboarded</option>
              <option value="SUBMIT_ASSIGNMENT">Assignment Submitted</option>
              <option value="GRADE_ASSIGNMENT">Assignment Graded</option>
              <option value="CREATE_FEE_VOUCHER">Fee Issued</option>
              <option value="PAY_FEE">Fee Payment Recorded</option>
              <option value="CREATE_ANNOUNCEMENT">Announcement Broadcast</option>
            </select>
          </div>

          {/* Logs Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
                <p className="text-xs text-slate-500">Loading audit trail...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <History className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No activity logs found
                </p>
                <p className="text-xs text-slate-500">
                  Actions taken by users will be permanently recorded here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">Action</th>
                      <th className="px-4 py-3.5">Target Entity</th>
                      <th className="px-4 py-3.5">Actor / User</th>
                      <th className="px-6 py-3.5">Audit Description</th>
                      <th className="px-4 py-3.5">IP Address</th>
                      <th className="px-6 py-3.5 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {logs.map((log) => (
                      <tr
                        key={log._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getActionColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-mono text-slate-700 dark:text-slate-300">
                          {log.entity}
                        </td>
                        <td className="px-4 py-4">
                          {log.user ? (
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {log.user.firstName} {log.user.lastName}
                              </p>
                              <span className="text-[10px] uppercase font-bold text-slate-400">
                                {log.user.role}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">System</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 max-w-sm">
                          {log.description}
                        </td>
                        <td className="px-4 py-4 font-mono text-slate-500 text-[11px]">
                          {log.ip || '127.0.0.1'}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-500 whitespace-nowrap text-[11px]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

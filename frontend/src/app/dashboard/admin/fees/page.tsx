'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { FeeItem, SemesterItem, StudentProfileData } from '../../../../types/university';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Trash2,
  DollarSign,
  X,
  Eye,
  Check,
} from 'lucide-react';

export default function AdminFeesPage() {
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [students, setStudents] = useState<StudentProfileData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    totalBilled: 0,
    totalPaid: 0,
    totalOutstanding: 0,
  });

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [activeFee, setActiveFee] = useState<FeeItem | null>(null);

  // Create form
  const [createForm, setCreateForm] = useState({
    studentId: '',
    semesterId: '',
    amount: '1200',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Semester Tuition Fee & Facilities Voucher',
  });
  const [payAmount, setPayAmount] = useState('');
  const [modalSaving, setModalSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadFees = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      limit: '15',
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(semesterFilter ? { semesterId: semesterFilter } : {}),
      ...(search ? { search } : {}),
    });

    const res = await apiFetch<{
      fees: FeeItem[];
      total: number;
      totalPages: number;
    }>(`/fees?${query.toString()}`);

    if (res.success && res.data) {
      const items = res.data.fees || [];
      setFees(items);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);

      // Calculate totals from retrieved dataset
      let billed = 0;
      let paid = 0;
      let out = 0;
      for (const f of items) {
        billed += f.amount;
        paid += f.paidAmount;
        out += f.remainingAmount;
      }
      setStats({ totalBilled: billed, totalPaid: paid, totalOutstanding: out });
    }
    setLoading(false);
  }, [page, statusFilter, semesterFilter, search]);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  useEffect(() => {
    async function loadMetadata() {
      const [semRes, stuRes] = await Promise.all([
        apiFetch<SemesterItem[]>('/semesters'),
        apiFetch<{ students: StudentProfileData[] }>('/admin/students?limit=100'),
      ]);
      if (semRes.success && semRes.data) setSemesters(semRes.data);
      if (stuRes.success && stuRes.data) setStudents(stuRes.data.students || []);
    }
    loadMetadata();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSaving(true);
    setFormError('');

    const res = await apiFetch('/fees', {
      method: 'POST',
      body: JSON.stringify(createForm),
    });

    if (res.success) {
      setShowCreateModal(false);
      loadFees();
    } else {
      setFormError(res.message || 'Failed to issue fee voucher');
    }
    setModalSaving(false);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFee) return;
    setModalSaving(true);
    setFormError('');

    const res = await apiFetch(`/fees/${activeFee._id}/pay`, {
      method: 'POST',
      body: JSON.stringify({
        amount: Number(payAmount),
        paymentMethod: 'Administrative Cash / Bank Deposit',
      }),
    });

    if (res.success) {
      setShowPayModal(false);
      loadFees();
    } else {
      setFormError(res.message || 'Payment recording failed');
    }
    setModalSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice voucher?')) return;
    const res = await apiFetch(`/fees/${id}`, { method: 'DELETE' });
    if (res.success) {
      setFees((prev) => prev.filter((f) => f._id !== id));
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardShell role="admin" title="University Bursar & Fee Ledger">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Fee Collection & Ledger
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  {totalCount} Vouchers
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Issue semester tuition invoices, verify student payments, and track campus accounts receivable.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCreateForm({
                  studentId: students[0]?.user?._id || '',
                  semesterId: semesters[0]?._id || '',
                  amount: '1200',
                  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0],
                  description: 'Semester Tuition Fee & Facilities Voucher',
                });
                setFormError('');
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Fee Voucher</span>
            </button>
          </div>

          {/* Revenue KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Invoiced
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                ${stats.totalBilled.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">Total generated vouchers</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Collected
              </span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ${stats.totalPaid.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">Settled payments received</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Outstanding Balance
              </span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                ${stats.totalOutstanding.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">Unpaid or overdue tuition dues</p>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by invoice number (e.g. INV-2026-12345)..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 outline-hidden"
              >
                <option value="">All Payment Statuses</option>
                <option value="unpaid">Unpaid</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="paid">Paid (Cleared)</option>
                <option value="overdue">Overdue</option>
              </select>

              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 outline-hidden"
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

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                <p className="text-xs text-slate-500">Loading fee records...</p>
              </div>
            ) : fees.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <CreditCard className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No fee vouchers found
                </p>
                <p className="text-xs text-slate-500">
                  Issue a new semester fee voucher to begin tracking tuition.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">Invoice #</th>
                      <th className="px-4 py-3.5">Student</th>
                      <th className="px-4 py-3.5">Semester</th>
                      <th className="px-4 py-3.5">Due Date</th>
                      <th className="px-4 py-3.5 text-right">Total</th>
                      <th className="px-4 py-3.5 text-right">Paid</th>
                      <th className="px-4 py-3.5 text-right">Balance</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {fees.map((f) => (
                      <tr
                        key={f._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                          {f.invoiceNumber}
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {f.student?.firstName} {f.student?.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400">{f.student?.email}</p>
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                          {f.semester?.name}
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {new Date(f.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ${f.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          ${f.paidAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                          ${f.remainingAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                              f.status === 'paid'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                                : f.status === 'partially_paid'
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                                : f.status === 'overdue'
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                            }`}
                          >
                            {f.status === 'paid' ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {f.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            {f.status !== 'paid' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveFee(f);
                                  setPayAmount(f.remainingAmount.toString());
                                  setFormError('');
                                  setShowPayModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 transition-colors"
                                title="Record payment"
                              >
                                Record Payment
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(f._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Delete invoice"
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
            )}
          </div>

          {/* CREATE VOUCHER MODAL */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Issue Fee Voucher
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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
                      Target Student *
                    </label>
                    <select
                      required
                      value={createForm.studentId}
                      onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden"
                    >
                      <option value="">Select student...</option>
                      {students.map((st) => (
                        <option key={st.user?._id || st._id} value={st.user?._id || st._id}>
                          {st.user?.firstName} {st.user?.lastName} ({st.studentId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Semester *
                    </label>
                    <select
                      required
                      value={createForm.semesterId}
                      onChange={(e) => setCreateForm({ ...createForm, semesterId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden"
                    >
                      <option value="">Select semester...</option>
                      {semesters.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Fee Amount ($) *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={createForm.amount}
                        onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={createForm.dueDate}
                        onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Voucher Description
                    </label>
                    <input
                      type="text"
                      value={createForm.description}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, description: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={modalSaving}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md transition-colors disabled:opacity-50"
                    >
                      {modalSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Generate Voucher</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* RECORD PAYMENT MODAL */}
          {showPayModal && activeFee && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Record Payment Receipt
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-slate-500">
                    Invoice:{' '}
                    <strong className="font-mono text-purple-600">{activeFee.invoiceNumber}</strong>
                  </p>
                  <p className="text-slate-500">
                    Student:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {activeFee.student?.firstName} {activeFee.student?.lastName}
                    </strong>
                  </p>
                  <p className="text-slate-500">
                    Outstanding Balance:{' '}
                    <strong className="text-rose-600 font-bold">
                      ${activeFee.remainingAmount}
                    </strong>
                  </p>
                </div>

                <form onSubmit={handlePaySubmit} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Received Payment Amount ($)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={activeFee.remainingAmount}
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowPayModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={modalSaving}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors disabled:opacity-50"
                    >
                      {modalSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Confirm Payment</span>
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

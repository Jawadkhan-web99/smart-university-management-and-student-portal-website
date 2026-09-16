'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { useAuth } from '../../../../context/AuthContext';
import { FeeItem, StudentFeeSummary } from '../../../../types/university';
import {
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  DollarSign,
  Receipt,
  Download,
  AlertCircle,
  X,
  Building,
  ShieldCheck,
  Printer,
  ChevronRight,
} from 'lucide-react';

export default function StudentFeesPage() {
  const { user } = useAuth();
  const [feeData, setFeeData] = useState<StudentFeeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pay Modal State
  const [selectedVoucher, setSelectedVoucher] = useState<FeeItem | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('Online Debit / Credit Card (Mock)');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentFeedback, setPaymentFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const loadFeeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<StudentFeeSummary>('/fees/student/me');
    if (res.success && res.data) {
      setFeeData(res.data);
    } else {
      setError(res.message || 'Unable to load fee ledger.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFeeData();
  }, [loadFeeData]);

  const handleOpenPay = (v: FeeItem) => {
    setSelectedVoucher(v);
    setPayAmount(String(v.remainingAmount));
    setPaymentFeedback(null);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucher) return;

    const num = Number(payAmount);
    if (isNaN(num) || num <= 0 || num > selectedVoucher.remainingAmount) {
      setPaymentFeedback({
        type: 'error',
        message: `Please enter a valid amount between $1 and $${selectedVoucher.remainingAmount}`,
      });
      return;
    }

    setProcessingPayment(true);
    setPaymentFeedback(null);

    const res = await apiFetch<FeeItem>(`/fees/${selectedVoucher._id}/pay`, {
      method: 'POST',
      body: JSON.stringify({
        amount: num,
        paymentMethod,
      }),
    });

    setProcessingPayment(false);

    if (res.success) {
      setPaymentFeedback({
        type: 'success',
        message: `Payment of $${num.toLocaleString()} recorded successfully!`,
      });
      setTimeout(() => {
        setSelectedVoucher(null);
        loadFeeData();
      }, 1200);
    } else {
      setPaymentFeedback({
        type: 'error',
        message: res.message || 'Payment processing failed.',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5" /> Cleared & Paid
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
            <Clock className="w-3.5 h-3.5" /> Partially Paid
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
            <AlertTriangle className="w-3.5 h-3.5" /> Overdue
          </span>
        );
      case 'unpaid':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <Clock className="w-3.5 h-3.5" /> Unpaid
          </span>
        );
    }
  };

  const handlePrintChallan = (voucher: FeeItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Voucher - ${voucher.invoiceNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #334155; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
            .header p { margin: 4px 0 0; font-size: 13px; color: #64748b; }
            .grid { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
            th { background-color: #f1f5f9; }
            .amount { text-align: right; }
            .total-row { font-weight: bold; background-color: #f8fafc; }
            .notice { font-size: 11px; color: #64748b; margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Smart University Management System</h1>
            <p>Official Bank Fee Deposit Challan / Student Voucher</p>
          </div>
          <div class="grid">
            <div>
              <strong>Student:</strong> ${user?.firstName || ''} ${user?.lastName || ''}<br/>
              <strong>Email:</strong> ${user?.email || 'N/A'}<br/>
              <strong>Semester:</strong> ${voucher.semester?.name || 'N/A'} (${voucher.semester?.academicYear || ''})
            </div>
            <div style="text-align: right;">
              <strong>Invoice #:</strong> ${voucher.invoiceNumber}<br/>
              <strong>Due Date:</strong> ${new Date(voucher.dueDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}<br/>
              <strong>Status:</strong> ${voucher.status.toUpperCase()}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Particulars / Description</th>
                <th class="amount">Billed Amount</th>
                <th class="amount">Paid to Date</th>
                <th class="amount">Remaining Due</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${voucher.description || 'Tuition & Examination Fee'}</td>
                <td class="amount">$${voucher.amount.toLocaleString()}</td>
                <td class="amount">$${voucher.paidAmount.toLocaleString()}</td>
                <td class="amount">$${voucher.remainingAmount.toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td>Total Net Payable:</td>
                <td colspan="3" class="amount" style="color: #2563eb; font-size: 15px;">$${voucher.remainingAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div class="notice">
            <p>&bull; Deposit this voucher at any affiliated bank branch or settle online through the student portal.</p>
            <p>&bull; Late fee charges will apply if unpaid after the specified due date.</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardShell role="student" title="Fee Vouchers & Dues">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-7 h-7 text-brand-600 dark:text-brand-400" />
                Tuition Fees & Billing Ledger
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                View verified semester invoices, download challans, and make digital tuition payments
              </p>
            </div>
          </div>

          {/* Loading / Error States */}
          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-xs text-slate-500">Loading student financial ledger...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-md mx-auto space-y-4">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Unable to Retrieve Fees
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{error}</p>
              <button
                onClick={loadFeeData}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl"
              >
                Retry
              </button>
            </div>
          ) : feeData ? (
            <>
              {/* Financial KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                  <span className="text-xs font-semibold text-slate-400 block">Total Billed Fees</span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    ${feeData.totalBilled.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cumulative institutional billing
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                  <span className="text-xs font-semibold text-slate-400 block">Paid Amount</span>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    ${feeData.totalPaid.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Successfully cleared transactions
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-lg space-y-2">
                  <span className="text-xs font-medium text-brand-100 block">
                    Remaining Outstanding Balance
                  </span>
                  <div className="text-3xl font-black">
                    ${feeData.totalOutstanding.toLocaleString()}
                  </div>
                  <p className="text-xs text-brand-100 font-medium">
                    {feeData.totalOutstanding === 0
                      ? 'No outstanding university dues'
                      : 'Payable across pending vouchers'}
                  </p>
                </div>
              </div>

              {/* Invoices & Vouchers Table */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Fee Vouchers & Payment History
                      </h3>
                      <p className="text-xs text-slate-500">
                        Official records and digital settlement vouchers
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {feeData.vouchers.length} Total Voucher{feeData.vouchers.length === 1 ? '' : 's'}
                  </span>
                </div>

                {feeData.vouchers.length === 0 ? (
                  <div className="p-16 text-center">
                    <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                      No Fee Vouchers Issued
                    </h4>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                      You do not have any pending or past fee vouchers on record.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                          <th className="py-3.5 px-6">Invoice #</th>
                          <th className="py-3.5 px-6">Semester & Description</th>
                          <th className="py-3.5 px-6">Due Date</th>
                          <th className="py-3.5 px-6 text-right">Total</th>
                          <th className="py-3.5 px-6 text-right">Paid</th>
                          <th className="py-3.5 px-6 text-right">Balance</th>
                          <th className="py-3.5 px-6 text-center">Status</th>
                          <th className="py-3.5 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {feeData.vouchers.map((v) => (
                          <tr
                            key={v._id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="py-4 px-6 font-mono font-bold text-brand-600 dark:text-brand-400">
                              {v.invoiceNumber}
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <span className="font-semibold text-slate-900 dark:text-white block">
                                  {v.semester?.name || 'General Voucher'}
                                </span>
                                <span className="text-slate-400 text-[11px]">
                                  {v.description || 'Academic Fee'}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {new Date(v.dueDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right font-bold text-slate-900 dark:text-white">
                              ${v.amount.toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                              ${v.paidAmount.toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-right font-bold text-slate-900 dark:text-white">
                              ${v.remainingAmount.toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-center">{getStatusBadge(v.status)}</td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handlePrintChallan(v)}
                                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  title="Print Bank Challan"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                                {v.remainingAmount > 0 && (
                                  <button
                                    onClick={() => handleOpenPay(v)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
                                  >
                                    Pay Now
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}

          {/* Pay Now Modal */}
          {selectedVoucher && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Online Fee Payment
                      </h3>
                      <p className="text-xs text-slate-500">
                        Invoice #{selectedVoucher.invoiceNumber}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVoucher(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleProcessPayment} className="p-6 space-y-4">
                  {paymentFeedback && (
                    <div
                      className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                        paymentFeedback.type === 'error'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      }`}
                    >
                      {paymentFeedback.type === 'error' ? (
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span>{paymentFeedback.message}</span>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block">Remaining Due:</span>
                      <strong className="text-base font-black text-slate-900 dark:text-white">
                        ${selectedVoucher.remainingAmount.toLocaleString()}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block">Due Date:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {new Date(selectedVoucher.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Payment Amount ($)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={selectedVoucher.remainingAmount}
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white font-bold"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      You can pay full balance or a custom installment
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Payment Method (Mock Portal)
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                    >
                      <option value="Online Debit / Credit Card (Mock)">
                        Online Debit / Credit Card (Mock)
                      </option>
                      <option value="Online Digital Banking (Mock)">
                        Online Digital Banking (Mock)
                      </option>
                      <option value="Campus Bank Slip Confirmation (Mock)">
                        Campus Bank Slip Confirmation (Mock)
                      </option>
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
                    <span>
                      Demo Mode: No actual financial charge will occur. Submitting will update your university ledger balance instantly.
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedVoucher(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processingPayment}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {processingPayment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      <span>Confirm & Settle Payment</span>
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

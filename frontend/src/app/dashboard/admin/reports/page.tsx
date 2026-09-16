'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Users,
  Award,
  CreditCard,
  Loader2,
  Table,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<'students' | 'results' | 'fees'>('students');
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<{ count: number; data: Record<string, unknown>[] }>(
      `/admin/reports?type=${reportType}`
    );
    if (res.success && res.data) {
      setData(res.data.data || []);
    }
    setLoading(false);
  }, [reportType]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const downloadCSV = () => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).filter((k) => k !== 'id');
    const rows = data.map((row) =>
      headers
        .map((header) => {
          const val = row[header] ?? '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Apex_University_${reportType.toUpperCase()}_REPORT_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getHeaders = () => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter((k) => k !== 'id');
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardShell role="admin" title="Institutional Reporting & Data Export">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Institutional Reports Engine
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {data.length} Records
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Generate tabular datasets for institutional audits, accreditation compliance, and downloadable CSV exports.
              </p>
            </div>

            <button
              type="button"
              onClick={downloadCSV}
              disabled={loading || data.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors disabled:opacity-50 self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Export Spreadsheet (CSV)</span>
            </button>
          </div>

          {/* Report Type Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setReportType('students')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                reportType === 'students'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Students Directory</span>
            </button>

            <button
              type="button"
              onClick={() => setReportType('results')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                reportType === 'results'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Academic Results & Grades</span>
            </button>

            <button
              type="button"
              onClick={() => setReportType('fees')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                reportType === 'fees'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Fee Invoices & Dues</span>
            </button>
          </div>

          {/* Data Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-xs text-slate-500">Compiling report dataset...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <FileSpreadsheet className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No records in report
                </p>
                <p className="text-xs text-slate-500">
                  Data records for this category are currently empty.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold sticky top-0 z-10">
                    <tr>
                      {getHeaders().map((header) => (
                        <th key={header} className="px-5 py-3.5 whitespace-nowrap">
                          {header.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {getHeaders().map((header) => (
                          <td
                            key={header}
                            className="px-5 py-3.5 text-slate-700 dark:text-slate-300 whitespace-nowrap"
                          >
                            {String(row[header] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

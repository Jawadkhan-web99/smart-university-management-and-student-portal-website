'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Download, CalendarCheck, Sparkles, CheckCircle2, FileText } from 'lucide-react';
import { DetailModal } from '../ui/DetailModal';

export function CtaSection() {
  const [prospectusOpen, setProspectusOpen] = useState(false);

  return (
    <section id="admissions" className="py-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-brand-950 via-brand-900 to-slate-950 text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl border border-brand-800/40">
          {/* Decorative Backdrops */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-brand-500/20 text-brand-200 border border-brand-400/30 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Admissions Fall 2026
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Ready to Shape Your Future in Advanced Computing &amp; Technology?
            </h2>

            <p className="text-base sm:text-lg text-brand-100/90 leading-relaxed max-w-2xl mx-auto font-normal">
              Join thousands of aspiring innovators, software engineers, and digital pioneers.
              Submit your online application now for merit-based seats and institutional scholarships.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-white hover:bg-slate-100 shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all duration-200"
              >
                <span>Apply for Admission</span>
                <ArrowRight className="w-4 h-4 text-brand-600" />
              </Link>

              <button
                type="button"
                onClick={() => setProspectusOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>View Prospectus Info</span>
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-brand-200">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                100% Online Paperless Admission
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CalendarCheck className="w-4 h-4 text-amber-400" />
                Application Deadline: Fall Semester 2026
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prospectus Modal */}
      <DetailModal
        isOpen={prospectusOpen}
        onClose={() => setProspectusOpen(false)}
        title="Apex University Prospectus 2026-2027"
        subtitle="Official Academic Handbook & Admissions Criteria"
        badge="Official Document"
        actions={
          <>
            <button
              type="button"
              onClick={() => setProspectusOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
            >
              <span>Begin Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </>
        }
      >
        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800">
            <FileText className="w-6 h-6 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Undergraduate Curriculum & Fee Structure</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                The comprehensive prospectus outlines all 4 accredited computing faculties, fee schedules, HEC merit formulas, and hostel/transport facilities.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <p className="font-bold text-slate-900 dark:text-white">Key Admissions Schedule:</p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Entry Test Phase: Rolling online admission testing</li>
              <li>Merit List Announcement: Published directly on portal</li>
              <li>Orientation & Class Commencement: Fall 2026</li>
            </ul>
          </div>
        </div>
      </DetailModal>
    </section>
  );
}


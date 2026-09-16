'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Clock, GraduationCap, ArrowRight, Award, CheckCircle, BookOpen } from 'lucide-react';
import { Program } from '../../types/index.js';
import { DetailModal } from './DetailModal';

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="group relative flex flex-col justify-between bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-2xl hover:border-brand-500/50 dark:hover:border-brand-500/50 hover:-translate-y-1 transition-all duration-300">
        {/* Glow Accent on hover */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div>
          {/* Card Header & Badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-100 dark:border-brand-900/60 shadow-xs">
              <GraduationCap className="w-3.5 h-3.5" />
              {program.degreeType}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              {program.creditHours} Credits
            </span>
          </div>

          {/* Program Name */}
          <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors tracking-tight">
            {program.name}
          </h3>

          {/* Program Department */}
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Dept. of {program.department}
          </p>

          {/* Short Description */}
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
            {program.shortDescription}
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          {/* Duration */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4 text-brand-500" />
            <span>{program.duration}</span>
          </div>

          {/* View Program Button */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 group-hover:translate-x-0.5 transition-transform"
          >
            Curriculum Details
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Program Detail Modal */}
      <DetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={program.name}
        subtitle={`Department of ${program.department}`}
        badge={`${program.degreeType} • ${program.duration}`}
        actions={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
            >
              <span>Apply for Admission</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </>
        }
      >
        <div className="space-y-4 text-left">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {program.shortDescription}
          </p>

          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Degree Level</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{program.degreeType}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Credit Hours</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{program.creditHours} Total Units</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Core Academic Competencies
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                Accredited outcome-based computing curriculum (OBE aligned)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                Industry capstone project & dedicated mentor guidance
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                Hands-on modern computer labs and high-performance clusters
              </li>
            </ul>
          </div>
        </div>
      </DetailModal>
    </>
  );
}


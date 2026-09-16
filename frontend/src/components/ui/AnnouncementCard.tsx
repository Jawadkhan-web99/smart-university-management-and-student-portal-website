'use client';

import React, { useState } from 'react';
import { Calendar, Tag, ArrowUpRight, Pin } from 'lucide-react';
import { Announcement } from '../../types/index.js';
import { DetailModal } from './DetailModal';

interface AnnouncementCardProps {
  announcement: Announcement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Admissions':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50';
      case 'Academic':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/50';
      case 'Examination':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50';
      case 'Research':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/50';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <>
      <div className="relative group bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
        <div>
          {/* Meta Header */}
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(
                  announcement.category
                )}`}
              >
                <Tag className="w-3 h-3" />
                {announcement.category}
              </span>
              {announcement.isPinned && (
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300/50 dark:border-amber-800/60">
                  <Pin className="w-3 h-3" />
                  Featured
                </span>
              )}
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              {announcement.date}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors tracking-tight">
            {announcement.title}
          </h3>

          {/* Short Description */}
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {announcement.shortDescription}
          </p>
        </div>

        {/* Footer / Read More Button */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 group-hover:translate-x-0.5 transition-transform"
          >
            Read Notice
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Announcement Detail Modal */}
      <DetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={announcement.title}
        subtitle={`Posted by University Registrar • ${announcement.date}`}
        badge={announcement.category}
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
          >
            Acknowledge & Close
          </button>
        }
      >
        <div className="space-y-4 text-left">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
            {announcement.shortDescription}
          </p>

          <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-900/60 text-xs text-brand-800 dark:text-brand-300 space-y-1">
            <p className="font-bold">Official University Communication</p>
            <p>This bulletin is transmitted to all active enrolled students and faculty members. For inquiries, please reach out to the campus registrar office.</p>
          </div>
        </div>
      </DetailModal>
    </>
  );
}


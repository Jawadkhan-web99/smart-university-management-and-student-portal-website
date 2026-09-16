'use client';

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UniversityEvent } from '../../types/index.js';
import { DetailModal } from './DetailModal';

interface EventCardProps {
  event: UniversityEvent;
}

export function EventCard({ event }: EventCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [rsvpConfirmed, setRsvpConfirmed] = useState(false);

  return (
    <>
      <div className="group bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
        <div>
          {/* Date & Category header */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-100 dark:border-brand-900/60 shadow-xs">
              {event.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{event.date}</span>
            </div>
          </div>

          {/* Event Title */}
          <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors tracking-tight">
            {event.title}
          </h3>

          {/* Event Location & Time */}
          <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{event.time}</span>
            </div>
          </div>

          {/* Short Description */}
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {event.shortDescription}
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Free Campus Entry
          </span>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 group-hover:translate-x-0.5 transition-transform"
          >
            Event Details
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Event Detail Modal */}
      <DetailModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setRsvpConfirmed(false);
        }}
        title={event.title}
        subtitle={`${event.date} • ${event.time}`}
        badge={event.category}
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setRsvpConfirmed(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => setRsvpConfirmed(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
            >
              {rsvpConfirmed ? 'Seat Reserved!' : 'RSVP Free Seat'}
            </button>
          </>
        }
      >
        <div className="space-y-4 text-left">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {event.shortDescription}
          </p>

          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Venue</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{event.location}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Timing</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{event.time}</p>
            </div>
          </div>

          {rsvpConfirmed && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>You have successfully RSVP&apos;d. A calendar reminder has been marked for your session!</span>
            </div>
          )}
        </div>
      </DetailModal>
    </>
  );
}


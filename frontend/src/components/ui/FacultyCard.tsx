import React from 'react';
import { Mail, Award } from 'lucide-react';
import { FacultyMember } from '../../types/index.js';

interface FacultyCardProps {
  faculty: FacultyMember;
}

export function FacultyCard({ faculty }: FacultyCardProps) {
  return (
    <div className="group bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 text-center flex flex-col items-center">
      {/* Profile Image Placeholder */}
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center text-xl font-bold tracking-wider shadow-md ring-4 ring-brand-50 dark:ring-slate-800">
          {faculty.avatarText}
        </div>
      </div>

      {/* Faculty Name */}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        {faculty.name}
      </h3>

      {/* Designation */}
      <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
        {faculty.designation}
      </p>

      {/* Department */}
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Dept. of {faculty.department}
      </p>

      {/* Qualification badge */}
      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60">
        <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="truncate max-w-[220px]">{faculty.qualification}</span>
      </div>

      {/* Specialization */}
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic">
        "{faculty.specialization}"
      </p>

      {/* Contact Email */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 w-full flex items-center justify-center">
        <a
          href={`mailto:${faculty.email}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>{faculty.email}</span>
        </a>
      </div>
    </div>
  );
}

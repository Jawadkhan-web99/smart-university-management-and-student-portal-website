import React from 'react';
import { Cpu, Code, Network, Briefcase, Building2, Users, BookOpen, ChevronRight } from 'lucide-react';
import { Department } from '../../types/index.js';

interface DepartmentCardProps {
  department: Department;
}

export function DepartmentCard({ department }: DepartmentCardProps) {
  // Dynamically resolve icon
  const getIcon = () => {
    switch (department.icon) {
      case 'Cpu':
        return <Cpu className="w-6 h-6" />;
      case 'Code':
        return <Code className="w-6 h-6" />;
      case 'Network':
        return <Network className="w-6 h-6" />;
      case 'Briefcase':
        return <Briefcase className="w-6 h-6" />;
      default:
        return <Building2 className="w-6 h-6" />;
    }
  };

  return (
    <div className="group flex flex-col justify-between bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-100 dark:border-brand-900/50 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
            {getIcon()}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            {department.code}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {department.name}
        </h3>

        <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {department.description}
        </p>

        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Head of Department:</span>{' '}
          {department.headOfDepartment}
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-brand-500" />
            {department.programsCount} Programs
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-brand-500" />
            {department.facultyCount} Faculty
          </span>
        </div>

        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform cursor-pointer">
          Explore
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}

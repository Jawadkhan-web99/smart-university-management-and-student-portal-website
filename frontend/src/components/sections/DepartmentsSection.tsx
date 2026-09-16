import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { DepartmentCard } from '../ui/DepartmentCard';
import { departmentsData } from '../../data/departments';

export function DepartmentsSection() {
  return (
    <section id="departments" className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="ACADEMIC DEPARTMENTS"
          title="Departments & Faculties"
          subtitle="Our interdisciplinary departments house world-class research faculties, modern lab computing facilities, and specialized research clusters."
        />

        {/* 4 Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {departmentsData.map((department) => (
            <DepartmentCard key={department.id} department={department} />
          ))}
        </div>
      </div>
    </section>
  );
}

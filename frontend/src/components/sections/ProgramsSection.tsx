import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { ProgramCard } from '../ui/ProgramCard';
import { programsData } from '../../data/programs';

export function ProgramsSection() {
  return (
    <section id="programs" className="py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="DEGREE PROGRAMS"
          title="Undergraduate Programs of Study"
          subtitle="Explore our comprehensive bachelor degree programs designed to provide rigorous theoretical knowledge alongside pragmatic industrial applications."
        />

        {/* 6 Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {programsData.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      </div>
    </section>
  );
}

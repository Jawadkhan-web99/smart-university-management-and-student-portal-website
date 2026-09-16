import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { FacultyCard } from '../ui/FacultyCard';
import { facultyData } from '../../data/faculty';

export function FacultySection() {
  return (
    <section id="faculty" className="py-20 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="DISTINGUISHED FACULTY"
          title="Learn from World-Class Academics"
          subtitle="Our educators are global researchers, seasoned industry practitioners, and passionate mentors driving impactful scientific discoveries."
        />

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facultyData.map((faculty) => (
            <FacultyCard key={faculty.id} faculty={faculty} />
          ))}
        </div>
      </div>
    </section>
  );
}

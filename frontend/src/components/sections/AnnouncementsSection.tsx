import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { AnnouncementCard } from '../ui/AnnouncementCard';
import { announcementsData } from '../../data/announcements';

export function AnnouncementsSection() {
  return (
    <section id="announcements" className="py-20 bg-white/70 dark:bg-slate-900/30 backdrop-blur-sm border-b border-slate-200/70 dark:border-slate-800/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="CAMPUS NOTICES"
          title="Latest Announcements & Updates"
          subtitle="Stay informed with official circulars, examination schedules, academic notifications, and university directives."
        />

        {/* Announcements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcementsData.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      </div>
    </section>
  );
}

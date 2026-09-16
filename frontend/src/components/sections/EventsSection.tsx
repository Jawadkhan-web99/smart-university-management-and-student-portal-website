import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { EventCard } from '../ui/EventCard';
import { eventsData } from '../../data/events';

export function EventsSection() {
  return (
    <section id="events" className="py-20 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="CAMPUS LIFE & HAPPENINGS"
          title="Upcoming University Events"
          subtitle="Explore our upcoming academic symposiums, competitive coding hackathons, research conventions, and career networking seminars."
        />

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {eventsData.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { HeroSection } from '../components/sections/HeroSection';
import { AboutSection } from '../components/sections/AboutSection';
import { ProgramsSection } from '../components/sections/ProgramsSection';
import { DepartmentsSection } from '../components/sections/DepartmentsSection';
import { FacultySection } from '../components/sections/FacultySection';
import { AnnouncementsSection } from '../components/sections/AnnouncementsSection';
import { EventsSection } from '../components/sections/EventsSection';
import { CtaSection } from '../components/sections/CtaSection';
import { Footer } from '../components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sticky Header Navbar */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1 w-full">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. About Section */}
        <AboutSection />

        {/* 3. Degree Programs Section */}
        <ProgramsSection />

        {/* 4. Academic Departments Section */}
        <DepartmentsSection />

        {/* 5. Faculty Preview Section */}
        <FacultySection />

        {/* 6. Campus Announcements Section */}
        <AnnouncementsSection />

        {/* 7. Upcoming Events Section */}
        <EventsSection />

        {/* 8. Call to Action (Admissions) */}
        <CtaSection />
      </main>

      {/* University Footer */}
      <Footer />
    </div>
  );
}

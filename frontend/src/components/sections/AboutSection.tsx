import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import {
  GraduationCap,
  Globe2,
  Building,
  Award,
  BookOpenCheck,
  Cpu,
  CheckCircle,
} from 'lucide-react';

export function AboutSection() {
  const stats = [
    { label: 'Enrolled Scholars', value: '14,000+', icon: GraduationCap },
    { label: 'Accredited Programs', value: '24+', icon: Award },
    { label: 'Ph.D. Faculty', value: '120+', icon: BookOpenCheck },
    { label: 'Graduate Employability', value: '96.8%', icon: Globe2 },
  ];

  const pillars = [
    {
      title: 'Industry-Integrated Curricula',
      description:
        'Syllabi designed collaboratively with top tech corporations to match contemporary enterprise demands.',
      icon: Cpu,
    },
    {
      title: 'High-Performance Research Facilities',
      description:
        'Equipped with modern GPU clusters, robotics testbeds, IoT prototyping labs, and cybersecurity ranges.',
      icon: Building,
    },
    {
      title: 'Digital-First Campus Infrastructure',
      description:
        'End-to-end cloud student management portal for enrollment, grade evaluation, and attendance tracking.',
      icon: BookOpenCheck,
    },
  ];

  return (
    <section id="about" className="py-20 bg-white/70 dark:bg-slate-900/30 backdrop-blur-sm border-b border-slate-200/70 dark:border-slate-800/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="ABOUT OUR INSTITUTION"
          title="Fostering Academic Distinction & Technological Leadership"
          subtitle="Apex University is an autonomous premier institution committed to nurturing visionary computer scientists, software architects, and innovators."
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Narrative & Core Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Narrative */}
          <div className="space-y-5">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-snug">
              A Twenty-First Century University Built for Tomorrow&apos;s Engineering Frontier
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              Founded with the mandate to transform collegiate computing and software education,
              Apex University bridges academic theory and modern industrial practice. Our
              curriculum reflects the dynamic frontiers of modern computing, including generative
              AI, cloud infrastructure, cryptography, and big-data engineering.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              With our upcoming integrated Smart Portal system, students, faculty, and administrative
              staff will benefit from centralized digital workflows, transparent evaluations, and
              real-time notifications.
            </p>

            <ul className="space-y-2.5 pt-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero-tolerance academic integrity standards and continuous evaluation.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Active research grants funded by national science foundations.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Comprehensive student career incubation and startup accelerator.</span>
              </li>
            </ul>
          </div>

          {/* Core Pillars Cards */}
          <div className="space-y-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 hover:border-brand-500/40 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {pillar.title}
                    </h4>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

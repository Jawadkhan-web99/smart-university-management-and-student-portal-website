import { Announcement } from '../types/index.js';

export const announcementsData: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Fall 2026 Undergraduate Admissions Open',
    date: 'March 10, 2026',
    category: 'Admissions',
    shortDescription: 'Online applications are formally open for BS Computer Science, Software Engineering, AI, and related engineering degrees.',
    isPinned: true,
  },
  {
    id: 'ann-2',
    title: 'Midterm Examination Schedule Announcement - Spring 2026',
    date: 'March 05, 2026',
    category: 'Examination',
    shortDescription: 'The comprehensive examination date sheet for the ongoing Spring 2026 academic term has been officially published.',
    isPinned: false,
  },
  {
    id: 'ann-3',
    title: 'National Robotics & AI Innovation Summit 2026',
    date: 'February 28, 2026',
    category: 'Research',
    shortDescription: 'Apex University will host the annual collegiate robotics and artificial intelligence symposium with international guest keynote speakers.',
    isPinned: false,
  },
  {
    id: 'ann-4',
    title: 'Merit Scholarship & Financial Assistance Portal Now Active',
    date: 'February 20, 2026',
    category: 'Academic',
    shortDescription: 'Students eligible for dean list honor and need-based tuition waivers can submit their documentation through the financial aid desk.',
    isPinned: false,
  },
];

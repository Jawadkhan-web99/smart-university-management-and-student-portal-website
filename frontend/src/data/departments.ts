import { Department } from '../types/index.js';

export const departmentsData: Department[] = [
  {
    id: 'dept-cs',
    name: 'Department of Computer Science',
    code: 'DCS',
    description: 'Pioneering breakthroughs in computation, intelligent autonomous systems, and advanced software algorithms.',
    headOfDepartment: 'Dr. Tariq Mahmood, Ph.D.',
    programsCount: 5,
    facultyCount: 38,
    icon: 'Cpu',
  },
  {
    id: 'dept-se',
    name: 'Department of Software Engineering',
    code: 'DSE',
    description: 'Empowering future architects to construct resilient, enterprise-grade cloud ecosystems and full-stack solutions.',
    headOfDepartment: 'Dr. Ayesha Siddiqua, Ph.D.',
    programsCount: 4,
    facultyCount: 29,
    icon: 'Code',
  },
  {
    id: 'dept-it',
    name: 'Department of Information Technology',
    code: 'DIT',
    description: 'Delivering excellence across enterprise systems administration, cyber security operations, and networking architecture.',
    headOfDepartment: 'Dr. Kamran Malik, Ph.D.',
    programsCount: 4,
    facultyCount: 26,
    icon: 'Network',
  },
  {
    id: 'dept-ms',
    name: 'Department of Management Sciences',
    code: 'DMS',
    description: 'Fostering visionary corporate leaders, technology strategists, and innovative entrepreneurs for the global market.',
    headOfDepartment: 'Dr. Bilal Farooq, Ph.D.',
    programsCount: 6,
    facultyCount: 32,
    icon: 'Briefcase',
  },
];

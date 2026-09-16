export interface Program {
  id: string;
  name: string;
  shortDescription: string;
  duration: string;
  degreeType: 'Undergraduate' | 'Graduate' | 'Postgraduate';
  department: string;
  creditHours: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headOfDepartment: string;
  programsCount: number;
  facultyCount: number;
  icon: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  qualification: string;
  specialization: string;
  email: string;
  avatarText: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  category: 'Admissions' | 'Academic' | 'Examination' | 'General' | 'Research';
  shortDescription: string;
  isPinned?: boolean;
}

export interface UniversityEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  shortDescription: string;
  category: 'Conference' | 'Workshop' | 'Orientation' | 'Sports' | 'Seminar';
}

export * from './auth.js';
export * from './university.js';

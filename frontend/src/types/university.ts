import { User } from './auth';

export interface DepartmentItem {
  _id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SemesterItem {
  _id: string;
  name: string;
  semesterNumber: number;
  academicYear: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseItem {
  _id: string;
  courseCode: string;
  title: string;
  description?: string;
  creditHours: number;
  department: {
    _id: string;
    name: string;
    code: string;
  } | string;
  semester?: {
    _id: string;
    name: string;
    semesterNumber: number;
    academicYear: string;
  } | string;
  teacher?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
  } | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfileData {
  _id: string;
  user: User;
  studentId: string;
  department?: {
    _id: string;
    name: string;
    code: string;
  };
  program: string;
  semester?: {
    _id: string;
    name: string;
    semesterNumber: number;
    academicYear: string;
    startDate?: string;
    endDate?: string;
  };
  admissionYear: number;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  profileImage?: string;
  enrollmentStatus: 'enrolled' | 'suspended' | 'graduated' | 'leave';
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecordItem {
  _id: string;
  student: string;
  course: {
    _id: string;
    courseCode: string;
    title: string;
    creditHours?: number;
  };
  date: string;
  status: 'present' | 'absent' | 'late';
  markedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CourseAttendanceSummary {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export interface AttendanceSummaryData {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  overallPercentage: number;
  courseBreakdown: CourseAttendanceSummary[];
  records: AttendanceRecordItem[];
}

export interface AdminStatsData {
  totalStudents: number;
  totalTeachers: number;
  totalDepartments: number;
  totalCourses: number;
  totalSemesters: number;
}

export interface TeacherProfileData {
  _id: string;
  user: User;
  teacherId: string;
  department?: {
    _id: string;
    name: string;
    code: string;
    description?: string;
  };
  designation: string;
  specialization?: string;
  qualification?: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  joiningDate?: string;
  employmentStatus: 'active' | 'on_leave' | 'retired' | 'terminated';
  createdAt: string;
  updatedAt: string;
}

export type AssignmentStatus = 'draft' | 'published' | 'closed';
export type AssignmentDynamicStatus =
  | 'draft'
  | 'published'
  | 'due_soon'
  | 'overdue'
  | 'closed';

export interface AssignmentItem {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    courseCode: string;
    title: string;
    creditHours?: number;
    department?: {
      _id: string;
      name: string;
      code: string;
    };
    semester?: {
      _id: string;
      name: string;
      semesterNumber: number;
      academicYear: string;
    };
  };
  teacher: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  dueDate: string;
  totalMarks: number;
  attachment?: string;
  status: AssignmentStatus;
  dynamicStatus?: AssignmentDynamicStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherStatsData {
  assignedCourses: number;
  totalStudents: number;
  todayClasses: number;
  pendingAssignments: number;
  attendanceOverview: {
    totalRecords: number;
    presentRecords: number;
    attendanceRate: number;
  };
  recentActivity: {
    attendance: Array<{
      _id: string;
      date: string;
      status: 'present' | 'absent' | 'late';
      course?: { _id: string; courseCode: string; title: string };
      student?: { _id: string; firstName: string; lastName: string };
    }>;
    assignments: Array<{
      _id: string;
      title: string;
      dueDate: string;
      status: string;
      course?: { _id: string; courseCode: string; title: string };
    }>;
  };
}

export interface AttendanceRosterStudent {
  studentUserId: string;
  profileId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  status: 'present' | 'absent' | 'late' | null;
  recordId?: string | null;
}

export interface AttendanceSessionSummary {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  date: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  percentage: number;
}

export interface ComprehensiveAdminStatsData {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  totalDepartments: number;
  totalCourses: number;
  totalSemesters: number;
  totalAssignments: number;
  totalSubmissions: number;
  totalResults: number;
  publishedResults: number;
  fees: {
    totalBilled: number;
    totalPaid: number;
    totalOutstanding: number;
  };
  gradeDistribution: Record<string, number>;
  departmentDistribution: Array<{
    departmentName: string;
    count: number;
  }>;
  recentLogs: Array<{
    _id: string;
    action: string;
    description: string;
    createdAt: string;
    user?: {
      firstName: string;
      lastName: string;
      role: string;
    };
  }>;
}

export interface ResultItem {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    studentId?: string;
  };
  course: {
    _id: string;
    courseCode: string;
    title: string;
    creditHours: number;
    department?: {
      name: string;
      code: string;
    };
  };
  semester: {
    _id: string;
    name: string;
    academicYear: string;
  };
  teacher?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  marks: number;
  totalMarks: number;
  grade: string;
  gradePoint: number;
  remarks?: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface StudentCourseResult {
  resultId: string;
  courseCode: string;
  title: string;
  creditHours: number;
  marks: number;
  totalMarks: number;
  grade: string;
  gradePoint: number;
  remarks: string;
}

export interface StudentSemesterResult {
  semester: {
    _id: string;
    name: string;
    academicYear: string;
    semesterNumber: number;
  };
  courses: StudentCourseResult[];
  gpa: number;
  totalCredits: number;
  qualityPoints: number;
}

export interface StudentResultsSummary {
  cgpa: number;
  totalCompletedCourses: number;
  totalCredits: number;
  semesters: StudentSemesterResult[];
}

export interface SubmissionItem {
  _id: string;
  assignment: {
    _id: string;
    title: string;
    totalMarks: number;
    dueDate: string;
    course?: {
      _id: string;
      courseCode: string;
      title: string;
    };
  };
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    studentId?: string;
  };
  file: string;
  fileName?: string;
  fileSize?: number;
  comment?: string;
  submittedAt: string;
  marks?: number | null;
  feedback?: string;
  status: 'submitted' | 'late' | 'graded' | 'returned';
  gradedAt?: string | null;
  gradedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  audience: 'all' | 'students' | 'teachers' | 'department';
  department?: {
    _id: string;
    name: string;
    code: string;
  } | null;
  publishDate: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'announcement' | 'assignment' | 'result' | 'attendance' | 'fee' | 'course' | 'general';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface FeeItem {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    studentId?: string;
  };
  semester: {
    _id: string;
    name: string;
    academicYear: string;
  };
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  paidAmount: number;
  remainingAmount: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFeeSummary {
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  vouchersCount: number;
  vouchers: FeeItem[];
}

export interface AuditLogItem {
  _id: string;
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  ip?: string;
  createdAt: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export interface ContactMessageItem {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}



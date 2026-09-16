import { connectDatabase, disconnectDatabase } from '../config/database.js';
import {
  User,
  Department,
  Semester,
  Course,
  StudentProfile,
  TeacherProfile,
  Attendance,
  Assignment,
  Result,
  Submission,
  Announcement,
  Notification,
  Fee,
  AuditLog,
  ContactMessage,
} from '../models/index.js';

const seedDatabase = async () => {
  console.log('Connecting to database for seeding...');
  const conn = await connectDatabase();

  if (!conn) {
    console.error('Cannot seed database: Connection failed. Ensure MongoDB is running.');
    process.exit(1);
  }

  // 1. Seed Users
  const defaultUsers = [
    {
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@apex.edu',
      password: 'Admin@123456',
      role: 'admin' as const,
      phone: '+92 300 1234567',
      isActive: true,
    },
    {
      firstName: 'Dr. Tariq',
      lastName: 'Mahmood',
      email: 'teacher@apex.edu',
      password: 'Teacher@123456',
      role: 'teacher' as const,
      phone: '+92 301 7654321',
      isActive: true,
    },
    {
      firstName: 'Ali',
      lastName: 'Ahmed',
      email: 'student@apex.edu',
      password: 'Student@123456',
      role: 'student' as const,
      phone: '+92 333 9876543',
      isActive: true,
    },
  ];

  const userMap = new Map<string, typeof User.prototype>();

  for (const userData of defaultUsers) {
    let u = await User.findOne({ email: userData.email });
    if (!u) {
      u = await User.create(userData);
      console.log(`[Seed] Created ${userData.role} user: ${userData.email}`);
    } else {
      console.log(`[Seed] User exists: ${userData.email}`);
    }
    userMap.set(userData.email, u);
  }

  const adminUser = userMap.get('admin@apex.edu');
  const teacherUser = userMap.get('teacher@apex.edu');
  const studentUser = userMap.get('student@apex.edu');

  // 2. Seed Departments
  const departmentsData = [
    {
      name: 'Department of Computer Science',
      code: 'DCS',
      description: 'Pioneering breakthroughs in computation and algorithmic intelligence.',
      headOfDepartment: 'Dr. Tariq Mahmood',
      isActive: true,
    },
    {
      name: 'Department of Software Engineering',
      code: 'DSE',
      description: 'Engineering resilient cloud architecture and enterprise systems.',
      headOfDepartment: 'Dr. Ayesha Siddiqua',
      isActive: true,
    },
    {
      name: 'Department of Information Technology',
      code: 'DIT',
      description: 'Enterprise networking, cybersecurity, and cloud system administration.',
      headOfDepartment: 'Dr. Kamran Malik',
      isActive: true,
    },
    {
      name: 'Department of Management Sciences',
      code: 'DMS',
      description: 'Executive leadership, technology management, and entrepreneurship.',
      headOfDepartment: 'Dr. Bilal Farooq',
      isActive: true,
    },
  ];

  const deptMap = new Map<string, typeof Department.prototype>();

  for (const deptData of departmentsData) {
    let d = await Department.findOne({ code: deptData.code });
    if (!d) {
      d = await Department.create(deptData);
      console.log(`[Seed] Created department: ${deptData.code}`);
    }
    deptMap.set(deptData.code, d);
  }

  // 3. Seed Semesters
  const semestersData = [
    {
      name: 'Fall 2026',
      semesterNumber: 7,
      academicYear: '2026-2027',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2027-01-31'),
      isActive: true,
    },
    {
      name: 'Spring 2026',
      semesterNumber: 6,
      academicYear: '2025-2026',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-06-30'),
      isActive: false,
    },
  ];

  const semesterMap = new Map<string, typeof Semester.prototype>();

  for (const semData of semestersData) {
    let s = await Semester.findOne({ name: semData.name });
    if (!s) {
      s = await Semester.create(semData);
      console.log(`[Seed] Created semester: ${semData.name}`);
    }
    semesterMap.set(semData.name, s);
  }

  const activeSemester = semesterMap.get('Fall 2026');
  const pastSemester = semesterMap.get('Spring 2026');
  const csDept = deptMap.get('DCS');

  // 4. Seed Courses
  const coursesData = [
    {
      title: 'Advanced Operating Systems & Kernel Architecture',
      courseCode: 'CS-401',
      creditHours: 3,
      department: csDept?._id,
      semester: activeSemester?._id,
      teacher: teacherUser?._id,
      description: 'Microkernel design, virtual memory subsystems, and Linux kernel programming.',
      isActive: true,
    },
    {
      title: 'Deep Learning & Natural Language Understanding',
      courseCode: 'CS-405',
      creditHours: 4,
      department: csDept?._id,
      semester: activeSemester?._id,
      teacher: teacherUser?._id,
      description: 'Modern attention architectures, large language models, and PyTorch optimization.',
      isActive: true,
    },
    {
      title: 'Cloud Infrastructure & Microservices Orchestration',
      courseCode: 'CS-410',
      creditHours: 3,
      department: csDept?._id,
      semester: activeSemester?._id,
      teacher: teacherUser?._id,
      description: 'Kubernetes orchestration, serverless microservices, and distributed consistency.',
      isActive: true,
    },
  ];

  const courseList: Array<typeof Course.prototype> = [];

  for (const cData of coursesData) {
    let c = await Course.findOne({ courseCode: cData.courseCode });
    if (!c) {
      c = await Course.create(cData);
      console.log(`[Seed] Created course: ${cData.courseCode}`);
    } else {
      c.teacher = teacherUser?._id as any;
      await c.save();
    }
    courseList.push(c);
  }

  // 5. Seed Student Profile
  if (studentUser) {
    let profile = await StudentProfile.findOne({ user: studentUser._id });
    if (!profile) {
      profile = await StudentProfile.create({
        user: studentUser._id,
        studentId: 'STU-2026-0042',
        department: csDept?._id,
        program: 'BS Computer Science',
        semester: activeSemester?._id,
        admissionYear: 2023,
        phone: '+92 333 9876543',
        address: 'House 14, Street 9, Sector F-8/2, Islamabad',
        dateOfBirth: new Date('2003-05-18'),
        gender: 'male',
        enrollmentStatus: 'enrolled',
      });
      console.log('[Seed] Created StudentProfile for student@apex.edu');
    }

    // 6. Seed Attendance Records for this student
    if (courseList.length > 0 && teacherUser) {
      const dates = [
        new Date('2026-09-02'),
        new Date('2026-09-04'),
        new Date('2026-09-09'),
        new Date('2026-09-11'),
      ];

      for (const course of courseList) {
        for (let i = 0; i < dates.length; i++) {
          const status = i === 2 ? 'late' : i === 3 ? 'absent' : 'present';
          const existing = await Attendance.findOne({
            student: studentUser._id,
            course: course._id,
            date: dates[i],
          });

          if (!existing) {
            await Attendance.create({
              student: studentUser._id,
              course: course._id,
              date: dates[i],
              status,
              markedBy: teacherUser._id,
            });
          }
        }
      }
      console.log('[Seed] Created sample attendance records');
    }
  }

  // 7. Seed Teacher Profile
  if (teacherUser) {
    let teacherProfile = await TeacherProfile.findOne({ user: teacherUser._id });
    if (!teacherProfile) {
      teacherProfile = await TeacherProfile.create({
        user: teacherUser._id,
        teacherId: 'FAC-2026-0101',
        department: csDept?._id,
        designation: 'Professor & Department Chair',
        specialization: 'Distributed Systems & Cloud Computing Architecture',
        qualification: 'Ph.D. in Computer Engineering, Stanford University',
        phone: '+92 301 7654321',
        address: 'Faculty Enclave, Block D-4, Apex Campus',
        employmentStatus: 'active',
      });
      console.log('[Seed] Created TeacherProfile for Dr. Tariq Mahmood');
    }
  }

  // 8. Seed Assignments
  const assignmentList: Array<typeof Assignment.prototype> = [];
  if (courseList.length > 0 && teacherUser) {
    const assignmentsData = [
      {
        title: 'Assignment 1: Distributed Consensus & Raft Implementation',
        description:
          'Design and implement a mini replicated state machine simulator using the Raft consensus algorithm. Ensure leader election, log replication, and safety guarantees are met.',
        course: courseList[0]._id,
        teacher: teacherUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        totalMarks: 50,
        status: 'published' as const,
      },
      {
        title: 'Assignment 2: Deep Transformer Self-Attention from Scratch',
        description:
          'Implement multi-head scaled dot-product self-attention mechanism in PyTorch. Train on Shakespeare dataset and report perplexity metrics.',
        course: courseList[1]._id,
        teacher: teacherUser._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        totalMarks: 100,
        status: 'published' as const,
      },
      {
        title: 'Lab Task 3: DevSecOps Pipeline with Container Scanning',
        description:
          'Construct an automated GitHub Actions pipeline with Trivy container vulnerability scanning, SonarQube static code analysis, and unit test coverage gating.',
        course: courseList[2]._id,
        teacher: teacherUser._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        totalMarks: 30,
        status: 'published' as const,
      },
    ];

    for (const aData of assignmentsData) {
      let a = await Assignment.findOne({
        course: aData.course,
        title: aData.title,
      });
      if (!a) {
        a = await Assignment.create(aData);
        console.log(`[Seed] Created assignment: ${aData.title}`);
      }
      assignmentList.push(a);
    }
  }

  // 9. Seed Submission for Assignment 1
  if (assignmentList.length > 0 && studentUser && teacherUser) {
    const existingSub = await Submission.findOne({
      assignment: assignmentList[0]._id,
      student: studentUser._id,
    });
    if (!existingSub) {
      await Submission.create({
        assignment: assignmentList[0]._id,
        student: studentUser._id,
        file: '/uploads/submissions/demo_raft_implementation.pdf',
        fileName: 'Ali_Ahmed_Raft_Consensus_Simulator.pdf',
        fileSize: 412 * 1024,
        comment: 'Implemented Raft leader election, heartbeats, and cluster split-brain recovery tests.',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        marks: 48,
        feedback: 'Exceptional test coverage and clear handling of network partition edge cases.',
        status: 'graded',
        gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        gradedBy: teacherUser._id,
      });
      console.log('[Seed] Created sample graded submission');
    }
  }

  // 10. Seed Official Examination Results
  if (courseList.length > 0 && studentUser && activeSemester && pastSemester) {
    const resultsData = [
      {
        student: studentUser._id,
        course: courseList[0]._id,
        semester: pastSemester._id,
        teacher: teacherUser?._id,
        marks: 89,
        totalMarks: 100,
        grade: 'A',
        gradePoint: 4.0,
        remarks: 'Outstanding performance',
        status: 'published' as const,
      },
      {
        student: studentUser._id,
        course: courseList[1]._id,
        semester: pastSemester._id,
        teacher: teacherUser?._id,
        marks: 84,
        totalMarks: 100,
        grade: 'A-',
        gradePoint: 3.67,
        remarks: 'Excellent coursework and project presentation',
        status: 'published' as const,
      },
      {
        student: studentUser._id,
        course: courseList[2]._id,
        semester: activeSemester._id,
        teacher: teacherUser?._id,
        marks: 92,
        totalMarks: 100,
        grade: 'A',
        gradePoint: 4.0,
        remarks: 'Top score in mid-term and lab evaluations',
        status: 'published' as const,
      },
    ];

    for (const rData of resultsData) {
      const existing = await Result.findOne({
        student: rData.student,
        course: rData.course,
        semester: rData.semester,
      });
      if (!existing) {
        await Result.create(rData);
        console.log(`[Seed] Created examination result for course`);
      }
    }
  }

  // 11. Seed Announcements
  if (adminUser && teacherUser) {
    const announcementsData = [
      {
        title: 'Fall 2026 Midterm Examination Schedule Released',
        description:
          'The Controller of Examinations has published the date sheet for Fall 2026 Midterm Evaluations. All students are advised to check room allocations and seat tags on the notice boards.',
        category: 'exam',
        author: adminUser._id,
        audience: 'all' as const,
        publishDate: new Date(),
        isPublished: true,
      },
      {
        title: 'Call for Papers: 14th National Computing Conference (NCC 2026)',
        description:
          'Faculty members and final-year undergraduate researchers are invited to submit original research papers in Distributed Systems, Generative AI, and Quantum Computing.',
        category: 'academic',
        author: teacherUser._id,
        audience: 'all' as const,
        department: csDept?._id,
        publishDate: new Date(),
        isPublished: true,
      },
      {
        title: 'Campus Fiber Network Maintenance Alert',
        description:
          'IT Services will be carrying out core network switch upgrades this Sunday between 02:00 AM and 06:00 AM. Portal connectivity may experience intermittent latency.',
        category: 'notice',
        author: adminUser._id,
        audience: 'all' as const,
        publishDate: new Date(),
        isPublished: true,
      },
    ];

    for (const ann of announcementsData) {
      const existing = await Announcement.findOne({ title: ann.title });
      if (!existing) {
        await Announcement.create(ann);
        console.log(`[Seed] Created announcement: ${ann.title}`);
      }
    }
  }

  // 12. Seed Student Fee Vouchers
  if (studentUser && activeSemester && pastSemester) {
    const feesData = [
      {
        student: studentUser._id,
        semester: pastSemester._id,
        invoiceNumber: 'INV-2026-0041',
        amount: 85000,
        dueDate: new Date('2026-03-15'),
        paidAmount: 85000,
        status: 'paid' as const,
        description: 'Spring 2026 Tuition Fee, Computer Lab Charges, and Library Subscription',
      },
      {
        student: studentUser._id,
        semester: activeSemester._id,
        invoiceNumber: 'INV-2026-0098',
        amount: 92000,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days ahead
        paidAmount: 46000,
        status: 'partially_paid' as const,
        description: 'Fall 2026 Tuition Fee, Final Year Project Lab Facility, and Student Activity Fee',
      },
    ];

    for (const f of feesData) {
      const existing = await Fee.findOne({ invoiceNumber: f.invoiceNumber });
      if (!existing) {
        await Fee.create(f);
        console.log(`[Seed] Created fee voucher: ${f.invoiceNumber}`);
      }
    }
  }

  // 13. Seed Notifications
  if (studentUser && teacherUser) {
    const notificationsData = [
      {
        recipient: studentUser._id,
        title: 'Assignment Graded',
        message: 'Your coursework for "Assignment 1: Distributed Consensus & Raft Implementation" has been graded.',
        type: 'assignment' as const,
        link: `/dashboard/student/assignments/${assignmentList[0]?._id}`,
        isRead: false,
      },
      {
        recipient: studentUser._id,
        title: 'New Official Result Published',
        message: 'Official result for CS-410 Cloud Infrastructure has been verified and published.',
        type: 'result' as const,
        link: '/dashboard/student/results',
        isRead: false,
      },
      {
        recipient: teacherUser._id,
        title: 'Coursework Submitted',
        message: 'Ali Ahmed submitted solution for Assignment 1.',
        type: 'assignment' as const,
        link: `/dashboard/teacher/assignments/${assignmentList[0]?._id}/submissions`,
        isRead: true,
      },
    ];

    for (const n of notificationsData) {
      const existing = await Notification.findOne({ recipient: n.recipient, title: n.title });
      if (!existing) {
        await Notification.create(n);
        console.log(`[Seed] Created notification: ${n.title}`);
      }
    }
  }

  // 14. Seed Audit Logs
  if (adminUser) {
    const logsData = [
      {
        user: adminUser._id,
        action: 'USER_ENROLLED',
        entity: 'User',
        description: 'Enrolled new student Ali Ahmed (STU-2026-0042) into BS Computer Science',
        ip: '127.0.0.1',
      },
      {
        user: adminUser._id,
        action: 'PUBLISH_RESULTS',
        entity: 'Result',
        description: 'Published approved semester results for Fall 2026 batch',
        ip: '127.0.0.1',
      },
      {
        user: adminUser._id,
        action: 'BROADCAST_ANNOUNCEMENT',
        entity: 'Announcement',
        description: 'Broadcasted Fall 2026 Midterm Examination Schedule',
        ip: '127.0.0.1',
      },
    ];

    for (const l of logsData) {
      const existing = await AuditLog.findOne({ description: l.description });
      if (!existing) {
        await AuditLog.create(l);
        console.log(`[Seed] Created audit log: ${l.action}`);
      }
    }
  }

  // 15. Seed Contact Message
  const existingContact = await ContactMessage.findOne({ email: 'prospective.student@gmail.com' });
  if (!existingContact) {
    await ContactMessage.create({
      name: 'Zainab Qureshi',
      email: 'prospective.student@gmail.com',
      subject: 'Inquiry regarding MS Data Science Admissions 2026',
      message:
        'Hello Admissions Office, I am interested in applying for the evening MS Data Science program. Could you kindly share the prerequisite coursework and scholarship eligibility guidelines? Thank you.',
      isRead: false,
    });
    console.log('[Seed] Created sample prospective contact inquiry');
  }

  console.log('Seeding completed successfully!');
  await disconnectDatabase();
  process.exit(0);
};

seedDatabase().catch(async (err) => {
  console.error('Seeding error:', err);
  await disconnectDatabase();
  process.exit(1);
});

import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { TeacherProfile } from '../models/teacherProfile.model.js';
import { User } from '../models/user.model.js';
import { Course } from '../models/course.model.js';
import { StudentProfile } from '../models/studentProfile.model.js';
import { Attendance } from '../models/attendance.model.js';
import { Assignment } from '../models/assignment.model.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Helper: Find enrolled students for given course(s)
 */
export async function getStudentProfilesForCourses(courseIds: (mongoose.Types.ObjectId | string)[]) {
  const courses = await Course.find({ _id: { $in: courseIds } });
  if (courses.length === 0) return [];

  const semesterIds: mongoose.Types.ObjectId[] = [];
  const deptIds: mongoose.Types.ObjectId[] = [];
  const explicitStudentUserIds: mongoose.Types.ObjectId[] = [];

  for (const c of courses) {
    if (c.semester) semesterIds.push(c.semester as mongoose.Types.ObjectId);
    if (c.department) deptIds.push(c.department as mongoose.Types.ObjectId);
    if (c.enrolledStudents && c.enrolledStudents.length > 0) {
      explicitStudentUserIds.push(...(c.enrolledStudents as mongoose.Types.ObjectId[]));
    }
  }

  // Find students by matching semester, department, or explicit enrollment
  const studentProfiles = await StudentProfile.find({
    $or: [
      {
        semester: { $in: semesterIds },
        department: { $in: deptIds },
      },
      {
        user: { $in: explicitStudentUserIds },
      },
    ],
    enrollmentStatus: 'enrolled',
  })
    .populate('user', 'firstName lastName email phone isActive')
    .populate('department', 'name code')
    .populate('semester', 'name semesterNumber academicYear');

  return studentProfiles;
}

/**
 * GET /api/teachers/me
 * Authenticated teacher gets own profile
 */
export const getMyTeacherProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    let profile = await TeacherProfile.findOne({ user: req.user._id })
      .populate('department', 'name code description')
      .populate('user', 'firstName lastName email phone role isActive');

    // Auto-create profile if missing
    if (!profile) {
      const generatedTeacherId = `FAC-${new Date().getFullYear()}-${Math.floor(
        100 + Math.random() * 900
      )}`;

      profile = await TeacherProfile.create({
        user: req.user._id,
        teacherId: generatedTeacherId,
        designation: 'Assistant Professor',
        qualification: 'Ph.D. in Computer Science',
        phone: req.user.phone || '',
        employmentStatus: 'active',
      });

      profile = await TeacherProfile.findById(profile._id)
        .populate('department', 'name code description')
        .populate('user', 'firstName lastName email phone role isActive');
    }

    ApiResponse.success(res, 'Teacher profile retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/teachers/me
 * Teacher updates permitted information
 * Allowed: phone, address, specialization, qualification, profileImage
 * Prohibited: teacherId, role, department, designation, joiningDate, employmentStatus
 */
export const updateMyTeacherProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { phone, address, specialization, qualification, profileImage } = req.body;

    let profile = await TeacherProfile.findOne({ user: req.user._id });

    if (!profile) {
      const generatedTeacherId = `FAC-${new Date().getFullYear()}-${Math.floor(
        100 + Math.random() * 900
      )}`;

      profile = new TeacherProfile({
        user: req.user._id,
        teacherId: generatedTeacherId,
        designation: 'Assistant Professor',
        employmentStatus: 'active',
      });
    }

    if (phone !== undefined) {
      profile.phone = phone.trim();
      await User.findByIdAndUpdate(req.user._id, { phone: phone.trim() });
    }
    if (address !== undefined) profile.address = address.trim();
    if (specialization !== undefined) profile.specialization = specialization.trim();
    if (qualification !== undefined) profile.qualification = qualification.trim();
    if (profileImage !== undefined) profile.profileImage = profileImage;

    await profile.save();

    const updatedProfile = await TeacherProfile.findById(profile._id)
      .populate('department', 'name code')
      .populate('user', 'firstName lastName email role phone');

    ApiResponse.success(res, 'Teacher profile updated successfully', updatedProfile);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/teachers/stats
 * Dashboard metrics for teacher
 */
export const getTeacherStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const isTeacher = req.user.role === 'teacher';
    const filter: Record<string, unknown> = { isActive: true };
    if (isTeacher) {
      filter.teacher = req.user._id;
    }

    // 1. Assigned Courses
    const courses = await Course.find(filter).select('_id semester department courseCode title');
    const courseIds = courses.map((c) => c._id);

    // 2. Distinct Students
    const studentProfiles = await getStudentProfilesForCourses(courseIds);
    const totalStudents = studentProfiles.length;

    // 3. Today's active classes
    const todayClasses = courses.length;

    // 4. Pending assignments (published and due date in future)
    const assignmentFilter: Record<string, unknown> = {
      course: { $in: courseIds },
      status: 'published',
      dueDate: { $gte: new Date() },
    };
    if (isTeacher) {
      assignmentFilter.teacher = req.user._id;
    }
    const pendingAssignments = await Assignment.countDocuments(assignmentFilter);

    // 5. Attendance Overview
    const attendanceFilter: Record<string, unknown> = { course: { $in: courseIds } };
    if (isTeacher) {
      attendanceFilter.markedBy = req.user._id;
    }
    const totalAttendanceMarks = await Attendance.countDocuments(attendanceFilter);
    const presentAttendanceMarks = await Attendance.countDocuments({
      ...attendanceFilter,
      status: 'present',
    });
    const attendanceRate =
      totalAttendanceMarks > 0
        ? Math.round((presentAttendanceMarks / totalAttendanceMarks) * 100)
        : 0;

    // 6. Recent Activity
    const recentAttendance = await Attendance.find(attendanceFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('course', 'courseCode title')
      .populate('student', 'firstName lastName');

    const recentAssignments = await Assignment.find(
      isTeacher ? { teacher: req.user._id } : { course: { $in: courseIds } }
    )
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('course', 'courseCode title');

    ApiResponse.success(res, 'Teacher statistics retrieved successfully', {
      assignedCourses: courses.length,
      totalStudents,
      todayClasses,
      pendingAssignments,
      attendanceOverview: {
        totalRecords: totalAttendanceMarks,
        presentRecords: presentAttendanceMarks,
        attendanceRate,
      },
      recentActivity: {
        attendance: recentAttendance,
        assignments: recentAssignments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/teachers/courses
 * List courses assigned to teacher
 */
export const getTeacherCourses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { search, department, semester } = req.query;

    const filter: Record<string, unknown> = { isActive: true };
    if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    }

    if (department && mongoose.Types.ObjectId.isValid(department as string)) {
      filter.department = department;
    }

    if (semester && mongoose.Types.ObjectId.isValid(semester as string)) {
      filter.semester = semester;
    }

    if (search && typeof search === 'string') {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { courseCode: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const courses = await Course.find(filter)
      .populate('department', 'name code')
      .populate('semester', 'name semesterNumber academicYear')
      .populate('teacher', 'firstName lastName email')
      .sort({ courseCode: 1 });

    // Attach student count for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (c) => {
        const students = await getStudentProfilesForCourses([c._id]);
        return {
          ...c.toObject(),
          studentCount: students.length,
        };
      })
    );

    ApiResponse.success(res, 'Teacher courses retrieved successfully', coursesWithStats);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/teachers/courses/:id
 * Retrieve specific course with isolation check
 */
export const getTeacherCourseById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ApiResponse.error(res, 'Invalid course ID', 400);
      return;
    }

    const course = await Course.findById(id)
      .populate('department', 'name code description')
      .populate('semester', 'name semesterNumber academicYear startDate endDate')
      .populate('teacher', 'firstName lastName email phone');

    if (!course) {
      ApiResponse.error(res, 'Course not found', 404);
      return;
    }

    // Access control: Teacher must be the assigned instructor or admin
    if (
      req.user.role === 'teacher' &&
      (!course.teacher || course.teacher._id.toString() !== req.user._id.toString())
    ) {
      ApiResponse.error(
        res,
        'Access denied. You are not assigned as the instructor for this course.',
        403
      );
      return;
    }

    // Fetch enrolled students
    const students = await getStudentProfilesForCourses([course._id]);

    ApiResponse.success(res, 'Course details retrieved successfully', {
      course,
      students,
      studentCount: students.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/teachers/students
 * List students belonging to teacher's courses
 */
export const getTeacherStudents = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const { search, courseId, semesterId, page = 1, limit = 10 } = req.query;

    let targetCourseIds: mongoose.Types.ObjectId[] = [];

    if (courseId && mongoose.Types.ObjectId.isValid(courseId as string)) {
      // Check that teacher owns this course
      const course = await Course.findById(courseId);
      if (!course) {
        ApiResponse.error(res, 'Course not found', 404);
        return;
      }
      if (
        req.user.role === 'teacher' &&
        (!course.teacher || course.teacher.toString() !== req.user._id.toString())
      ) {
        ApiResponse.error(res, 'Access denied to this course roster', 403);
        return;
      }
      targetCourseIds = [course._id as mongoose.Types.ObjectId];
    } else {
      // Find all courses assigned to teacher
      const filter: Record<string, unknown> = { isActive: true };
      if (req.user.role === 'teacher') {
        filter.teacher = req.user._id;
      }
      const myCourses = await Course.find(filter).select('_id');
      targetCourseIds = myCourses.map((c) => c._id as mongoose.Types.ObjectId);
    }

    const allStudents = await getStudentProfilesForCourses(targetCourseIds);

    // Filter by search and semesterId
    let filtered = allStudents;

    if (semesterId && typeof semesterId === 'string') {
      filtered = filtered.filter(
        (s) => s.semester && s.semester._id && s.semester._id.toString() === semesterId
      );
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter((s) => {
        const u = s.user as unknown as { firstName?: string; lastName?: string; email?: string };
        const name = `${u?.firstName || ''} ${u?.lastName || ''}`.toLowerCase();
        const studentId = (s.studentId || '').toLowerCase();
        const email = (u?.email || '').toLowerCase();
        return name.includes(q) || studentId.includes(q) || email.includes(q);
      });
    }

    // Pagination
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    ApiResponse.success(res, 'Teacher students retrieved successfully', {
      students: paginated,
      total,
      page: pageNum,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

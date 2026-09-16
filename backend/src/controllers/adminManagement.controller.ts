import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { Department } from '../models/department.model.js';
import { Course } from '../models/course.model.js';
import { Semester } from '../models/semester.model.js';
import { StudentProfile } from '../models/studentProfile.model.js';
import { TeacherProfile } from '../models/teacherProfile.model.js';
import { Assignment } from '../models/assignment.model.js';
import { Submission } from '../models/submission.model.js';
import { Result } from '../models/result.model.js';
import { Fee } from '../models/fee.model.js';
import { Announcement } from '../models/announcement.model.js';
import { AuditLog } from '../models/auditLog.model.js';
import { ContactMessage } from '../models/contactMessage.model.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * GET /api/admin/analytics
 * Comprehensive university dashboard metrics
 */
export const getComprehensiveAdminStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      totalDepartments,
      totalCourses,
      totalSemesters,
      totalAssignments,
      totalSubmissions,
      totalResults,
      publishedResults,
      feeAgg,
      gradeAgg,
      recentLogs,
      deptDist,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'teacher', isActive: true }),
      Department.countDocuments(),
      Course.countDocuments(),
      Semester.countDocuments(),
      Assignment.countDocuments(),
      Submission.countDocuments(),
      Result.countDocuments(),
      Result.countDocuments({ status: 'published' }),
      Fee.aggregate([
        {
          $group: {
            _id: null,
            totalBilled: { $sum: '$amount' },
            totalPaid: { $sum: '$paidAmount' },
            totalOutstanding: { $sum: '$remainingAmount' },
          },
        },
      ]),
      Result.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$grade', count: { $sum: 1 } } },
      ]),
      AuditLog.find().populate('user', 'firstName lastName role').sort({ createdAt: -1 }).limit(6),
      StudentProfile.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'dept',
          },
        },
        { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            departmentName: { $ifNull: ['$dept.name', 'Unassigned'] },
            count: 1,
          },
        },
      ]),
    ]);

    const fees = feeAgg[0] || { totalBilled: 0, totalPaid: 0, totalOutstanding: 0 };

    const gradeDistribution: Record<string, number> = {
      'A+': 0,
      A: 0,
      'B+': 0,
      B: 0,
      'C+': 0,
      C: 0,
      D: 0,
      F: 0,
    };
    for (const g of gradeAgg) {
      if (g._id && gradeDistribution[g._id] !== undefined) {
        gradeDistribution[g._id] = g.count;
      }
    }

    ApiResponse.success(res, 'Comprehensive university statistics retrieved', {
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      totalDepartments,
      totalCourses,
      totalSemesters,
      totalAssignments,
      totalSubmissions,
      totalResults,
      publishedResults,
      fees,
      gradeDistribution,
      departmentDistribution: deptDist,
      recentLogs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/students
 * List students with full profile, department, semester, and filtering
 */
export const getStudentsList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { department, semester, status, search, page = 1, limit = 20 } = req.query;

    const userFilter: Record<string, unknown> = { role: 'student' };
    if (status === 'active') userFilter.isActive = true;
    if (status === 'inactive') userFilter.isActive = false;

    if (search) {
      userFilter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const matchedUsers = await User.find(userFilter).select('_id');
    const userIds = matchedUsers.map((u) => u._id);

    const profileFilter: Record<string, unknown> = { user: { $in: userIds } };
    if (department && mongoose.Types.ObjectId.isValid(department as string)) {
      profileFilter.department = department;
    }
    if (semester && mongoose.Types.ObjectId.isValid(semester as string)) {
      profileFilter.semester = semester;
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const total = await StudentProfile.countDocuments(profileFilter);
    const profiles = await StudentProfile.find(profileFilter)
      .populate('user', 'firstName lastName email isActive avatar phone address createdAt')
      .populate('department', 'name code')
      .populate('semester', 'name semesterNumber academicYear')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    ApiResponse.success(res, 'Students retrieved successfully', {
      students: profiles,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/students
 * Create new student account + profile
 */
export const createStudent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      email,
      password = 'Password123!',
      studentId,
      rollNumber,
      departmentId,
      semesterId,
      program = 'BS Computer Science',
      phone,
      address,
    } = req.body;

    if (!firstName || !lastName || !email || !studentId) {
      ApiResponse.error(res, 'firstName, lastName, email, and studentId are required', 400);
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      ApiResponse.error(res, 'A user with this email already exists', 400);
      return;
    }

    const existingId = await StudentProfile.findOne({ studentId: studentId.trim() });
    if (existingId) {
      ApiResponse.error(res, 'A student with this Student ID already exists', 400);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'student',
      phone: phone || '',
      isActive: true,
    });
    await user.save();

    const profile = new StudentProfile({
      user: user._id,
      studentId: studentId.trim(),
      department: departmentId || null,
      semester: semesterId || null,
      program: program || 'BS Computer Science',
      phone: phone || '',
      address: address || '',
      admissionYear: new Date().getFullYear(),
    });
    await profile.save();

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        action: 'CREATE_STUDENT',
        entity: 'StudentProfile',
        entityId: profile._id.toString(),
        description: `Enrolled new student ${user.firstName} ${user.lastName} (${studentId})`,
      });
    }

    const populated = await StudentProfile.findById(profile._id)
      .populate('user', 'firstName lastName email isActive')
      .populate('department', 'name code')
      .populate('semester', 'name academicYear');

    ApiResponse.success(res, 'Student created successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/students/:id
 * Updates student user and profile details
 */
export const updateStudent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      departmentId,
      semesterId,
      program,
      isActive,
      phone,
      address,
    } = req.body;

    const profile = await StudentProfile.findById(id);
    if (!profile) {
      ApiResponse.error(res, 'Student profile not found', 404);
      return;
    }

    const user = await User.findById(profile.user);
    if (user) {
      if (firstName) user.firstName = firstName.trim();
      if (lastName) user.lastName = lastName.trim();
      if (email) user.email = email.toLowerCase().trim();
      if (phone !== undefined) user.phone = phone;
      if (isActive !== undefined) user.isActive = Boolean(isActive);
      await user.save();
    }

    if (departmentId !== undefined) profile.department = departmentId || null;
    if (semesterId !== undefined) profile.semester = semesterId || null;
    if (program) profile.program = program;
    if (phone !== undefined) profile.phone = phone;
    if (address !== undefined) profile.address = address;
    await profile.save();

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        action: 'UPDATE_STUDENT',
        entity: 'StudentProfile',
        entityId: profile._id.toString(),
        description: `Updated student record for ${user?.firstName} ${user?.lastName}`,
      });
    }

    const updated = await StudentProfile.findById(id)
      .populate('user', 'firstName lastName email isActive phone address')
      .populate('department', 'name code')
      .populate('semester', 'name academicYear');

    ApiResponse.success(res, 'Student record updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/students/:id
 */
export const deleteStudent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const profile = await StudentProfile.findById(id);
    if (!profile) {
      ApiResponse.error(res, 'Student not found', 404);
      return;
    }

    await User.findByIdAndDelete(profile.user);
    await StudentProfile.findByIdAndDelete(id);

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        action: 'DELETE_STUDENT',
        entity: 'StudentProfile',
        entityId: id,
        description: `Deleted student profile ID ${id}`,
      });
    }

    ApiResponse.success(res, 'Student deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/teachers
 * List teachers with profile and assigned courses
 */
export const getTeachersList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { department, search, page = 1, limit = 20 } = req.query;

    const userFilter: Record<string, unknown> = { role: 'teacher' };
    if (search) {
      userFilter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const matchedUsers = await User.find(userFilter).select('_id');
    const userIds = matchedUsers.map((u) => u._id);

    const profileFilter: Record<string, unknown> = { user: { $in: userIds } };
    if (department && mongoose.Types.ObjectId.isValid(department as string)) {
      profileFilter.department = department;
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const total = await TeacherProfile.countDocuments(profileFilter);
    const profiles = await TeacherProfile.find(profileFilter)
      .populate('user', 'firstName lastName email isActive profileImage phone')
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const teacherUserIds = profiles.map((p) => p.user?._id || p.user);
    const assignedCourses = await Course.find({ teacher: { $in: teacherUserIds } }).select(
      'courseCode title creditHours teacher'
    );

    const teachersWithCourses = profiles.map((p) => {
      const u = p.user as unknown as { _id?: mongoose.Types.ObjectId };
      const uId = u?._id ? u._id.toString() : p.user.toString();
      const courses = assignedCourses.filter(
        (c) => c.teacher && c.teacher.toString() === uId
      );
      return {
        ...p.toObject(),
        courses,
      };
    });

    ApiResponse.success(res, 'Teachers retrieved successfully', {
      teachers: teachersWithCourses,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/teachers
 * Create teacher account + profile
 */
export const createTeacher = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      email,
      password = 'Password123!',
      teacherId,
      departmentId,
      designation = 'Assistant Professor',
      qualification,
      specialization,
      phone,
      address,
    } = req.body;

    if (!firstName || !lastName || !email || !teacherId) {
      ApiResponse.error(res, 'firstName, lastName, email, and teacherId are required', 400);
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      ApiResponse.error(res, 'A user with this email already exists', 400);
      return;
    }

    const existingId = await TeacherProfile.findOne({ teacherId: teacherId.trim() });
    if (existingId) {
      ApiResponse.error(res, 'A faculty member with this Teacher ID already exists', 400);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'teacher',
      phone: phone || '',
      isActive: true,
    });
    await user.save();

    const profile = new TeacherProfile({
      user: user._id,
      teacherId: teacherId.trim(),
      department: departmentId || null,
      designation: designation || 'Assistant Professor',
      qualification: qualification || 'Ph.D. / M.S.',
      specialization: specialization || 'Computer Science',
      phone: phone || '',
      address: address || '',
    });
    await profile.save();

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        action: 'CREATE_TEACHER',
        entity: 'TeacherProfile',
        entityId: profile._id.toString(),
        description: `Created faculty profile for Prof. ${user.firstName} ${user.lastName}`,
      });
    }

    const populated = await TeacherProfile.findById(profile._id)
      .populate('user', 'firstName lastName email isActive')
      .populate('department', 'name code');

    ApiResponse.success(res, 'Faculty member created successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/teachers/:id
 */
export const updateTeacher = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      departmentId,
      designation,
      qualification,
      specialization,
      isActive,
      courses,
      phone,
      address,
    } = req.body;

    const profile = await TeacherProfile.findById(id);
    if (!profile) {
      ApiResponse.error(res, 'Teacher profile not found', 404);
      return;
    }

    const user = await User.findById(profile.user);
    if (user) {
      if (firstName) user.firstName = firstName.trim();
      if (lastName) user.lastName = lastName.trim();
      if (email) user.email = email.toLowerCase().trim();
      if (phone !== undefined) user.phone = phone;
      if (isActive !== undefined) user.isActive = Boolean(isActive);
      await user.save();
    }

    if (departmentId !== undefined) profile.department = departmentId || null;
    if (designation) profile.designation = designation;
    if (qualification) profile.qualification = qualification;
    if (specialization) profile.specialization = specialization;
    if (phone !== undefined) profile.phone = phone;
    if (address !== undefined) profile.address = address;

    if (Array.isArray(courses) && user) {
      await Course.updateMany(
        { teacher: user._id },
        { $unset: { teacher: 1 } }
      );
      await Course.updateMany(
        { _id: { $in: courses } },
        { teacher: user._id }
      );
    }
    await profile.save();

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        action: 'UPDATE_TEACHER',
        entity: 'TeacherProfile',
        entityId: profile._id.toString(),
        description: `Updated faculty profile for ${user?.firstName} ${user?.lastName}`,
      });
    }

    const updated = await TeacherProfile.findById(id)
      .populate('user', 'firstName lastName email isActive phone address')
      .populate('department', 'name code')
      .populate('courses', 'courseCode title');

    ApiResponse.success(res, 'Teacher profile updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/teachers/:id
 */
export const deleteTeacher = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const profile = await TeacherProfile.findById(id);
    if (!profile) {
      ApiResponse.error(res, 'Teacher not found', 404);
      return;
    }

    await Course.updateMany({ teacher: profile.user }, { $unset: { teacher: 1 } });
    await User.findByIdAndDelete(profile.user);
    await TeacherProfile.findByIdAndDelete(id);

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        action: 'DELETE_TEACHER',
        entity: 'TeacherProfile',
        entityId: id,
        description: `Deleted teacher profile ID ${id}`,
      });
    }

    ApiResponse.success(res, 'Teacher deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/activity
 * System audit logs
 */
export const getActivityLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { action, entity, page = 1, limit = 30 } = req.query;
    const filter: Record<string, unknown> = {};

    if (action) filter.action = action;
    if (entity) filter.entity = entity;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 30);
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    ApiResponse.success(res, 'Audit activity logs retrieved', {
      logs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/reports
 * Structured reporting data generator
 */
export const getReportsData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type = 'students', department, semester } = req.query;

    if (type === 'students') {
      const filter: Record<string, unknown> = {};
      if (department) filter.department = department;
      if (semester) filter.semester = semester;

      const records = await StudentProfile.find(filter)
        .populate('user', 'firstName lastName email phone isActive')
        .populate('department', 'name code')
        .populate('semester', 'name');

      const data = records.map((r) => {
        const u = r.user as unknown as { firstName?: string; lastName?: string; email?: string; phone?: string; isActive?: boolean };
        const d = r.department as unknown as { name?: string; code?: string };
        const s = r.semester as unknown as { name?: string };
        return {
          id: r._id,
          studentId: r.studentId,
          name: `${u?.firstName || ''} ${u?.lastName || ''}`.trim(),
          email: u?.email || '',
          phone: u?.phone || 'N/A',
          department: d?.name || 'N/A',
          semester: s?.name || 'N/A',
          program: r.program,
          status: u?.isActive ? 'Active' : 'Inactive',
        };
      });

      ApiResponse.success(res, 'Student report generated', { type, count: data.length, data });
      return;
    }

    if (type === 'results') {
      const results = await Result.find({ status: 'published' })
        .populate('student', 'firstName lastName studentId email')
        .populate('course', 'courseCode title creditHours')
        .populate('semester', 'name academicYear');

      const data = results.map((r) => {
        const s = r.student as unknown as { firstName?: string; lastName?: string; email?: string };
        const c = r.course as unknown as { courseCode?: string; title?: string; creditHours?: number };
        const sem = r.semester as unknown as { name?: string };
        return {
          id: r._id,
          studentName: `${s?.firstName || ''} ${s?.lastName || ''}`.trim(),
          studentEmail: s?.email || '',
          courseCode: c?.courseCode || '',
          courseTitle: c?.title || '',
          creditHours: c?.creditHours || 3,
          semester: sem?.name || '',
          marks: r.marks,
          totalMarks: r.totalMarks,
          grade: r.grade,
          gradePoint: r.gradePoint,
        };
      });

      ApiResponse.success(res, 'Results report generated', { type, count: data.length, data });
      return;
    }

    if (type === 'fees') {
      const fees = await Fee.find()
        .populate('student', 'firstName lastName email')
        .populate('semester', 'name academicYear');

      const data = fees.map((f) => {
        const s = f.student as unknown as { firstName?: string; lastName?: string; email?: string };
        const sem = f.semester as unknown as { name?: string };
        return {
          id: f._id,
          invoiceNumber: f.invoiceNumber,
          studentName: `${s?.firstName || ''} ${s?.lastName || ''}`.trim(),
          semester: sem?.name || '',
          amount: f.amount,
          paidAmount: f.paidAmount,
          remainingAmount: f.remainingAmount,
          status: f.status,
          dueDate: new Date(f.dueDate).toLocaleDateString(),
        };
      });

      ApiResponse.success(res, 'Fee report generated', { type, count: data.length, data });
      return;
    }

    ApiResponse.error(res, 'Invalid report type specified', 400);
  } catch (error) {
    next(error);
  }
};

/**
 * Public Contact Form Submission: POST /api/admin/contact
 */
export const submitContactForm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      ApiResponse.error(res, 'Name, email, subject, and message are required', 400);
      return;
    }

    const contact = await ContactMessage.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    ApiResponse.success(res, 'Thank you! Your inquiry has been received.', contact, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin view contact inquiries: GET /api/admin/messages
 */
export const getContactMessages = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    ApiResponse.success(res, 'Contact messages retrieved', messages);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin mark contact inquiry read: PUT /api/admin/messages/:id/read
 */
export const markContactMessageRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const msg = await ContactMessage.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!msg) {
      ApiResponse.error(res, 'Message not found', 404);
      return;
    }
    ApiResponse.success(res, 'Message marked as read', msg);
  } catch (error) {
    next(error);
  }
};

/**
 * Global Search: GET /api/admin/search?q=keyword
 */
export const globalSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      ApiResponse.success(res, 'Search term too short', { results: [] });
      return;
    }

    const query = q.trim();
    const regex = { $regex: query, $options: 'i' };

    const [students, teachers, courses, announcements] = await Promise.all([
      User.find({
        role: 'student',
        $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
      })
        .select('firstName lastName email')
        .limit(5),
      User.find({
        role: 'teacher',
        $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
      })
        .select('firstName lastName email')
        .limit(5),
      Course.find({
        $or: [{ courseCode: regex }, { title: regex }],
      })
        .select('courseCode title')
        .limit(5),
      Announcement.find({
        $or: [{ title: regex }, { description: regex }],
      })
        .select('title category')
        .limit(5),
    ]);

    const results = [
      ...students.map((s) => ({
        id: s._id,
        title: `${s.firstName} ${s.lastName}`,
        subtitle: s.email,
        type: 'Student',
        url: `/dashboard/admin/students`,
      })),
      ...teachers.map((t) => ({
        id: t._id,
        title: `${t.firstName} ${t.lastName}`,
        subtitle: t.email,
        type: 'Teacher',
        url: `/dashboard/admin/teachers`,
      })),
      ...courses.map((c) => ({
        id: c._id,
        title: `${c.courseCode} - ${c.title}`,
        subtitle: 'Academic Course',
        type: 'Course',
        url: `/dashboard/admin/courses`,
      })),
      ...announcements.map((a) => ({
        id: a._id,
        title: a.title,
        subtitle: a.category,
        type: 'Announcement',
        url: `/dashboard/admin/announcements`,
      })),
    ];

    ApiResponse.success(res, 'Search results retrieved', { query, results });
  } catch (error) {
    next(error);
  }
};

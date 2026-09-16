import { computeDynamicStatus } from '../controllers/assignment.controller.js';
import { TeacherProfile } from '../models/teacherProfile.model.js';
import { Assignment } from '../models/assignment.model.js';
import { Attendance } from '../models/attendance.model.js';
import { Course } from '../models/course.model.js';

async function runPhase4Verification() {
  console.log('----------------------------------------------------');
  console.log('Starting Phase 4 Academic Functionality Verifications');
  console.log('----------------------------------------------------');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // 1. Test Assignment Dynamic Status Calculator
  console.log('\n--- 1. Testing Assignment Dynamic Status Calculator ---');
  const now = new Date();

  // Test 1: Draft remains draft regardless of date
  const futureDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  assert(computeDynamicStatus('draft', futureDate) === 'draft', 'Draft status returns draft');

  // Test 2: Closed remains closed
  assert(computeDynamicStatus('closed', futureDate) === 'closed', 'Closed status returns closed');

  // Test 3: Past due date returns overdue
  const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  assert(computeDynamicStatus('published', pastDate) === 'overdue', 'Past date returns overdue');

  // Test 4: Due within 48 hours returns due_soon
  const dueSoonDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  assert(computeDynamicStatus('published', dueSoonDate) === 'due_soon', 'Date within 48h returns due_soon');

  // Test 5: Due after 48 hours returns published
  assert(computeDynamicStatus('published', futureDate) === 'published', 'Date beyond 48h returns published');

  // 2. Test Attendance Schema & Compound Index Uniqueness
  console.log('\n--- 2. Testing Attendance Model Schema & Compound Indexes ---');
  const attendanceIndexes = Attendance.schema.indexes();
  const hasUniqueCompoundIndex = attendanceIndexes.some((idx) => {
    const fields = idx[0] as Record<string, number>;
    const options = idx[1] as { unique?: boolean } | undefined;
    return fields.student === 1 && fields.course === 1 && fields.date === 1 && options?.unique === true;
  });
  assert(hasUniqueCompoundIndex, 'Attendance schema contains unique compound index { student: 1, course: 1, date: 1 }');

  // Allowed statuses
  const statusEnumValues = (Attendance.schema.path('status') as unknown as { options?: { enum?: { values?: string[] } } })?.options?.enum?.values;
  assert(
    Array.isArray(statusEnumValues) &&
      statusEnumValues.includes('present') &&
      statusEnumValues.includes('absent') &&
      statusEnumValues.includes('late'),
    'Attendance status schema enforces enum [present, absent, late]'
  );

  // 3. Test Teacher Profile Model Schema
  console.log('\n--- 3. Testing Teacher Profile Schema Definitions ---');
  assert(TeacherProfile.schema.path('teacherId') !== undefined, 'TeacherProfile has teacherId');
  assert(TeacherProfile.schema.path('department') !== undefined, 'TeacherProfile has department reference');
  assert(TeacherProfile.schema.path('designation') !== undefined, 'TeacherProfile has designation');
  assert(TeacherProfile.schema.path('specialization') !== undefined, 'TeacherProfile has specialization');
  assert(TeacherProfile.schema.path('qualification') !== undefined, 'TeacherProfile has qualification');
  assert(TeacherProfile.schema.path('phone') !== undefined, 'TeacherProfile has phone');
  assert(TeacherProfile.schema.path('address') !== undefined, 'TeacherProfile has address');
  assert(TeacherProfile.schema.path('profileImage') !== undefined, 'TeacherProfile has profileImage');
  assert(TeacherProfile.schema.path('joiningDate') !== undefined, 'TeacherProfile has joiningDate');
  assert(TeacherProfile.schema.path('employmentStatus') !== undefined, 'TeacherProfile has employmentStatus');

  // Ensure email, password, role are NOT duplicated in TeacherProfile schema
  assert(TeacherProfile.schema.path('email') === undefined, 'TeacherProfile does NOT duplicate User email');
  assert(TeacherProfile.schema.path('password') === undefined, 'TeacherProfile does NOT duplicate User password');
  assert(TeacherProfile.schema.path('role') === undefined, 'TeacherProfile does NOT duplicate User role');

  // 4. Test Assignment Model Schema
  console.log('\n--- 4. Testing Assignment Model Schema Definitions ---');
  assert(Assignment.schema.path('title') !== undefined, 'Assignment schema has title');
  assert(Assignment.schema.path('description') !== undefined, 'Assignment schema has description');
  assert(Assignment.schema.path('course') !== undefined, 'Assignment schema has course reference');
  assert(Assignment.schema.path('teacher') !== undefined, 'Assignment schema has teacher reference');
  assert(Assignment.schema.path('dueDate') !== undefined, 'Assignment schema has dueDate');
  assert(Assignment.schema.path('totalMarks') !== undefined, 'Assignment schema has totalMarks');
  assert(Assignment.schema.path('attachment') !== undefined, 'Assignment schema has attachment');
  assert(Assignment.schema.path('status') !== undefined, 'Assignment schema has status');

  console.log('----------------------------------------------------');
  console.log(`Phase 4 Automated Verification Result: ${passedTests}/${totalTests} Tests Passed`);
  console.log('----------------------------------------------------');

  if (passedTests === totalTests) {
    console.log('ALL PHASE 4 LOGICAL & SCHEMA VERIFICATIONS PASSED.');
  } else {
    process.exit(1);
  }
}

runPhase4Verification().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});

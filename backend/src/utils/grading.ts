export interface GradeTier {
  minPercentage: number;
  grade: string;
  gradePoint: number;
  remarks: string;
}

export const UNIVERSITY_GRADE_SCALE: GradeTier[] = [
  { minPercentage: 90, grade: 'A+', gradePoint: 4.0, remarks: 'Exceptional' },
  { minPercentage: 85, grade: 'A', gradePoint: 4.0, remarks: 'Excellent' },
  { minPercentage: 80, grade: 'A-', gradePoint: 3.7, remarks: 'Superior' },
  { minPercentage: 75, grade: 'B+', gradePoint: 3.3, remarks: 'Very Good' },
  { minPercentage: 70, grade: 'B', gradePoint: 3.0, remarks: 'Good' },
  { minPercentage: 65, grade: 'B-', gradePoint: 2.7, remarks: 'Above Average' },
  { minPercentage: 60, grade: 'C+', gradePoint: 2.3, remarks: 'Average' },
  { minPercentage: 55, grade: 'C', gradePoint: 2.0, remarks: 'Below Average' },
  { minPercentage: 50, grade: 'D', gradePoint: 1.0, remarks: 'Pass' },
  { minPercentage: 0, grade: 'F', gradePoint: 0.0, remarks: 'Fail' },
];

/**
 * Calculates letter grade and grade point from marks and totalMarks
 */
export function calculateGrade(
  marks: number,
  totalMarks: number = 100
): {
  percentage: number;
  grade: string;
  gradePoint: number;
  remarks: string;
} {
  const safeMarks = Math.max(0, marks);
  const safeTotal = Math.max(1, totalMarks);
  const percentage = Math.round((safeMarks / safeTotal) * 100);

  for (const tier of UNIVERSITY_GRADE_SCALE) {
    if (percentage >= tier.minPercentage) {
      return {
        percentage,
        grade: tier.grade,
        gradePoint: tier.gradePoint,
        remarks: tier.remarks,
      };
    }
  }

  return {
    percentage,
    grade: 'F',
    gradePoint: 0.0,
    remarks: 'Fail',
  };
}

export interface CourseGradeCalcInput {
  creditHours: number;
  gradePoint: number;
}

/**
 * Calculates GPA using: sum(GradePoint * CreditHours) / sum(CreditHours)
 */
export function calculateGPA(courses: CourseGradeCalcInput[]): {
  gpa: number;
  totalCreditHours: number;
  totalGradePoints: number;
} {
  let totalCreditHours = 0;
  let totalWeightedPoints = 0;

  for (const c of courses) {
    const credits = Math.max(0, c.creditHours || 0);
    const points = Math.max(0, c.gradePoint || 0);
    if (credits > 0) {
      totalCreditHours += credits;
      totalWeightedPoints += points * credits;
    }
  }

  const gpa =
    totalCreditHours > 0
      ? Number((totalWeightedPoints / totalCreditHours).toFixed(2))
      : 0.0;

  return {
    gpa,
    totalCreditHours,
    totalGradePoints: Number(totalWeightedPoints.toFixed(2)),
  };
}

/**
 * Calculates CGPA across multiple completed semesters
 */
export function calculateCGPA(
  semesters: Array<{
    courses: CourseGradeCalcInput[];
  }>
): {
  cgpa: number;
  totalCredits: number;
  totalCompletedCourses: number;
} {
  let totalCredits = 0;
  let totalWeightedPoints = 0;
  let totalCompletedCourses = 0;

  for (const sem of semesters) {
    for (const c of sem.courses) {
      const credits = Math.max(0, c.creditHours || 0);
      const points = Math.max(0, c.gradePoint || 0);
      if (credits > 0) {
        totalCredits += credits;
        totalWeightedPoints += points * credits;
        totalCompletedCourses++;
      }
    }
  }

  const cgpa =
    totalCredits > 0
      ? Number((totalWeightedPoints / totalCredits).toFixed(2))
      : 0.0;

  return {
    cgpa,
    totalCredits,
    totalCompletedCourses,
  };
}

export type Grade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'NG';

export interface GradeResult {
    grade: Grade;
    gpa: number;
}

export function calculateGrade(obtained: number, fullMarks: number): GradeResult {
    if (fullMarks === 0) return { grade: 'NG', gpa: 0 };

    // Scale obtained to 100% just for checking percentage range, 
    // BUT NEB basic grades are on percentage of total usually. 
    // Or is it on abs values? Usually percentage.
    const percentage = (obtained / fullMarks) * 100;

    if (percentage >= 90) return { grade: 'A+', gpa: 4.0 };
    if (percentage >= 80) return { grade: 'A', gpa: 3.6 };
    if (percentage >= 70) return { grade: 'B+', gpa: 3.2 };
    if (percentage >= 60) return { grade: 'B', gpa: 2.8 };
    if (percentage >= 50) return { grade: 'C+', gpa: 2.4 };
    if (percentage >= 40) return { grade: 'C', gpa: 2.0 };
    if (percentage >= 35) return { grade: 'D', gpa: 1.6 };

    return { grade: 'NG', gpa: 0 };
}

export function calculateOverallGPA(subjects: { creditHour: number, gradePoint: number }[]): string {
    if (subjects.length === 0) return "0.00";

    const totalCreditPoints = subjects.reduce((sum, s) => sum + (s.creditHour * s.gradePoint), 0);
    const totalCreditHours = subjects.reduce((sum, s) => sum + s.creditHour, 0);

    return (totalCreditPoints / totalCreditHours).toFixed(2);
}

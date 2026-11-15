/**
 * BTEB (polytechnic) grading scale used across the app.
 * Marks -> letter grade & grade point.
 */
export function gradeFor(marks: number): { grade: string; point: number } {
  if (marks >= 80) return { grade: "A+", point: 4.0 }
  if (marks >= 75) return { grade: "A", point: 3.75 }
  if (marks >= 70) return { grade: "A-", point: 3.5 }
  if (marks >= 65) return { grade: "B+", point: 3.25 }
  if (marks >= 60) return { grade: "B", point: 3.0 }
  if (marks >= 55) return { grade: "B-", point: 2.75 }
  if (marks >= 50) return { grade: "C+", point: 2.5 }
  if (marks >= 45) return { grade: "C", point: 2.25 }
  if (marks >= 40) return { grade: "D", point: 2.0 }
  return { grade: "F", point: 0 }
}

export function gpaFor(marks: number[]): number {
  if (marks.length === 0) return 0
  const total = marks.reduce((sum, m) => sum + gradeFor(m).point, 0)
  return Math.round((total / marks.length) * 100) / 100
}

export function gpaColor(gpa: number): string {
  if (gpa >= 3.5) return "text-emerald-600 dark:text-emerald-400"
  if (gpa >= 2.5) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const

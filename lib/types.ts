export type Shift = "1st" | "2nd"

export type StudentStatus = "active" | "graduated" | "dropped"

export type Department = {
  id: string
  /** e.g. "Computer Science & Technology" */
  name: string
  /** e.g. "CST" */
  short: string
  /** BTEB technology code, e.g. 67 */
  code: number
  createdAt: string
}

export type Student = {
  id: string
  /** e.g. 672401 */
  roll: string
  name: string
  email: string
  phone: string
  departmentId: string
  /** 1-8 */
  semester: number
  shift: Shift
  /** e.g. "2024-25" */
  session: string
  guardianName: string
  guardianPhone: string
  address: string
  /** yyyy-mm-dd */
  dob: string
  bloodGroup: string
  status: StudentStatus
  createdAt: string
}

export type SubjectResult = {
  name: string
  marks: number
  grade: string
  point: number
}

export type Result = {
  id: string
  studentId: string
  semester: number
  subjects: SubjectResult[]
  gpa: number
  createdAt: string
}

export type Attendance = {
  id: string
  /** yyyy-mm-dd */
  date: string
  departmentId: string
  semester: number
  /** student ids */
  present: string[]
  absent: string[]
}

export type Notice = {
  id: string
  title: string
  body: string
  date: string
  pinned: boolean
}

export type User = {
  username: string
  name: string
  passwordHash: string
}

export type DB = {
  users: User[]
  departments: Department[]
  students: Student[]
  results: Result[]
  attendance: Attendance[]
  notices: Notice[]
}

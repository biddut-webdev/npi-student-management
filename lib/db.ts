import "server-only"

import { createHash, randomUUID } from "node:crypto"
import { accessSync, constants as fsConstants, mkdirSync } from "node:fs"
import { promises as fs } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

import type { Attendance, DB, Department, Notice, Result, Student } from "./types"
import { gpaFor, gradeFor } from "./grading"
import { hashPassword } from "./password"

/**
 * Database file location:
 * - Local dev/production server → `<project>/data/db.json`
 * - Serverless hosting (e.g. Vercel) → `/tmp/…` because the project
 *   directory is read-only there.
 */
let dataDir = path.join(process.cwd(), "data")
try {
  mkdirSync(dataDir, { recursive: true })
  accessSync(dataDir, fsConstants.W_OK)
} catch {
  dataDir = path.join(tmpdir(), "npi-student-management")
}
const DB_FILE = path.join(dataDir, "db.json")

/** Serializes all writes so concurrent requests never clobber the file. */
let writeChain: Promise<unknown> = Promise.resolve()

export function newId(): string {
  return randomUUID()
}

async function readRaw(): Promise<DB> {
  const text = await fs.readFile(DB_FILE, "utf8")
  return JSON.parse(text) as DB
}

async function writeRaw(db: DB): Promise<void> {
  const run = writeChain.then(async () => {
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf8")
  })
  writeChain = run.catch(() => {})
  await run
}

export async function readDb(): Promise<DB> {
  try {
    return await readRaw()
  } catch {
    const seed = seedData()
    await writeRaw(seed)
    return seed
  }
}

export async function writeDb(db: DB): Promise<void> {
  await writeRaw(db)
}

/* ------------------------------------------------------------------ */
/* Seed data — created automatically on first run                      */
/* ------------------------------------------------------------------ */

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function seedDepartments(): Department[] {
  const base = [
    { name: "Computer Science Technology", short: "CST", code: 67 },
    { name: "Environment Technology", short: "ENVT", code: 70 },
    { name: "Civil Technology", short: "CT", code: 66 },
    { name: "Architecture Technology", short: "AT", code: 61 },
    { name: "Food Technology", short: "FT", code: 72 },
  ]
  return base.map((d, i) => ({
    id: `dept-${d.short.toLowerCase()}`,
    ...d,
    createdAt: isoDaysAgo(400 - i),
  }))
}

const SEED_STUDENTS: Array<
  Pick<
    Student,
    "roll" | "name" | "email" | "phone" | "departmentId" | "semester" | "shift" | "session" | "guardianName" | "guardianPhone" | "address" | "dob" | "bloodGroup"
  > & { status?: Student["status"] }
> = [
  { roll: "672401", name: "Ayesha Siddika", email: "ayesha.npi@gmail.com", phone: "01710000001", departmentId: "dept-cst", semester: 3, shift: "1st", session: "2024-25", guardianName: "Md. Siddik Hossain", guardianPhone: "01710000101", address: "Boro Pangram, Naogaon", dob: "2008-03-14", bloodGroup: "B+" },
  { roll: "672402", name: "Md. Rakibul Hasan", email: "rakib.hasan.npi@gmail.com", phone: "01710000002", departmentId: "dept-cst", semester: 3, shift: "1st", session: "2024-25", guardianName: "Abdul Karim", guardianPhone: "01710000102", address: "Dubalhat, Naogaon", dob: "2008-01-22", bloodGroup: "O+" },
  { roll: "672403", name: "Nusrat Jahan", email: "nusrat.jahan.npi@gmail.com", phone: "01710000003", departmentId: "dept-cst", semester: 1, shift: "2nd", session: "2025-26", guardianName: "Mizanur Rahman", guardianPhone: "01710000103", address: "Kazirhat, Naogaon", dob: "2009-06-30", bloodGroup: "A+" },
  { roll: "672404", name: "Tanvir Ahmed", email: "tanvir.ahmed.npi@gmail.com", phone: "01710000004", departmentId: "dept-cst", semester: 5, shift: "1st", session: "2023-24", guardianName: "Shafiqul Islam", guardianPhone: "01710000104", address: "Paharpur, Badalgachhi", dob: "2006-11-02", bloodGroup: "AB+" },
  { roll: "672405", name: "Sumaiya Akter", email: "sumaiya.akter.npi@gmail.com", phone: "01710000005", departmentId: "dept-cst", semester: 7, shift: "1st", session: "2022-23", guardianName: "Nasir Uddin", guardianPhone: "01710000105", address: "Naogaon Sadar", dob: "2005-08-19", bloodGroup: "B-" },
  { roll: "702401", name: "Mahmudul Hasan", email: "mahmudul.npi@gmail.com", phone: "01710000006", departmentId: "dept-envt", semester: 2, shift: "1st", session: "2025-26", guardianName: "Jahangir Alam", guardianPhone: "01710000106", address: "Atgrah, Naogaon", dob: "2008-04-11", bloodGroup: "O-" },
  { roll: "702402", name: "Sabrina Haque", email: "sabrina.haque.npi@gmail.com", phone: "01710000007", departmentId: "dept-envt", semester: 4, shift: "1st", session: "2023-24", guardianName: "Anwar Haque", guardianPhone: "01710000107", address: "Mohadevpur, Naogaon", dob: "2007-02-05", bloodGroup: "A-" },
  { roll: "702403", name: "Imran Hossain", email: "imran.hossain.npi@gmail.com", phone: "01710000008", departmentId: "dept-envt", semester: 6, shift: "2nd", session: "2022-23", guardianName: "Rashedul Karim", guardianPhone: "01710000108", address: "Patnitala, Naogaon", dob: "2005-12-27", bloodGroup: "B+" },
  { roll: "612401", name: "Fatema Tuz Zohra", email: "fatema.npi@gmail.com", phone: "01710000009", departmentId: "dept-at", semester: 3, shift: "1st", session: "2024-25", guardianName: "Habibur Rahman", guardianPhone: "01710000109", address: "Shahid Nagar, Naogaon", dob: "2008-05-09", bloodGroup: "O+" },
  { roll: "612402", name: "Jubayer Rahman", email: "jubayer.npi@gmail.com", phone: "01710000010", departmentId: "dept-at", semester: 5, shift: "1st", session: "2023-24", guardianName: "Sohel Rana", guardianPhone: "01710000110", address: "Dhamoirhat, Naogaon", dob: "2006-09-17", bloodGroup: "AB-" },
  { roll: "662401", name: "Rifat Chowdhury", email: "rifat.npi@gmail.com", phone: "01710000011", departmentId: "dept-ct", semester: 1, shift: "1st", session: "2025-26", guardianName: "Kamruzzaman", guardianPhone: "01710000111", address: "Atrai, Naogaon", dob: "2009-01-08", bloodGroup: "A+" },
  { roll: "662402", name: "Tasnim Rahman", email: "tasnim.npi@gmail.com", phone: "01710000012", departmentId: "dept-ct", semester: 4, shift: "2nd", session: "2023-24", guardianName: "Rafiqul Bari", guardianPhone: "01710000112", address: "Raninagar, Naogaon", dob: "2007-07-23", bloodGroup: "B+" },
  { roll: "662403", name: "Ariful Islam", email: "ariful.npi@gmail.com", phone: "01710000013", departmentId: "dept-ct", semester: 8, shift: "1st", session: "2022-23", guardianName: "Nurul Amin", guardianPhone: "01710000113", address: "Manda, Naogaon", dob: "2004-10-15", bloodGroup: "O+", status: "graduated" },
  { roll: "722401", name: "Shahida Begum", email: "shahida.npi@gmail.com", phone: "01710000014", departmentId: "dept-ft", semester: 2, shift: "1st", session: "2025-26", guardianName: "Delwar Hossain", guardianPhone: "01710000114", address: "Naogaon Sadar", dob: "2008-08-03", bloodGroup: "A+" },
  { roll: "722402", name: "Hasibul Karim", email: "hasibul.npi@gmail.com", phone: "01710000015", departmentId: "dept-ft", semester: 6, shift: "1st", session: "2022-23", guardianName: "Babul Akter", guardianPhone: "01710000115", address: "Porsha, Naogaon", dob: "2005-04-29", bloodGroup: "B+", status: "dropped" },
  { roll: "722403", name: "Maliha Rahman", email: "maliha.npi@gmail.com", phone: "01710000016", departmentId: "dept-ft", semester: 5, shift: "2nd", session: "2023-24", guardianName: "Ekhlas Uddin", guardianPhone: "01710000116", address: "Sapahar, Naogaon", dob: "2006-03-21", bloodGroup: "O+" },
]

const SUBJECTS_BY_DEPT: Record<string, string[]> = {
  "dept-cst": ["Mathematics-3", "Database Application", "Web Design & Development", "Java Programming", "Network Fundamentals", "Business Communication"],
  "dept-envt": ["Environmental Chemistry", "Water Supply & Sewerage", "Environmental Pollution", "Solid Waste Management", "Mathematics-3", "Sanitary Engineering"],
  "dept-at": ["Architectural Design", "Building Construction", "Building Drawing", "History of Architecture", "Mathematics-3", "Materials & Construction"],
  "dept-ct": ["Structural Mechanics", "Surveying", "Construction Process", "Civil Materials", "Mathematics-3", "Estimating & Costing"],
  "dept-ft": ["Food Chemistry", "Food Microbiology", "Food Processing & Preservation", "Dairy Technology", "Mathematics-3", "Food Plant Design"],
}

/** Deterministic pseudo-random marks so the seed data is stable-ish per student. */
function marksFor(seedStr: string, index: number): number {
  const hash = createHash("md5").update(`${seedStr}:${index}`).digest()
  const value = hash[0]
  return 45 + (value % 51) // 45-95
}

function seedResults(students: Student[], departments: Department[]): Result[] {
  const results: Result[] = []
  const deptSubjects = new Map(departments.map((d) => [d.id, SUBJECTS_BY_DEPT[d.id] ?? ["General Subject"]]))
  for (const s of students) {
    const subjects = deptSubjects.get(s.departmentId) ?? ["General Subject"]
    const maxSemester = Math.min(s.semester, 4)
    for (let sem = 1; sem <= maxSemester; sem++) {
      const rows = subjects.slice(0, 5).map((name, i) => {
        const marks = marksFor(`${s.roll}:${sem}`, i)
        const { grade, point } = gradeFor(marks)
        return { name, marks, grade, point }
      })
      results.push({
        id: `result-${s.roll}-${sem}`,
        studentId: s.id,
        semester: sem,
        subjects: rows,
        gpa: gpaFor(rows.map((r) => r.marks)),
        createdAt: isoDaysAgo(120 - sem * 20),
      })
    }
  }
  return results
}

function seedAttendance(students: Student[]): Attendance[] {
  const records: Attendance[] = []
  const dates = ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12"]
  const groups = new Map<string, Student[]>()
  for (const s of students) {
    const key = `${s.departmentId}|${s.semester}`
    groups.set(key, [...(groups.get(key) ?? []), s])
  }
  let counter = 0
  for (const [key, group] of groups) {
    const [departmentId, semester] = key.split("|")
    for (const date of dates) {
      counter++
      const present: string[] = []
      const absent: string[] = []
      for (const s of group) {
        const hash = createHash("md5").update(`${s.roll}:${date}`).digest()[0]
        if (hash % 10 < 8) present.push(s.id)
        else absent.push(s.id)
      }
      records.push({
        id: `att-${counter}`,
        date,
        departmentId,
        semester: Number(semester),
        present,
        absent,
      })
    }
  }
  return records
}

function seedNotices(): Notice[] {
  return [
    {
      id: "notice-1",
      title: "Semester Final Examination — January 2027",
      body: "The semester final examination of all technologies will start from 5 January 2027 as per the academic calendar published by BTEB. Students must collect admit cards from their department office at least three days before the exam. Mobile phones are strictly prohibited inside the exam hall.",
      date: isoDaysAgo(2),
      pinned: true,
    },
    {
      id: "notice-2",
      title: "Class Attendance Rule Reminder",
      body: "As per BTEB rules, every student must maintain at least 70% class attendance to appear in the final examination. Attendance will be verified from this system before admit card distribution.",
      date: isoDaysAgo(6),
      pinned: false,
    },
    {
      id: "notice-3",
      title: "Scholarship Application (Stipend) Open",
      body: "Eligible students can apply for the government stipend for the current session. Collect and submit the application form to the Student Welfare office within 20 November 2026. Guardian NID copy and bank details are required.",
      date: isoDaysAgo(11),
      pinned: true,
    },
    {
      id: "notice-4",
      title: "Winter Vacation Schedule",
      body: "The institute will remain closed for winter vacation from 21 December 2026 to 2 January 2027. Administrative office will remain open on working days.",
      date: isoDaysAgo(18),
      pinned: false,
    },
  ]
}

function seedData(): DB {
  const departments = seedDepartments()
  const students: Student[] = SEED_STUDENTS.map((s, i) => ({
    id: `student-${i + 1}`,
    ...s,
    status: s.status ?? "active",
    createdAt: isoDaysAgo(300 - i * 10),
  }))
  return {
    users: [
      {
        username: "admin",
        name: "NPI Administrator",
        passwordHash: hashPassword("admin123"),
      },
    ],
    departments,
    students,
    results: seedResults(students, departments),
    attendance: seedAttendance(students),
    notices: seedNotices(),
  }
}

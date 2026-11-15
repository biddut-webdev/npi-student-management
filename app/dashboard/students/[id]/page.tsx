import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  BookOpenCheck,
  CalendarCheck,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react"

import { deleteStudentAction } from "@/app/actions/students"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ConfirmSubmit } from "@/components/submit-button"
import { readDb } from "@/lib/db"
import { gpaColor } from "@/lib/grading"

export const dynamic = "force-dynamic"

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = await readDb()
  const student = db.students.find((s) => s.id === id)
  if (!student) notFound()

  const department = db.departments.find((d) => d.id === student.departmentId)
  const results = db.results
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => a.semester - b.semester)

  // Attendance summary for this student.
  const attendanceRows = db.attendance.filter(
    (a) => a.present.includes(student.id) || a.absent.includes(student.id)
  )
  const presentCount = attendanceRows.filter((a) =>
    a.present.includes(student.id)
  ).length
  const attendancePct =
    attendanceRows.length > 0
      ? Math.round((presentCount / attendanceRows.length) * 100)
      : null

  const cgpa =
    results.length > 0
      ? Math.round(
          (results.reduce((sum, r) => sum + r.gpa, 0) / results.length) * 100
        ) / 100
      : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/students"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Students
        </Link>
        <div className="flex gap-2">
          <Button
            render={<Link href={`/dashboard/students/${student.id}/edit`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            <Pencil /> Edit
          </Button>
          <form action={deleteStudentAction}>
            <input type="hidden" name="id" value={student.id} />
            <ConfirmSubmit
              message={`Delete ${student.name} (roll ${student.roll})? This also removes their results.`}
            >
              <Trash2 /> Delete
            </ConfirmSubmit>
          </form>
        </div>
      </div>

      {/* Identity card */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 font-heading text-2xl font-semibold text-primary">
            {student.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 font-heading text-xl font-semibold">
              {student.name}
              <Badge variant="secondary">Roll {student.roll}</Badge>
              <Badge
                variant={
                  student.status === "active"
                    ? "default"
                    : student.status === "graduated"
                      ? "secondary"
                      : "destructive"
                }
              >
                {student.status}
              </Badge>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {department?.name} · Semester {student.semester} · {student.shift} shift ·
              Session {student.session}
            </p>
          </div>
          {cgpa !== null ? (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">CGPA</p>
              <p className={`font-heading text-2xl font-semibold ${gpaColor(cgpa)}`}>
                {cgpa.toFixed(2)}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Details + attendance */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Phone, label: "Mobile", value: student.phone || "—" },
              { icon: Mail, label: "Email", value: student.email || "—" },
              {
                icon: CalendarCheck,
                label: "Date of birth",
                value: student.dob || "—",
              },
              { icon: BookOpenCheck, label: "Blood group", value: student.bloodGroup || "—" },
              { icon: Phone, label: "Guardian", value: student.guardianName || "—" },
              {
                icon: Phone,
                label: "Guardian mobile",
                value: student.guardianPhone || "—",
              },
            ].map((row) => (
              <div key={row.label} className="text-sm">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <row.icon className="size-3.5" /> {row.label}
                </p>
                <p className="mt-0.5 font-medium">{row.value}</p>
              </div>
            ))}
            <div className="text-sm sm:col-span-2">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" /> Address
              </p>
              <p className="mt-0.5 font-medium">{student.address || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
            <CardDescription>Based on recorded classes.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-semibold">
              {attendancePct === null ? "—" : `${attendancePct}%`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Present {presentCount} of {attendanceRows.length} classes.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Semester results</CardTitle>
          <CardDescription>Published results of this student.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {results.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No results published yet.
            </p>
          ) : (
            results.map((r) => (
              <div key={r.id} className="rounded-xl border border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium">Semester {r.semester}</p>
                  <p className={`font-heading font-semibold ${gpaColor(r.gpa)}`}>
                    GPA {r.gpa.toFixed(2)}
                  </p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="py-1 font-medium">Subject</th>
                      <th className="py-1 font-medium">Marks</th>
                      <th className="py-1 font-medium">Grade</th>
                      <th className="py-1 font-medium">Point</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.subjects.map((sub, i) => (
                      <tr key={i} className="border-b border-border/60 last:border-0">
                        <td className="py-1.5">{sub.name}</td>
                        <td className="py-1.5">{sub.marks}</td>
                        <td className="py-1.5">{sub.grade}</td>
                        <td className="py-1.5">{sub.point.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

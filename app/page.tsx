import Link from "next/link"
import {
  ArrowRight,
  BookOpenCheck,
  CalendarCheck,
  GraduationCap,
  MapPin,
  Megaphone,
  Phone,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { readDb } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const db = await readDb()
  const activeStudents = db.students.filter((s) => s.status === "active")
  const notices = db.notices
    .slice()
    .sort((a, b) => (a.pinned === b.pinned ? b.date.localeCompare(a.date) : a.pinned ? -1 : 1))
    .slice(0, 4)

  const stats = [
    { label: "Students", value: activeStudents.length, icon: Users },
    { label: "Technologies", value: db.departments.length, icon: GraduationCap },
    { label: "Published results", value: db.results.length, icon: BookOpenCheck },
    { label: "Notices", value: db.notices.length, icon: Megaphone },
  ]

  return (
    <div className="min-h-svh">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">NPI</span>
              <span className="block text-[11px] text-muted-foreground">
                Naogaon Polytechnic Institute
              </span>
            </span>
          </Link>
          <nav className="ml-auto hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
            <a href="#technologies" className="hover:text-foreground">
              Technologies
            </a>
            <a href="#notices" className="hover:text-foreground">
              Notices
            </a>
            <Link href="/check-result" className="hover:text-foreground">
              Check Result
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-1 sm:ml-0">
            <ThemeToggle />
            <Button render={<Link href="/login" />} nativeButton={false} size="sm">
              Admin Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:py-24">
          <Badge variant="secondary" className="h-6">
            <MapPin /> Naogaon, Rajshahi Division
          </Badge>
          <h1 className="max-w-2xl font-heading text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
            Naogaon Polytechnic Institute —{" "}
            <span className="text-primary">Student Management System</span>
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            One system for everything of our institute — student records, technology
            departments, semester results, class attendance and official notices.
            Run by the NPI administration.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button render={<Link href="/check-result" />} nativeButton={false} size="lg">
              Check your result <ArrowRight />
            </Button>
            <Button
              render={<Link href="#technologies" />}
              nativeButton={false}
              variant="outline"
              size="lg"
            >
              Explore technologies
            </Button>
          </div>

          <div className="mt-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-card p-4"
              >
                <s.icon className="size-4 text-primary" />
                <p className="mt-2 font-heading text-2xl font-semibold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section id="technologies" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-heading text-2xl font-semibold">Technologies</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The technology departments running under Bangladesh Technical Education
          Board (BTEB).
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {db.departments.map((d) => {
            const count = activeStudents.filter((s) => s.departmentId === d.id).length
            return (
              <Card key={d.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {d.name}
                    <Badge variant="secondary">Code {d.code}</Badge>
                  </CardTitle>
                  <CardDescription>Technology code {d.code} · {d.short}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    <Users className="mr-1 inline size-4 text-primary" />
                    {count} active student{count === 1 ? "" : "s"}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Notices */}
      <section id="notices" className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-semibold">Notice Board</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Latest official notices from the institute.
              </p>
            </div>
            <Button render={<Link href="/check-result" />} nativeButton={false} variant="outline" size="sm">
              <CalendarCheck /> Check result
            </Button>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {notices.map((n) => (
              <Card key={n.id} size="sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {n.pinned ? (
                      <Badge className="shrink-0">
                        <Megaphone /> Pinned
                      </Badge>
                    ) : null}
                    {n.title}
                  </CardTitle>
                  <CardDescription>
                    {new Date(n.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="font-heading font-semibold">Naogaon Polytechnic Institute</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A government polytechnic institute under the Bangladesh Technical
              Education Board (BTEB), serving the students of Naogaon and beyond.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <MapPin className="size-4" /> Naogaon Sadar, Naogaon
            </p>
            <p className="mt-2 flex items-center gap-2">
              <Phone className="size-4" /> +880 (0) — institute office
            </p>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} NPI Student Management System · Built for the
          students of Naogaon Polytechnic Institute
        </div>
      </footer>
    </div>
  )
}

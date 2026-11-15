# NPI — Naogaon Polytechnic Institute · Student Management System

NPI-র (নওগাঁ পলিটেকনিক ইনস্টিটিউট) জন্য তৈরি একটি সম্পূর্ণ Student Management System।
Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui (Base UI) দিয়ে বানানো।

## চালানোর নিয়ম

```bash
npm install
npm run dev      # development — http://localhost:3000
npm run build    # production build
npm start        # production server
```

**লগইন:** username `admin` · password `admin123`
(Settings পেজ থেকে পাল্টে নিতে পারবে।)

## কী কী ফিচার আছে

| ফিচার | কোথায় |
| --- | --- |
| Public website (hero, stats, technologies, notice board) | `/` |
| Public result check (roll দিয়ে রেজাল্ট দেখা) | `/check-result` |
| Admin login / logout | `/login` |
| Dashboard (stats, charts, recent students) | `/dashboard` |
| Students — list, search, filter (technology/semester/shift) | `/dashboard/students` |
| Student যোগ করা | `/dashboard/students/new` |
| Student profile (personal info, attendance %, results, CGPA) | `/dashboard/students/[id]` |
| Student edit / delete | `/dashboard/students/[id]/edit` |
| Departments (technologies) — add / edit / delete | `/dashboard/departments` |
| Results — semester result publish (GPA auto), delete | `/dashboard/results` |
| Attendance — দিন ভিত্তিক হাজিরা নেওয়া + history | `/dashboard/attendance` |
| Notices — publish/edit/delete (website-এ দেখায়) | `/dashboard/notices` |
| Admin account settings (name, username, password change) | `/dashboard/settings` |

GPA হিসাব BTEB গ্রেডিং স্কেল অনুযায়ী (A+ 80+, A 75+, A- 70+ … D 40, F <40)।

## কোথায় কী কোড আছে (project map)

```
app/
  layout.tsx                 → root layout (font, theme provider, metadata)
  globals.css                → theme colors (NPI-র জন্য নীল primary ব্র্যান্ডিং)
  page.tsx                   → public landing page
  login/page.tsx             → admin login
  check-result/page.tsx      → public result check (roll দিয়ে)
  actions/                   → server actions (সব mutation এখানে)
    auth.ts                  → login, logout, update account
    students.ts              → create / update / delete student
    departments.ts           → create / update / delete department
    results.ts               → publish / delete result (GPA auto-calc)
    attendance.ts            → save daily attendance
    notices.ts               → create / update / delete notice
  dashboard/
    layout.tsx               → login guard + sidebar shell
    page.tsx                 → overview (stats + charts)
    students/…               → list, new, [id] profile, [id]/edit
    departments/page.tsx
    results/…                → list + new (publish)
    attendance/page.tsx
    notices/page.tsx
    settings/page.tsx

lib/
  types.ts                   → সব TypeScript type (Student, Result, …)
  db.ts                      → JSON file database + seed data
  auth.ts                    → cookie session (getSession / requireSession)
  password.ts                → SHA-256 password hashing
  grading.ts                 → BTEB grading scale + GPA calculation
  utils.ts                   → cn() helper

components/
  ui/                        → shadcn/ui components (button, card, table, …)
  dashboard/
    dashboard-shell.tsx      → sidebar + topbar (mobile menu সহ)
    student-form.tsx         → add/edit student form (shared)
    result-form.tsx          → subject rows সহ result form (client)
  form-fields.tsx            → shared input/select/field styles
  submit-button.tsx          → pending-state + confirm delete buttons
  theme-toggle.tsx           → dark mode toggle

data/db.json                 → runtime database (প্রথম রানে auto-seed হয়)
```

## ডাটা কীভাবে সেভ হয়

- কোনো আলাদা database install লাগে না — সব ডাটা `data/db.json` ফাইলে থাকে।
- প্রথমবার চালালে seed data নিজে থেকে তৈরি হয়: ৫টি technology, ১৬ জন student,
  রেজাল্ট, হাজিরা রেকর্ড ও ৪টি notice।
- ডাটা রিসেট করতে চাইলে `data/db.json` মুছে দাও — আবার auto-seed হবে।
- প্রোডাকশনে গেলে পরে JSON ফাইলের জায়গায় SQLite/Postgres বসানো যাবে
  (`lib/db.ts`-এর `readDb`/`writeDb` দুটো ফাংশন বদলালেই হবে)।

## নোট

- Next.js 16: `params`/`searchParams`/`cookies()` সব async — কোডে `await` করা আছে।
- Turbopack default; `next.config.ts`-এ `turbopack.root` সেট করা আছে।

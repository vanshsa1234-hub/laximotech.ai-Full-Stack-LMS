# laximotech.ai — Full Stack LMS (Phase 0 + 1 + 2)

India's Most Affordable AI & Tech Learning Platform
Stack: Next.js 14 · TypeScript · Tailwind CSS · NestJS · PostgreSQL · Prisma · Auth.js · OpenAI

---

## ⚡ Quick Start (3 commands after unzip)

```powershell
docker compose up -d   # Start PostgreSQL on port 5433
npm install            # Install all dependencies
npm run dev            # Start frontend (3000) + backend (4000)
```

That's it. **No .env setup needed** — both `.env` files ship pre-configured for Docker.

### First time only — push DB schema + seed data:

```powershell
npm run db:push    # Push Prisma schema to Docker PostgreSQL
npm run db:seed    # Seed 25 courses, admin user, coupons, blog posts
```

---

## 📁 Project Structure

```
laximotech/
├── apps/
│   ├── web/                    # Next.js 14 (Vercel)
│   │   ├── src/app/            # App Router pages
│   │   │   ├── (public)/       # Homepage, courses, blog, paths, auth
│   │   │   ├── (dashboard)/    # Dashboard, learn, quiz
│   │   │   └── admin/          # Admin panel
│   │   ├── src/components/     # UI components
│   │   ├── src/hooks/          # React Query hooks
│   │   ├── src/lib/api.ts      # Axios API client
│   │   └── .env.local          # Pre-configured for Docker dev
│   └── api/                    # NestJS (Railway)
│       ├── src/
│       │   ├── auth/           # JWT + guards + decorators
│       │   ├── courses/        # Course CRUD + filters
│       │   ├── enrollments/    # Enrollment management
│       │   ├── orders/         # Razorpay payment flow
│       │   ├── lessons/        # Signed S3 video URLs
│       │   ├── progress/       # Watch time + streak tracking
│       │   ├── quizzes/        # Quiz engine + spaced repetition
│       │   ├── certificates/   # PDF generation + verify
│       │   ├── blog/           # Blog CRUD
│       │   ├── career-paths/   # Learning roadmaps
│       │   ├── comments/       # Discussion + upvotes
│       │   ├── ai/             # OpenAI Study Buddy (SSE streaming)
│       │   ├── admin/          # Admin dashboard + analytics
│       │   ├── users/          # Profile + leaderboard
│       │   └── storage/        # AWS S3 presigned URLs
│       ├── prisma/
│       │   ├── schema.prisma   # 29 models
│       │   └── seed.ts         # 25 courses + full data
│       └── .env                # Pre-configured for Docker dev
├── docker-compose.yml          # PostgreSQL (5433) + pgAdmin (5050)
├── package.json                # Turborepo + dotenv-cli scripts
└── turbo.json
```

---

## 🛠 All Scripts

```powershell
npm run dev          # Frontend :3000 + Backend :4000
npm run build        # Production build (both apps)
npm run db:push      # Push schema (no migration file) — uses dotenv-cli
npm run db:seed      # Seed all 25 courses + data
npm run db:studio    # Prisma Studio visual DB editor
npm run db:reset     # Drop + recreate schema (fresh start)
npm run db:migrate   # Create migration file + push
```

---

## 🐳 Docker

```powershell
docker compose up -d       # Start PostgreSQL + pgAdmin
docker compose down        # Stop
docker compose down -v     # Stop + delete all data (fresh start)
```

Services:

- **PostgreSQL** → localhost:5433 (user: laximotech / pass: laximotech123)
- **pgAdmin** → http://localhost:5050 (admin@laximotech.ai / admin123)

---

## 🌐 URLs (development)

| Service       | URL                               |
| ------------- | --------------------------------- |
| Frontend      | http://localhost:3000             |
| Backend API   | http://localhost:4000             |
| Swagger Docs  | http://localhost:4000/api/docs    |
| pgAdmin       | http://localhost:5050             |
| Prisma Studio | http://localhost:5555 (db:studio) |

---

## 🔑 Optional Environment Variables

The app runs without any of these — they just enable optional features:

| Variable                  | Feature            | Where to get             |
| ------------------------- | ------------------ | ------------------------ |
| `GOOGLE_CLIENT_ID/SECRET` | Google login       | console.cloud.google.com |
| `RESEND_API_KEY`          | Magic link email   | resend.com (free)        |
| `RAZORPAY_KEY_ID/SECRET`  | Payments           | dashboard.razorpay.com   |
| `OPENAI_API_KEY`          | AI Study Buddy     | platform.openai.com      |
| `AWS_*`                   | Video/file storage | AWS IAM                  |

Add to `apps/api/.env` and `apps/web/.env.local`.

---

## 👤 Default Users (after seed)

| Role         | Email                    | Password   |
| ------------ | ------------------------ | ---------- |
| Admin        | admin@laximotech.ai      | magic link |
| Instructor   | instructor@laximotech.ai | magic link |
| Demo Student | demo@laximotech.ai       | magic link |

---

## 📦 What's Built

### Phase 0 — Foundation

✅ Turborepo monorepo · Prisma 29-model schema · NestJS JWT auth
✅ Docker Compose · Design system · PWA manifest · Deployment configs

### Phase 1 — MVP

✅ Homepage (12 sections) · /courses listing + filters · Course detail page
✅ Video player (speed/seek/bookmark/fullscreen) · Razorpay payment
✅ Student dashboard · My courses · Certificates page · Auth page
✅ NestJS: Courses · Orders · Enrollments · Lessons · Progress · Users APIs

### Phase 2 — Full LMS

✅ Quiz engine (timer, spaced repetition, explanations, XP rewards)
✅ Certificate PDF generation (Puppeteer) + public verify page
✅ AI Study Buddy (OpenAI SSE streaming + context injection)
✅ Discussion/Comments (threaded, upvotes, instructor badge)
✅ Admin Panel (dashboard, courses, students, analytics, blog, coupons)
✅ Blog listing + detail pages · Career paths listing + detail pages
✅ About / Contact / Demo booking pages · Privacy/Terms/Refund
✅ Leaderboard page · Progress dashboard (heatmap + quiz history)
✅ Profile + Settings pages · All 25 courses in seed
✅ Sitemap.xml + robots.txt · 404 + error pages
✅ React Query hooks for all API calls · API sync hook

---

## 🚀 Production Deployment

### Frontend → Vercel

```
Root: apps/web
Build: next build
Env: copy apps/web/.env.local → Vercel environment variables
     (change DATABASE_URL to Railway PostgreSQL URL)
```

### Backend → Railway

```
Root: apps/api
Start: npm run start
Env: copy apps/api/.env → Railway environment variables
     (DATABASE_URL is auto-provided by Railway PostgreSQL plugin)
```

---

_Built with ❤️ in Greater Noida West, India 🇮🇳_

---

## ⚠️ Current Real-World Status (Backend Rebuild Pass)

This section documents exactly what is real vs. what still needs your input.

### ✅ Fully real, working end-to-end

- Auth: Google OAuth, magic link, and email+password ALL create the same kind of session (NextAuth JWT strategy). One login system, no fake tokens.
- `/dashboard` and all sub-pages pull real data from Postgres via NestJS — no hardcoded names, no fake XP.
- Quizzes: seeded with real `Quiz` + `QuizQuestion` rows per course section. Submitting grades against real correct answers, awards real XP, issues a real certificate on final exam pass.
- Discussion/comments: real threaded comments, real upvotes, tied to real logged-in users.
- Video player: plays whatever `videoUrl` is on the `Lesson` row. Seed currently points every lesson at one public sample MP4 — **replace via Prisma Studio or the admin panel with your real course videos.**
- Admin dashboard/students: real Postgres queries, zero mock arrays.

### 🟡 Honest in-progress state

- **Payments**: Razorpay is NOT configured. `EnrollButton` detects this and enrolls the user directly for free instead of pretending to charge them — no fake "payment successful" screen. Add `RAZORPAY_KEY_ID`/`SECRET` to `apps/api/.env` to switch on real payments.
- **AI Study Buddy**: requires `OPENAI_API_KEY` in `apps/api/.env`. Add your key and it streams real responses; without it, the panel shows a clear "not configured" state rather than a fake canned reply.
- **Video hosting**: no S3 wired up. The player works with any direct video URL — update `Lesson.videoUrl` per lesson via Prisma Studio (`npm run db:studio`) with your own hosted files.

### How to swap in your real video

```sql
-- via Prisma Studio (npm run db:studio), open the Lesson table and edit videoUrl,
-- or run a quick script:
```

```ts
await prisma.lesson.update({
  where: { id: 'lesson-id-here' },
  data: { videoUrl: 'https://your-cdn.com/real-video.mp4', videoDurationSec: 1200 },
});
```

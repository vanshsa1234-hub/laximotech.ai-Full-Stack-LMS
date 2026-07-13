# laximotech.ai — Full-Stack Learning Management System

**India's most affordable AI & tech learning platform** — a production-grade LMS built as a Turborepo monorepo, covering everything from course delivery and video streaming to payments, quizzes, certificates, and an AI study buddy.

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" />
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss" />
</p>

---

## ✨ Features

- **Course delivery** — sections, lessons, video/PDF/text/code content types, previews for non-enrolled users
- **Per-lesson downloadable documents** — optional notes/slides/PDFs per lesson, managed from the admin panel, multiple documents per lesson
- **Video learning experience** — custom video player with progress tracking, bookmarks, subtitles (Hindi/English), playback speed
- **Quizzes & assessments** — per-lesson quizzes, final exams, pass/fail thresholds, attempt history
- **Certificates** — auto-generated on course completion, verifiable via public link, customizable per-course templates
- **Payments** — Razorpay integration with coupon codes, order verification, webhook handling
- **AI Study Buddy** — OpenAI/OpenRouter-powered chat assistant embedded in the lesson view (streamed via SSE), plus an in-browser code playground/sandbox
- **Community** — per-lesson discussions/comments with voting, reviews on courses
- **Career paths** — curated multi-course learning tracks
- **Admin panel** — full CRUD for courses, sections, lessons, documents, blog, career paths, coupons, students, instructors, site content, contact/demo requests, plus analytics
- **Blog & marketing pages** — corporate training page, demo requests, contact forms, SEO metadata
- **PWA support** — installable, offline-friendly
- **Auth** — Auth.js (NextAuth) with Google OAuth + magic link email, JWT-secured API

---

## 🏗️ Tech Stack

| Layer            | Technology                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| Frontend          | Next.js 14 (App Router), TypeScript, Tailwind CSS, React Query, Radix UI    |
| Backend           | NestJS, TypeScript, Prisma ORM                                              |
| Database          | PostgreSQL 16                                                               |
| Auth              | Auth.js (NextAuth) on the frontend, JWT on the API                          |
| Storage           | AWS S3 (with local-disk fallback for dev)                                   |
| Payments          | Razorpay                                                                    |
| AI                | OpenAI / OpenRouter (chat), Judge0 (code execution sandbox)                 |
| Monorepo tooling  | Turborepo, npm workspaces                                                   |
| Infra (dev)       | Docker Compose (PostgreSQL + pgAdmin)                                       |

---

## 📁 Project Structure

```
laximotech/
├── apps/
│   ├── web/                          # Next.js 14 frontend (port 3000)
│   │   ├── src/app/
│   │   │   ├── (public)/             # Homepage, courses, blog, career paths, auth, contact, demo
│   │   │   ├── (dashboard)/          # Student dashboard, my-courses, progress, learn/[slug]/[lessonId]
│   │   │   ├── admin/                # Admin panel (courses, blog, students, coupons, analytics...)
│   │   │   └── api/auth/             # NextAuth route handlers
│   │   ├── src/components/           # home/, courses/, admin/, ai/, community/, payment/, layout/, ui/, pwa/
│   │   ├── src/hooks/                # React Query hooks (use-queries.ts, use-api-sync.ts...)
│   │   ├── src/lib/                  # api.ts (Axios client), auth.ts, utils.ts
│   │   └── src/middleware.ts
│   │
│   └── api/                          # NestJS backend (port 4000)
│       ├── src/
│       │   ├── auth/                 # JWT auth, guards, strategies
│       │   ├── courses/              # Courses, sections, lessons, admin CRUD
│       │   ├── lessons/              # Public lesson resolution (signed URLs, documents)
│       │   ├── enrollments/ orders/  # Enrollment + Razorpay payment flow
│       │   ├── progress/ quizzes/    # Progress tracking, quiz attempts
│       │   ├── certificates/         # PDF generation + public verification
│       │   ├── blog/ career-paths/   # Content modules
│       │   ├── comments/ reviews/    # Community features
│       │   ├── storage/              # S3 / local upload handling
│       │   ├── ai/                   # OpenAI study buddy (SSE) + code sandbox
│       │   ├── admin/ users/ instructors/
│       │   └── prisma/               # PrismaService/module
│       └── prisma/
│           ├── schema.prisma         # Full data model (see below)
│           └── seed.ts               # Seeds 25 courses, admin user, coupons, blog posts
│
├── docker-compose.yml                # PostgreSQL + pgAdmin for local dev
├── turbo.json                        # Turborepo pipeline config
└── package.json                      # Root scripts (see below)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 20
- Docker (for local PostgreSQL) — or your own PostgreSQL instance
- npm ≥ 10

### 1. Clone & install
```bash
git clone <your-repo-url>
cd laximotech
npm install
```

### 2. Start the database
```bash
docker compose up -d
```
This starts PostgreSQL on `localhost:5433` and pgAdmin (see `docker-compose.yml` for pgAdmin's port/credentials).

#### 🐳 Docker commands
```bash
docker compose up -d       # Start PostgreSQL + pgAdmin
docker compose down        # Stop
docker compose down -v     # Stop + delete all data (fresh start)
```

**Services:**
- **PostgreSQL** → `localhost:5433` (user: `laximotech` / pass: `laximotech123`)
- **pgAdmin** → http://localhost:5050 (`admin@laximotech.ai` / `admin123`)

### 3. Configure environment variables
Copy the example files and fill in real values (see [Environment Variables](#-environment-variables) below):
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```
> `AUTH_SECRET` / `JWT_SECRET` must be identical between `apps/api/.env` and `apps/web/.env.local` — they're used to validate the same signed tokens across both apps.

### 4. Set up the database
```bash
npm run db:migrate   # apply Prisma migrations
npm run db:seed      # seed 25 courses, admin user, coupons, blog posts
```

### 5. Run the app
```bash
npm run dev
```
This runs both apps in parallel via Turborepo:
- **Frontend** → http://localhost:3000
- **Backend API** → http://localhost:4000

### 🌐 URLs (development)

| Service        | URL                                    |
|-----------------|------------------------------------------|
| Frontend        | http://localhost:3000                    |
| Backend API     | http://localhost:4000                    |
| Swagger Docs    | http://localhost:4000/api/docs            |
| pgAdmin         | http://localhost:5050                     |
| Prisma Studio   | http://localhost:5555 (`npm run db:studio`) |

### 👤 Default Users (after `npm run db:seed`)

| Role          | Email                       | Password    |
|----------------|-------------------------------|--------------|
| Admin          | `admin@laximotech.ai`         | magic link   |
| Instructor     | `instructor@laximotech.ai`    | magic link   |
| Demo Student   | `demo@laximotech.ai`          | magic link   |

> These accounts sign in via magic link (email) rather than a password — make sure `RESEND_API_KEY` is set, or use your dev environment's console/log output to grab the magic link if email isn't configured.

---

## 🔐 Environment Variables

### `apps/api/.env`
| Variable                  | Required | Notes                                                  |
|----------------------------|:--------:|---------------------------------------------------------|
| `DATABASE_URL`              | ✅       | PostgreSQL connection string                            |
| `AUTH_SECRET` / `JWT_SECRET`| ✅       | Must match the frontend's values                        |
| `JWT_EXPIRES_IN`            | ✅       | e.g. `7d`                                                |
| `FRONTEND_URL`              | ✅       | Used for CORS                                            |
| `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_S3_BUCKET` | ❌ | Leave blank in dev — falls back to local disk storage |
| `CLOUDFRONT_URL`            | ❌       | CDN URL for S3 assets                                    |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | ❌ | Payments disabled if blank |
| `OPENROUTER_API_KEY` / `OPENROUTER_MODEL` | ❌ | Powers the AI Study Buddy — disabled if blank |
| `RESEND_API_KEY` / `EMAIL_FROM` | ❌  | Transactional email — disabled if blank                 |
| `JUDGE0_API_URL` / `JUDGE0_API_KEY` | ❌ | Code playground execution                        |


ALL the feature are working Just put the API Key in the .env and use it  

### `apps/web/.env.local`
| Variable                        | Required | Notes                                        |
|-----------------------------------|:--------:|-------------------------------------------------|
| `NEXT_PUBLIC_API_URL`             | ✅       | Points to the NestJS API (`http://localhost:4000`) |
| `DATABASE_URL`                    | ✅       | Same DB — needed for the Auth.js Prisma adapter |
| `AUTH_SECRET` / `AUTH_URL`        | ✅       | NextAuth config                                 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ❌ | Google OAuth login                       |
| `RESEND_API_KEY`                  | ❌       | Magic-link email login                          |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | ❌ | Payments UI + verification         |
| `NEXT_PUBLIC_CDN_URL`             | ❌       | CloudFront CDN for media                        |
| `OPENAI_API_KEY`                  | ❌       | Server-side only — AI features                 |

Full templates with generation instructions live in `apps/api/.env.example` and `apps/web/.env.example`.

ALL the feature are working Just put the API Key in the .env.local and use it

### 🔑 Optional Environment Variables

The app runs fully without any of these — they just enable optional features:

| Variable                     | Feature              | Where to get                        |
|--------------------------------|-------------------------|----------------------------------------|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google login          | console.cloud.google.com              |
| `RESEND_API_KEY`               | Magic link email       | resend.com (free tier)                |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`   | Payments               | dashboard.razorpay.com                |
| `OPENAI_API_KEY` / `OPENROUTER_API_KEY`     | AI Study Buddy         | platform.openai.com / openrouter.ai   |
| `AWS_*`                        | Video/file storage      | AWS IAM                               |

Add these to `apps/api/.env` and `apps/web/.env.local` as needed.

---

## 📜 Available Scripts

Run from the repo root (powered by Turborepo, applies to both apps):

| Command                | Description                                              |
|--------------------------|------------------------------------------------------------|
| `npm run dev`            | Start frontend + backend in watch mode                    |
| `npm run build`          | Production build of both apps                             |
| `npm run lint`           | Lint both apps                                             |
| `npm run type-check`     | TypeScript type checking across both apps                  |
| `npm run format`         | Prettier format the whole repo                             |
| `npm run db:push`        | Push the Prisma schema to the DB without a migration       |
| `npm run db:migrate`     | Create & apply a Prisma migration                          |
| `npm run db:seed`        | Seed sample data (courses, admin user, coupons, blog posts)|
| `npm run db:studio`      | Open Prisma Studio (visual DB browser)                     |
| `npm run db:reset`       | ⚠️ Force-reset the DB schema (destructive)                 |

---

## 🗄️ Database Schema Overview

The Prisma schema (`apps/api/prisma/schema.prisma`) models:

- **Identity & Auth** — `User`, `Account`, `Session`, `VerificationToken` (Auth.js tables)
- **Course content** — `Course`, `Section`, `Lesson`, `LessonDocument` (optional per-lesson downloadable material — notes/slides/PDFs)
- **Learning progress** — `Enrollment`, `LessonProgress`, `WeeklyGoal`
- **Commerce** — `Order`, `Coupon`, `CouponCourse`
- **Assessment** — `Quiz`, `QuizQuestion`, `QuizAttempt`, `QuizAnswerRecord`
- **Recognition** — `Certificate`
- **Community** — `Review`, `Comment`, `CommentVote`
- **Discovery** — `CareerPath`, `CareerPathCourse`, `Tag`, `CourseTag`
- **Content marketing** — `BlogPost`, `BlogTag`
- **AI features** — `AiChatMessage`, `SavedCode`
- **Growth/ops** — `DemoRequest`, `ContactMessage`, `SiteContent`

---

## 🧭 Key Flows

- **Learn page** (`/learn/[slug]/[lessonId]`) — video player with progress tracking, a **Discussion** panel and a **Documents** panel (each lesson's optional notes/slides, downloadable), lesson navigation sidebar, and an embedded AI Study Buddy.
- **Admin course builder** (`/admin/courses/[id]/builder`) — manage sections, lessons, quizzes, per-lesson documents, and certificate templates for a course in one place.
- **Certificates** — generated on completion, publicly verifiable without login via a certificate ID.

---

## 🚢 Deployment Notes

- **Frontend (`apps/web`)** — deploys cleanly to Vercel; set all `NEXT_PUBLIC_*` and server env vars in the Vercel project settings.
- **Backend (`apps/api`)** — deploy anywhere that runs Node (Railway, Render, Fly.io, EC2, etc). Run `npm run build && npm run start` in `apps/api`.
- **Database** — use a managed PostgreSQL instance in production (e.g. Neon, RDS, Supabase) and point `DATABASE_URL` at it in both apps.
- **Storage** — configure real AWS S3 credentials in production; local-disk storage is dev-only and won't persist across deploys.
- Run `npx prisma migrate deploy` (not `migrate dev`) against production databases.

---

## 🤝 Contributing

1. Create a feature branch off `main`.
2. Keep changes scoped to one feature per PR.
3. Run `npm run lint && npm run type-check` before pushing.
4. Never commit real `.env` / `.env.local` files — only `.env.example` should be tracked.

---

## 📄 License

Proprietary — © laximotech.ai. All rights reserved.
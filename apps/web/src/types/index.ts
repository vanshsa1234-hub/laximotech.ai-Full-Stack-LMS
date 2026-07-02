// ============================================================
// laximotech.ai — Shared TypeScript Types
// ============================================================

export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseCategory = 'AI_ML' | 'DATA_SCIENCE' | 'PROGRAMMING' | 'ROBOTICS_IOT' | 'CYBERSECURITY_CLOUD';
export type ContentType = 'VIDEO' | 'PDF' | 'QUIZ' | 'CODE' | 'TEXT';
export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

// ── User ─────────────────────────────────────────────────────
export interface User {
  id:           string;
  name:         string | null;
  email:        string;
  image:        string | null;
  role:         Role;
  xpPoints:     number;
  streakDays:   number;
  bio?:         string | null;
  city?:        string | null;
  linkedinUrl?: string | null;
  createdAt:    string;
}

// ── Course ───────────────────────────────────────────────────
export interface Course {
  id:           string;
  slug:         string;
  title:        string;
  description:  string;
  shortDesc:    string;
  thumbnailUrl: string | null;
  previewVideo: string | null;
  price:        number;
  level:        CourseLevel;
  category:     CourseCategory;
  language:     string;
  durationHrs:  number;
  totalLessons: number;
  isPublished:  boolean;
  isFeatured:   boolean;
  instructor:   Pick<User, 'id' | 'name' | 'image'>;
  tags:         { tag: { id: string; name: string } }[];
  _count?: {
    enrollments: number;
    reviews:     number;
  };
  avgRating?:   number;
  createdAt:    string;
}

// ── Section + Lesson ─────────────────────────────────────────
export interface Section {
  id:      string;
  title:   string;
  order:   number;
  lessons: Lesson[];
}

export interface Lesson {
  id:               string;
  title:            string;
  order:            number;
  contentType:      ContentType;
  videoDurationSec: number | null;
  isPreview:        boolean;
  isMandatory:      boolean;
  estimatedMinutes: number | null;
  quiz?:            { id: string } | null;
}

// ── Enrollment & Progress ────────────────────────────────────
export interface Enrollment {
  id:          string;
  userId:      string;
  courseId:    string;
  enrolledAt:  string;
  completedAt: string | null;
  progress:    number;
  course:      Course;
}

export interface LessonProgress {
  lessonId:       string;
  watchedSeconds: number;
  isCompleted:    boolean;
  bookmarkSeconds: number | null;
}

// ── Quiz ─────────────────────────────────────────────────────
export interface QuizQuestion {
  id:          string;
  question:    string;
  options:     string[];
  explanation: string | null;
  order:       number;
  // correctIndex NOT sent to client before submission
}

export interface QuizAttempt {
  id:           string;
  score:        number;
  passed:       boolean;
  attemptedAt:  string;
  timeTakenSec: number | null;
}

// ── Certificate ──────────────────────────────────────────────
export interface Certificate {
  id:            string;
  certificateNo: string;
  pdfUrl:        string | null;
  imageUrl:      string | null;
  finalScore:    number | null;
  issuedAt:      string;
  course:        Pick<Course, 'id' | 'slug' | 'title' | 'category'>;
  user:          Pick<User, 'id' | 'name'>;
}

// ── Order ────────────────────────────────────────────────────
export interface Order {
  id:              string;
  amount:          number;
  currency:        string;
  status:          OrderStatus;
  razorpayOrderId: string | null;
  createdAt:       string;
  course:          Pick<Course, 'id' | 'title' | 'slug' | 'thumbnailUrl'>;
}

// ── Blog ─────────────────────────────────────────────────────
export interface BlogPost {
  id:          string;
  slug:        string;
  title:       string;
  excerpt:     string;
  coverImage:  string | null;
  publishedAt: string | null;
  author:      Pick<User, 'id' | 'name' | 'image'>;
}

// ── Career Path ──────────────────────────────────────────────
export interface CareerPath {
  id:          string;
  slug:        string;
  title:       string;
  description: string;
  avgSalary:   string;
  iconUrl:     string | null;
  courses:     { step: number; label: string; course: Course }[];
}

// ── AI Chat ──────────────────────────────────────────────────
export interface AiChatMessage {
  id:        string;
  role:      'user' | 'assistant';
  content:   string;
  createdAt: string;
}

// ── API Response Wrappers ────────────────────────────────────
export interface ApiResponse<T> {
  data:    T;
  message: string;
}

export interface PaginatedResponse<T> {
  data:       T[];
  total:      number;
  page:       number;
  pageSize:   number;
  totalPages: number;
}

// ── Dashboard Stats ──────────────────────────────────────────
export interface DashboardStats {
  enrolledCourses:   number;
  completedCourses:  number;
  certificates:      number;
  xpPoints:          number;
  streakDays:        number;
  totalWatchedHrs:   number;
}

// ── Coupon ───────────────────────────────────────────────────
export interface CouponValidation {
  valid:          boolean;
  discountPct:    number;
  discountAmount: number;
  finalAmount:    number;
  message:        string;
}

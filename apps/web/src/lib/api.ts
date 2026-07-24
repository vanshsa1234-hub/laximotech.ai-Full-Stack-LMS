// C:\Users\LENOVO\Downloads\laximotech(project)\laximotech7\apps\web\src\lib\api.ts
import axios from 'axios';
import { getAuthToken, clearTokenCache } from './get-token';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach the NextAuth session JWT to every request — this is the
// single source of truth for auth across the whole app (Google,
// magic link, and email/password all produce the same kind of token).
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const token = await getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearTokenCache();
    }
    return Promise.reject(err);
  },
);

// ── Courses ──────────────────────────────────────────────────
export const coursesApi = {
  list:      (params?: Record<string, string>) => api.get('/courses', { params }),
  get:       (slug: string)                     => api.get(`/courses/${slug}`),
  search:    (q: string)                        => api.get('/courses', { params: { q } }),
  adminList: (params?: Record<string, string>)  => api.get('/courses/admin/all', { params }),
  builder:   (courseId: string)                 => api.get(`/courses/admin/${courseId}/builder`),
  create: (data: {
    slug: string; title: string; description: string; shortDesc: string;
    price: number; level: string; category: string; language: string; thumbnailUrl?: string;
    durationHrs: number; instructorId: string; metaTitle?: string; metaDesc?: string;
  }) => api.post('/courses', data),
  update: (id: string, data: any) => api.patch(`/courses/${id}`, data),
  createSection: (courseId: string, data: { title: string; order?: number }) =>
    api.post(`/courses/admin/${courseId}/sections`, data),
  updateSection: (sectionId: string, data: { title?: string; order?: number }) =>
    api.patch(`/courses/admin/sections/${sectionId}`, data),
  createLesson: (sectionId: string, data: any) =>
    api.post(`/courses/admin/sections/${sectionId}/lessons`, data),
  updateLesson: (lessonId: string, data: any) =>
    api.patch(`/courses/admin/lessons/${lessonId}`, data),
  upsertLessonQuiz: (lessonId: string, data: any) =>
    api.post(`/courses/admin/lessons/${lessonId}/quiz`, data),
  addLessonDocument: (lessonId: string, data: { title: string; fileUrl: string; fileType: string; order?: number }) =>
    api.post(`/courses/admin/lessons/${lessonId}/documents`, data),
  updateLessonDocument: (documentId: string, data: Partial<{ title: string; fileUrl: string; fileType: string; order: number }>) =>
    api.patch(`/courses/admin/lessons/documents/${documentId}`, data),
  deleteLessonDocument: (documentId: string) =>
    api.delete(`/courses/admin/lessons/documents/${documentId}`),
};

// ── Enrollments ──────────────────────────────────────────────
export const enrollmentsApi = {
  mine:   ()                  => api.get('/enrollments/me'),
  check:  (courseId: string)  => api.get(`/enrollments/check/${courseId}`),
  enroll: (courseId: string)  => api.post('/enrollments', { courseId }),
};

// ── Orders ───────────────────────────────────────────────────
export const ordersApi = {
  create: (courseId: string, couponCode?: string) =>
    api.post('/orders', { courseId, couponCode }),
  verify: (data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    api.post('/orders/verify', data),
  validateCoupon: (courseId: string, couponCode: string) =>
    api.post('/orders/validate-coupon', { courseId, couponCode }),
  mine: () => api.get('/orders/me'),
};

// ── Progress ─────────────────────────────────────────────────
export const progressApi = {
  update: (lessonId: string, watchedSeconds: number, bookmarkSeconds?: number) =>
    api.post('/progress', { lessonId, watchedSeconds, ...(bookmarkSeconds !== undefined && { bookmarkSeconds }) }),
  getCourse: (courseId: string) =>
    api.get(`/progress/course/${courseId}`),
};

// ── Lessons ──────────────────────────────────────────────────
export const lessonsApi = {
  get:        (lessonId: string)   => api.get(`/lessons/${lessonId}`),
  forCourse:  (courseSlug: string) => api.get(`/lessons/course/${courseSlug}`),
};

// ── Quizzes ──────────────────────────────────────────────────
export const quizzesApi = {
  get:     (quizId: string) => api.get(`/quizzes/${quizId}`),
  submit:  (quizId: string, body: { answers: number[]; timeTakenSec?: number }) =>
    api.post(`/quizzes/${quizId}/submit`, body),
  history: (courseId: string) => api.get(`/quizzes/history/${courseId}`),
};

// ── Certificates ─────────────────────────────────────────────
export const certificatesApi = {
  mine:                ()  => api.get('/certificates/me'),
  verify:              (certificateNo: string) => api.get(`/certificates/verify/${certificateNo}`),
  regenerateAll:       (courseId?: string) => api.post('/certificates/regenerate-all', {}, { params: courseId ? { courseId } : {} }),
  getCourseTemplate:   (courseId: string) => api.get(`/certificates/course-template/${courseId}`),
  updateCourseTemplate:(courseId: string, data: any) => api.patch(`/certificates/course-template/${courseId}`, data),
  resetCourseTemplate: (courseId: string) => api.delete(`/certificates/course-template/${courseId}`),
};

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  sync: (data: { email: string; name?: string; image?: string; provider: string; providerAccountId: string }) =>
    api.post('/auth/sync', data),
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; email: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/change-password', data),
  me: () => api.get('/auth/me'),
};

// ── AI ───────────────────────────────────────────────────────
export const aiApi = {
  chat: async (courseId: string, lessonId: string | null, messages: { role: string; content: string }[]) => {
    const token = await getAuthToken();
    return fetch(`${API_URL}/api/v1/ai/chat`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ courseId, lessonId, messages }),
    });
  },
};

// ── Storage ──────────────────────────────────────────────────
export const storageApi = {
  // Real local-disk upload — no AWS account needed. Returns { url }.
  uploadFile: (file: File, folder: string, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append('folder', folder); // must come before 'file' — multer needs this parsed first
    formData.append('file', file);
    return api.post('/storage/upload', formData, {
      headers: { 'Content-Type': undefined }, // let the browser set the multipart boundary itself
      timeout: 10 * 60 * 1000, // 10 minutes — the default 15s timeout is nowhere near enough for real video files
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
  },
  // Legacy S3 path — only works once real AWS credentials are configured.
  getUploadUrl: (folder: string, fileName: string, contentType: string) =>
    api.post('/storage/upload-url', { folder, fileName, contentType }),
};

// ── Blog ─────────────────────────────────────────────────────
export const blogApi = {
  list: (params?: Record<string, string>) => api.get('/blog', { params }),
  get:  (slug: string)                    => api.get(`/blog/${slug}`),
  adminList: (params?: Record<string, string>) => api.get('/blog/admin/all', { params }),
  adminGet:  (id: string)                       => api.get(`/blog/admin/${id}`),
  create:    (data: any)                        => api.post('/blog', data),
  update:    (id: string, data: any)            => api.patch(`/blog/${id}`, data),
  publish:   (id: string)                       => api.patch(`/blog/${id}/publish`),
  unpublish: (id: string)                       => api.patch(`/blog/${id}/unpublish`),
  remove:    (id: string)                       => api.delete(`/blog/${id}`),
};

// ── Career Paths ─────────────────────────────────────────────
export const careerPathsApi = {
  list: ()             => api.get('/career-paths'),
  get:  (slug: string) => api.get(`/career-paths/${slug}`),
  adminGet:    (id: string)          => api.get(`/career-paths/admin/${id}`),
  create:      (data: any)           => api.post('/career-paths', data),
  update:      (id: string, data: any) => api.patch(`/career-paths/${id}`, data),
  remove:      (id: string)          => api.delete(`/career-paths/${id}`),
  addCourse:   (id: string, data: { courseId: string; step: number; label: string }) =>
    api.post(`/career-paths/${id}/courses`, data),
  removeCourse: (entryId: string) => api.delete(`/career-paths/courses/${entryId}`),
};

// ── Comments ─────────────────────────────────────────────────
export const commentsApi = {
  lessonComments: (lessonId: string) => api.get(`/comments/lesson/${lessonId}`),
  replies:        (parentId: string) => api.get(`/comments/replies/${parentId}`),
  post:           (body: { lessonId?: string; body: string; parentId?: string }) => api.post('/comments', body),
  vote:           (commentId: string, isUpvote: boolean) => api.post(`/comments/${commentId}/vote`, { isUpvote }),
  delete:         (commentId: string) => api.delete(`/comments/${commentId}`),
};

// ── Users ────────────────────────────────────────────────────
export const usersApi = {
  me:          () => api.get('/users/me'),
  stats:       () => api.get('/users/me/stats'),
  activity:    () => api.get('/users/me/activity'),
  update:      (data: any) => api.patch('/users/me', data),
  leaderboard: (limit = 20) => api.get('/users/leaderboard', { params: { limit } }),
};

// ── Admin ────────────────────────────────────────────────────
export const adminApi = {
  stats:        ()                                => api.get('/admin/stats'),
  students:     (params?: Record<string, string>) => api.get('/admin/students', { params }),
  studentEnrollments: (userId: string) => api.get(`/admin/students/${userId}/enrollments`),
  orders:       (params?: Record<string, string>) => api.get('/admin/orders', { params }),
  createCoupon: (body: any)                        => api.post('/admin/coupons', body),
  coupons:      ()                                 => api.get('/admin/coupons'),
  toggleCoupon: (id: string, isActive: boolean)    => api.patch(`/admin/coupons/${id}/toggle`, { isActive }),
};

// ── Demo Requests ────────────────────────────────────────────
export const demoRequestsApi = {
  create: (data: { name: string; phone: string; email: string; topic: string; slot: string; mode: string }) =>
    api.post('/demo-requests', data),
  list:   (params?: Record<string, string>) => api.get('/demo-requests', { params }),
  updateStatus: (id: string, status: string) => api.patch(`/demo-requests/${id}/status`, { status }),
};

// ── Site Content (CMS) ───────────────────────────────────────
export const siteContentApi = {
  get:      (key: string) => api.get(`/site-content/${key}`),
  getAll:   ()             => api.get('/site-content'),
  update:   (key: string, data: any) => api.put(`/site-content/${key}`, { data }),
  reset:    (key: string) => api.delete(`/site-content/${key}`),
};

// ── Contact Messages ─────────────────────────────────────────
export const contactMessagesApi = {
  create: (data: { name: string; email: string; subject: string; message: string }) =>
    api.post('/contact-messages', data),
  list:   (params?: Record<string, string>) => api.get('/contact-messages', { params }),
  updateStatus: (id: string, status: string) => api.patch(`/contact-messages/${id}/status`, { status }),
};

// ── Reviews & Platform Stats ─────────────────────────────────
export const reviewsApi = {
  upsert:   (courseId: string, data: { rating: number; comment?: string }) =>
    api.post(`/courses/${courseId}/reviews`, data),
  mine:     (courseId: string) => api.get(`/courses/${courseId}/reviews/mine`),
  featured: () => api.get('/reviews/featured'),
};

export const platformStatsApi = {
  get: () => api.get('/platform-stats'),
};

// ── Community ────────────────────────────────────────────────
export const communityApi = {
  feed:       (cursor?: string) => api.get('/community/feed', { params: cursor ? { cursor } : {} }),
  createPost: (data: { content?: string; mediaUrl?: string; mediaType?: string }) => api.post('/community/posts', data),
  deletePost: (id: string) => api.delete(`/community/posts/${id}`),
  members:    (params?: { search?: string; cursor?: string }) => api.get('/community/members', { params }),
  profile:    (id: string) => api.get(`/community/users/${id}`),
  sendFriendRequest:   (receiverId: string) => api.post('/community/friend-requests', { receiverId }),
  friendRequests:      () => api.get('/community/friend-requests'),
  acceptFriendRequest: (id: string) => api.post(`/community/friend-requests/${id}/accept`),
  rejectFriendRequest: (id: string) => api.post(`/community/friend-requests/${id}/reject`),
  friends:      () => api.get('/community/friends'),
  conversations: () => api.get('/community/conversations'),
  thread:       (userId: string) => api.get(`/community/messages/${userId}`),
  sendMessage:  (data: { receiverId: string; content?: string; mediaUrl?: string; mediaType?: string }) =>
    api.post('/community/messages', data),
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/storage/community-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ── Instructors (admin) ───────────────────────────────────────
export const instructorsApi = {
  list:   () => api.get('/instructors'),
  get:    (id: string) => api.get(`/instructors/${id}`),
  create: (data: { name: string; email: string; bio?: string; phone?: string; city?: string; linkedinUrl?: string; image?: string }) =>
    api.post('/instructors', data),
  update: (id: string, data: any) => api.patch(`/instructors/${id}`, data),
  remove: (id: string) => api.delete(`/instructors/${id}`),
};

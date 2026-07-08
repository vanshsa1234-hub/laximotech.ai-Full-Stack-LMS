'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  coursesApi, enrollmentsApi, progressApi,
  quizzesApi, certificatesApi, blogApi,
  careerPathsApi, commentsApi, adminApi, usersApi, demoRequestsApi,
  siteContentApi, contactMessagesApi, reviewsApi, platformStatsApi, instructorsApi,
} from '@/lib/api';

// ── Courses ───────────────────────────────────────────────────
export function useCourses(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn:  () => coursesApi.list(params).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: ['course', slug],
    queryFn:  () => coursesApi.get(slug).then(r => r.data),
    enabled:  !!slug,
    staleTime: 10 * 60 * 1000,
  });
}

// ── Enrollments ───────────────────────────────────────────────
export function useMyEnrollments() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn:  () => enrollmentsApi.mine().then(r => r.data),
    enabled:  !!session,
  });
}

export function useEnrollmentCheck(courseId: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ['enrollment-check', courseId],
    queryFn:  () => enrollmentsApi.check(courseId).then(r => r.data),
    enabled:  !!session && !!courseId,
    staleTime: 30 * 1000,
  });
}

// ── Progress ──────────────────────────────────────────────────
export function useCourseProgress(courseId: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ['progress', courseId],
    queryFn:  () => progressApi.getCourse(courseId).then(r => r.data),
    enabled:  !!session && !!courseId,
    staleTime: 30 * 1000,
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, watchedSeconds, bookmarkSeconds }: {
      lessonId: string; watchedSeconds: number; bookmarkSeconds?: number;
    }) => progressApi.update(lessonId, watchedSeconds, bookmarkSeconds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}

// ── Quiz ──────────────────────────────────────────────────────
export function useQuiz(quizId: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn:  () => quizzesApi.get(quizId).then(r => r.data),
    enabled:  !!session && !!quizId,
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, answers, timeTakenSec }: {
      quizId: string; answers: number[]; timeTakenSec?: number;
    }) => quizzesApi.submit(quizId, { answers, timeTakenSec }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });
}

// ── Certificates ──────────────────────────────────────────────
export function useMyCertificates() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ['certificates', 'me'],
    queryFn:  () => certificatesApi.mine().then(r => r.data),
    enabled:  !!session,
    // PDF generation happens async right after a certificate is issued —
    // keep refetching for a bit so the download link appears without a manual reload.
    refetchInterval: (query) => {
      const certs = (query.state.data as any[]) ?? [];
      const stillGenerating = certs.some(c => !c.pdfUrl);
      return stillGenerating ? 4000 : false;
    },
  });
}

export function useVerifyCertificate(certificateNo: string) {
  return useQuery({
    queryKey: ['certificate-verify', certificateNo],
    queryFn:  () => certificatesApi.verify(certificateNo).then(r => r.data),
    enabled:  !!certificateNo,
    staleTime: Infinity, // certificates don't change often
  });
}

// ── Blog ──────────────────────────────────────────────────────
export function useBlogPosts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['blog', params],
    queryFn:  () => blogApi.list(params).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn:  () => blogApi.get(slug).then(r => r.data),
    enabled:  !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Career Paths ──────────────────────────────────────────────
export function useCareerPaths() {
  return useQuery({
    queryKey: ['career-paths'],
    queryFn:  () => careerPathsApi.list().then(r => r.data),
    staleTime: 30 * 60 * 1000,
  });
}

export function useCareerPath(slug: string) {
  return useQuery({
    queryKey: ['career-path', slug],
    queryFn:  () => careerPathsApi.get(slug).then(r => r.data),
    enabled:  !!slug,
    staleTime: 30 * 60 * 1000,
  });
}

// ── Comments ──────────────────────────────────────────────────
export function useLessonComments(lessonId: string) {
  return useQuery({
    queryKey: ['comments', lessonId],
    queryFn:  () => commentsApi.lessonComments(lessonId).then(r => r.data),
    enabled:  !!lessonId,
  });
}

export function usePostComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { lessonId?: string; body: string; parentId?: string }) =>
      commentsApi.post(body).then(r => r.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.lessonId] });
    },
  });
}

// ── User stats ────────────────────────────────────────────────
export function useUserStats() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ['user-stats'],
    queryFn:  () => usersApi.stats().then(r => r.data),
    enabled:  !!session,
    staleTime: 2 * 60 * 1000,
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn:  () => usersApi.leaderboard().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProfile() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ['my-profile'],
    queryFn:  () => usersApi.me().then(r => r.data),
    enabled:  !!session,
    staleTime: 60 * 1000,
  });
}

export function useActivityHeatmap() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ['activity-heatmap'],
    queryFn:  () => usersApi.activity().then(r => r.data),
    enabled:  !!session,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Admin ─────────────────────────────────────────────────────
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn:  () => adminApi.stats().then(r => r.data),
    staleTime: 60 * 1000,
  });
}

export function useAdminStudents(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['admin-students', params],
    queryFn:  () => adminApi.students(params).then(r => r.data),
  });
}

// ── Demo Requests ────────────────────────────────────────────
export function useAdminDemoRequests(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['admin-demo-requests', params],
    queryFn:  () => demoRequestsApi.list(params).then(r => r.data),
  });
}

export function useUpdateDemoRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      demoRequestsApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-demo-requests'] }),
  });
}

// ── Admin Blog ───────────────────────────────────────────────
export function useAdminBlogPosts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['admin-blog-posts', params],
    queryFn:  () => blogApi.adminList(params).then(r => r.data),
  });
}

export function useAdminBlogPost(id: string) {
  return useQuery({
    queryKey: ['admin-blog-post', id],
    queryFn:  () => blogApi.adminGet(id).then(r => r.data),
    enabled:  !!id,
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => blogApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] }),
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => blogApi.update(id, data),
    onSuccess: (_r, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blog-post', vars.id] });
    },
  });
}

export function useTogglePublishBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      publish ? blogApi.publish(id) : blogApi.unpublish(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] }),
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] }),
  });
}

// ── Admin Career Paths ───────────────────────────────────────
export function useAdminCareerPaths() {
  return useQuery({
    queryKey: ['admin-career-paths'],
    queryFn:  () => careerPathsApi.list().then(r => r.data),
  });
}

export function useAdminCareerPath(id: string) {
  return useQuery({
    queryKey: ['admin-career-path', id],
    queryFn:  () => careerPathsApi.adminGet(id).then(r => r.data),
    enabled:  !!id,
  });
}

export function useCreateCareerPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => careerPathsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-career-paths'] }),
  });
}

export function useUpdateCareerPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => careerPathsApi.update(id, data),
    onSuccess: (_r, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-career-paths'] });
      queryClient.invalidateQueries({ queryKey: ['admin-career-path', vars.id] });
    },
  });
}

export function useDeleteCareerPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => careerPathsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-career-paths'] }),
  });
}

export function useAddCourseToPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pathId, data }: { pathId: string; data: { courseId: string; step: number; label: string } }) =>
      careerPathsApi.addCourse(pathId, data),
    onSuccess: (_r, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-career-paths'] });
      queryClient.invalidateQueries({ queryKey: ['admin-career-path', vars.pathId] });
    },
  });
}

export function useRemoveCourseFromPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => careerPathsApi.removeCourse(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-career-paths'] });
      queryClient.invalidateQueries({ queryKey: ['admin-career-path'] });
    },
  });
}

// ── Site Content (CMS) ───────────────────────────────────────
export function useSiteContent(key: string) {
  return useQuery({
    queryKey: ['site-content', key],
    queryFn:  () => siteContentApi.get(key).then(r => r.data),
  });
}

export function useAdminSiteContent() {
  return useQuery({
    queryKey: ['admin-site-content'],
    queryFn:  () => siteContentApi.getAll().then(r => r.data),
  });
}

export function useUpdateSiteContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: any }) => siteContentApi.update(key, data),
    onSuccess: (_r, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-site-content'] });
      queryClient.invalidateQueries({ queryKey: ['site-content', vars.key] });
    },
  });
}

export function useResetSiteContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => siteContentApi.reset(key),
    onSuccess: (_r, key) => {
      queryClient.invalidateQueries({ queryKey: ['admin-site-content'] });
      queryClient.invalidateQueries({ queryKey: ['site-content', key] });
    },
  });
}

// ── Contact Messages ─────────────────────────────────────────
export function useCreateContactMessage() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; subject: string; message: string }) =>
      contactMessagesApi.create(data),
  });
}

export function useAdminContactMessages(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['admin-contact-messages', params],
    queryFn:  () => contactMessagesApi.list(params).then(r => r.data),
  });
}

export function useUpdateContactMessageStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      contactMessagesApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] }),
  });
}

// ── Reviews & Platform Stats ─────────────────────────────────
export function useFeaturedReviews() {
  return useQuery({
    queryKey: ['featured-reviews'],
    queryFn:  () => reviewsApi.featured().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn:  () => platformStatsApi.get().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyReview(courseId: string) {
  return useQuery({
    queryKey: ['my-review', courseId],
    queryFn:  () => reviewsApi.mine(courseId).then(r => r.data),
    enabled:  !!courseId,
  });
}

export function useUpsertReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: { rating: number; comment?: string } }) =>
      reviewsApi.upsert(courseId, data),
    onSuccess: (_r, vars) => {
      queryClient.invalidateQueries({ queryKey: ['my-review', vars.courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['featured-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
    },
  });
}

// ── Admin Coupons ────────────────────────────────────────────
export function useAdminCoupons() {
  return useQuery({
    queryKey: ['admin-coupons'],
    queryFn:  () => adminApi.coupons().then(r => r.data),
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { code: string; discountPct: number; maxUses?: number; expiresAt?: string }) =>
      adminApi.createCoupon(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });
}

export function useToggleCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminApi.toggleCoupon(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });
}

// ── Instructors (admin) ──────────────────────────────────────
export function useAdminInstructors() {
  return useQuery({
    queryKey: ['admin-instructors'],
    queryFn:  () => instructorsApi.list().then(r => r.data),
  });
}

export function useAdminInstructor(id: string) {
  return useQuery({
    queryKey: ['admin-instructor', id],
    queryFn:  () => instructorsApi.get(id).then(r => r.data),
    enabled:  !!id,
  });
}

export function useCreateInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => instructorsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-instructors'] }),
  });
}

export function useUpdateInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => instructorsApi.update(id, data),
    onSuccess: (_r, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-instructors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-instructor', vars.id] });
    },
  });
}

export function useDeleteInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => instructorsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-instructors'] }),
  });
}

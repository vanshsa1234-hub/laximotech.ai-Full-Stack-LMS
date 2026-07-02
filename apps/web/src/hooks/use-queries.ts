'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  coursesApi, enrollmentsApi, progressApi,
  quizzesApi, certificatesApi, blogApi,
  careerPathsApi, commentsApi, adminApi, usersApi,
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

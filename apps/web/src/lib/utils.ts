import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format Indian currency */
export function formatPrice(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format date in Indian style */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-IN', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
    ...options,
  }).format(new Date(date));
}

/** Format relative time */
export function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return formatDate(date);
}

/** Format seconds to MM:SS */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Format hours */
export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours}h`;
}

/** Truncate string */
export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Get initials from name */
export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

/** Format large numbers (1200 → 1.2K) */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

/** Category display labels */
export const CATEGORY_LABELS: Record<string, string> = {
  AI_ML:               'AI & Machine Learning',
  DATA_SCIENCE:        'Data Science',
  PROGRAMMING:         'Programming',
  ROBOTICS_IOT:        'Robotics & IoT',
  CYBERSECURITY_CLOUD: 'Cybersecurity & Cloud',
};

/** Category emoji map */
export const CATEGORY_EMOJI: Record<string, string> = {
  AI_ML:               '🤖',
  DATA_SCIENCE:        '📊',
  PROGRAMMING:         '💻',
  ROBOTICS_IOT:        '⚡',
  CYBERSECURITY_CLOUD: '🔒',
};

/** Level display labels */
export const LEVEL_LABELS: Record<string, string> = {
  BEGINNER:     'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED:     'Advanced',
};

/** Level colors */
export const LEVEL_COLORS: Record<string, string> = {
  BEGINNER:     'text-green-600',
  INTERMEDIATE: 'text-yellow-600',
  ADVANCED:     'text-red-600',
};

/** XP to level */
export function xpToLevel(xp: number): { level: number; label: string; progress: number; nextXp: number } {
  const thresholds = [0, 500, 1500, 3000, 6000, 12000, 25000, 50000];
  const labels     = ['Beginner', 'Explorer', 'Practitioner', 'Expert', 'Master', 'Champion', 'Legend', 'Guru'];
  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i + 1;
    else break;
  }
  const current  = thresholds[level - 1];
  const next     = thresholds[level] ?? thresholds[thresholds.length - 1];
  const progress = next > current ? ((xp - current) / (next - current)) * 100 : 100;
  return { level, label: labels[level - 1] ?? 'Guru', progress, nextXp: next };
}

/** Copy text to clipboard with fallback */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
}

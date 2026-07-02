// Reusable UI component library for laximotech.ai

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ── Badge ────────────────────────────────────────────────────
const badgeVariants = cva(
  'inline-flex items-center font-semibold rounded-full transition-colors',
  {
    variants: {
      variant: {
        default:  'bg-brand-blue/10 text-brand-blue',
        orange:   'bg-brand-orange/10 text-brand-orange',
        green:    'bg-brand-green/10 text-brand-green',
        yellow:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
        red:      'bg-red-50 text-red-600',
        gray:     'bg-gray-100 text-gray-600',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-3 py-1',
        lg: 'text-sm px-4 py-1.5',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, variant, size, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      {children}
    </span>
  );
}

// ── Progress bar ─────────────────────────────────────────────
interface ProgressProps {
  value:     number;   // 0–100
  className?: string;
  color?:    'blue' | 'green' | 'orange';
  size?:     'sm' | 'md' | 'lg';
  animated?: boolean;
  showLabel?: boolean;
}

export function Progress({ value, className = '', color = 'green', size = 'md', showLabel = false }: ProgressProps) {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const colors  = { blue: 'bg-brand-blue', green: 'bg-brand-green', orange: 'bg-brand-orange' };

  return (
    <div className={className}>
      <div className={`${heights[size]} bg-gray-100 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${colors[color]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{Math.round(value)}% complete</span>
        </div>
      )}
    </div>
  );
}

// ── Avatar ───────────────────────────────────────────────────
interface AvatarProps {
  name?:      string;
  image?:     string | null;
  size?:      'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ name, image, size = 'md', className = '' }: AvatarProps) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  const initial = (name ?? 'U')[0].toUpperCase();

  if (image) {
    return (
      <img src={image} alt={name ?? 'Avatar'}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${className}`} />
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-brand-blue flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}>
      {initial}
    </div>
  );
}

// ── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Empty state ──────────────────────────────────────────────
interface EmptyStateProps {
  icon?:    string;
  title:    string;
  desc?:    string;
  action?:  React.ReactNode;
}

export function EmptyState({ icon = '📭', title, desc, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-heading font-semibold text-gray-700 text-lg mb-2">{title}</h3>
      {desc && <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">{desc}</p>}
      {action}
    </div>
  );
}

// ── Section header ───────────────────────────────────────────
interface SectionHeaderProps {
  label?:    string;
  title:     string;
  highlight?: string;
  desc?:     string;
  center?:   boolean;
}

export function SectionHeader({ label, title, highlight, desc, center = true }: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      {label && <span className="section-label">{label}</span>}
      <h2 className="section-title mt-2">
        {title} {highlight && <span>{highlight}</span>}
      </h2>
      {desc && <p className="text-gray-500 mt-3 max-w-xl mx-auto">{desc}</p>}
    </div>
  );
}

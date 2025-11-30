'use client';

/**
 * Skeleton Components
 * Reusable loading placeholders for various UI elements
 */

import { cn } from '@/shared/utils/cn';

// ============================================================================
// Base Skeleton
// ============================================================================

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-gray-200 dark:bg-gray-700',
        animate && 'animate-pulse',
        className
      )}
    />
  );
}

// ============================================================================
// Text Skeleton
// ============================================================================

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: 'full' | 'three-quarters' | 'half' | 'quarter';
}

export function SkeletonText({
  lines = 3,
  className,
  lastLineWidth = 'three-quarters',
}: SkeletonTextProps) {
  const widthMap = {
    full: 'w-full',
    'three-quarters': 'w-3/4',
    half: 'w-1/2',
    quarter: 'w-1/4',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? widthMap[lastLineWidth] : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Avatar Skeleton
// ============================================================================

interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return <Skeleton className={cn('rounded-full', sizeMap[size], className)} />;
}

// ============================================================================
// Card Skeleton
// ============================================================================

interface SkeletonCardProps {
  hasImage?: boolean;
  hasFooter?: boolean;
  className?: string;
}

export function SkeletonCard({
  hasImage = false,
  hasFooter = false,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      {hasImage && <Skeleton className="mb-4 h-40 w-full rounded-lg" />}
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <SkeletonText lines={2} />
      </div>
      {hasFooter && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Table Skeleton
// ============================================================================

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  hasHeader?: boolean;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  hasHeader = true,
  className,
}: SkeletonTableProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      {hasHeader && (
        <div className="flex gap-4 border-b border-gray-200 p-4 dark:border-gray-700">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      )}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={cn('h-4 flex-1', colIndex === 0 && 'w-1/3 flex-none')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Stat Card Skeleton
// ============================================================================

interface SkeletonStatCardProps {
  className?: string;
}

export function SkeletonStatCard({ className }: SkeletonStatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

// ============================================================================
// List Skeleton
// ============================================================================

interface SkeletonListProps {
  items?: number;
  hasAvatar?: boolean;
  className?: string;
}

export function SkeletonList({
  items = 5,
  hasAvatar = true,
  className,
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {hasAvatar && <SkeletonAvatar size="md" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Form Skeleton
// ============================================================================

interface SkeletonFormProps {
  fields?: number;
  hasSubmit?: boolean;
  className?: string;
}

export function SkeletonForm({
  fields = 4,
  hasSubmit = true,
  className,
}: SkeletonFormProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      {hasSubmit && (
        <div className="flex justify-end gap-3 pt-4">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Dashboard Skeleton
// ============================================================================

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <Skeleton className="mb-4 h-6 w-40" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <Skeleton className="mb-4 h-6 w-40" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>

      {/* Table Section */}
      <SkeletonTable rows={5} columns={5} />
    </div>
  );
}

// ============================================================================
// Order Detail Skeleton
// ============================================================================

export function SkeletonOrderDetail() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} hasFooter />
        ))}
      </div>

      {/* Details Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <Skeleton className="mb-4 h-6 w-40" />
        <SkeletonForm fields={6} hasSubmit={false} />
      </div>
    </div>
  );
}

// ============================================================================
// Profile Skeleton
// ============================================================================

export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <SkeletonAvatar size="xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Profile Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <Skeleton className="mb-6 h-6 w-40" />
        <SkeletonForm fields={5} />
      </div>
    </div>
  );
}

export default Skeleton;

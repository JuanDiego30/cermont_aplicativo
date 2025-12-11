// 📁 web/src/components/ui/Skeleton.tsx

import { cn } from '@/lib/cn';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
}

function SkeletonDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="border rounded-lg p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full mb-2" />
        ))}
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

function SkeletonTable({ rows = 10, columns = 5 }: SkeletonTableProps = {}) {
  return (
    <div className="p-6">
      <div className="border rounded-lg">
        {/* Table header */}
        <div className="border-b p-4">
          <div className="flex gap-4">
            {[...Array(columns)].map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>
        {/* Table rows */}
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="border-b p-4 last:border-b-0">
            <div className="flex gap-4">
              {[...Array(columns)].map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { Skeleton, SkeletonDashboard, SkeletonTable };

/**
 * Skeleton Loading Components
 *
 * Placeholder components for loading states.
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-shimmer rounded ${className}`} />;
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <Skeleton className="h-6 w-1/3 mb-4" />
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b last:border-b-0 px-4 py-3 flex gap-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonRangeCard() {
  return (
    <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <Skeleton className="h-6 w-8 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-3/4 mt-4" />
    </div>
  );
}

export function SkeletonEventCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex gap-4">
        <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-5 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    </div>
  );
}

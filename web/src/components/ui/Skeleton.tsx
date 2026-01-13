/**
 * Skeleton Loading Components
 *
 * Placeholder components for loading states.
 * Uses the design system colors and animations.
 */

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'dark' | 'primary';
}

const variantClasses = {
  default: 'skeleton',
  dark: 'skeleton skeleton-dark',
  primary: 'skeleton skeleton-primary',
};

export function Skeleton({ className = '', variant = 'default' }: SkeletonProps) {
  return (
    <div className={`${variantClasses[variant]} ${className}`} />
  );
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

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card card-default p-5 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-5 w-1/3 mb-2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="card card-default overflow-hidden">
      {/* Header */}
      <div className="section-card px-5 py-4 flex gap-4 border-b">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" variant="dark" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="border-b last:border-b-0 px-5 py-4 flex gap-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
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
    <div className="card card-outlined section-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" variant="primary" />
          <div>
            <Skeleton className="h-5 w-12 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
      <Skeleton className="h-4 w-3/4 mt-4 ml-12" />
    </div>
  );
}

export function SkeletonEventCard() {
  return (
    <div className="card card-default p-5">
      <div className="flex gap-4">
        <Skeleton className="h-16 w-16 rounded-xl flex-shrink-0" variant="primary" />
        <div className="flex-1">
          <Skeleton className="h-5 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard stat card skeleton
export function SkeletonStatCard() {
  return (
    <div className="card card-default p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" variant="primary" />
      </div>
      <Skeleton className="h-8 w-16 mb-1" variant="dark" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// Profile/member card skeleton
export function SkeletonProfileCard() {
  return (
    <div className="card card-default p-6">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" variant="primary" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div>
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
}

// Form skeleton
export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-11 w-32 rounded-lg mt-6" variant="primary" />
    </div>
  );
}

// Page header skeleton
export function SkeletonPageHeader() {
  return (
    <div className="mb-8">
      <Skeleton className="h-8 w-48 mb-2" variant="dark" />
      <Skeleton className="h-5 w-72" />
    </div>
  );
}

// Full page loading skeleton
export function SkeletonPage() {
  return (
    <div className="animate-fade-in">
      <SkeletonPageHeader />
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  count?: number;
}

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-md bg-chamber-800',
        className,
      )}
    />
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'rounded-lg bg-chamber-900 p-6',
        className,
      )}
    >
      <Pulse className="mb-4 h-5 w-1/3" />
      <Pulse className="mb-2 h-4 w-full" />
      <Pulse className="mb-2 h-4 w-2/3" />
      <Pulse className="h-4 w-1/2" />
    </div>
  );
}

export function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'rounded-lg bg-chamber-900 p-6',
        className,
      )}
    >
      <Pulse className="mb-3 h-4 w-1/2" />
      <Pulse className="mb-2 h-8 w-1/3" />
      <Pulse className="h-3 w-2/3" />
    </div>
  );
}

export function TableSkeleton({ className, count = 5 }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-lg bg-chamber-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex gap-4 border-b border-chamber-800 px-6 py-3">
        <Pulse className="h-4 w-1/4" />
        <Pulse className="h-4 w-1/4" />
        <Pulse className="h-4 w-1/4" />
        <Pulse className="h-4 w-1/4" />
      </div>

      {/* Rows */}
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 border-b border-chamber-800/50 px-6 py-4 last:border-b-0"
        >
          <Pulse className="h-4 w-1/4" />
          <Pulse className="h-4 w-1/4" />
          <Pulse className="h-4 w-1/4" />
          <Pulse className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton({ className, count = 4 }: SkeletonProps) {
  return (
    <div className={clsx('space-y-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Pulse className="mb-2 h-4 w-24" />
          <Pulse className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <Pulse className="h-10 w-32 rounded-lg" />
    </div>
  );
}

export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('space-y-6', className)}>
      {/* Title */}
      <Pulse className="h-8 w-48" />

      {/* Metric cards row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Table */}
      <TableSkeleton />
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-secondary/70 ${className}`} />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border/40 bg-card/40">
          <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
          <Skeleton className="h-4 w-10" />
          <div className="flex gap-1">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-border/40 bg-card/40 space-y-3">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="p-6 rounded-2xl border border-border/40 bg-card/40">
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-[220px] w-full rounded-xl" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-border/40 bg-card/40">
          <Skeleton className="h-4 w-40 mb-4" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
        <div className="p-6 rounded-2xl border border-border/40 bg-card/40 space-y-3">
          <Skeleton className="h-4 w-32 mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-2.5 h-2.5 rounded-full" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="flex-1 h-2 rounded-full" />
              <Skeleton className="h-3 w-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <Skeleton className="w-20 h-20 rounded-full" />
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-64" />
      <div className="w-full space-y-3 mt-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

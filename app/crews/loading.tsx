import AppShell from '@/components/layout/AppShell';

export default function CrewsLoading() {
  return (
    <AppShell title="Crews">
      {/* Header skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200" />
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            {/* Card header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            </div>

            {/* Description lines */}
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
            </div>

            {/* Agents badges */}
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-5 w-14 animate-pulse rounded-full bg-gray-200" />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <div className="h-8 flex-1 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

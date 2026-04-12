import AppShell from '@/components/layout/AppShell';

export default function JobsLoading() {
  return (
    <AppShell title="Trabajos">
      {/* Header actions skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-5 gap-4 border-b border-gray-100 bg-gray-50 px-6 py-3">
          {['Trabajo', 'Crew', 'Estado', 'Progreso', 'Fecha'].map((col) => (
            <div key={col} className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          ))}
        </div>

        {/* Table rows */}
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 items-center gap-4 px-6 py-4">
              {/* Job name + id */}
              <div className="space-y-1.5">
                <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
              </div>
              {/* Crew */}
              <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
              {/* Status badge */}
              <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
              {/* Progress circle */}
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
              {/* Date */}
              <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

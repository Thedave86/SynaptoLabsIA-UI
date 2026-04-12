import AppShell from '@/components/layout/AppShell';

export default function ProjectsLoading() {
  return (
    <AppShell title="Proyectos">
      {/* Header skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-gray-200" />
      </div>

      {/* Project cards skeleton */}
      <div className="max-w-5xl space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 px-6 py-5">
              {/* Folder icon */}
              <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200 shrink-0" />

              {/* Project info */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-64 animate-pulse rounded bg-gray-100" />
                <div className="flex gap-3 mt-1">
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                </div>
              </div>

              {/* Status badge */}
              <div className="h-5 w-24 animate-pulse rounded-full bg-gray-200 shrink-0" />

              {/* Arrow */}
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

import AppShell from '@/components/layout/AppShell';

export default function DashboardLoading() {
  return (
    <AppShell title="Dashboard">
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            </div>
            <div className="h-8 w-16 animate-pulse rounded bg-gray-300 mb-2" />
            <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Clients table skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        {/* Jobs list skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/**
 * hooks/useJobs.ts
 * Hook para obtener la lista de jobs con polling adaptativo.
 *
 * - Si hay jobs activos (running/queued): refresca cada 5 segundos
 * - Si todos están en estado final: refresca cada 30 segundos
 * - Reduce peticiones innecesarias al servidor
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Job, JobsResponse } from '@/lib/types';

const ACTIVE_STATUSES = new Set<string>(['running', 'queued']);
const ACTIVE_POLL_MS = 5_000;
const IDLE_POLL_MS = 30_000;

export function useJobs() {
  return useQuery<JobsResponse, Error>({
    queryKey: ['jobs'],
    queryFn: () => apiClient.listJobs() as Promise<JobsResponse>,
    refetchInterval: (query) => {
      const jobs: Job[] = query.state.data?.jobs ?? [];
      const hasActive = jobs.some((j) => ACTIVE_STATUSES.has(j.status));
      return hasActive ? ACTIVE_POLL_MS : IDLE_POLL_MS;
    },
    select: (data) => ({
      jobs: data?.jobs ?? [],
      total: data?.total ?? 0,
    }),
  });
}

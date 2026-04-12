'use client';

import Link from 'next/link';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { useJobsStream } from '@/hooks/useJobsStream';
import AppShell from '@/components/layout/AppShell';
import {
  Card, CardContent,
  Badge, Button, Spinner, Alert
} from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { Job } from '@/lib/types';
import { JOB_STATUS_MAP } from '@/lib/types';

export default function JobsPage() {
  // Stream SSE para actualizaciones en tiempo real
  useJobsStream();

  const { data, isLoading, error, refetch, isFetching } = useJobs();
  const jobs: Job[] = data?.jobs ?? [];

  const statusMap = JOB_STATUS_MAP;

  return (
    <AppShell title="Trabajos">
      <div className="max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Trabajos (Jobs)</h2>
            <p className="mt-1 text-sm text-gray-500">Ejecuciones en curso e historial reciente</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            loading={isFetching}
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            No se pudieron cargar los jobs. ¿Está activo el backend?
          </Alert>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && jobs.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-gray-500">No hay jobs todavía.</p>
              <Link href="/request/new" className="mt-4 inline-block">
                <Button variant="primary" size="sm">Lanzar primera petición</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {jobs.map((job: Job) => {
            const sm = statusMap[job.status] ?? { label: job.status, variant: 'default' };
            return (
              <Card key={job.job_id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 pt-5 pb-5">
                  {/* Progress visual con ARIA */}
                  <div className="flex-shrink-0">
                    <div
                      role="progressbar"
                      aria-valuenow={Math.round((job.progress || 0) * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progreso: ${Math.round((job.progress || 0) * 100)}%`}
                      className="relative flex h-12 w-12 items-center justify-center"
                    >
                      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="4"
                          strokeDasharray={`${(job.progress || 0) * 125.66} 125.66`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-xs font-bold text-indigo-700">
                        {Math.round((job.progress || 0) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{job.crew_name}</p>
                      <Badge variant={sm.variant}>{sm.label}</Badge>
                    </div>
                    <p className="font-mono text-xs text-gray-400 truncate">{job.job_id}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Iniciado: {formatDate(job.started_at)}
                      {job.completed_at && ` · Fin: ${formatDate(job.completed_at)}`}
                    </p>
                  </div>

                  {/* Action */}
                  <Link href={`/jobs/${job.job_id}`}>
                    <Button variant="outline" size="sm">
                      Ver logs
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

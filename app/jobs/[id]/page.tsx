'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Activity, CheckCircle, XCircle, Clock, Terminal
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import AppShell from '@/components/layout/AppShell';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Badge, Button, Progress, Spinner, Alert
} from '@/components/ui';
import { formatDate, formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<string, { label: string; variant: any; icon: React.ElementType }> = {
  running: { label: 'En ejecución', variant: 'warning', icon: Activity },
  completed: { label: 'Completado', variant: 'success', icon: CheckCircle },
  failed: { label: 'Fallido', variant: 'danger', icon: XCircle },
  queued: { label: 'En cola', variant: 'info', icon: Clock },
};

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id: jobId } = use(params);
  const [logs, setLogs] = useState<string[]>([]);
  const [sseConnected, setSseConnected] = useState(false);
  const [sseDone, setSseDone] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const { data: job, isLoading, error, refetch } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => apiClient.getJobStatus(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'running' || status === 'queued' ? 5000 : false;
    },
  });

  // SSE streaming de logs
  useEffect(() => {
    if (!jobId) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const url = apiClient.getJobLogsUrl(jobId);

    const es = new EventSource(url);
    setSseConnected(true);

    es.addEventListener('log', (e) => {
      try {
        const data = JSON.parse(e.data);
        setLogs((prev) => [...prev, data.line]);
      } catch {
        setLogs((prev) => [...prev, e.data]);
      }
    });

    es.addEventListener('done', () => {
      setSseDone(true);
      setSseConnected(false);
      es.close();
      refetch();
    });

    es.onerror = () => {
      setSseConnected(false);
      es.close();
    };

    return () => {
      es.close();
    };
  }, [jobId, refetch]);

  // Auto-scroll al final de los logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const config = job ? (statusConfig[job.status] || statusConfig.running) : statusConfig.running;
  const StatusIcon = config.icon;

  return (
    <AppShell title={`Job — ${jobId.slice(0, 12)}…`}>
      <div className="mx-auto max-w-4xl">
        {/* Cabecera */}
        <div className="mb-6 flex items-center gap-3">
          <Link href="/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {job?.crew_name || 'Cargando…'}
            </h2>
            <p className="font-mono text-xs text-gray-400">{jobId}</p>
          </div>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            Error al cargar el job. ¿Está activo el backend?
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Info del job */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Spinner />
                  </div>
                ) : job ? (
                  <>
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-5 w-5 text-gray-600" />
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Progreso</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Progress
                          value={(job.progress || 0) * 100}
                          colorClass={
                            job.status === 'failed'
                              ? 'bg-red-500'
                              : job.status === 'completed'
                              ? 'bg-emerald-500'
                              : 'bg-indigo-600'
                          }
                        />
                        <span className="text-xs font-medium text-gray-700">
                          {Math.round((job.progress || 0) * 100)}%
                        </span>
                      </div>
                    </div>

                    {job.current_task && (
                      <div>
                        <p className="text-xs text-gray-500">Tarea actual</p>
                        <p className="mt-0.5 text-sm text-gray-800 font-mono">{job.current_task}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-gray-500">Iniciado</p>
                      <p className="mt-0.5 text-sm text-gray-700">{formatDate(job.started_at)}</p>
                    </div>

                    {job.completed_at && (
                      <div>
                        <p className="text-xs text-gray-500">Completado</p>
                        <p className="mt-0.5 text-sm text-gray-700">{formatDate(job.completed_at)}</p>
                      </div>
                    )}
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Estado SSE */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      sseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'
                    )}
                  />
                  <p className="text-xs text-gray-500">
                    {sseConnected ? 'Log en vivo (SSE)' : sseDone ? 'Log completo' : 'Sin conexión SSE'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Terminal de logs */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-gray-500" />
                  <CardTitle>Logs de ejecución</CardTitle>
                  {sseConnected && <Spinner size="sm" />}
                </div>
                <CardDescription>
                  {logs.length} líneas · {sseConnected ? 'Streaming en vivo' : sseDone ? 'Finalizado' : 'Conectando...'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto rounded-lg bg-gray-900 p-4 font-mono text-xs">
                  {logs.length === 0 && !sseConnected && !sseDone && (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Spinner size="sm" className="mx-auto mb-2 text-gray-500" />
                        <p>Conectando al stream de logs…</p>
                      </div>
                    </div>
                  )}

                  {logs.map((line, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'mb-1 leading-relaxed',
                        line.includes('✅') || line.includes('🏁')
                          ? 'text-emerald-400'
                          : line.includes('❌') || line.includes('ERROR')
                          ? 'text-red-400'
                          : line.includes('🤖') || line.includes('🚀')
                          ? 'text-indigo-300'
                          : 'text-gray-300'
                      )}
                    >
                      {line}
                    </div>
                  ))}

                  {sseConnected && (
                    <div className="flex items-center gap-1 text-indigo-400">
                      <span className="inline-block h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                      <span>Ejecutando…</span>
                    </div>
                  )}

                  {sseDone && (
                    <div className="mt-2 text-emerald-400 font-semibold">
                      ✅ Ejecución completada
                    </div>
                  )}

                  <div ref={logsEndRef} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

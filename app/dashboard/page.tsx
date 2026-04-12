'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, Briefcase, Users, TrendingUp, ArrowRight, Activity } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useJobsStream } from '@/hooks/useJobsStream';
import AppShell from '@/components/layout/AppShell';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Badge, Button, Spinner, Alert
} from '@/components/ui';
import { formatDate, formatPercent } from '@/lib/utils';
import type { Job, Client, MetricsOverview, ClientsResponse, JobsResponse } from '@/lib/types';
import { CLIENT_STATUS_MAP } from '@/lib/types';

export default function DashboardPage() {
  const user = useCurrentUser();
  // Stream SSE para actualizaciones de jobs en tiempo real
  useJobsStream();

  const { data: clientsData, isLoading: loadingClients, error: clientsError } = useQuery<ClientsResponse>({
    queryKey: ['clients'],
    queryFn: () => apiClient.listClients() as Promise<ClientsResponse>,
    refetchInterval: 60_000,
  });

  const { data: jobsData, isLoading: loadingJobs } = useQuery<JobsResponse>({
    queryKey: ['jobs'],
    queryFn: () => apiClient.listJobs() as Promise<JobsResponse>,
    refetchInterval: 30_000, // SSE hace el trabajo; polling como fallback
  });

  const { data: metricsData } = useQuery<MetricsOverview>({
    queryKey: ['metrics'],
    queryFn: () => apiClient.getMetricsOverview(24) as Promise<MetricsOverview>,
    refetchInterval: 30_000,
  });

  const clients: Client[] = clientsData?.clients ?? [];
  const jobs: Job[] = jobsData?.jobs ?? [];
  const runningJobs = jobs.filter((j) => j.status === 'running');

  return (
    <AppShell title="Dashboard">
      {/* Bienvenida */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Bienvenido de nuevo, {user?.username || 'Usuario'} 👋
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Aquí tienes el resumen de tu plataforma SynaptoLabsIA
        </p>
      </div>

      {/* Métricas rápidas */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Clientes"
          value={loadingClients ? '—' : clients.length}
          icon={Users}
          color="indigo"
        />
        <StatCard
          label="Jobs activos"
          value={loadingJobs ? '—' : runningJobs.length}
          icon={Activity}
          color="amber"
        />
        <StatCard
          label="Tasa de éxito"
          value={metricsData ? formatPercent(metricsData.success_rate) : '—'}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          label="Total jobs (24h)"
          value={metricsData ? metricsData.total_requests : '—'}
          icon={Briefcase}
          color="blue"
        />
      </div>

      {/* CTA nueva petición */}
      <Card className="mb-6 border-indigo-100 bg-gradient-to-r from-indigo-50 to-white">
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <h3 className="font-semibold text-gray-900">¿Tienes un nuevo proyecto?</h3>
            <p className="mt-1 text-sm text-gray-500">
              Cuéntanos lo que necesitas y nuestros agentes se pondrán en marcha
            </p>
          </div>
          <Link href="/request/new">
            <Button size="lg">
              <PlusCircle className="h-5 w-5" />
              Nueva Petición
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Proyectos activos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Proyectos</CardTitle>
              <Link href="/projects" className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <CardDescription>Clientes y estado de sus proyectos</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingClients && (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            )}
            {clientsError && (
              <Alert variant="error">No se pudieron cargar los clientes. ¿El backend está activo?</Alert>
            )}
            {!loadingClients && clients.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">Sin clientes todavía</p>
            )}
            <div className="space-y-3">
              {clients.slice(0, 4).map((client: Client) => (
                <div
                  key={client.slug}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{client.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {client.tipo} · {client.ultima_entrega ? formatDate(client.ultima_entrega) : 'Sin entregas'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={CLIENT_STATUS_MAP[client.estado]?.variant || 'default'}>
                      {CLIENT_STATUS_MAP[client.estado]?.label || client.estado}
                    </Badge>
                    <Link href={`/projects/${client.slug}`}>
                      <ArrowRight className="h-4 w-4 text-gray-400 hover:text-indigo-600" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Jobs recientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Jobs Recientes</CardTitle>
              <Link href="/jobs" className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <CardDescription>Ejecuciones en curso y recientes</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingJobs && (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            )}
            {!loadingJobs && jobs.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">Sin jobs recientes</p>
            )}
            <div className="space-y-3">
              {jobs.slice(0, 4).map((job: Job) => (
                <div
                  key={job.job_id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{job.crew_name}</p>
                    <p className="text-xs font-mono text-gray-400">{job.job_id.slice(0, 12)}…</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <JobStatusBadge status={job.status} />
                    <Link href={`/jobs/${job.job_id}`}>
                      <ArrowRight className="h-4 w-4 text-gray-400 hover:text-indigo-600" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: 'indigo' | 'amber' | 'emerald' | 'blue';
}) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function JobStatusBadge({ status }: { status: string }) {
  const map: Record<string, any> = {
    running: { label: 'En curso', variant: 'warning' },
    completed: { label: 'Completado', variant: 'success' },
    failed: { label: 'Fallido', variant: 'danger' },
    queued: { label: 'En cola', variant: 'info' },
  };
  const { label, variant } = map[status] || { label: status, variant: 'default' };
  return <Badge variant={variant}>{label}</Badge>;
}

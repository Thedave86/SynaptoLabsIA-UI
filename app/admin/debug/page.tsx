'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import AppShell from '@/components/layout/AppShell';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Badge, Button, Spinner, Alert, Progress
} from '@/components/ui';
import { formatPercent, formatDuration } from '@/lib/utils';

export default function AdminDebugPage() {
  const { data: metrics, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['metrics', 'overview'],
    queryFn: () => apiClient.getMetricsOverview(168),
    refetchInterval: 30_000,
  });

  // Datos para gráfico de crews
  const crewChartData = metrics?.crews
    ? Object.entries(metrics.crews).map(([name, stats]: [string, any]) => ({
        name,
        ejecuciones: stats.ejecuciones || 0,
        exito: stats.exito_pct || 0,
        duracion: stats.dur_media_s || 0,
      }))
    : [];

  return (
    <AppShell title="Admin — Métricas">
      <div className="max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Dashboard de Métricas</h2>
            <p className="mt-1 text-sm text-gray-500">Últimas 168h · Auto-refresh 30s</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} loading={isFetching}>
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            No se pudieron cargar las métricas. ¿Está activo el backend?
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard
                icon={TrendingUp}
                label="Total Requests"
                value={metrics?.total_requests?.toLocaleString() || '0'}
                color="blue"
              />
              <KpiCard
                icon={CheckCircle}
                label="Tasa de éxito"
                value={formatPercent(metrics?.success_rate || 0)}
                color={(metrics?.success_rate || 0) > 0.9 ? 'green' : 'amber'}
              />
              <KpiCard
                icon={Clock}
                label="Duración media"
                value={formatDuration(metrics?.avg_duration_s || 0)}
                color="indigo"
              />
              <KpiCard
                icon={AlertTriangle}
                label="Alertas activas"
                value={metrics?.alertas?.length || 0}
                color={metrics?.alertas?.length > 0 ? 'red' : 'green'}
              />
            </div>

            {/* Alertas */}
            {metrics?.alertas && metrics.alertas.length > 0 && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                  <AlertTriangle className="h-4 w-4" />
                  {metrics.alertas.length} Alerta{metrics.alertas.length > 1 ? 's' : ''} activa
                  {metrics.alertas.length > 1 ? 's' : ''}
                </h3>
                <ul className="mt-2 space-y-1">
                  {metrics.alertas.map((alerta: string, i: number) => (
                    <li key={i} className="text-sm text-amber-800">• {alerta}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Gráfico de ejecuciones por crew */}
              <Card>
                <CardHeader>
                  <CardTitle>Ejecuciones por Crew</CardTitle>
                  <CardDescription>Número total de ejecuciones</CardDescription>
                </CardHeader>
                <CardContent>
                  {crewChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={crewChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="ejecuciones" fill="#6366f1" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="py-8 text-center text-sm text-gray-400">Sin datos de crews</p>
                  )}
                </CardContent>
              </Card>

              {/* Gráfico tasa de éxito */}
              <Card>
                <CardHeader>
                  <CardTitle>Tasa de Éxito por Crew (%)</CardTitle>
                  <CardDescription>Porcentaje de éxito en últimas 168h</CardDescription>
                </CardHeader>
                <CardContent>
                  {crewChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={crewChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: any) => [`${v}%`, 'Éxito']} />
                        <Bar dataKey="exito" fill="#10b981" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="py-8 text-center text-sm text-gray-400">Sin datos</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tabla detallada de crews */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Detalle por Crew</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics?.crews ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="pb-3 text-left font-medium text-gray-500">Crew</th>
                          <th className="pb-3 text-right font-medium text-gray-500">Ejecuciones</th>
                          <th className="pb-3 text-right font-medium text-gray-500">Éxito</th>
                          <th className="pb-3 text-right font-medium text-gray-500">Dur. media</th>
                          <th className="pb-3 text-right font-medium text-gray-500">Reintentos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {Object.entries(metrics.crews).map(([name, stats]: [string, any]) => (
                          <tr key={name} className="hover:bg-gray-50">
                            <td className="py-3 font-medium text-gray-900">{name}</td>
                            <td className="py-3 text-right text-gray-600">{stats.ejecuciones}</td>
                            <td className="py-3 text-right">
                              <Badge
                                variant={
                                  stats.exito_pct > 90
                                    ? 'success'
                                    : stats.exito_pct > 70
                                    ? 'warning'
                                    : 'danger'
                                }
                              >
                                {stats.exito_pct?.toFixed(1)}%
                              </Badge>
                            </td>
                            <td className="py-3 text-right text-gray-600">
                              {formatDuration(stats.dur_media_s || 0)}
                            </td>
                            <td className="py-3 text-right text-gray-600">
                              {stats.reintentos_total}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="py-4 text-center text-sm text-gray-400">Sin datos de crews</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'amber' | 'indigo' | 'red';
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

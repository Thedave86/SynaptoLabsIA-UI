/**
 * app/debug/page.tsx
 * Dashboard de debug: métricas y monitoreo de crews
 * 
 * Autor: GitHub Copilot (Claude Sonnet 4.5)
 * Fecha: 2026-04-10
 */

'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface MetricsOverview {
  total_requests: number;
  success_rate: number;
  avg_duration_s: number;
  crews: Record<string, any>;
  alertas: string[];
}

export default function DebugPage() {
  const [metrics, setMetrics] = useState<MetricsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // refresh cada 30s
    return () => clearInterval(interval);
  }, []);

  async function loadMetrics() {
    try {
      const data = await apiClient.getMetricsOverview(168);
      setMetrics(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Clock className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-2 text-gray-600">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-2 text-red-700">Error: {error}</p>
          <button
            onClick={loadMetrics}
            className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          SynaptoLabsIA Debug Dashboard
        </h1>

        {/* Global Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="Total Requests"
            value={metrics?.total_requests.toLocaleString() || '0'}
            color="blue"
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6" />}
            label="Success Rate"
            value={`${((metrics?.success_rate || 0) * 100).toFixed(1)}%`}
            color={
              (metrics?.success_rate || 0) > 0.9
                ? 'green'
                : (metrics?.success_rate || 0) > 0.7
                ? 'yellow'
                : 'red'
            }
          />
          <StatCard
            icon={<Clock className="h-6 w-6" />}
            label="Avg Duration"
            value={`${metrics?.avg_duration_s.toFixed(0)}s`}
            color="blue"
          />
        </div>

        {/* Alertas */}
        {metrics?.alertas && metrics.alertas.length > 0 && (
          <div className="mb-8 rounded-lg bg-yellow-50 p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <h2 className="ml-2 text-lg font-semibold text-yellow-900">
                Alertas ({metrics.alertas.length})
              </h2>
            </div>
            <ul className="mt-2 space-y-1">
              {metrics.alertas.map((alerta, i) => (
                <li key={i} className="text-sm text-yellow-800">
                  • {alerta}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Crews Table */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Crews</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Crew
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Executions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Avg Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Retries
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {metrics?.crews &&
                  Object.entries(metrics.crews).map(([name, stats]: [string, any]) => (
                    <tr key={name} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {stats.ejecuciones}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            stats.exito_pct > 90
                              ? 'bg-green-100 text-green-800'
                              : stats.exito_pct > 70
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {stats.exito_pct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {stats.dur_media_s}s
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {stats.reintentos_total}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className={`inline-flex rounded-lg p-3 ${colorClasses[color]}`}>{icon}</div>
      <p className="mt-4 text-sm font-medium text-gray-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

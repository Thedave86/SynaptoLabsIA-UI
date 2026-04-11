'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Clock, TrendingUp, Users, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import AppShell from '@/components/layout/AppShell';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Badge, Button, Spinner, Alert
} from '@/components/ui';
import { formatPercent, formatDuration } from '@/lib/utils';

export default function CrewsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['crews'],
    queryFn: () => apiClient.listCrews(),
  });

  const crews: any[] = Array.isArray(data) ? data : data?.crews || [];

  return (
    <AppShell title="Servicios">
      <div className="max-w-5xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Catálogo de Servicios</h2>
          <p className="mt-1 text-sm text-gray-500">
            Todos los agentes especializados disponibles en la plataforma
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            No se pudieron cargar los servicios. ¿El backend está activo?
          </Alert>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {crews.map((crew: any) => (
            <Card key={crew.name} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{crew.name}</CardTitle>
                    <CardDescription className="mt-1">{crew.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Éxito</span>
                    </div>
                    <span className="font-medium text-emerald-700">
                      {formatPercent(crew.success_rate || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Duración media</span>
                    </div>
                    <span className="font-medium text-gray-700">
                      {formatDuration(crew.avg_duration_s || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="h-3.5 w-3.5" />
                      <span>Ejecuciones</span>
                    </div>
                    <span className="font-medium text-gray-700">{crew.total_executions || 0}</span>
                  </div>
                </div>

                {/* Agentes */}
                {crew.agents && crew.agents.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1.5">Agentes</p>
                    <div className="flex flex-wrap gap-1">
                      {crew.agents.map((agent: string) => (
                        <Badge key={agent} variant="outline" className="text-xs">
                          {agent}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <Link href={`/request/new?crew=${crew.name}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Solicitar este servicio
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

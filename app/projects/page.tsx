'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FolderOpen, PlusCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import AppShell from '@/components/layout/AppShell';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Badge, Button, Spinner, Alert
} from '@/components/ui';
import { formatDate } from '@/lib/utils';

const statusVariant: Record<string, any> = {
  activo: 'success',
  en_progreso: 'warning',
  completado: 'info',
  requiere_accion: 'danger',
};

const statusLabel: Record<string, string> = {
  activo: 'Activo',
  en_progreso: 'En progreso',
  completado: 'Completado',
  requiere_accion: 'Requiere acción',
};

export default function ProjectsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.listClients(),
    refetchInterval: 30_000,
  });

  const clients = data?.clients || [];

  return (
    <AppShell title="Proyectos">
      <div className="max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Proyectos</h2>
            <p className="mt-1 text-sm text-gray-500">
              {data?.total ?? '…'} clientes · Estado de sus proyectos
            </p>
          </div>
          <Link href="/request/new">
            <Button>
              <PlusCircle className="h-4 w-4" />
              Nueva Petición
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            No se pudieron cargar los proyectos. ¿El backend está activo?
          </Alert>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && clients.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No hay clientes todavía.</p>
              <Link href="/request/new" className="mt-4 inline-block">
                <Button variant="primary" size="sm">Crear primer proyecto</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client: any) => (
            <Card key={client.slug} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{client.nombre}</CardTitle>
                    <CardDescription className="capitalize">{client.tipo}</CardDescription>
                  </div>
                  <Badge variant={statusVariant[client.estado] || 'default'}>
                    {statusLabel[client.estado] || client.estado}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  {client.proyectos_activos > 0 && (
                    <p>
                      <span className="font-medium">{client.proyectos_activos}</span> proyecto
                      {client.proyectos_activos !== 1 ? 's' : ''} activo
                      {client.proyectos_activos !== 1 ? 's' : ''}
                    </p>
                  )}
                  {client.ultima_entrega && (
                    <p className="text-xs text-gray-400">
                      Última entrega: {formatDate(client.ultima_entrega)}
                    </p>
                  )}
                </div>
                <Link href={`/projects/${client.slug}`} className="mt-4 block">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver detalle
                    <ArrowRight className="h-3 w-3" />
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

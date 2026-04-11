'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Package } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import AppShell from '@/components/layout/AppShell';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Badge, Button, Spinner, Alert
} from '@/components/ui';
import { formatDate } from '@/lib/utils';

interface ProjectDetailProps {
  params: Promise<{ cliente: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailProps) {
  const { cliente } = use(params);

  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client', cliente],
    queryFn: () => apiClient.getClient(cliente),
  });

  const { data: outputs } = useQuery({
    queryKey: ['client-outputs', cliente],
    queryFn: () => apiClient.listClientOutputs(cliente),
  });

  return (
    <AppShell title={client?.nombre || cliente}>
      <div className="max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
          {!isLoading && client && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{client.nombre}</h2>
              <p className="text-sm text-gray-500 capitalize">
                {client.tipo} · {client.contacto}
              </p>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            Cliente no encontrado o error de conexión.
          </Alert>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {client && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Info principal */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Descripción del proyecto</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{client.descripcion || 'Sin descripción'}</p>
                </CardContent>
              </Card>

              {/* Outputs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Entregas y Outputs</CardTitle>
                    <Badge variant="info">{outputs?.total || 0} archivos</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {!outputs || outputs.outputs.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-400">Sin entregas todavía</p>
                  ) : (
                    <div className="space-y-2">
                      {outputs.outputs.map((file: any) => (
                        <div
                          key={file.filename}
                          className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700 font-mono">{file.filename}</span>
                          </div>
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}/clients/${cliente}/outputs/${file.filename}`}
                            download
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar info */}
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Estado</p>
                    <Badge variant="success" className="mt-1">
                      {client.estado}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Proyectos activos</p>
                    <p className="mt-0.5 font-semibold text-gray-900">{client.proyectos_activos}</p>
                  </div>
                  {client.ultima_entrega && (
                    <div>
                      <p className="text-xs text-gray-500">Última entrega</p>
                      <p className="mt-0.5 text-sm text-gray-700">{formatDate(client.ultima_entrega)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Crews usados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {client.crews_usados?.map((crew: string) => (
                      <Badge key={crew} variant="default">{crew}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Link href="/request/new">
                <Button className="w-full">Nueva petición para este cliente</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

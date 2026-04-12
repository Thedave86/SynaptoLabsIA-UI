/**
 * hooks/useJobsStream.ts
 * Hook para recibir actualizaciones de jobs en tiempo real via SSE.
 *
 * Conecta al endpoint /api/proxy/jobs/stream (BFF → Core).
 * Actualiza el caché de TanStack Query directamente, de modo que
 * los componentes que usan useJobs() reciben las actualizaciones automáticamente.
 *
 * Fallback: si el stream se desconecta, vuelve a conectar con backoff exponencial.
 */

'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { JobsResponse } from '@/lib/types';

const STREAM_URL = '/api/proxy/jobs/stream';
const MAX_RECONNECT_DELAY_MS = 30_000;

export function useJobsStream() {
  const queryClient = useQueryClient();
  const reconnectDelay = useRef(1_000);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;

      const es = new EventSource(STREAM_URL);
      esRef.current = es;

      es.addEventListener('jobs', (event: MessageEvent) => {
        try {
          const data: JobsResponse = JSON.parse(event.data);
          // Actualiza el caché directamente — sin petición adicional al servidor
          queryClient.setQueryData<JobsResponse>(['jobs'], data);
          // Resetear el backoff en conexión exitosa
          reconnectDelay.current = 1_000;
        } catch {
          // Silenciar errores de parsing
        }
      });

      es.onerror = () => {
        es.close();
        if (!cancelled) {
          // Reconectar con backoff exponencial, máximo 30s
          const delay = reconnectDelay.current;
          reconnectDelay.current = Math.min(delay * 2, MAX_RECONNECT_DELAY_MS);
          setTimeout(connect, delay);
        }
      };
    }

    connect();

    return () => {
      cancelled = true;
      esRef.current?.close();
      esRef.current = null;
    };
  }, [queryClient]);
}

'use client';

/**
 * app/error.tsx
 * Error boundary global de Next.js App Router.
 * Captura errores de render en cualquier ruta y muestra una UI de recuperación.
 */

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // En producción, aquí se integraría Sentry u otro sistema de reporte
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <h1 className="mb-2 text-lg font-semibold text-gray-900">
          Algo salió mal
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Se produjo un error inesperado. Puedes intentar recargar la página.
          {error?.digest && (
            <span className="mt-1 block font-mono text-xs text-gray-400">
              Ref: {error.digest}
            </span>
          )}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Intentar de nuevo
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Ir al Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

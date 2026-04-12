/**
 * app/api/proxy/[...path]/route.ts
 * BFF: proxy genérico que reenvía todas las llamadas al Core API.
 * Lee la cookie httpOnly synaptolabs-token y la añade como Bearer token.
 * El token nunca circula a través del JavaScript del navegador.
 *
 * Soporta: GET, POST, PUT, PATCH, DELETE
 * Soporta: streaming (SSE), JSON, form-urlencoded
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const CORE_API_URL = process.env.CORE_API_URL || 'http://localhost:8000/api/v1';

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxyRequest(request: NextRequest, context: RouteContext): Promise<Response> {
  const { path } = await context.params;
  const cookieStore = await cookies();
  const token = cookieStore.get('synaptolabs-token')?.value;

  if (!token) {
    return NextResponse.json({ detail: 'No autorizado' }, { status: 401 });
  }

  // Reconstruir URL con query params
  const upstreamPath = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const upstreamUrl = `${CORE_API_URL}/${upstreamPath}${searchParams ? `?${searchParams}` : ''}`;

  // Preparar headers — conservar Content-Type del cliente excepto para host
  const forwardHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  const contentType = request.headers.get('content-type');
  if (contentType) forwardHeaders['Content-Type'] = contentType;

  // Preparar body (solo para métodos con payload)
  const method = request.method;
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
  const body = hasBody ? request.body : undefined;

  const coreResponse = await fetch(upstreamUrl, {
    method,
    headers: forwardHeaders,
    body: body as BodyInit | undefined,
    // Necesario para streaming (SSE)
    duplex: 'half',
  } as RequestInit & { duplex?: string });

  // Reenviar la respuesta tal cual, incluyendo streaming
  const responseHeaders = new Headers();
  const contentTypeRes = coreResponse.headers.get('content-type');
  if (contentTypeRes) responseHeaders.set('content-type', contentTypeRes);

  // Para SSE y otros streams: no bufferizar
  if (contentTypeRes?.includes('text/event-stream')) {
    responseHeaders.set('cache-control', 'no-cache');
    responseHeaders.set('x-accel-buffering', 'no');
  }

  return new Response(coreResponse.body, {
    status: coreResponse.status,
    statusText: coreResponse.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;

/**
 * lib/api-client.ts
 * Cliente HTTP para SynaptoLabsIA API — Arquitectura BFF
 *
 * SEGURIDAD: El token JWT vive exclusivamente en una cookie httpOnly
 * gestionada por las API Routes de Next.js (/api/auth/*).
 * Ningún token circula por el JavaScript del navegador.
 *
 * Todas las llamadas al Core API se enrutan a través del proxy BFF:
 *   /api/proxy/* → Core API (con Bearer inyectado server-side)
 *
 * Autor: GitHub Copilot (Claude Sonnet 4.6)
 */

import axios, { AxiosInstance } from 'axios';

// El proxy BFF corre en el mismo origen — sin CORS, sin tokens en el cliente
const PROXY_BASE = '/api/proxy';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: PROXY_BASE,
      headers: { 'Content-Type': 'application/json' },
      // Incluye cookies httpOnly automáticamente (mismo origen)
      withCredentials: true,
    });

    // Response interceptor: manejar 401 → redirigir a login
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            const redirectTo = encodeURIComponent(window.location.pathname);
            window.location.href = `/login?redirectTo=${redirectTo}`;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ==========================================================================
  // Auth — llaman a las API Routes de Next.js, no al Core directamente
  // ==========================================================================

  async login(username: string, password: string): Promise<{ user: { username: string; email: string; role: string } }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw { response: { data: err, status: res.status } };
    }

    return res.json();
  }

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  }

  async getCurrentUser(): Promise<{ username: string; email: string; role: string }> {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) throw new Error('No autenticado');
    return res.json();
  }

  // ==========================================================================
  // Crews
  // ==========================================================================

  async listCrews() {
    const { data } = await this.client.get('/crews/');
    return data;
  }

  async getCrewDetails(crewName: string) {
    const { data } = await this.client.get(`/crews/${crewName}`);
    return data;
  }

  async executeCrew(crewName: string, inputs: Record<string, string>) {
    const { data } = await this.client.post(`/crews/${crewName}/execute`, { inputs });
    return data;
  }

  // ==========================================================================
  // Jobs
  // ==========================================================================

  async listJobs() {
    const { data } = await this.client.get('/jobs/');
    return data;
  }

  async getJobStatus(jobId: string) {
    const { data } = await this.client.get(`/jobs/${jobId}`);
    return data;
  }

  /** URL del stream SSE de logs — mismo origen (BFF proxy), cookies auto-incluidas */
  getJobLogsUrl(jobId: string): string {
    return `/api/proxy/jobs/${jobId}/logs`;
  }

  /** URL del stream SSE de todos los jobs activos */
  getJobsStreamUrl(): string {
    return `/api/proxy/jobs/stream`;
  }

  // ==========================================================================
  // Clients
  // ==========================================================================

  async listClients() {
    const { data } = await this.client.get('/clients/');
    return data;
  }

  async getClient(slug: string) {
    const { data } = await this.client.get(`/clients/${slug}`);
    return data;
  }

  async listClientOutputs(slug: string) {
    const { data } = await this.client.get(`/clients/${slug}/outputs`);
    return data;
  }

  // ==========================================================================
  // Requests (nueva petición)
  // ==========================================================================

  async createRequest(texto: string, cliente: string, contextoAdicional?: string) {
    const { data } = await this.client.post('/requests/', {
      texto,
      cliente,
      contexto_adicional: contextoAdicional,
    });
    return data;
  }

  async getRequestStatus(requestId: string) {
    const { data } = await this.client.get(`/requests/${requestId}`);
    return data;
  }

  async submitAclaracion(requestId: string, respuestas: Record<string, string>) {
    const { data } = await this.client.post(`/requests/${requestId}/aclarar`, {
      request_id: requestId,
      respuestas,
    });
    return data;
  }

  async executeRequest(requestId: string) {
    const { data } = await this.client.post(`/requests/${requestId}/ejecutar`, {});
    return data;
  }

  // ==========================================================================
  // Metrics
  // ==========================================================================

  async getMetricsOverview(hoursAgo: number = 168) {
    const { data } = await this.client.get('/metrics/overview', {
      params: { desde_horas: hoursAgo },
    });
    return data;
  }

  async getTimeseries(
    metric: string,
    granularity: string = '1h',
    from?: string,
    to?: string
  ) {
    const { data } = await this.client.get('/metrics/timeseries', {
      params: {
        metric,
        granularity,
        desde: from,
        hasta: to,
      },
    });
    return data;
  }
}

export const apiClient = new ApiClient();

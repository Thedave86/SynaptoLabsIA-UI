/**
 * lib/api-client.ts
 * Cliente HTTP para SynaptoLabsIA API
 * 
 * Autor: GitHub Copilot (Claude Sonnet 4.5)
 * Fecha: 2026-04-10
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: añadir token JWT
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor: manejar 401
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    // Cargar token desde localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  // ==========================================================================
  // Auth
  // ==========================================================================

  async login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const { data } = await this.client.post('/auth/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    this.token = data.access_token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', this.token!);
    }

    return data;
  }

  logout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  async getCurrentUser() {
    const { data } = await this.client.get('/auth/me');
    return data;
  }

  // ==========================================================================
  // Crews
  // ==========================================================================

  async listCrews() {
    const { data } = await this.client.get('/crews/');
    return data.crews;
  }

  async getCrewDetails(crewName: string) {
    const { data } = await this.client.get(`/crews/${crewName}`);
    return data;
  }

  async executeCrew(crewName: string, inputs: Record<string, any>) {
    const { data } = await this.client.post(`/crews/${crewName}/execute`, { inputs });
    return data;
  }

  // ==========================================================================
  // Jobs
  // ==========================================================================

  async getJobStatus(jobId: string) {
    const { data } = await this.client.get(`/jobs/${jobId}`);
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

/**
 * lib/types.ts
 * Interfaces de dominio para SynaptoLabsIA-UI
 *
 * Fuente de verdad para todos los tipos que viajan entre el Core API y el UI.
 * Elimina el uso de `any` en páginas y componentes.
 *
 * Convención: los nombres de campo coinciden con los nombres devueltos por el Core API.
 *
 * Autor: GitHub Copilot (Claude Sonnet 4.6)
 */

// ============================================================================
// Auth
// ============================================================================

export interface User {
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
}

// ============================================================================
// Jobs
// ============================================================================

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Job {
  job_id: string;
  crew_name: string;
  status: JobStatus;
  progress: number;          // 0.0 – 1.0
  current_task?: string;
  started_at?: string;       // ISO 8601
  completed_at?: string;
  result?: Record<string, unknown>;
  error?: string;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
}

// ============================================================================
// Crews
// ============================================================================

export interface CrewInput {
  name: string;
  description?: string;
  required?: boolean;
}

export interface Crew {
  name: string;
  description: string;
  category: string;
  inputs: CrewInput[] | string[];
}

export interface CrewsResponse {
  crews: Crew[];
  total?: number;
}

export interface CrewExecuteResult {
  job_id: string;
  status: JobStatus;
  message?: string;
}

// ============================================================================
// Clients / Projects
// ============================================================================

export type ClientStatus = 'activo' | 'en_progreso' | 'completado' | 'requiere_accion';

export interface Client {
  id?: string;
  slug: string;
  nombre: string;
  estado: ClientStatus;
  tipo_proyecto?: string;
  tipo?: string;
  ultima_entrega?: string;
  created_at?: string;
  repo_url?: string;
}

export interface ClientsResponse {
  clients: Client[];
  total: number;
}

// ============================================================================
// Requests (nueva petición / intake flow)
// ============================================================================

export type RequestStatus =
  | 'pendiente'
  | 'clarificando'
  | 'aprobado'
  | 'en_ejecucion'
  | 'completado'
  | 'fallido';

export interface RequestItem {
  request_id: string;
  texto: string;
  cliente: string;
  status: RequestStatus;
  crew_sugerido?: string;
  preguntas_aclaracion?: string[];
  job_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AclaracionRespuestas {
  request_id: string;
  respuestas: Record<string, string>;
}

// ============================================================================
// Metrics
// ============================================================================

export interface CrewStats {
  ejecuciones: number;
  exito_pct: number;
  dur_media_s: number;
  reintentos_total: number;
}

export interface MetricsOverview {
  total_requests: number;
  success_rate: number;
  avg_duration_s: number;
  crews: Record<string, CrewStats>;
  alertas: string[];
}

export interface TimeseriesPoint {
  timestamp: string;
  value: number;
}

export interface TimeseriesResponse {
  metric: string;
  granularity: string;
  data: TimeseriesPoint[];
}

// ============================================================================
// UI helpers
// ============================================================================

/** Mapa de estado → variante de Badge */
export const JOB_STATUS_MAP: Record<JobStatus, { label: string; variant: string }> = {
  running: { label: 'En ejecución', variant: 'warning' },
  completed: { label: 'Completado', variant: 'success' },
  failed: { label: 'Fallido', variant: 'danger' },
  queued: { label: 'En cola', variant: 'info' },
  cancelled: { label: 'Cancelado', variant: 'default' },
};

export const CLIENT_STATUS_MAP: Record<ClientStatus, { label: string; variant: string }> = {
  activo: { label: 'Activo', variant: 'success' },
  en_progreso: { label: 'En progreso', variant: 'warning' },
  completado: { label: 'Completado', variant: 'info' },
  requiere_accion: { label: 'Requiere acción', variant: 'danger' },
};

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Send, CheckCircle, AlertCircle, XCircle, ChevronRight,
  Clock, Layers, MessageSquare, Rocket
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import AppShell from '@/components/layout/AppShell';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Input, Textarea, Label, Alert, Badge, Spinner, Progress
} from '@/components/ui';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface ProjectSpec {
  tipo: string;
  cliente: string;
  descripcion: string;
  complejidad: string;
  crews_recomendados: string[];
  tiempo_estimado_h: number;
}

interface CeoDictamen {
  decision: 'APROBADO' | 'REQUIERE_ACLARACION' | 'RECHAZADO';
  comentario: string;
  preguntas: string[];
  precio_estimado_eur: number | null;
}

interface RequestState {
  requestId: string | null;
  status: string;
  projectSpec: ProjectSpec | null;
  ceoDictamen: CeoDictamen | null;
  jobId: string | null;
}

// ============================================================================
// Wizard Step Indicator
// ============================================================================

const steps = [
  { icon: MessageSquare, label: 'Tu petición' },
  { icon: Layers, label: 'Revisión' },
  { icon: CheckCircle, label: 'Aprobación CEO' },
  { icon: Rocket, label: 'Seguimiento' },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8 flex items-center">
      {steps.map((step, idx) => {
        const done = idx < currentStep;
        const active = idx === currentStep;
        return (
          <div key={idx} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  done && 'bg-emerald-500 text-white',
                  active && 'bg-indigo-600 text-white ring-4 ring-indigo-100',
                  !done && !active && 'bg-gray-100 text-gray-400'
                )}
              >
                {done ? <CheckCircle className="h-4 w-4" /> : idx + 1}
              </div>
              <p
                className={cn(
                  'mt-1 text-xs font-medium',
                  active ? 'text-indigo-700' : done ? 'text-emerald-600' : 'text-gray-400'
                )}
              >
                {step.label}
              </p>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'mb-4 h-0.5 flex-1 transition-colors',
                  done ? 'bg-emerald-400' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Step 1: Nueva Petición
// ============================================================================

const requestSchema = z.object({
  texto: z.string().min(10, 'Describe tu proyecto con al menos 10 caracteres').max(2000),
  cliente: z.string().min(2, 'Introduce el nombre o slug del cliente').max(100),
});

type RequestForm = z.infer<typeof requestSchema>;

function Step1({
  onNext,
}: {
  onNext: (requestId: string, texto: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
  });

  const textoValue = watch('texto', '');

  async function onSubmit(data: RequestForm) {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.createRequest(data.texto, data.cliente);
      onNext(result.request_id, data.texto);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Error al enviar la petición');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <Label htmlFor="cliente">Cliente *</Label>
        <Input
          id="cliente"
          placeholder="ej: farmacialopez, clinica-dental-sonrisa..."
          {...register('cliente')}
        />
        {errors.cliente && <p className="mt-1 text-xs text-red-600">{errors.cliente.message}</p>}
      </div>

      <div>
        <Label htmlFor="texto">Cuéntanos qué necesitas *</Label>
        <Textarea
          id="texto"
          rows={6}
          placeholder="Ej: Quiero una landing page para mi farmacia en Madrid. Necesito que incluya los servicios que ofrecemos, horarios, localización y un formulario de contacto. La imagen tiene que ser moderna y de confianza."
          className="resize-y"
          {...register('texto')}
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.texto ? (
            <p className="text-xs text-red-600">{errors.texto.message}</p>
          ) : (
            <p className="text-xs text-gray-400">Cuanto más detallado, mejor resultado</p>
          )}
          <p className="text-xs text-gray-400">{textoValue.length}/2000</p>
        </div>
      </div>

      <Button type="submit" className="w-full" loading={loading} size="lg">
        <Send className="h-4 w-4" />
        Enviar Petición
      </Button>
    </form>
  );
}

// ============================================================================
// Step 2: Revisión del ProjectSpec (polling hasta que el backend lo tenga)
// ============================================================================

function Step2({
  requestId,
  onNext,
  onSpec,
}: {
  requestId: string;
  onNext: (spec: ProjectSpec, dictamen: CeoDictamen) => void;
  onSpec: (spec: ProjectSpec) => void;
}) {
  const [status, setStatus] = useState('clasificando');
  const [spec, setSpec] = useState<ProjectSpec | null>(null);
  const [dictamen, setDictamen] = useState<CeoDictamen | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dots, setDots] = useState(0);

  // Polling hasta tener spec + dict
  const poll = useCallback(async () => {
    try {
      const result = await apiClient.getRequestStatus(requestId);
      setStatus(result.status);

      if (result.project_spec) {
        setSpec(result.project_spec);
        onSpec(result.project_spec);
      }
      if (result.ceo_dictamen) {
        setDictamen(result.ceo_dictamen);
      }

      if (result.project_spec && result.ceo_dictamen) {
        onNext(result.project_spec, result.ceo_dictamen);
      } else {
        setTimeout(poll, 3000);
        setDots((d) => (d + 1) % 4);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al consultar el estado');
    }
  }, [requestId, onNext, onSpec]);

  useState(() => {
    poll();
  });

  // Usar useEffect para iniciar polling
  const [started, setStarted] = useState(false);
  if (!started) {
    setStarted(true);
    setTimeout(poll, 1000);
  }

  return (
    <div className="space-y-5">
      {error && <Alert variant="error">{error}</Alert>}

      {!spec && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-indigo-700">
            Analizando tu petición{'.'.repeat(dots + 1)}
          </p>
          <p className="text-xs text-gray-400">
            El ClassifierCrew está detectando el tipo de proyecto
          </p>
        </div>
      )}

      {spec && (
        <div className="space-y-4">
          <Alert variant="success">
            <CheckCircle className="mr-2 inline h-4 w-4" />
            ¡Proyecto clasificado! Revisa los detalles detectados.
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Tipo de proyecto" value={spec.tipo} />
            <InfoRow label="Cliente" value={spec.cliente} />
            <InfoRow label="Complejidad" value={spec.complejidad} />
            <InfoRow label="Tiempo estimado" value={`${spec.tiempo_estimado_h}h`} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Descripción detectada</p>
            <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{spec.descripcion}</p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Crews recomendados</p>
            <div className="flex gap-2 flex-wrap">
              {spec.crews_recomendados.map((crew) => (
                <Badge key={crew} variant="default">{crew}</Badge>
              ))}
            </div>
          </div>

          {!dictamen && (
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <Spinner size="sm" className="text-amber-500" />
              Esperando dictamen del CEO...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 font-medium text-gray-900 capitalize">{value}</p>
    </div>
  );
}

// ============================================================================
// Step 3: CEO Gate
// ============================================================================

function Step3({
  requestId,
  spec,
  dictamen,
  onApproved,
  onRejected,
}: {
  requestId: string;
  spec: ProjectSpec;
  dictamen: CeoDictamen;
  onApproved: (jobId: string) => void;
  onRejected: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [aclaraciones, setAclaraciones] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.executeRequest(requestId);
      onApproved(result.job_id);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Error al ejecutar la petición');
    } finally {
      setLoading(false);
    }
  }

  async function handleAclaracion() {
    setLoading(true);
    setError(null);
    try {
      await apiClient.submitAclaracion(requestId, aclaraciones);
      // Tras aclaración, reintentar aprobación
      const result = await apiClient.executeRequest(requestId);
      onApproved(result.job_id);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Error al enviar aclaraciones');
    } finally {
      setLoading(false);
    }
  }

  const decisionConfig = {
    APROBADO: {
      icon: CheckCircle,
      color: 'emerald',
      label: 'Aprobado',
      alertVariant: 'success' as const,
    },
    REQUIERE_ACLARACION: {
      icon: AlertCircle,
      color: 'amber',
      label: 'Requiere aclaración',
      alertVariant: 'warning' as const,
    },
    RECHAZADO: {
      icon: XCircle,
      color: 'red',
      label: 'Rechazado',
      alertVariant: 'error' as const,
    },
  };

  const config = decisionConfig[dictamen.decision] || decisionConfig.APROBADO;
  const DecisionIcon = config.icon;

  return (
    <div className="space-y-5">
      {error && <Alert variant="error">{error}</Alert>}

      {/* Dictamen CEO */}
      <div className="rounded-xl border-2 border-indigo-100 bg-indigo-50 p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
            <span className="text-xs font-bold text-white">CEO</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Dictamen del CEO</p>
            <p className="text-xs text-gray-500">SynaptoLabs CEO Agent</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <DecisionIcon className={`h-5 w-5 text-${config.color}-600`} />
          <Badge
            variant={
              dictamen.decision === 'APROBADO'
                ? 'success'
                : dictamen.decision === 'RECHAZADO'
                ? 'danger'
                : 'warning'
            }
          >
            {config.label}
          </Badge>
          {dictamen.precio_estimado_eur && (
            <Badge variant="info">~{dictamen.precio_estimado_eur}€</Badge>
          )}
        </div>

        <p className="text-sm text-gray-700">{dictamen.comentario}</p>
      </div>

      {/* APROBADO */}
      {dictamen.decision === 'APROBADO' && (
        <Button size="lg" className="w-full" onClick={handleApprove} loading={loading}>
          <Rocket className="h-5 w-5" />
          Lanzar el proyecto
        </Button>
      )}

      {/* REQUIERE_ACLARACION */}
      {dictamen.decision === 'REQUIERE_ACLARACION' && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-amber-700">
            El CEO necesita más información para proceder:
          </p>
          {dictamen.preguntas.map((pregunta, idx) => (
            <div key={idx}>
              <Label>{pregunta}</Label>
              <Textarea
                rows={2}
                placeholder="Tu respuesta..."
                value={aclaraciones[pregunta] || ''}
                onChange={(e) =>
                  setAclaraciones((prev) => ({ ...prev, [pregunta]: e.target.value }))
                }
              />
            </div>
          ))}
          <Button
            size="lg"
            className="w-full"
            onClick={handleAclaracion}
            loading={loading}
          >
            Enviar aclaraciones y lanzar
          </Button>
        </div>
      )}

      {/* RECHAZADO */}
      {dictamen.decision === 'RECHAZADO' && (
        <div className="space-y-4">
          <Alert variant="error">
            El CEO ha rechazado esta petición. Por favor, revisa los criterios y reformula.
          </Alert>
          <Button variant="outline" className="w-full" onClick={onRejected}>
            Volver al inicio
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Step 4: Job Tracking
// ============================================================================

function Step4({ jobId }: { jobId: string }) {
  const router = useRouter();

  return (
    <div className="space-y-5 text-center">
      <div className="flex flex-col items-center py-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
          <Rocket className="h-10 w-10 text-emerald-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">¡Proyecto lanzado!</h3>
        <p className="mt-2 text-sm text-gray-500">
          Nuestros agentes están trabajando en tu proyecto
        </p>
        <Badge variant="info" className="mt-2 font-mono text-xs">
          Job: {jobId.slice(0, 16)}…
        </Badge>
      </div>

      <div className="flex gap-3">
        <Button
          variant="primary"
          className="flex-1"
          onClick={() => router.push(`/jobs/${jobId}`)}
        >
          Ver progreso en vivo
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => router.push('/dashboard')}>
          Ir al Dashboard
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Wizard Page
// ============================================================================

export default function NewRequestPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<RequestState>({
    requestId: null,
    status: 'idle',
    projectSpec: null,
    ceoDictamen: null,
    jobId: null,
  });

  function handleStep1Done(requestId: string, _texto: string) {
    setState((s) => ({ ...s, requestId, status: 'clasificando' }));
    setCurrentStep(1);
  }

  function handleSpec(spec: ProjectSpec) {
    setState((s) => ({ ...s, projectSpec: spec }));
  }

  function handleStep2Done(spec: ProjectSpec, dictamen: CeoDictamen) {
    setState((s) => ({
      ...s,
      projectSpec: spec,
      ceoDictamen: dictamen,
      status: dictamen.decision.toLowerCase(),
    }));
    setCurrentStep(2);
  }

  function handleStep3Approved(jobId: string) {
    setState((s) => ({ ...s, jobId, status: 'ejecutando' }));
    setCurrentStep(3);
  }

  function handleStep3Rejected() {
    setState({ requestId: null, status: 'idle', projectSpec: null, ceoDictamen: null, jobId: null });
    setCurrentStep(0);
  }

  return (
    <AppShell title="Nueva Petición">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Nueva Petición de Proyecto</h2>
          <p className="mt-1 text-sm text-gray-500">
            Describe lo que necesitas y nuestros agentes se pondrán en marcha
          </p>
        </div>

        <StepIndicator currentStep={currentStep} />

        <Card>
          <CardContent className="pt-6">
            {currentStep === 0 && <Step1 onNext={handleStep1Done} />}

            {currentStep === 1 && state.requestId && (
              <Step2
                requestId={state.requestId}
                onNext={handleStep2Done}
                onSpec={handleSpec}
              />
            )}

            {currentStep === 2 && state.requestId && state.projectSpec && state.ceoDictamen && (
              <Step3
                requestId={state.requestId}
                spec={state.projectSpec}
                dictamen={state.ceoDictamen}
                onApproved={handleStep3Approved}
                onRejected={handleStep3Rejected}
              />
            )}

            {currentStep === 3 && state.jobId && <Step4 jobId={state.jobId} />}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

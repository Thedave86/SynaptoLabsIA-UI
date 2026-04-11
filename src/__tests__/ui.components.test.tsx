import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  Spinner,
  Input,
  Label,
  Progress,
} from '@/components/ui';

// ── Button ──────────────────────────────────────────────────────────────────

describe('Button', () => {
  it('renderiza el texto correctamente', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDefined();
  });

  it('aplica variant primary por defecto', () => {
    render(<Button>OK</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/indigo|primary/i);
  });

  it('se puede desactivar con disabled', () => {
    render(<Button disabled>No puedo</Button>);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('muestra Spinner cuando loading=true', () => {
    render(<Button loading>Cargando</Button>);
    expect(screen.getByRole('button').querySelector('svg, .animate-spin')).toBeTruthy();
  });

  it('llama onClick al hacer click', async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button onClick={() => { clicked = true; }}>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(clicked).toBe(true);
  });

  it('no llama onClick cuando está desactivado', async () => {
    const user = userEvent.setup();
    let count = 0;
    render(<Button disabled onClick={() => { count++; }}>No Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(count).toBe(0);
  });
});

// ── Badge ────────────────────────────────────────────────────────────────────

describe('Badge', () => {
  it('renderiza el contenido', () => {
    render(<Badge>Activo</Badge>);
    expect(screen.getByText('Activo')).toBeDefined();
  });

  it('aplica variante success', () => {
    render(<Badge variant="success">OK</Badge>);
    const badge = screen.getByText('OK');
    expect(badge.className).toMatch(/emerald|green/i);
  });

  it('aplica variante danger', () => {
    render(<Badge variant="danger">ERROR</Badge>);
    expect(screen.getByText('ERROR').className).toMatch(/red/i);
  });

  it('aplica variante warning', () => {
    render(<Badge variant="warning">ADVERTENCIA</Badge>);
    expect(screen.getByText('ADVERTENCIA').className).toMatch(/yellow|amber/i);
  });
});

// ── Card ──────────────────────────────────────────────────────────────────

describe('Card', () => {
  it('renderiza con header, título y contenido', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Mi Título</CardTitle>
        </CardHeader>
        <CardContent>Contenido aquí</CardContent>
      </Card>
    );
    expect(screen.getByText('Mi Título')).toBeDefined();
    expect(screen.getByText('Contenido aquí')).toBeDefined();
  });

  it('acepta className extra', () => {
    render(<Card className="custom-class">Hola</Card>);
    const el = screen.getByText('Hola').closest('div');
    expect(el?.className).toContain('custom-class');
  });
});

// ── Alert ────────────────────────────────────────────────────────────────────

describe('Alert', () => {
  it('renderiza el mensaje', () => {
    render(<Alert variant="info">Información importante</Alert>);
    expect(screen.getByText('Información importante')).toBeDefined();
  });

  it('aplica colores de error', () => {
    render(<Alert variant="error">Algo salió mal</Alert>);
    const alert = screen.getByText('Algo salió mal').closest('div');
    expect(alert?.className).toMatch(/red/i);
  });

  it('aplica colores de success', () => {
    render(<Alert variant="success">¡Éxito!</Alert>);
    const alert = screen.getByText('¡Éxito!').closest('div');
    expect(alert?.className).toMatch(/emerald|green/i);
  });
});

// ── Input ────────────────────────────────────────────────────────────────────

describe('Input', () => {
  it('renderiza el input', () => {
    render(<Input placeholder="Escribe aquí" />);
    expect(screen.getByPlaceholderText('Escribe aquí')).toBeDefined();
  });

  it('acepta un valor inicial', () => {
    render(<Input defaultValue="Hola" />);
    expect((screen.getByDisplayValue('Hola') as HTMLInputElement).value).toBe('Hola');
  });
});

// ── Label ────────────────────────────────────────────────────────────────────

describe('Label', () => {
  it('renderiza el texto del label', () => {
    render(<Label>Nombre del cliente</Label>);
    expect(screen.getByText('Nombre del cliente')).toBeDefined();
  });
});

// ── Progress ──────────────────────────────────────────────────────────────

describe('Progress', () => {
  it('renderiza sin errores', () => {
    const { container } = render(<Progress value={65} />);
    expect(container.firstChild).toBeDefined();
  });
});

// ── Spinner ──────────────────────────────────────────────────────────────

describe('Spinner', () => {
  it('renderiza sin errores', () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toBeDefined();
  });

  it('acepta tamaño lg', () => {
    const { container } = render(<Spinner size="lg" />);
    expect(container.firstChild).toBeDefined();
  });
});

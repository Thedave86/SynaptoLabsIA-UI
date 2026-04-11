import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatDuration, formatPercent } from '@/lib/utils';

describe('cn()', () => {
  it('combina clases simples', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('elimina clases tailwind conflictivas', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6');
  });

  it('ignora valores falsy', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });

  it('acepta condiciones', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });
});

describe('formatDate()', () => {
  it('formatea una fecha ISO', () => {
    const result = formatDate('2026-04-11T12:00:00Z');
    expect(result).toMatch(/\d{1,2}.*abr.*2026|Apr.*11.*2026/i);
  });

  it('devuelve guión para null', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('devuelve guión para undefined', () => {
    expect(formatDate(undefined)).toBe('—');
  });
});

describe('formatDuration()', () => {
  it('formatea segundos a minutos y segundos', () => {
    expect(formatDuration(90)).toBe('1m 30s');
  });

  it('formatea solo segundos si <60', () => {
    expect(formatDuration(45)).toBe('0m 45s');
  });

  it('formatea 0 segundos', () => {
    expect(formatDuration(0)).toBe('0m 0s');
  });

  it('devuelve guión para valores nulos', () => {
    expect(formatDuration(null)).toBe('—');
    expect(formatDuration(undefined)).toBe('—');
  });
});

describe('formatPercent()', () => {
  it('formatea 0.5 como 50.0%', () => {
    expect(formatPercent(0.5)).toMatch(/50[.,]0\s*%/);
  });

  it('formatea 1 como 100.0%', () => {
    expect(formatPercent(1)).toMatch(/100[.,]0\s*%/);
  });

  it('formatea 0 como 0.0%', () => {
    expect(formatPercent(0)).toMatch(/0[.,]0\s*%/);
  });
});

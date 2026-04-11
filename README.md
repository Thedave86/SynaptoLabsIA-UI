# SynaptoLabsIA-UI

Dashboard web para monitoreo y debug de SynaptoLabsIA multi-agent platform.

## Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Language**: TypeScript 5

## Instalación

```bash
npm install
```

## Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador: http://localhost:3000
```

## Variables de Entorno

Crear `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Estructura

```
app/
  layout.tsx         # Root layout
  page.tsx           # Home (redirect a /debug)
  globals.css        # Global styles
  debug/
    page.tsx         # Dashboard de métricas
lib/
  api-client.ts      # Cliente HTTP para backend API
hooks/               # Custom hooks (useStreamingJob, etc)
components/
  ui/                # Componentes reutilizables
```

## Build Production

```bash
npm run build
npm start
```

## Deploy

Optimizado para Vercel, Netlify o cualquier plataforma con soporte Next.js.

---

**Autor**: GitHub Copilot (Claude Sonnet 4.5)  
**Fecha**: 2026-04-10

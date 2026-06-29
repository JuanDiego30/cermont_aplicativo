# Plan de Pulido Pre-Deploy — Temas, Cámara, Docker Cleanup y Workspaces

> **Para workers agentic:** Usar `superpowers:executing-plans` o `superpowers:subagent-driven-development`.
> **Estado:** 2026-06-14 — Auditoría completa + investigación de librerías profesionales.

**Objetivo:** 3 áreas de trabajo: (1) Unificar colores dark/light en todos los componentes UI usando CSS variables, (2) Agregar cámara y escáner QR profesional con `html5-qrcode`, (3) Eliminar TODO rastro de Docker (comentarios, docs, tooling).

---

## Resumen de Hallazgos de Investigación

### QR Scanner — Recomendación: `html5-qrcode` v2.3.8

| Criterio | Resultado |
|----------|-----------|
| **Librería** | [`html5-qrcode`](https://github.com/mebjas/html5-qrcode) (6,115 ★, Apache 2.0) |
| **Bundle** | ~350KB minified — sin dependencias |
| **TypeScript** | ✅ Tipos incluidos (migró a TS en v2.0.4) |
| **React 19** | ✅ Funciona con `useEffect` + `useRef` + `ssr: false` |
| **Next.js** | ✅ Requiere `dynamic(() => import(...), { ssr: false })` |
| **iOS Safari** | ✅ Full soporte (a diferencia de `BarcodeDetector` API) |
| **Formatos** | QR, Aztec, Codabar, Code 39/93/128, Data Matrix, EAN-8/13, ITF, PDF417, UPC-A/E |
| **APIs** | `Html5QrcodeScanner` (UI completa) + `Html5Qrcode` (low-level) |
| **Características** | Scanning por cámara + archivo, torch, zoom, cámara frontal/trasera |
| **Caso real** | [`bonnie-wee-plot`](https://github.com/IsmaelMartinez/bonnie-wee-plot) migró de `@yudiel/react-qr-scanner` a `html5-qrcode` por compatibilidad iOS |

**Por qué NO otras opciones:**
| Librería | Razón |
|----------|--------|
| `@yudiel/react-qr-scanner` | Usa `BarcodeDetector` — no soportado en iOS Safari |
| `quagga2` | Solo códigos de barras (no QR). Mantenimiento irregular |
| `zxing-js/library` | Bundle grande + API compleja para React |
| `jsQR` | Solo QR, sin UI de cámara |
| `BarcodeDetector` nativo | Solo Chrome/Edge. iOS Safari NO lo soporta |

### Tailwind v4 Theme — El sistema actual es arquitectónicamente correcto

El proyecto ya usa la arquitectura correcta para runtime theming:
- `:root { --color-background: #fff; ... }` para tema claro
- `.dark { --color-background: #0f1117; ... }` para tema oscuro
- `@theme inline { ... }` mapea variables a utilidades Tailwind
- `@custom-variant dark (&:is(.dark *));` para compatibilidad con `dark:`

**⚠️ ADVERTENCIA:** `@theme inline` resuelve en build time (hardcodea valores). Las utilidades como `bg-background` NO responderán a cambios runtime de tema. La ÚNICA forma correcta de theming dinámico es usar `var(--color-*)` en los componentes.

### Docker Cleanup — Estado detallado

| Ubicación | Estado | Acción |
|-----------|--------|--------|
| Todos los `package.json` | ✅ Ya limpios | N/A |
| `frontend/next.config.ts` | ⚠️ 1 comentario Docker | Actualizar |
| `frontend/.../backend/[...path]/route.ts` | ⚠️ 2 líneas comentario | Actualizar |
| `frontend/.../serwist/[path]/route.ts` | ⚠️ 1 línea comentario | Actualizar |
| `tooling/quality/check-env-config.ts` | ⚠️ 1 línea mensaje | Actualizar |
| `docs/deploy/VARIABLES_ENTORNO.md` | ❌ 5 referencias Docker | Reescribir sección |
| `docs/deploy/PRODUCTION_DEPLOYMENT.md` | ❌ ~20 referencias Docker | Reescribir completo |

---

## Fase 0: Línea Base

```bash
npm run typecheck && npm run lint && npm run test && npm run build && npm run verify
```

Guardar en: `.kilo/evidence/deploy-polish/00_baseline.txt`

---

## Fase 1: Workspaces y Endpoints — Verificación

### 1.1 Contratos compartidos

```bash
npm run contracts:check
npm run typecheck
```

**Archivos clave:**
- `packages/shared-types/src/schemas/auth.schema.ts` — LoginSchema ✅
- `packages/domain/src/rbac.ts` — 37 rutas RBAC. Verificar ruta `/evidences` con `EVIDENCE_ACCESS_ROLES` ✅
- `packages/config/src/env.ts` — validación de entorno ✅
- `frontend/proxy.ts` — perímetro de seguridad ✅
- `frontend/src/lib/http/api-client-constants.ts` — `API_ROOT = "/api/backend"` ✅

### 1.2 Auth flow

```
LoginForm → useAuth.login() → apiClient.post("/auth/login")
  → API_ROOT="/api/backend" → fetch("/api/backend/auth/login")
  → next.config rewrite → http://localhost:4000/api/auth/login
  → validateBody(LoginSchema) → AuthController.login → AuthService.login → User.findOne
```

**Verificar:**
```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gerencia@cermont.co","password":"Cermont2026!"}' | head -c 200

curl -s http://localhost:4000/api/health/ready
```

---

## Fase 2: Unificar Colores Dark/Light en Componentes UI

### 2.1 Diagnóstico

El proyecto mezcla 2 patrones de color:

**Patrón A — CSS variables (✅ correcto, preservar):**
```tsx
className="text-[var(--text-primary)] bg-[var(--surface-card)]"
```

**Patrón B — Tailwind hardcodeado (❌ migrar):**
```tsx
className="text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800"
```

### 2.2 Mapper de colores

| Tailwind hardcodeado | CSS variable (reemplazo) |
|---------------------|--------------------------|
| `bg-white` / `bg-zinc-50` | `bg-[var(--surface-card)]` |
| `bg-zinc-100` | `bg-[var(--surface-secondary)]` |
| `bg-black/50` | `bg-[var(--surface-overlay)]` |
| `text-zinc-900` / `text-gray-900` | `text-[var(--text-primary)]` |
| `text-zinc-700` / `text-gray-700` | `text-[var(--text-secondary)]` |
| `text-zinc-500` / `text-gray-500` | `text-[var(--text-tertiary)]` |
| `text-zinc-400` | `text-[var(--text-muted)]` |
| `border-zinc-200` / `border-gray-200` | `border-[var(--border-medium)]` |
| `border-zinc-300` | `border-[var(--border-medium)]` |
| `ring-brand` / `focus:ring-blue-500` | `focus:ring-[var(--color-focus-ring)]` |
| `border-red-400` / `text-red-500` | `border-[var(--color-danger)]` / `text-[var(--color-danger)]` |
| `bg-red-50` / `bg-green-50` | `bg-[var(--color-danger-bg)]` / `bg-[var(--color-success-bg)]` |

### 2.3 Scope de migración

**ALTA prioridad (5 archivos core):**
| Archivo | Clases a reemplazar |
|---------|---------------------|
| `frontend/src/core/ui/ThemeToggle.tsx` | `bg-zinc-100`, `text-zinc-600`, `dark:bg-zinc-800`, `dark:text-zinc-300` |
| `frontend/src/core/ui/Button.tsx` | `bg-brand`, `text-white`, `bg-zinc-100`, `text-zinc-700` |
| `frontend/src/core/ui/FormField.tsx` | `text-zinc-700`, `text-red-500`, `dark:text-zinc-300` |
| `frontend/src/core/ui/StatusBadge.tsx` | `bg-green-*`, `text-green-*`, `bg-yellow-*`, `bg-red-*` |
| `frontend/src/core/ui/PriorityBadge.tsx` | `bg-red-*`, `bg-yellow-*`, `bg-green-*`, `text-white` |

**MEDIA prioridad (~30 archivos de negocio):**
- `modules/evidences/ui/*.tsx` (5 archivos)
- `modules/dashboard/ui/*.tsx` (10 archivos)
- `modules/orders/ui/**/*.tsx` (15 archivos)
- `modules/kits/ui/*.tsx` (9 archivos)
- `modules/costs/ui/*.tsx` (4 archivos)

**BAJA prioridad:** Resto de módulos

### 2.4 Ejemplo — EvidencePhotoCard.tsx

```tsx
// ANTES:
<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Título</label>
  <input className="text-zinc-900 placeholder-zinc-400 dark:bg-zinc-700 dark:text-zinc-100" />
</div>

// DESPUÉS:
<div className="rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-4">
  <label className="text-xs font-medium text-[var(--text-secondary)]">Título</label>
  <input className="text-[var(--text-primary)] placeholder-[var(--text-muted)] bg-[var(--surface-primary)]" />
</div>
```

### 2.5 Ejemplo — ThemeToggle.tsx

```tsx
// ANTES:
<button className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
  <Sun className="size-4" />
</button>

// DESPUÉS:
<button className="bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-sidebar-hover)]">
  <Sun className="size-4" />
</button>
```

---

## Fase 3: Cámara y Escáner QR con `html5-qrcode`

### 3.1 Instalación

```bash
npm install html5-qrcode
# Sin @types/ — los tipos vienen incluidos en el paquete
```

### 3.2 Crear: CameraCapture.tsx

`frontend/src/modules/evidences/ui/CameraCapture.tsx` — componente para capturar fotos:

```typescript
"use client";

import { FlipCamera, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

type FacingMode = "environment" | "user";

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const startCamera = useCallback(async (mode: FacingMode) => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setError(null);
    } catch (err) {
      setError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Permiso de cámara denegado."
          : "No se pudo acceder a la cámara.",
      );
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, [facingMode, startCamera]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setPreview(URL.createObjectURL(blob));
    }, "image/jpeg", 0.85);
  };

  const handleAccept = async () => {
    if (!preview) return;
    const response = await fetch(preview);
    const blob = await response.blob();
    onCapture(new File([blob], `evidence-${Date.now()}.jpg`, { type: "image/jpeg" }));
    URL.revokeObjectURL(preview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4">
        <button onClick={onClose} className="text-white" aria-label="Cerrar"><X className="size-6" /></button>
        <button onClick={() => setFacingMode((p) => (p === "environment" ? "user" : "environment"))}
          className="text-white" aria-label="Cambiar cámara"><FlipCamera className="size-6" /></button>
      </div>
      <div className="flex flex-1 items-center justify-center">
        {error ? (
          <div className="text-center text-white p-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => startCamera(facingMode)} className="text-[var(--color-brand)] underline">Reintentar</button>
          </div>
        ) : preview ? (
          <img src={preview} alt="Preview" className="max-h-full object-contain" />
        ) : (
          <video ref={videoRef} autoPlay playsInline className="max-h-full" />
        )}
      </div>
      <div className="flex items-center justify-center p-8">
        {preview ? (
          <div className="flex gap-4">
            <button onClick={() => { URL.revokeObjectURL(preview!); setPreview(null); }}
              className="rounded-full bg-zinc-700 px-8 py-3 text-white">Re-tomar</button>
            <button onClick={handleAccept}
              className="rounded-full bg-[var(--color-brand)] px-8 py-3 text-white">Aceptar</button>
          </div>
        ) : (
          <button onClick={handleCapture} className="size-16 rounded-full border-4 border-white bg-transparent" aria-label="Capturar">
            <div className="mx-auto size-14 rounded-full bg-white" />
          </button>
        )}
      </div>
    </div>
  );
}
```

### 3.3 Crear: QRScanner.tsx

`frontend/src/modules/evidences/ui/QRScanner.tsx` — escáner QR profesional:

```typescript
"use client";

import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const start = async () => {
      try {
        const scanner = new Html5Qrcode("qr-reader-container");
        scannerRef.current = scanner;
        if (!active) return;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.7777 },
          (decodedText) => { if (active) { onScan(decodedText); onClose(); }},
          () => {},
        );
      } catch {
        if (active) setError("No se pudo iniciar la cámara para escanear.");
      }
    };
    start();
    return () => {
      active = false;
      scannerRef.current?.stop().catch(() => {});
      scannerRef.current?.clear().catch(() => {});
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-white text-lg font-semibold">Escanear código QR</h2>
        <button onClick={onClose} className="text-white" aria-label="Cerrar"><X className="size-6" /></button>
      </div>
      <div className="flex flex-1 items-center justify-center">
        {error ? (
          <div className="text-center text-white p-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={onClose} className="text-[var(--color-brand)] underline">Cerrar</button>
          </div>
        ) : (
          <div id="qr-reader-container" className="w-full max-w-md" />
        )}
      </div>
      <p className="text-center text-zinc-400 pb-8 text-sm">Apunta la cámara al código QR del equipo</p>
    </div>
  );
}
```

### 3.4 Integrar en EvidenceUploader.tsx

```typescript
import { Camera, QrCode } from "lucide-react"; // Agregar QrCode
import dynamic from "next/dynamic";

// Lazy load — html5-qrcode es browser-only
const QRScanner = dynamic(() => import("./QRScanner").then((m) => ({ default: m.QRScanner })), { ssr: false });

// Estados
const [showCamera, setShowCamera] = useState(false);
const [showQRScanner, setShowQRScanner] = useState(false);
```

**Botones en el JSX:**
```tsx
<div className="flex gap-3">
  <button onClick={() => setShowCamera(true)}
    className="flex items-center gap-2 rounded-lg border border-[var(--border-medium)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]">
    <Camera className="size-4" /> Tomar foto
  </button>
  <button onClick={() => setShowQRScanner(true)}
    className="flex items-center gap-2 rounded-lg border border-[var(--border-medium)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]">
    <QrCode className="size-4" /> Escanear QR
  </button>
</div>
{showCamera && <CameraCapture onCapture={(f) => { addFiles([f]); setShowCamera(false); }} onClose={() => setShowCamera(false)} />}
{showQRScanner && <QRScanner onScan={(d) => { toast.success(`Código: ${d}`); setShowQRScanner(false); }} onClose={() => setShowQRScanner(false)} />}
```

**Agregar `capture` al input file existente:**
```tsx
<input type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp"
  capture="environment" className="hidden" ... />
```

---

## Fase 4: Eliminar TODO Rastro de Docker

### 4.1 Comentarios en frontend (3 archivos)

**Archivo: `frontend/next.config.ts` (línea ~10)**
```
ANTES: // Docker Compose inyecta explícitamente BACKEND_URL=http://backend:4000
DESPUÉS: // En producción VPS, BACKEND_URL debe apuntar a 127.0.0.1:4000
```

**Archivo: `frontend/src/app/api/backend/[...path]/route.ts` (líneas ~36-37)**
```
ANTES: // Docker Compose inyecta explícitamente BACKEND_URL=http://backend:4000
DESPUÉS: // En producción VPS, BACKEND_URL debe apuntar a 127.0.0.1:4000
```

**Archivo: `frontend/src/app/serwist/[path]/route.ts` (línea ~6)**
```
ANTES: // In Docker builds there's no .git directory...
DESPUÉS: // In shallow clones (CI/VPS) there's no .git history...
```

### 4.2 Mensaje en tooling (1 archivo)

**Archivo: `tooling/quality/check-env-config.ts` (línea ~41)**
```
ANTES: "Must NOT reference 'http://backend:4000' (internal Docker hostname)..."
DESPUÉS: "Must NOT reference 'http://backend:4000' (production hostname)..."
```

### 4.3 Documentos de deploy (2 archivos)

**`docs/deploy/VARIABLES_ENTORNO.md`:** Eliminar 5 referencias:
- Línea 6: Reemplazar "Usar `.env.docker.example` como plantilla para Docker Compose" → "Usar `backend/.env.example`"
- Línea 19: Eliminar "Compose falla durante `docker compose config`"
- Línea 68: Reemplazar `docker compose exec` → `cd /opt/cermont && NODE_ENV=production npm run db:seed`
- Líneas 88-89: Eliminar referencias a `docker compose config`

**`docs/deploy/PRODUCTION_DEPLOYMENT.md`:** Reescribir completo para flujo PM2:
1. SSH Security + UFW (puertos 22, 80, 443)
2. nvm + Node.js 22
3. MongoDB 7.0
4. PM2 global
5. nginx reverse proxy
6. Certbot SSL
7. Clone + build + seed
8. `npm run deploy:pm2:start`
9. Actualización: `git pull → npm ci → npm run build → npm run deploy:pm2:reload`

### 4.4 Verificación final

```bash
rg -i "docker|docker-compose|dockerfile" \
  -g '*.ts' -g '*.tsx' -g '*.cjs' -g '*.mjs' -g '*.json' -g '*.yml' -g '*.md' \
  -g '!node_modules' -g '!.next' -g '!.turbo' -g '!dist'
# Debe dar 0 resultados
```

---

## Fase 5: Verificación Final

### 5.1 Quality Gates

```bash
npm run typecheck && npm run lint && npm run test && npm run build && npm run verify
npm run quality:strict
npm run doctor:verbose -w frontend
```

### 5.2 Login
```bash
npm run db:seed
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gerencia@cermont.co","password":"Cermont2026!"}'
```

### 5.3 Prueba visual de tema
- Alternar claro/oscuro sin FOUC
- Verificar tooltips, modales, inputs, badges, tablas, sidebar

### 5.4 Prueba de cámara y QR
- Click "Tomar foto" → cámara se abre → captura → foto aparece en lista
- Click "Escanear QR" → escáner se abre → escanea → muestra toast con resultado

---

## Orden de Ejecución

```
Paso  0: Quality gates baseline
Paso  1: Verificar workspaces/contratos (Fase 1)
Paso  2: Migrar colores core ui (ThemeToggle, Button, FormField, StatusBadge, PriorityBadge)
Paso  3: Migrar colores evidences (PhotoCard, Uploader, DropZone, GpsCapture)
Paso  4: npm install html5-qrcode
Paso  5: Crear CameraCapture.tsx + QRScanner.tsx
Paso  6: Integrar cámara + QR en EvidenceUploader.tsx
Paso  7: Migrar colores dashboard, orders, kits, costs
Paso  8: Actualizar 3 comentarios Docker en frontend + 1 en tooling
Paso  9: Actualizar docs/deploy (PRODUCTION_DEPLOYMENT.md + VARIABLES_ENTORNO.md)
Paso 10: Quality gates finales + verificación Docker residuals
```

---

## Resumen de Archivos

| Cambio | Archivos | Acción |
|--------|----------|--------|
| Migrar colores core | `core/ui/*.tsx` (5) | Modificar |
| Migrar colores negocio | `evidences(5) + dashboard(10) + orders(15) + kits(9) + costs(4)` | Modificar (~43) |
| Crear CameraCapture | `modules/evidences/ui/CameraCapture.tsx` | **Nuevo** |
| Crear QRScanner | `modules/evidences/ui/QRScanner.tsx` | **Nuevo** |
| Integrar en Uploader | `modules/evidences/ui/EvidenceUploader.tsx` | Modificar |
| Comentarios Docker | 4 archivos fuente | 4 líneas |
| Docs deploy | `PRODUCTION_DEPLOYMENT.md` + `VARIABLES_ENTORNO.md` | Reescribir |

---

## Checklist de Aceptación

- [ ] `npm run typecheck` — 0 errores
- [ ] `npm run lint` — 0 errores
- [ ] `npm run test` — todos pasan
- [ ] `npm run build` — 5/5 workspaces
- [ ] `npm run verify` + `quality:strict` + `doctor:verbose` — pasan
- [ ] Login con `gerencia@cermont.co` / `Cermont2026!` → 200 OK
- [ ] Tema claro/oscuro sin FOUC en todos los componentes
- [ ] Cámara captura fotos → se agregan como evidencias
- [ ] Escáner QR escanea → muestra toast con resultado
- [ ] `rg -i "docker"` en código fuente → 0 resultados
- [ ] Docs deploy sin referencias Docker

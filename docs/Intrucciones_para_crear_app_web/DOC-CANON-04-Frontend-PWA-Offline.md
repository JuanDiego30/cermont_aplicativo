# DOC-CANON-04 — Frontend, PWA, Offline-First, Diseno y Estado

**Proyecto:** Cermont S.A.S. — Plataforma documental-operativa
**Version:** v2.1 canónica ampliada para ejecución IA/Codex
**Estado:** SOURCE_OF_TRUTH + ANEXO v2.1 operativo
**Compresion:** DOC-05 + DOC-06 + DOC-19 + DOC-21 + DESIGN_CERMONT_COLORS_ONLY (partes de frontend + sistema de diseno)

---

## 1. Frontend — Next.js 16 + React 19

### 1.1 Configuracion

```typescript
// next.config.ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",  // Para Docker
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ]
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
}

export default nextConfig
```

### 1.2 Layout Raiz

```tsx
// app/layout.tsx
export const metadata = {
  title: "Cermont — Gestion de Ordenes de Trabajo",
  description: "Plataforma documental-operativa para Cermont S.A.S.",
  manifest: "/manifest.json",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
```

### 1.3 Pagina de Login

```tsx
// app/login/page.tsx
"use client"

import { useAuthStore } from "@/stores/authStore"
import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  const { login, isLoading } = useAuthStore()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--surface]">
      <div className="w-full max-w-md p-8 rounded-lg bg-[--canvas] border border-[--hairline]">
        <h1 className="text-heading-3 text-[--ink] mb-2">Cermont</h1>
        <p className="text-body-sm text-[--slate] mb-6">
          Ingresa tus credenciales para continuar
        </p>
        <LoginForm onSubmit={login} isLoading={isLoading} />
      </div>
    </div>
  )
}
```

### 1.4 Formulario de Login

```tsx
// components/auth/LoginForm.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginSchema } from "@cermont/shared-types"

interface Props {
  onSubmit: (email: string, password: string) => Promise<void>
  isLoading: boolean
}

export function LoginForm({ onSubmit, isLoading }: Props) {
  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  })

  return (
    <form onSubmit={form.handleSubmit((data) => onSubmit(data.email, data.password))}>
      <div className="space-y-4">
        <div>
          <label className="text-caption text-[--steel] mb-1 block">Correo electronico</label>
          <input
            {...form.register("email")}
            type="email"
            className="w-full h-10 px-3 rounded-md border border-[--hairline] bg-[--canvas] text-[--ink] focus:border-[--cermont-blue] focus:ring-1 focus:ring-[--cermont-blue] outline-none"
            placeholder="usuario@cermont.co"
          />
          {form.formState.errors.email && (
            <span className="text-[--error] text-caption mt-1">{form.formState.errors.email.message}</span>
          )}
        </div>

        <div>
          <label className="text-caption text-[--steel] mb-1 block">Contrasena</label>
          <input
            {...form.register("password")}
            type="password"
            className="w-full h-10 px-3 rounded-md border border-[--hairline] bg-[--canvas] text-[--ink] focus:border-[--cermont-blue] focus:ring-1 focus:ring-[--cermont-blue] outline-none"
          />
          {form.formState.errors.password && (
            <span className="text-[--error] text-caption mt-1">{form.formState.errors.password.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 rounded-full bg-[--cermont-blue] text-white font-medium text-button-md hover:bg-[--cermont-deep-blue] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Ingresando..." : "Ingresar"}
        </button>
      </div>
    </form>
  )
}
```

---

## 2. apiClient Unificado

### 2.1 Implementacion

```typescript
// lib/apiClient.ts
const API_BASE = "/api/backend"

class ApiClient {
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    const url = `${API_BASE}${path}`

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",  // Importante: envia cookies httpOnly
      ...options,
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      const error = new Error(data.error?.message || "Request failed")
      error.code = data.error?.code || "UNKNOWN_ERROR"
      error.statusCode = response.status
      error.details = data.error?.details || []
      error.traceId = data.error?.traceId
      throw error
    }

    return data.data
  }

  get<T>(path: string, options?: RequestInit) {
    return this.request<T>("GET", path, undefined, options)
  }

  post<T>(path: string, body?: unknown, options?: RequestInit) {
    return this.request<T>("POST", path, body, options)
  }

  put<T>(path: string, body?: unknown, options?: RequestInit) {
    return this.request<T>("PUT", path, body, options)
  }

  patch<T>(path: string, body?: unknown, options?: RequestInit) {
    return this.request<T>("PATCH", path, body, options)
  }

  delete<T>(path: string, options?: RequestInit) {
    return this.request<T>("DELETE", path, undefined, options)
  }
}

export const apiClient = new ApiClient()
```

### 2.2 Reglas

- **Unico punto de salida** para todas las llamadas HTTP
- **Cookies httpOnly** manejadas automaticamente por el navegador (`credentials: "include"`)
- **Errores tipados** con codigo, mensaje, detalles y traceId
- **Refresh 401 controlado:** Si el access token expiro, intenta refresh automatico
- **No duplicar** logica de fetch en componentes

---

## 3. TanStack Query v5

### 3.1 Configuracion del Cliente

```typescript
// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutos
      gcTime: 10 * 60 * 1000,         // 10 minutos (anteriormente cacheTime)
      retry: (failureCount, error) => {
        // No reintentar en 401 o 403
        if (error.statusCode === 401 || error.statusCode === 403) return false
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
```

### 3.2 Provider

```tsx
// components/providers/QueryProvider.tsx
"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { queryClient } from "@/lib/queryClient"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
```

### 3.3 Patron de Queries

```typescript
// hooks/useWorkRequests.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/apiClient"

const WORK_REQUESTS_KEY = "work-requests"

export function useWorkRequests(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [WORK_REQUESTS_KEY, params],
    queryFn: () => apiClient.get(`/work-requests?page=${params?.page || 1}&limit=${params?.limit || 20}&status=${params?.status || ""}`),
  })
}

export function useWorkRequest(id: string) {
  return useQuery({
    queryKey: [WORK_REQUESTS_KEY, id],
    queryFn: () => apiClient.get(`/work-requests/${id}`),
    enabled: !!id,
  })
}

export function useCreateWorkRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWorkRequestInput) =>
      apiClient.post("/work-requests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORK_REQUESTS_KEY] })
    },
  })
}

export function useQualifyWorkRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: QualifyWorkRequestInput }) =>
      apiClient.patch(`/work-requests/${id}/qualify`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [WORK_REQUESTS_KEY, variables.id] })
      queryClient.invalidateQueries({ queryKey: [WORK_REQUESTS_KEY] })
    },
  })
}
```

### 3.4 Patron de Pagina con Estados

```tsx
// app/work-requests/page.tsx
"use client"

import { useWorkRequests } from "@/hooks/useWorkRequests"
import { WorkRequestTable } from "@/components/work-requests/WorkRequestTable"
import { LoadingState } from "@/components/common/LoadingState"
import { ErrorState } from "@/components/common/ErrorState"
import { EmptyState } from "@/components/common/EmptyState"

export default function WorkRequestsPage() {
  const { data, isLoading, isError, error } = useWorkRequests()

  // Estado loading
  if (isLoading) return <LoadingState message="Cargando solicitudes..." />

  // Estado error
  if (isError) return <ErrorState error={error} retry={() => window.location.reload()} />

  // Estado empty
  if (!data?.items?.length) {
    return (
      <EmptyState
        title="No hay solicitudes"
        description="Aun no se han registrado solicitudes de trabajo."
        action={{ label: "Nueva solicitud", href: "/work-requests/new" }}
      />
    )
  }

  // Estado success
  return (
    <div>
      <PageHeader title="Solicitudes de Trabajo" />
      <WorkRequestTable items={data.items} />
    </div>
  )
}
```

---

## 4. Zustand Stores

### 4.1 Store de Autenticacion

```typescript
// stores/authStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apiClient } from "@/lib/apiClient"

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (email, password) => {
        await apiClient.post("/auth/login", { email, password })
        const { data: user } = await apiClient.get("/auth/me")
        set({ user, isAuthenticated: true })
      },

      logout: async () => {
        await apiClient.post("/auth/logout")
        set({ user: null, isAuthenticated: false })
      },

      checkAuth: async () => {
        try {
          const { data: user } = await apiClient.get("/auth/me")
          set({ user, isAuthenticated: true, isLoading: false })
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
```

### 4.2 Store de UI

```typescript
// stores/uiStore.ts
import { create } from "zustand"

interface UIState {
  // Sidebar
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Offline
  isOnline: boolean
  setIsOnline: (online: boolean) => void

  // Toast/Notifications
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void

  // Theme
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  setIsOnline: (online) => set({ isOnline: online }),

  toasts: [],
  addToast: (toast) => set((s) => ({
    toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }],
  })),
  removeToast: (id) => set((s) => ({
    toasts: s.toasts.filter((t) => t.id !== id),
  })),

  theme: "light",
  setTheme: (theme) => set({ theme }),
}))
```

---


## 5. Sistema de Diseno (Design System)

**Fuente:** DESIGN_CERMONT_COLORS_ONLY.md
**Inspiracion:** Mintlify design system adaptado a la paleta y necesidades de Cermont S.A.S.
**Paleta principal:** Azul Cermont (#2154A6) + Verde Cermont (#4CAF50)

---

### 5.1 Filosofia

El sistema de diseno de Cermont combina una presentacion profesional de tipo SaaS con la densidad informativa necesaria para una plataforma documental-operativa. La interfaz se siente moderna, accesible y confiable, con el azul Cermont (#2154A6) como color distintivo y el verde (#4CAF50) para estados de exito y confirmacion.

**Caracteristicas clave:**
- Paleta azul corporativo (#2154A6) como color principal — usado en CTAs primarios, navegacion activa y acentos
- Verde (#4CAF50) para estados de exito, confirmaciones e indicadores de sincronizacion
- Inter para toda la interfaz; Geist Mono para codigo y referencias tecnicas
- Layouts densos con tipografia de 14-16px para lectura prolongada
- Radios de borde controlados: 8px para UI compacta, 12px para tarjetas, rounded-full para botones
- Sin sombras pesadas — el sistema es predominantemente plano con profundidad atmosferica estrategica

---

### 5.2 Colores

#### 5.2.1 Marca y Acento

| Token CSS | Valor HEX | Uso |
|-----------|-----------|-----|
| --cermont-blue | #2154A6 | Color principal — botones primarios, enlaces, acentos, sidebar activo |
| --cermont-deep-blue | #0F2C59 | Variante presionada/hover del azul Cermont |
| --cermont-light-blue | #3A78D8 | Tags de documentacion, referencias de codigo, badges |
| --cermont-green | #4CAF50 | Exito, sincronizado, confirmacion, anotaciones |
| --cermont-light-green | #7CD966 | Fondos sutiles de exito, superficies de confirmacion |
| --cermont-warn | #F59E0B | Advertencia, deprecated, precaucion |
| --cermont-error | #EF4444 | Error, campos requeridos, validacion |
| --testimonial-orange | #F97316 | Tarjetas testimoniales, callouts importantes |

#### 5.2.2 Superficies

| Token CSS | Valor HEX | Uso |
|-----------|-----------|-----|
| --canvas | #FFFFFF | Fondo principal de pagina y tarjetas |
| --canvas-dark | #0F172A | Banner promocional, superficies de inversion, wrapper de editor |
| --surface | #F8FAFC | Fondos de seccion sutiles, search-pill reposo, codigo inline, sidebar activo |
| --surface-soft | #F1F5F9 | Fondos de seccion mas silenciosos, acordeones FAQ |
| --surface-code | #1E293B | Fondo de bloques de codigo |
| --hairline | #E2E8F0 | Bordes de 1px y divisores primarios |
| --hairline-soft | #F1F5F9 | Divisores secundarios, bordes de fila de tabla |

#### 5.2.3 Texto

| Token CSS | Valor HEX | Uso |
|-----------|-----------|-----|
| --ink | #0F172A | Titulares principales, texto de CTA |
| --charcoal | #1E293B | Texto body, codigo inline foreground |
| --slate | #475569 | Texto secundario y metadata |
| --steel | #64748B | Texto terciario, headers de tabla, sidebar inactivo, footer |
| --stone | #94A3B8 | Captions, cursor, etiquetas muteadas |
| --muted | #CBD5E1 | Etiquetas desenfatizadas, texto deshabilitado |
| --on-dark | #FFFFFF | Texto blanco sobre superficies oscuras |
| --on-dark-muted | 
gba(255,255,255,0.65) | Blanco con opacidad reducida para headers de codigo |

#### 5.2.4 Hero/Atmosferico

| Token CSS | Valor | Uso |
|-----------|-------|-----|
| --hero-sky-from | #E0F2FE | Gradient superior del hero atmosferico |
| --hero-sky-to | #FEF9C3 | Gradient inferior del hero atmosferico |
| --hero-dark-from | #0F2C59 | Gradient superior del hero oscuro |
| --hero-dark-to | #2154A6 | Gradient inferior del hero oscuro |

---

### 5.3 Tipografia

#### 5.3.1 Familias

**Inter** (primaria): Tipografia variable optimizada para legibilidad en UI. Usada en todas las superficies — body, headings, navegacion, botones, captions. Fallbacks: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif.

**Geist Mono** (codigo): Tipografia monoespaciada para bloques de codigo, referencias inline, firmas de tipo y nombres de propiedad. Fallbacks: 'SF Mono', Menlo, Consolas, 'Geist Mono Fallback', monospace.

No se usan variantes italicas de ninguna familia — el enfasis se logra mediante peso (500/600), cambio de color o fondo resaltado.

#### 5.3.2 Jerarquia Tipografica

| Token CSS | Tamano | Peso | Line Height | Letter Spacing | Uso |
|-----------|--------|------|-------------|----------------|-----|
| 	ext-hero-display | 72px | 600 | 1.05 | -2px | Hero de marketing (headline principal) |
| 	ext-display-lg | 56px | 600 | 1.10 | -1.5px | Apertura de seccion mayor |
| 	ext-heading-1 | 48px | 600 | 1.10 | -1px | Headlines de pagina |
| 	ext-heading-2 | 36px | 600 | 1.20 | -0.5px | Headlines de seccion |
| 	ext-heading-3 | 28px | 600 | 1.25 | 0 | Subtitulos de seccion, titulos de pagina interna |
| 	ext-heading-4 | 22px | 600 | 1.30 | 0 | Titulos de tarjeta, headers de feature |
| 	ext-heading-5 | 18px | 600 | 1.40 | 0 | Subtitulos menores, preguntas FAQ |
| 	ext-subtitle | 18px | 400 | 1.50 | 0 | Subtitulo de hero, lead body |
| 	ext-body-md | 16px | 400 | 1.50 | 0 | Texto body primario |
| 	ext-body-md-medium | 16px | 500 | 1.50 | 0 | Body con enfasis |
| 	ext-body-sm | 14px | 400 | 1.50 | 0 | Body secundario, celdas de tabla, navegacion |
| 	ext-body-sm-medium | 14px | 500 | 1.50 | 0 | Sidebar activo, botones, tabs |
| 	ext-caption | 13px | 400 | 1.40 | 0 | Texto auxiliar, letra pequena, headers de codigo |
| 	ext-caption-bold | 13px | 600 | 1.40 | 0 | Badge labels |
| 	ext-micro | 12px | 500 | 1.40 | 0 | Footer microcopy, chips |
| 	ext-micro-uppercase | 11px | 600 | 1.40 | 0.5px | Headers de seccion en sidebar, etiquetas REQUERIDO |
| 	ext-button-md | 14px | 500 | 1.30 | 0 | Labels de botones pill |
| 	ext-code-md | 14px | 400 | 1.50 | 0 | Contenido de bloques de codigo |
| 	ext-code-sm | 13px | 400 | 1.40 | 0 | Codigo pequeno, firmas de tipo |
| 	ext-code-inline | 13px | 500 | 1.30 | 0 | Referencias inline en body |

#### 5.3.3 Principios Tipograficos

- **Hero leading ajustado** (1.05) crea headlines de revista en 72px
- **Negative letter-spacing** progresivo inverso al tamano — los mas grandes usan -2px; headings pequenos relajan a 0
- **Cuerpo para documentacion** (1.50 line-height en 14-16px) asegura lectura comoda en superficies densas
- **Inter / Geist Mono** — Inter para todo, Geist Mono solo para codigo; el contraste entre ambos es la voz de la marca
- **Micro mayusculas** con +0.5px letter-spacing para headers de sidebar y etiquetas REQUERIDO

---


### 5.4 Layout y Espaciado

#### 5.4.1 Sistema de Espaciado

- **Unidad base:** 4px (incremento primario de 8px)
- **Tokens:** --space-xxs (4px) / --space-xs (8px) / --space-sm (12px) / --space-md (16px) / --space-lg (20px) / --space-xl (24px) / --space-xxl (32px) / --space-xxxl (40px) / --space-section-sm (48px) / --space-section (64px) / --space-section-lg (96px) / --space-hero (120px)
- **Ritmo de seccion:** Paginas de marketing usan 96px; tablas de precios reducen a 64px; documentacion usa 32px
- **Padding interno de tarjetas:** Estandar 24px; tarjetas de precios y paneles usan 32px

#### 5.4.2 Grid y Contenedor

- Paginas de marketing: max-width 1280px con gutters de 32px
- Hero y features: splits de 2 columnas (texto izquierda, ilustracion derecha)
- Paginas de documentacion: grid de 3 columnas (sidebar ~240px, prose central ~720px max-width, TOC derecho ~200px)
- Dashboard: layout fluido con widgets en grid responsive

#### 5.4.3 Filosofia de Espacio en Blanco

Las superficies de marketing dan a los contenidos espacio generoso — 120px arriba del fold. La documentacion se densifica: gaps de seccion bajan a 32px, filas de tabla se comprimen a 16px, navegacion del sidebar se reduce a 8px.

---

### 5.5 Elevacion y Sombras

El sistema es predominantemente plano con profundidad atmosferica estrategica.

| Nivel | Sombra | Uso |
|-------|--------|-----|
| 0 (plano) | Sin sombra; borde --hairline | Tarjetas default, filas de tabla, inputs |
| 1 (sutil) | rgba(0,0,0,0.04) 0px 1px 2px 0px | Hover en tiles, highlights sutiles |
| 2 (tarjeta) | rgba(0,0,0,0.08) 0px 4px 12px 0px | Tarjetas de feature estandar |
| 3 (mockup) | rgba(0,0,0,0.12) 0px 24px 48px -8px | Hero product mockup |
| 4 (brand) | rgba(33,84,166,0.08) 0px 8px 24px | Tarjeta destacada con glow azul |

---

### 5.6 Formas y Radios de Borde

| Token | Valor | Uso |
|-------|-------|-----|
| --radius-xs | 4px | Chips de codigo inline, micro tags |
| --radius-sm | 6px | Items de navegacion sidebar, badges de tipo |
| --radius-md | 8px | Inputs, search pill, bloques de codigo, tarjetas secundarias |
| --radius-lg | 12px | Tarjetas estandar, tiers de precios, hero mockup, FAQ |
| --radius-xl | 16px | Paneles de feature grandes |
| --radius-xxl | 24px | Tarjetas destacadas |
| --radius-full | 9999px | Todos los botones, pill tabs, badges |

La escala de radios es estrictamente controlada — no se usan valores intermedios entre 8px y 12px para la misma familia de componentes. Botones pill siempre; tarjetas consistentemente 12px.

---

### 5.7 Componentes del Sistema

#### 5.7.1 Botones

Todos los botones usan border-radius completo (pill). Transiciones de 150-200ms ease.

- **btn-primary**: Background --cermont-blue, text white, padding 10px 20px. Hover: --cermont-deep-blue. Disabled: opacity 50%.
- **btn-secondary**: Background transparente, text --ink, border 1px solid --hairline. Padding 10px 20px.
- **btn-ghost**: Background transparente, text --ink, padding 8px 12px, border-radius --radius-md (rectangular).
- **btn-on-dark**: Background white, text --ink, para fondos oscuros.
- **btn-icon**: 32x32px circular. Background --canvas, border 1px solid --hairline.

#### 5.7.2 Tarjetas y Contenedores

- **card-base**: Background --canvas, border-radius 12px, padding 24px, border 1px solid --hairline.
- **card-feature**: Background --surface, border-radius 12px, padding 32px.
- **card-highlighted**: Border 2px solid --cermont-blue, sombra brand-tinted rgba(33,84,166,0.08) 0px 8px 24px.
- **card-testimonial**: Background testimonial-orange o cermont-light-green, text white.

#### 5.7.3 Inputs y Formularios

- **input-text**: Background --canvas, height 40px, border-radius 8px, border 1px solid --hairline. Focus: border 2px solid --cermont-blue + ring.
- **input-search**: Background --surface, height 36px, border-radius 8px.
- **input-error**: Border --cermont-error, mensaje en caption color error.
- **checkbox/radio**: Border 1.5px solid --hairline. Checked: background --cermont-blue.

#### 5.7.4 Tabs

- **tab-segmented**: Inactivo text --steel, activo text --ink con borde inferior 2px.
- **tab-pill**: Inactivo background --canvas + border, activo background --cermont-blue text white, border-radius completo.

#### 5.7.5 Badges y Estado

- **badge-success**: Background --cermont-green, text white. Padding 2px 8px, border-radius completo.
- **badge-required**: Background --cermont-error, text white, micro-uppercase.
- **badge-type**: Background --surface, text --steel, code-sm font.
- **badge-tag**: Background rgba(58,120,216,0.15), text --cermont-light-blue.
- **badge-warning**: Background --cermont-warn, text white.

#### 5.7.6 Codigo

- **code-block**: Background --surface-code, text white, border-radius 8px, padding 16px. Tipografia text-code-md con Geist Mono.
- **code-inline**: Background --surface, text --charcoal, padding 2px 6px, border 1px solid --hairline.

#### 5.7.7 Navegacion

- **Barra superior**: Background --canvas, height ~64px, borde inferior 1px solid --hairline-soft.
- **Sidebar**: Width 240px (escritorio), background --canvas. Items: padding 8px 16px, border-radius 6px. Activo: background --surface, text --ink, text-body-sm-medium. Inactivo: text --steel.
- **Sidebar section header**: text-micro-uppercase, text --steel.

#### 5.7.8 Componentes de Documentacion

- **property-row**: Padding 16px 0, borde inferior 1px solid --hairline-soft. Layout: nombre + badge tipo + badge REQUERIDO + descripcion.
- **table-base**: Background --canvas, border 1px solid --hairline, border-radius 8px. Header: text-body-sm-medium, background --surface.

---

### 5.8 Do's and Don'ts

#### Do
- Reservar --cermont-blue para CTAs de acento y estados activos
- Usar --cermont-green solo para exito, confirmacion y sincronizado
- Aplicar border-radius completo a todos los botones y pills
- Inter para UI, Geist Mono para codigo — nunca mezclar
- 12px en tarjetas, 8px en UI compacta
- Body de documentacion en 16px con 1.50 line-height
- Transiciones de 150-200ms ease

#### Don't
- No usar --cermont-blue en texto body o superficies grandes
- No introducir colores de acento adicionales
- No aplicar sombras pesadas en tarjetas planas
- No reducir line-height de documentacion bajo 1.50
- No usar Inter para codigo ni Geist Mono para prosa

---

### 5.9 Comportamiento Responsive

#### Breakpoints

| Nombre | Width | Cambios clave |
|--------|-------|---------------|
| Mobile small | < 480px | Single column. Hero 36px. Sidebar drawer. Footer 1-col. |
| Mobile large | 480-767px | Feature tiles 2-up. Hero 44px. |
| Tablet | 768-1023px | 2-column grids. Sidebar drawer. Hero 56px. |
| Desktop | 1024-1279px | Full 3-column sidebar/body/TOC. Hero 72px. |
| Wide | >= 1280px | Gutters anchos, sidebar fijo 240px. |

#### Touch Targets
- Botones pill: 36-40px altura -> 44px mobile
- Botones icono: 32x32px -> 44x44px mobile
- Inputs: 40px -> 44px mobile
- Sidebar: ~32px -> 44px drawer mobile

#### Estrategia de Colapso
- Top nav < 1024px: hamburger menu
- Hero band < 1024px: stacked (mockup debajo de texto)
- Documentacion < 1024px: sidebar-drawer -> single-column < 768px
- Hero typography: 72px -> 56px tablet -> 44px mobile-large -> 36px mobile-small
- Footer: multi-columna -> 2-col tablet -> acordeon mobile

---

### 5.10 Animacion y Transiciones

- **Duracion base**: 150-200ms ease para hover/focus/active
- **Spinner**: animate-spin con borde --cermont-blue
- **Sidebar**: transicion de width 250ms ease-in-out
- **Modal/Dialog**: fade-in 200ms + scale 0.95 a 1.0
- **Reduced motion**: respetar prefers-reduced-motion: reduce

---

### 5.11 Implementation en Tailwind CSS v4

Los tokens de diseno se definen en app/globals.css usando la directiva @theme de Tailwind v4:

```css
@import "tailwindcss";

@theme {
  /* Colores de marca */
  --color-cermont-blue: #2154A6;
  --color-cermont-deep-blue: #0F2C59;
  --color-cermont-light-blue: #3A78D8;
  --color-cermont-green: #4CAF50;
  --color-cermont-light-green: #7CD966;
  --color-cermont-warn: #F59E0B;
  --color-cermont-error: #EF4444;
  /* Superficies */
  --color-canvas: #FFFFFF;
  --color-surface: #F8FAFC;
  --color-surface-soft: #F1F5F9;
  --color-hairline: #E2E8F0;
  --color-hairline-soft: #F1F5F9;
  /* Texto */
  --color-ink: #0F172A;
  --color-slate: #475569;
  --color-steel: #64748B;
  /* Tipografia */
  --font-family-sans: "Inter", system-ui, sans-serif;
  --font-family-mono: "Geist Mono", "SF Mono", monospace;
  /* Radios */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-xxl: 24px;
  /* Espaciado */
  --spacing-section-sm: 48px;
  --spacing-section: 64px;
  --spacing-section-lg: 96px;
}
```

Y las clases de tipografia se definen como utilidades:

```css
@utility text-hero-display {
  font-size: 72px; font-weight: 600;
  line-height: 1.05; letter-spacing: -2px;
}
@utility text-display-lg {
  font-size: 56px; font-weight: 600;
  line-height: 1.10; letter-spacing: -1.5px;
}
@utility text-heading-1 {
  font-size: 48px; font-weight: 600;
  line-height: 1.10; letter-spacing: -1px;
}
@utility text-heading-2 {
  font-size: 36px; font-weight: 600;
  line-height: 1.20; letter-spacing: -0.5px;
}
@utility text-heading-3 {
  font-size: 28px; font-weight: 600; line-height: 1.25; }
@utility text-heading-4 {
  font-size: 22px; font-weight: 600; line-height: 1.30; }
@utility text-heading-5 {
  font-size: 18px; font-weight: 600; line-height: 1.40; }
@utility text-body-md {
  font-size: 16px; line-height: 1.50; }
@utility text-body-sm {
  font-size: 14px; line-height: 1.50; }
@utility text-caption {
  font-size: 13px; line-height: 1.40; }
@utility text-button-md {
  font-size: 14px; font-weight: 500; line-height: 1.30; }
@utility text-code-md {
  font-family: var(--font-family-mono); font-size: 14px; }
```

---

### 5.12 Brechas Conocidas

- Los valores especificos de dark-mode para canvas, surface, ink y hairline no estan formalizados — implementar siguiendo el patron de contraste invertido
- La paleta completa de resaltado de sintaxis para bloques de codigo no esta enumerada — usar esquema por defecto de la libreria de resaltado
- El estado de validacion exitosa de formularios no esta capturado explicitamente — implementar con border verde + badge de exito



## 6. Componentes Comunes de Estado

### 6.1 LoadingState

```tsx
// components/common/LoadingState.tsx
interface Props {
  message?: string
  fullPage?: boolean
}

export function LoadingState({ message = "Cargando...", fullPage = false }) {
  const className = fullPage
    ? "min-h-screen flex items-center justify-center"
    : "flex items-center justify-center py-12"

  return (
    <div className={className} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[--cermont-blue] border-t-transparent rounded-full animate-spin" />
        <p className="text-body-sm text-[--slate]">{message}</p>
      </div>
    </div>
  )
}
```

### 6.2 ErrorState

```tsx
// components/common/ErrorState.tsx
interface Props {
  error: { message?: string; code?: string; traceId?: string }
  retry?: () => void
}

export function ErrorState({ error, retry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12" role="alert">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6 text-[--error]" />
      </div>
      <h3 className="text-heading-5 text-[--ink] mb-1">Ha ocurrido un error</h3>
      <p className="text-body-sm text-[--slate] mb-4 max-w-md text-center">
        {error.message || "No se pudo cargar la informacion. Intenta nuevamente."}
      </p>
      {error.traceId && (
        <p className="text-caption text-[--steel] mb-4">Trace ID: {error.traceId}</p>
      )}
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 rounded-full border border-[--hairline] text-[--ink] text-button-md hover:bg-[--surface] transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
```

### 6.3 EmptyState

```tsx
// components/common/EmptyState.tsx
interface Props {
  title: string
  description: string
  action?: { label: string; href: string }
  icon?: React.ReactNode
}

export function EmptyState({ title, description, action, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {icon || <Inbox className="w-12 h-12 text-[--steel] mb-3" />}
      <h3 className="text-heading-5 text-[--ink] mb-1">{title}</h3>
      <p className="text-body-sm text-[--slate] mb-4 text-center max-w-sm">{description}</p>
      {action && (
        <a
          href={action.href}
          className="px-4 py-2 rounded-full bg-[--cermont-blue] text-white text-button-md hover:bg-[--cermont-deep-blue] transition-colors"
        >
          {action.label}
        </a>
      )}
    </div>
  )
}
```

### 6.4 OfflineState

```tsx
// components/common/OfflineState.tsx
export function OfflineState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 bg-amber-50 rounded-lg border border-amber-200">
      <WifiOff className="w-10 h-10 text-amber-500 mb-3" />
      <h3 className="text-heading-5 text-amber-800 mb-1">Sin conexion</h3>
      <p className="text-body-sm text-amber-600 text-center max-w-sm">
        Los datos se guardaran localmente y se sincronizaran cuando recuperes la conexion.
      </p>
    </div>
  )
}
```

---


## 7. Arquitectura Offline-First (PWA)

### 7.1 Vision

El modo offline es **critico** para Cermont porque los tecnicos trabajan en campo con conectividad intermitente (campo petrolero Caño Limon). La arquitectura debe permitir:

- Capturar evidencias sin conexion
- Diligenciar formularios dinamicos
- Registrar materiales y horas
- Capturar firmas y GPS
- Todo se sincroniza automaticamente al recuperar conexion

### 7.2 Arquitectura

```text
[Frontend App]
  |
  +-- [Service Worker] -- Cache de assets, intercepta requests
  |
  +-- [IndexedDB] ----- Datos offline (evidencias, formularios, comandos)
  |
  +-- [Outbox] -------- Cola de comandos pendientes de sincronizacion
  |
  +-- [Sync Engine] --- Sincronizacion cuando hay conexion
  |
  +-- [apiClient] ------ Conexion al backend cuando online
```

### 7.3 Service Worker

```javascript
// public/sw.js
const CACHE_NAME = "cermont-v1"
const STATIC_ASSETS = [
  "/",
  "/login",
  "/dashboard",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
]

// Install: cachear assets estaticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Fetch: estrategia Network First para API, Cache First para assets
self.addEventListener("fetch", (event) => {
  const { request } = event

  // API calls: Network First con fallback offline
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear respuesta exitosa
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => {
          // Fallback: devolver cache si existe
          return caches.match(request).then((cached) => {
            if (cached) return cached
            // Si no hay cache, responder con indicador offline
            return new Response(
              JSON.stringify({
                success: false,
                error: { code: "OFFLINE", message: "Working offline. Data saved locally." },
              }),
              { status: 503, headers: { "Content-Type": "application/json" } }
            )
          })
        })
    )
    return
  }

  // Assets estaticos: Cache First
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  )
})

// Background Sync: sincronizar comandos pendientes
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-outbox") {
    event.waitUntil(syncOutbox())
  }
})

async function syncOutbox() {
  const outbox = await getOutboxFromIndexedDB()
  for (const command of outbox) {
    try {
      await fetch(command.url, {
        method: command.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command.body),
        credentials: "include",
      })
      await markAsSynced(command.id)
    } catch (error) {
      console.error("Sync failed for command:", command.id, error)
      // Mantener en outbox para reintento
    }
  }
}

// Push notifications (futuro)
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {}
  event.waitUntil(
    self.registration.showNotification(data.title || "Cermont", {
      body: data.body || "Tienes una nueva notificacion",
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
    })
  )
})
```

### 7.4 IndexedDB — Almacenamiento Offline

```typescript
// lib/offlineStorage.ts
import { openDB, type DBSchema, type IDBPDatabase } from "idb"

interface CermontDB extends DBSchema {
  evidences: {
    key: string
    value: {
      id: string
      workOrderId: string
      type: string
      file: Blob
      caption: string
      gps?: { latitude: number; longitude: number }
      capturedAt: Date
      capturedBy: string
      syncState: "pending" | "synced" | "failed"
      clientMutationId: string
    }
    indexes: { "by-work-order": string; "by-sync-state": string }
  }
  outbox: {
    key: string
    value: {
      id: string
      type: string          // "create_evidence", "update_execution", etc.
      url: string           // Endpoint
      method: string        // HTTP method
      body: unknown         // Payload
      entityId: string      // ID de entidad afectada
      clientMutationId: string
      createdAt: Date
      retryCount: number
    }
    indexes: { "by-entity": string }
  }
  formResponses: {
    key: string
    value: {
      id: string
      templateId: string
      templateVersion: string
      workOrderId: string
      data: Record<string, unknown>
      startedAt: Date
      submittedAt?: Date
      syncState: "pending" | "synced" | "failed"
    }
  }
}

let db: IDBPDatabase<CermontDB>

export async function getDB(): Promise<IDBPDatabase<CermontDB>> {
  if (!db) {
    db = await openDB<CermontDB>("cermont-offline", 1, {
      upgrade(db) {
        // Evidencias
        const evidenceStore = db.createObjectStore("evidences", { keyPath: "id" })
        evidenceStore.createIndex("by-work-order", "workOrderId")
        evidenceStore.createIndex("by-sync-state", "syncState")

        // Outbox
        const outboxStore = db.createObjectStore("outbox", { keyPath: "id" })
        outboxStore.createIndex("by-entity", "entityId")

        // Formularios
        db.createObjectStore("formResponses", { keyPath: "id" })
      },
    })
  }
  return db
}
```

### 7.5 Engine de Sincronizacion

```typescript
// lib/syncEngine.ts
import { getDB } from "./offlineStorage"
import { apiClient } from "./apiClient"

export class SyncEngine {
  private isSyncing = false

  async sync() {
    if (this.isSyncing) return
    this.isSyncing = true

    try {
      const db = await getDB()
      const pendingCommands = await db.getAllFromIndex("outbox", "by-sync-state", "pending")

      for (const command of pendingCommands) {
        try {
          await apiClient.request(command.method, command.url, command.body)
          await db.delete("outbox", command.id)

          // Marcar evidencia como sincronizada
          await this.markEntitySynced(command.entityId, command.type)
        } catch (error) {
          await db.put("outbox", {
            ...command,
            retryCount: command.retryCount + 1,
          })
        }
      }
    } finally {
      this.isSyncing = false
    }
  }

  private async markEntitySynced(entityId: string, type: string) {
    const db = await getDB()

    if (type === "create_evidence") {
      const evidence = await db.get("evidences", entityId)
      if (evidence) {
        await db.put("evidences", { ...evidence, syncState: "synced" })
      }
    }
  }

  async queueCommand(command: Omit<OutboxCommand, "id" | "createdAt">) {
    const db = await getDB()
    await db.add("outbox", {
      ...command,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      retryCount: 0,
    })

    // Solicitar sync en background
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register("sync-outbox")
    }
  }

  async getPendingCount(): Promise<number> {
    const db = await getDB()
    const all = await db.getAll("outbox")
    return all.length
  }

  get isOnline(): boolean {
    return navigator.onLine
  }
}

export const syncEngine = new SyncEngine()
```

### 7.6 Hook de Offline

```typescript
// hooks/useOffline.ts
import { useEffect } from "react"
import { useUIStore } from "@/stores/uiStore"
import { syncEngine } from "@/lib/syncEngine"

export function useOffline() {
  const { setIsOnline } = useUIStore()

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncEngine.sync()  // Auto-sync al recuperar conexion
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Sync inicial si estamos online
    if (navigator.onLine) {
      syncEngine.sync()
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [setIsOnline])
}
```

### 7.7 Hook de Evidencia Offline

```typescript
// hooks/useOfflineEvidence.ts
import { useState, useCallback } from "react"
import { getDB } from "@/lib/offlineStorage"
import { syncEngine } from "@/lib/syncEngine"

export function useOfflineEvidence() {
  const [isSaving, setIsSaving] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  const saveEvidence = useCallback(async (data: {
    workOrderId: string
    file: File
    type: string
    caption: string
    gps?: { latitude: number; longitude: number }
    capturedBy: string
  }) => {
    setIsSaving(true)
    try {
      const db = await getDB()
      const clientMutationId = crypto.randomUUID()

      // Guardar en IndexedDB
      const evidenceId = crypto.randomUUID()
      await db.add("evidences", {
        id: evidenceId,
        workOrderId: data.workOrderId,
        type: data.type,
        file: data.file,
        caption: data.caption,
        gps: data.gps,
        capturedAt: new Date(),
        capturedBy: data.capturedBy,
        syncState: "pending",
        clientMutationId,
      })

      // Si estamos online, intentar subir inmediatamente
      if (syncEngine.isOnline) {
        try {
          const formData = new FormData()
          formData.append("file", data.file)
          formData.append("type", data.type)
          formData.append("caption", data.caption)
          formData.append("workOrderId", data.workOrderId)
          formData.append("clientMutationId", clientMutationId)
          if (data.gps) {
            formData.append("gps", JSON.stringify(data.gps))
          }

          await fetch("/api/backend/evidences", {
            method: "POST",
            body: formData,
            credentials: "include",
          })

          await db.put("evidences", { ...evidence, syncState: "synced" })
        } catch {
          // Si falla, queda en cola
          await queueForLater(evidenceId, data, clientMutationId)
        }
      } else {
        // Offline: encolar para sync posterior
        await queueForLater(evidenceId, data, clientMutationId)
      }

      const count = await syncEngine.getPendingCount()
      setPendingCount(count)

      return evidenceId
    } finally {
      setIsSaving(false)
    }
  }, [])

  const queueForLater = async (evidenceId: string, data: any, clientMutationId: string) => {
    await syncEngine.queueCommand({
      type: "create_evidence",
      url: "/api/evidences",
      method: "POST",
      body: {
        workOrderId: data.workOrderId,
        type: data.type,
        caption: data.caption,
        gps: data.gps,
        clientMutationId,
      },
      entityId: evidenceId,
      clientMutationId,
    })
  }

  return { saveEvidence, isSaving, pendingCount }
}
```

### 7.8 Indicador de Estado de Sync (UI)

```tsx
// components/common/SyncStatus.tsx
"use client"

import { useEffect, useState } from "react"
import { useUIStore } from "@/stores/uiStore"
import { syncEngine } from "@/lib/syncEngine"

export function SyncStatus() {
  const { isOnline } = useUIStore()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(async () => {
      const count = await syncEngine.getPendingCount()
      setPendingCount(count)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
        <WifiOff className="w-4 h-4 text-amber-500" />
        <span className="text-caption text-amber-700">Sin conexion</span>
        {pendingCount > 0 && (
          <span className="text-caption-bold text-amber-700">({pendingCount} pendientes)</span>
        )}
      </div>
    )
  }

  if (pendingCount > 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
        <RefreshCw className="w-4 h-4 text-[--cermont-blue] animate-spin" />
        <span className="text-caption text-[--cermont-blue]">
          Sincronizando ({pendingCount})
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
      <Wifi className="w-4 h-4 text-[--cermont-green]" />
      <span className="text-caption text-green-700">Sincronizado</span>
    </div>
  )
}
```

### 7.9 PWA — Manifest

```json
{
  "name": "Cermont — Gestion de Ordenes",
  "short_name": "Cermont",
  "description": "Plataforma documental-operativa para Cermont S.A.S.",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2154A6",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 7.10 Reglas de Resolucion de Conflictos Offline

| Tipo de Dato | Politica |
|---|---|
| Evidencias | Append-only (agregar, no reemplazar) |
| Fotos | Append-only |
| Materiales | Merge por linea (sumar cantidades) |
| Costos | Merge controlado con auditoria |
| Firmas | Inmutables (no se sobrescriben) |
| Estados de flujo | Comandos transaccionales (validar precondiciones) |
| Plantillas publicadas | Inmutables |

### 7.11 Estados de Sync Obligatorios

Todo comando offline debe tener estado visible:

```text
queued    → Comando guardado localmente, esperando conexion
syncing   → En proceso de sincronizacion
synced    → Sincronizado exitosamente
failed    → Fallo despues de reintentos
conflict  → Conflicto con datos del servidor
```

---


## 8. Layout de la Aplicacion

### 8.1 AppShell

```tsx
// components/layout/AppShell.tsx
"use client"

import { useAuthStore } from "@/stores/authStore"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { useOffline } from "@/hooks/useOffline"
import { SyncStatus } from "@/components/common/SyncStatus"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()
  useOffline()

  if (isLoading) return <LoadingState fullPage />

  return (
    <div className="flex h-screen bg-[--surface]">
      {/* Sidebar */}
      <Sidebar userRole={user?.role} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user} />

        {/* Sync Status Bar */}
        <div className="px-6 py-2 border-b border-[--hairline] bg-[--canvas] flex justify-between items-center">
          <Breadcrumbs />
          <SyncStatus />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### 8.2 Sidebar

```tsx
// components/layout/Sidebar.tsx
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["gerente", "administrativo", "supervisor", "tecnico", "hes", "auditor"] },
  { name: "Solicitudes", href: "/work-requests", icon: FileText, roles: ["gerente", "administrativo", "supervisor", "tecnico"] },
  { name: "Propuestas", href: "/proposals", icon: FileCheck, roles: ["gerente", "administrativo", "supervisor"] },
  { name: "Ordenes", href: "/orders", icon: ClipboardList, roles: ["gerente", "administrativo", "supervisor", "tecnico", "hes"] },
  { name: "Costos", href: "/costs", icon: DollarSign, roles: ["gerente", "administrativo", "supervisor"] },
  { name: "Facturacion", href: "/billing", icon: CreditCard, roles: ["gerente", "administrativo"] },
  { name: "Pagos", href: "/payments", icon: Banknote, roles: ["gerente", "administrativo"] },
  { name: "Documentos", href: "/documents", icon: FolderOpen, roles: ["gerente", "administrativo", "supervisor", "tecnico"] },
  { name: "Activos", href: "/assets", icon: Wrench, roles: ["gerente", "supervisor", "hes"] },
  { name: "Mantenimiento", href: "/maintenance", icon: Settings, roles: ["gerente", "supervisor", "hes"] },
  { name: "Usuarios", href: "/users", icon: Users, roles: ["gerente"] },
]

export function Sidebar({ userRole }: { userRole?: string }) {
  const filteredNav = navigation.filter((item) =>
    item.roles.includes(userRole || "")
  )

  return (
    <aside className="w-64 bg-[--canvas] border-r border-[--hairline] flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[--hairline]">
        <span className="text-heading-4 font-semibold text-[--cermont-blue]">Cermont</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {filteredNav.map((item) => (
          <SidebarLink key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  )
}

function SidebarLink({ name, href, icon: Icon }: NavItem) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <a
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-md text-body-sm-medium transition-colors
        ${isActive
          ? "bg-[--surface] text-[--ink]"
          : "text-[--steel] hover:text-[--ink] hover:bg-[--surface-soft]"
        }
      `}
    >
      <Icon className="w-5 h-5" />
      {name}
    </a>
  )
}
```

---


## 9. Componentes Especificos por Modulo

### 9.1 FileUploadDropzone

```tsx
// components/files/FileUploadDropzone.tsx
"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"

interface Props {
  onUpload: (files: File[]) => void
  accept?: Record<string, string[]>
  maxSize?: number  // en bytes
  maxFiles?: number
}

export function FileUploadDropzone({ onUpload, accept, maxSize = 25 * 1024 * 1024, maxFiles = 10 }: Props) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles)
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive
          ? "border-[--cermont-blue] bg-blue-50"
          : "border-[--hairline] hover:border-[--cermont-blue] hover:bg-[--surface]"
        }
      `}
    >
      <input {...getInputProps()} />
      <Upload className="w-10 h-10 text-[--steel] mx-auto mb-3" />
      <p className="text-body-sm text-[--ink]">
        {isDragActive ? "Suelta los archivos aqui" : "Arrastra archivos o haz clic para seleccionar"}
      </p>
      <p className="text-caption text-[--steel] mt-1">
        Maximo {maxFiles} archivos, {(maxSize / 1024 / 1024).toFixed(0)} MB cada uno
      </p>
      {fileRejections.length > 0 && (
        <div className="mt-3 text-caption text-[--error]">
          {fileRejections.length} archivo(s) rechazado(s)
        </div>
      )}
    </div>
  )
}
```

### 9.2 EvidenceGallery

```tsx
// components/evidence/EvidenceGallery.tsx
"use client"

import { useState } from "react"
import Image from "next/image"

interface Props {
  evidences: Evidence[]
  onDelete?: (id: string) => void
  onSelectForReport?: (id: string, selected: boolean) => void
}

export function EvidenceGallery({ evidences, onDelete, onSelectForReport }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (!evidences.length) {
    return <EmptyState title="Sin evidencias" description="Aun no se han cargado evidencias." />
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {evidences.map((evidence) => (
        <div
          key={evidence.id}
          className="group relative rounded-lg overflow-hidden border border-[--hairline] bg-[--canvas] cursor-pointer"
          onClick={() => setSelectedId(evidence.id)}
        >
          <div className="aspect-square relative">
            <Image
              src={evidence.thumbnailUrl || evidence.url}
              alt={evidence.caption || "Evidencia"}
              fill
              className="object-cover"
            />
            {evidence.offlineSyncState === "pending" && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-micro">
                Pendiente
              </div>
            )}
          </div>
          <div className="p-2">
            <p className="text-caption text-[--ink] truncate">{evidence.caption}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-micro text-[--steel]">{evidence.evidenceType}</span>
              <span className="text-micro text-[--steel]">
                {formatDate(evidence.capturedAt)}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Lightbox */}
      {selectedId && (
        <EvidenceLightbox
          evidence={evidences.find((e) => e.id === selectedId)!}
          onClose={() => setSelectedId(null)}
          onDelete={onDelete}
        />
      )}
    </div>
  )
}
```

### 9.3 SignatureField

```tsx
// components/common/SignatureField.tsx
"use client"

import { useRef, useState, useCallback } from "react"\ninterface Props {
  onSave: (signatureData: string) => void  // base64 PNG
  onClear?: () => void
  width?: number
  height?: number
}

export function SignatureField({ onSave, onClear, width = 400, height = 200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawing, setHasDrawing] = useState(false)

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = "#0F172A"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    setIsDrawing(true)
    setHasDrawing(true)
  }, [])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }, [isDrawing])

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !hasDrawing) return
    const dataUrl = canvas.toDataURL("image/png")
    onSave(dataUrl)
  }, [hasDrawing, onSave])

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawing(false)
    onClear?.()
  }, [onClear])

  return (
    <div className="space-y-3">
      <div className="border border-[--hairline] rounded-md overflow-hidden inline-block">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="bg-white cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!hasDrawing}
          className="px-4 py-2 rounded-full bg-[--cermont-blue] text-white text-button-md disabled:opacity-50"
        >
          Guardar firma
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 rounded-full border border-[--hairline] text-[--ink] text-button-md"
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}
```

---


## 10. Checklist de Calidad Frontend

Antes de entregar cualquier cambio de frontend:

- [ ] No se uso `fetch` directo en componentes — se uso `apiClient`
- [ ] No se uso `useEffect` para data fetching — se uso TanStack Query
- [ ] No hay `new Date()` o `Math.random()` en render que afecten hydration
- [ ] Todos los componentes tienen estados: loading, error, empty
- [ ] Estado offline donde aplica
- [ ] No hay componentes gigantes (>200 lineas logicas)
- [ ] No se duplicaron componentes de Shadcn/ui
- [ ] Las rutas del sidebar tienen paginas funcionales
- [ ] No hay rutas 404 desde el sidebar
- [ ] RBAC aplicado correctamente
- [ ] Los endpoints llamados existen en el backend
- [ ] No hay mocks de datos en produccion
- [ ] React Doctor pasa (100/100 o >= 95 documentado)
- [ ] `npm run typecheck -w frontend` pasa
- [ ] `npm run lint -w frontend` pasa
- [ ] `npm run test -w frontend` pasa
- [ ] `npm run build -w frontend` pasa
- [ ] Accesibilidad basica: labels, roles ARIA, navegacion por teclado
- [ ] Reduced motion implementado
- [ ] Responsive (320px+)
---

# ANEXO v2.1 — Cierre de puntos ciegos para agentes IA/Codex

> **Prevalencia normativa:** si alguna sección anterior de este documento contradice este anexo, prevalece el **ANEXO v2.1**.  
> **Propósito:** convertir la documentación canónica en un plano arquitectónico ejecutable, verificable y sin ambigüedades para agentes IA/Codex.  
> **Regla base:** ningún agente puede declarar una función como implementada si no aporta **archivo + endpoint/contrato/componente + prueba + evidencia**.


## 1. Mapa de rutas frontend obligatorio

| Ruta | Paso CERMONT | Módulo | Debe mostrar | Acción principal |
|---|---:|---|---|---|
| `/service-cases` | transversal | service-cases | lista con paso actual y bloqueos | abrir cockpit |
| `/service-cases/[id]` | 1-14 | cockpit | timeline completo | resolver siguiente acción |
| `/work-requests` | 1 | solicitudes | solicitudes y estado | crear/calificar |
| `/site-visits` | 2 | visitas | visitas asociadas | registrar diagnóstico |
| `/proposals` | 3 | propuestas | costos estimados | aprobar/rechazar |
| `/purchase-orders` | 4 | PO | PO validadas | validar PO |
| `/planning` | 5 | planeación | readiness, AST, PTW, kits | aprobar planeación |
| `/execution` | 6 | ejecución | sesión, checklist, materiales | iniciar/cerrar |
| `/evidences` | 7 | evidencias | galería categorizada | subir/renombrar/categorizar |
| `/reports` | 8 | informes | informes generados | generar desde ejecución |
| `/delivery-records` | 9-10 | actas | actas y firmas | firmar/validar |
| `/billing/ses` | 11 | SES | radicación/aprobación | crear/aprobar SES |
| `/billing/invoices` | 12-13 | facturas | facturas y aprobación | crear/aprobar |
| `/payments` | 14 | pagos | pagos/conciliación | registrar pago |
| `/costs` | transversal | costos | estimado vs real | analizar variación |

Cada página debe tener: `loading`, `error`, `empty`, `forbidden`, `offline` y enlace a cockpit.

## 2. Reglas anti-loop y anti-refetch

Prohibido:
- `router.refresh()` sin causa;
- `refetch()` en `useEffect` sin dependencia estable;
- query keys construidas con objetos recreados cada render;
- `setInterval` sin cleanup;
- `window.location`.

Correcto:
- query keys centralizadas;
- invalidación por dominio;
- optimistic update donde aplique;
- estados `isPending/isError/isSuccess`;
- navegación con router de Next, no recarga completa.

## 3. Query keys SSOT

Crear o mantener:

```text
frontend/src/_shared/lib/query/query-keys.ts
```

Estructura sugerida:

```ts
export const queryKeys = {
  serviceCases: {
    all: ["service-cases"],
    detail: (id: string) => ["service-cases", id],
    workflow: (id: string) => ["service-cases", id, "workflow"],
  },
  documents: {
    all: ["documents"],
    byContext: (contextKey: string) => ["documents", "context", contextKey],
  },
  evidences: {
    byCase: (caseId: string) => ["evidences", "case", caseId],
  },
} as const;
```

## 4. Offline real

Offline no es una página de error. Debe permitir:

- consultar casos asignados;
- consultar planeación y checklists;
- llenar formularios;
- capturar evidencias;
- renombrar fotos;
- asignar categorías;
- capturar firma;
- registrar materiales y horas;
- guardar incidentes;
- sincronizar al volver internet.

### Matriz offline

| Acción | Offline | Datos precargados | Comando outbox | Conflicto |
|---|---|---|---|---|
| Ver caso asignado | Sí | workflow + documentos recientes | — | versión antigua |
| Completar checklist | Sí | plantilla + respuestas | `UPDATE_CHECKLIST_RESPONSE` | versión de plantilla |
| Subir evidencia | Sí | caso + requisito + categoría | `CREATE_EVIDENCE` | duplicado/hash |
| Renombrar evidencia | Sí | evidencia local | `UPDATE_EVIDENCE_METADATA` | evidencia ya aprobada |
| Capturar firma | Sí | acta/formulario | `CAPTURE_SIGNATURE` | acta versionada |
| Crear SES | No | solo lectura | — | requiere servidor |
| Registrar pago | No | solo lectura | — | requiere servidor |

## 5. Design tokens mínimos

Colores CERMONT deben usarse como acentos, no como fondos saturados:

| Token | Uso |
|---|---|
| `--surface-page` | fondo general gris/claro u oscuro sobrio |
| `--surface-card` | tarjetas |
| `--border-subtle` | bordes |
| `--brand-blue` | acciones primarias y bordes activos |
| `--brand-green` | éxito/conectado |
| `--text-primary` | texto principal |
| `--text-muted` | texto secundario |
| `--danger` | errores |

Regla: no mezclar componentes claros sobre fondo oscuro sin contraste.

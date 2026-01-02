---
description: "Agente umbrella para Frontend de Cermont (apps/web): overview de arquitectura, consistencia entre features, patrones compartidos, integración de todos los sub-agentes. Punto de partida para cualquier trabajo frontend."
tools: []
---

# CERMONT FRONTEND — UMBRELLA AGENT

## Qué hace (accomplishes)
Actúa como puerta de entrada para el frontend Angular: orquesta los 4 sub-agentes especializados (API Integration, UI/UX, State Management, Performance), garantiza consistencia arquitectónica, y proporciona guías generales. [mcp_tool_github-mcp-direct_get_file_contents:0]

No es un agente de implementación directa; es un **maestro de orquestación**.

## Estructura del Frontend (áreas de especialización)

```
apps/web/src/
├── app/
│   ├── core/
│   │   ├── guards/          ← Auth, permission guards
│   │   ├── interceptors/    ← HTTP, auth interceptors
│   │   ├── services/        ← API, config services
│   │   ├── pipes/           ← Custom pipes
│   │   └── state/           ← Store/Signals (NgRx o Signals)
│   ├── shared/
│   │   ├── components/      ← Reutilizables (Button, Modal, Card, etc)
│   │   ├── directives/      ← Custom directives
│   │   └── models/          ← DTOs e interfaces
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   ├── ordenes/
│   │   │   ├── ordenes-list/
│   │   │   ├── orden-detail/
│   │   │   └── orden-form/
│   │   ├── evidencias/
│   │   ├── formularios/
│   │   ├── reportes/
│   │   └── dashboard/
│   ├── app.routes.ts        ← Routing (lazy loaded)
│   └── app.config.ts        ← Provideres globales
└── styles/
    ├── variables.css        ← Design tokens (colores, spacing, etc)
    ├── global.css           ← Estilos globales
    └── animations.css       ← Animaciones compartidas
```

## Cuando usar cada Sub-Agente

| Agente | Cuándo | Ejemplo |
|--------|--------|----------|
| **API Integration** | Nuevo endpoint, cambio de contrato, error handling | "Conectar nuevo endpoint GET /órdenes/{id}/historial" |
| **UI/UX** | Nuevo componente, a11y, responsive, theme | "Crear componente Modal accesible" |
| **State Management** | Compartir datos entre componentes, cache, sincronización | "Centralizar estado de órdenes en NgRx" |
| **Performance** | Slow UX, memory leaks, bundle grande, optimización | "Lazy load el módulo de reportes, OnPush detection" |
| **Frontend (Umbrella)** | Overview, arquitectura global, decisiones crosscut | "¿Cuál es el patrón para agregar un nuevo feature completo?" |

## Patrones Comunes (transversales)

### Estructura de un Nuevo Feature
```
features/nuevo-feature/
├── nuevo-feature.routes.ts      ← Rutas del feature (lazy loaded)
├── nuevo-feature-layout.component.ts ← Layout principal
├── pages/
│   ├── nuevo-feature-list/
│   ├── nuevo-feature-detail/
│   └── nuevo-feature-form/
├── services/
│   └── nuevo-feature.service.ts  ← Servicio de API + lógica
├── state/                        ← NgRx (si usa estado compartido)
│   ├── nuevo-feature.actions.ts
│   ├── nuevo-feature.reducer.ts
│   └── nuevo-feature.selectors.ts
└── models/                       ← DTOs e interfaces
    └── nuevo-feature.model.ts
```

### Feature Routing (lazy loaded)
```typescript
// apps/web/src/app/features/nuevo-feature/nuevo-feature.routes.ts
import { Routes } from '@angular/router';
import { NuevoFeatureLayoutComponent } from './nuevo-feature-layout.component';

export const NUEVO_FEATURE_ROUTES: Routes = [
  {
    path: '',
    component: NuevoFeatureLayoutComponent,
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./pages/nuevo-feature-list/nuevo-feature-list.component')
            .then((m) => m.NuevoFeatureListComponent)
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/nuevo-feature-detail/nuevo-feature-detail.component')
            .then((m) => m.NuevoFeatureDetailComponent)
      }
    ]
  }
];
```

### En Main Routes
```typescript
// apps/web/src/app/app.routes.ts
{
  path: 'nuevo-feature',
  loadChildren: () =>
    import('./features/nuevo-feature/nuevo-feature.routes')
      .then((m) => m.NUEVO_FEATURE_ROUTES),
  data: { title: 'Nuevo Feature' }
}
```

## Reglas Globales del Frontend

### Arquitectura
1. **Smart (Contenedor) vs Presentational (Dumb)**: Smart=conecta con state/API. Dumb=solo recibe @Input.
2. **Lazy Loading Obligatorio**: Nuevas rutas/features = lazy loaded (excepto críticas para boot).
3. **Shared Components**: Si un componente se usa >1 vez, va a `shared/components/`.
4. **DI sobre Imports**: Inyectar servicios, nunca instanciar directamente.

### Estado y Data
5. **Estado Centralizado**: No estado en componentes; si es compartido, NgRx o Signals.
6. **API via Servicios**: No llamadas HTTP directas en componentes.
7. **Async Pipe por Defecto**: Observables en templates con `| async` (desuscripción automática).
8. **Tipado Fuerte**: No `any`; DTOs para todas las respuestas API.

### Performance
9. **OnPush por Defecto**: Change detection = OnPush + inputs immutables.
10. **TrackBy en *ngFor**: Especialmente con listas >10 items.
11. **Unsubscribe en OnDestroy**: Usar `takeUntilDestroyed`, `takeUntil`, o `async` pipe.
12. **Lazy Load Assets**: Images con `loading="lazy"`, fondos grandes en CSS.

### Accesibilidad
13. **ARIA Obligatorio**: `role`, `aria-label`, `aria-describedby`, `aria-live` donde aplique.
14. **Keyboard Navigation**: Tab, Enter, Escape deben funcionar.
15. **Focus Visible**: Indicadores de foco claramente visibles.
16. **Contrast**: 4.5:1 texto normal, 3:1 gráficos (WCAG 2.1 AA mínimo).

### Styling
17. **CSS Variables Obligatorias**: Nunca hardcodear colores. Usar `var(--color-*)`, `var(--space-*)`, etc.
18. **Mobile-First**: Estilos para mobile primero, luego media queries para desktop.
19. **Tailwind o Componentes**: No mezclar; si uses Tailwind, úsalo consistentemente.
20. **Dark Mode Support**: `prefers-color-scheme` o data attributes.

## Checklist "Feature Completo"

- ✅ Rutas lazy loaded en `app.routes.ts`
- ✅ Componentes en `features/[feature]/`
- ✅ Servicio de API en `features/[feature]/services/`
- ✅ Estado (si compartido) en NgRx o Signals
- ✅ Componentes reutilizables en `shared/`
- ✅ DTOs sincronizados con backend
- ✅ Error handling centralizado
- ✅ Caching inteligente (servicios + estado)
- ✅ OnPush change detection (donde aplique)
- ✅ TrackBy en *ngFor (si >10 items)
- ✅ Unsubscribe en OnDestroy o async pipe
- ✅ ARIA labels, keyboard navigation
- ✅ Responsive: mobile, tablet, desktop
- ✅ Tests: componentes, servicios, estado
- ✅ Lighthouse >90 Performance

## Entradas Ideales (qué confirmar con PM/BA)

- Scope del feature (qué pantallas, qué datos)
- Datos compartidos con otros features (necesita estado centralizado)
- Performance critical (necesita lazy load? caché agresivo?)
- Accesibilidad especial (usuarios con limitaciones?)
- Integraciones externas (mapas, cámara, geolocalización?)

## Escalabilidad Observaciones

- **Si bundle >500KB gzip**: Revisar imports, tree-shaking, lazy loading.
- **Si memory leaks en DevTools**: Revisar suscripciones, unsubscribe en OnDestroy.
- **Si change detection lento**: Cambiar a OnPush, revisar selectors en state.
- **Si UX sluggish**: Revisar Core Web Vitals, posibles bottlenecks en rendering.

## Documento de Decisión Arquitectónica

Para cambios significativos (pasar de NgRx a Signals, cambiar routing, etc.), crear ADR en `.github/adr/NNNN-decision.md`.

---

##  RESEARCH FINDINGS (2026-01-02)

### Structure: OK
- core/, features/, pages/, shared/
- Lazy loading en app.routes.ts

### Cross-Cutting Issues
- 50+ memory leaks (ver agent 14)
- 30+ any types (ver agents 12,13)

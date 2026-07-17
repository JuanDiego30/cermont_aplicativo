# UI/UX Audit Summary — CERMONT S.A.S.

**Fecha:** 2026-07-09  
**Auditor:** Sisyphus (Orquestador)  
**Estado:** COMPLETADA

## 1. Color Hardcoding Audit

| Métrica | Valor |
|---|---|
| Archivos con colores hardcoded | 55+ |
| Patrones encontrados | `bg-red-*`, `text-red-*`, `border-red-*`, `bg-emerald-*`, `bg-green-*`, `bg-yellow-*`, `bg-purple-*` |
| Verde lima/neón encontrado | Sí — `bg-emerald-*` en 25+ archivos, `text-green-*` en 8+ archivos |
| Tokens vs hardcode | Proporción alta de hardcode, especialmente en estados semánticos |
| Severidad | ALTA — Rompe consistencia del design system |

**Hallazgos críticos:**
- `bg-emerald-500`, `bg-emerald-100`, `border-emerald-200` en más de 25 archivos (checklists, documentos, órdenes, auth)
- `text-green-600/700/800` en `PlanningReadinessGate.tsx` — viola tokens semánticos
- `bg-green-100`, `text-green-700` en portal cliente
- `bg-purple-50`, `text-purple-600/700` en forms y work-requests
- `bg-red-500`, `border-red-500/20` en múltiples componentes
- `bg-yellow-100`, `border-yellow-100` en kanban y portal

## 2. Iconography Audit

| Métrica | Valor |
|---|---|
| Archivos con iconos | ~137 archivos |
| Emojis como iconos funcionales | 2 archivos (solo comentarios y console.error) |
| Uso de currentColor | Variable — no consistente |
| Multicolor detectado | Patrón `stroke`/`fill` no uniforme en varios componentes |
| Severidad | MEDIA — Hay estructura pero falta consistencia |

## 3. Component Audit

| Componente | Estado | Ubicación |
|---|---|---|
| StatusBadge | ✅ Existe | `frontend/src/core/ui/StatusBadge.tsx` |
| SegmentControl | ✅ Existe | `frontend/src/components/common/SegmentControl.tsx` |
| KpiCard | ✅ Existe (3 variantes) | `frontend/src/components/common/KpiCard.tsx`, `execution/page.tsx`, `portal/page.tsx` |
| Skeleton | ✅ Existe | `frontend/src/core/ui/Skeleton.tsx` |
| MobileBottomNav | ✅ Existe | `frontend/src/modules/core/ui/layout/MobileBottomNav.tsx` |
| EvidenceStatusBadge | ✅ Existe (módulo) | `frontend/src/modules/evidences/ui/EvidenceStatusBadge.tsx` |
| InvoiceStatusBadge | ✅ Existe (módulo) | `frontend/src/modules/invoices/ui/InvoiceStatusBadge.tsx` |
| ReportStatusBadge | ✅ Existe (módulo) | `frontend/src/modules/reports/ui/ReportStatusBadge.tsx` |
| ProposalStatusBadge | ✅ Existe (módulo) | `frontend/src/modules/proposals/ui/ProposalStatusBadge.tsx` |
| ExecutionStatusBadge | ✅ Existe (módulo) | `frontend/src/modules/field-execution/ui/ExecutionStatusBadge.tsx` |
| **CategoryBadge** | ❌ No existe | — |
| **ProgressRing** | ❌ No existe | — |
| **FAB controlado** | ❌ No existe | — |
| **ActionSheet** | ❌ No existe | — |
| **CommandBar** | ❌ No existe | — |
| **CompactStepper** | ❌ No existe | — |
| **CockpitTimeline** | ❌ No existe | — |
| **PremiumCard** | ❌ No existe | — |

## 4. 14-Step Flow Audit

| Métrica | Valor |
|---|---|
| Archivos con implementación | 28 archivos |
| Componentes principales | `FourteenStepProgressBar.tsx`, `CockpitTabs.tsx`, `ServiceCaseWorkflowCockpit.tsx`, `OrderTimeline.tsx`, `OperationalStepProgress.tsx` |
| Estructura | Cockpit modular con tabs + timeline + step progress |
| Mobile pipeline | Vertical timeline en `OperationalStepProgress.tsx` |
| Desktop pipeline | `OrderTimeline.tsx` con timeline lateral |
| Severidad | MEDIA — Existe pero carece de premium design |

## 5. Responsive Audit

| Métrica | Valor |
|---|---|
| MobileBottomNav | ✅ Implementado |
| Breakpoints sm/md/lg/xl | ✅ Usados extensivamente |
| Sidebar | ✅ Desktop sidebar con `hidden`/`block` |
| Bottom nav fixed | ✅ Presente |
| Safe area | Posiblemente presente |
| Severidad | BAJA-MEDIA — Buena base responsive |

## 6. Deuda Visual Priorizada

| # | Deuda | Severidad | Archivos |
|---|---|---|---|
| 1 | Colores hardcoded (emerald, green, red, yellow, purple) | 🔴 Alta | 55+ archivos |
| 2 | Iconos multicolor sin currentColor consistente | 🟡 Media | 137+ archivos |
| 3 | Múltiples StatusBadge duplicados por módulo | 🟡 Media | 6 variantes |
| 4 | FAB no controlado (tapa bottom nav) | 🟡 Media | Cockpit/evidencias |
| 5 | Cards genéricas sin elevación premium | 🟡 Media | Múltiples |
| 6 | Falta ProgressRing componente global | 🟢 Baja | — |
| 7 | Falta CommandBar global | 🟢 Baja | — |
| 8 | Falta ActionSheet contextual | 🟢 Baja | — |
| 9 | Escala tipográfica inconsistente | 🟡 Media | Múltiples |
| 10 | Negro absoluto sin profundidad en dark mode | 🟡 Media | Varios |

## 7. Veredicto

La base técnica es sólida (Tokens CSS existentes, Skeleton, StatusBadge, SegmentControl, KpiCard, BottomNav). Sin embargo, hay una **brecha de implementación significativa** entre el DESIGN.md v4.0 y la UI real. Se requiere una transformación sistemática por fases para alcanzar el nivel premium deseado.

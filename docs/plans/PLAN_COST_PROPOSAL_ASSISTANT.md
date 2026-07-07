# PLAN DE IMPLEMENTACIÓN — Asistente de Costos para Propuestas

**Basado en:** `docs/PROMPTS/ASSISTANT_COST_PROPOSAL_PROMPT.md`  
**Especificación:** Spec-014 — Frontend Profesionalización + Cost Intelligence  
**Fecha:** 2026-07-04  
**Versión:** 1.0  
**Estrategia:** Contract-First → Backend Engine → Frontend Component → Integration

---

## Resumen Ejecutivo

El prompt `ASSISTANT_COST_PROPOSAL_PROMPT.md` define un asistente interactivo que ayuda al usuario a calcular costos para actividades de campo. Aunque el prompt describe un comportamiento conversacional (estilo LLM), la implementación técnica debe ser un **motor determinístico de cálculo** que use el catálogo de costos existente (`CostCatalogItem`) y reglas de negocio predefinidas, expuesto a través de una API REST y un componente frontend.

### Alcance

| Capa | Entregable | Descripción |
|------|-----------|-------------|
| Contract | `CostProposalInput` + `CostProposalResult` schemas | Zod schemas en `@cermont/shared-types` |
| Backend | `POST /api/costs/suggest` | Motor de cálculo con catálogo de costos |
| Frontend | `CostProposalAssistant` component | Panel lateral con formulario + resultados |
| Integration | Wiring en 3 páginas | `/proposals/new`, `/work-requests/[id]`, `/costs` |

---

## Análisis del Estado Actual

### Lo que YA existe (no duplicar)

| Componente | Ubicación | Estado |
|-----------|-----------|--------|
| Catálogo de costos | `CostCatalogItem` model + `cost-catalog.service.ts` + `GET /api/costs/catalog` | ✅ Completo |
| CRUD de costos | `cost.service.ts` + `cost.controller.ts` + `cost.routes.ts` | ✅ Completo |
| Cálculo de totales | `proposal.service.ts` → `calculateProposalTotals()` | ✅ Completo |
| Resumen de costos | `getOrderSummary()` + `GET /api/costs/order/:id/summary` | ✅ Completo |
| Formulario de propuesta | `frontend/src/app/(dashboard)/proposals/new/page.tsx` | ✅ Completo |
| TanStack Query hooks | `frontend/src/modules/costs/queries.ts` | ✅ Completo |
| Schemas compartidos | `packages/shared-types/src/schemas/cost.schema.ts` | ✅ Completo |
| Cost cart schemas | `packages/shared-types/src/schemas/cost-cart.schema.ts` | ✅ Completo |

### Lo que NO existe (hay que crear)

| Componente | Prioridad |
|-----------|-----------|
| `POST /api/costs/suggest` endpoint | P0 |
| `cost-suggest.service.ts` (motor de cálculo) | P0 |
| `CostProposalInput` schema (Zod) | P0 |
| `CostProposalResult` schema (Zod) | P0 |
| `CostProposalAssistant` component (frontend) | P0 |
| `useCostSuggestion` hook (TanStack Query) | P0 |
| Integración en `/proposals/new` page | P1 |
| Integración en `/work-requests/[id]` page | P1 |
| Integración en `/costs` page | P2 |

---

## Phase 1 — Contract (packages/shared-types)

### 1.1 Nuevo schema: `cost-suggest.schema.ts`

Ubicación: `packages/shared-types/src/schemas/cost-suggest.schema.ts`

```typescript
// ─── Activity Types ───────────────────────────────────────────────────
export const CostProposalActivityTypeSchema = z.enum([
  "lifeline_horizontal", "lifeline_vertical",
  "cctv_installation", "cctv_maintenance",
  "anchor_installation", "anchor_inspection",
  "structural_inspection", "safety_inspection",
  "electrical", "refrigeration", "civil_works",
  "general_maintenance", "other",
]);
export type CostProposalActivityType = z.infer<typeof CostProposalActivityTypeSchema>;

// ─── Location ─────────────────────────────────────────────────────────
export const LocationTypeSchema = z.enum(["urban", "rural", "remote"]);
export type LocationType = z.infer<typeof LocationTypeSchema>;

// ─── Measurement ──────────────────────────────────────────────────────
export const CostMeasurementSchema = z.object({
  description: z.string().min(1).max(200),
  value: z.number().positive(),
  unit: z.string().min(1).max(50),
});
export type CostMeasurement = z.infer<typeof CostMeasurementSchema>;

// ─── Material Input (user-provided or empty for auto-suggest) ─────────
export const CostMaterialInputSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(50),
  estimatedPrice: z.number().nonnegative().optional(),
});
export type CostMaterialInput = z.infer<typeof CostMaterialInputSchema>;

// ─── Main Input ───────────────────────────────────────────────────────
export const CostProposalInputSchema = z.object({
  activityType: CostProposalActivityTypeSchema,
  clientName: z.string().max(200).optional(),
  location: z.string().min(1).max(500),
  locationType: LocationTypeSchema,
  technicians: z.number().int().min(1).max(50),
  supervisor: z.boolean(),
  engineer: z.boolean().optional(),
  estimatedDuration: z.object({
    days: z.number().int().min(1).max(365),
    hoursPerDay: z.number().int().min(1).max(24).optional(),
  }),
  scopeDescription: z.string().min(1).max(2000),
  measurements: z.array(CostMeasurementSchema).max(50).optional(),
  materials: z.array(CostMaterialInputSchema).max(100).optional(),
  clientBudget: z.number().nonnegative().optional(),
  requiresFinalCertification: z.boolean(),
  nightWork: z.boolean().optional(),
  adverseWeather: z.boolean().optional(),
  requiresHeightWork: z.boolean().optional(),
  requiresHotWork: z.boolean().optional(),
  requiresLockoutTagout: z.boolean().optional(),
}).strict();
export type CostProposalInput = z.infer<typeof CostProposalInputSchema>;

// ─── Result Line Item ─────────────────────────────────────────────────
export const CostProposalLineItemSchema = z.object({
  category: CostCategorySchema,  // reuse existing CostCategory
  item: z.string().min(1).max(300),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(50),
  unitPrice: z.number().nonnegative(),
  total: z.number().nonnegative(),
  source: z.enum(["catalog", "calculated", "user_provided", "estimated"]),
  catalogItemId: z.string().optional(),
  notes: z.string().max(300).optional(),
});
export type CostProposalLineItem = z.infer<typeof CostProposalLineItemSchema>;

// ─── Result ───────────────────────────────────────────────────────────
export const CostProposalResultSchema = z.object({
  activityDescription: z.string().min(1),
  generatedAt: z.string().datetime(),
  lineItems: z.array(CostProposalLineItemSchema),
  subtotals: z.object({
    materials: z.number().nonnegative(),
    labor: z.number().nonnegative(),
    equipment: z.number().nonnegative(),
    transport: z.number().nonnegative(),
    other: z.number().nonnegative(),
  }),
  directCost: z.number().nonnegative(),
  suggestedMarginPercent: z.number().min(0).max(100),
  suggestedMarginAmount: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
  taxBase: z.number().nonnegative(),           // base gravable
  taxAmount: z.number().nonnegative(),          // IVA 19%
  taxRate: z.number().min(0).max(1),
  total: z.number().nonnegative(),
  totalRounded: z.number().nonnegative(),       // redondeado a miles
  observations: z.array(z.string().max(500)),
  suggestedActions: z.array(z.string().max(300)),
  clientBudgetComparison: z.object({
    clientBudget: z.number().nonnegative(),
    proposedTotal: z.number().nonnegative(),
    difference: z.number(),
    differencePercent: z.number(),
    isWithinBudget: z.boolean(),
  }).optional(),
}).strict();
export type CostProposalResult = z.infer<typeof CostProposalResultSchema>;

// ─── API Envelope ─────────────────────────────────────────────────────
export const CostSuggestionResponseSchema = z.object({
  success: z.literal(true),
  data: CostProposalResultSchema,
});
export type CostSuggestionResponse = z.infer<typeof CostSuggestionResponseSchema>;
```

### 1.2 Export from schemas index

Add to `packages/shared-types/src/schemas/index.ts`:
```typescript
export * from "./cost-suggest.schema";
```

---

## Phase 2 — Backend Engine

### 2.1 New service: `backend/src/modules/cost/cost-suggest.service.ts`

```
backend/src/modules/cost/cost-suggest.service.ts   ← NEW
```

**Responsabilidades del servicio:**

1. **Búsqueda en catálogo** — Consultar `CostCatalogItem` por categoría para obtener precios unitarios de referencia
2. **Cálculo de materiales** — Si el usuario proporciona materiales, usar sus precios; si no, sugerir materiales típicos para el tipo de actividad
3. **Cálculo de mano de obra** — Aplicar tarifas por rol:
   - Técnico de campo: $30,000 COP/hora base
   - Técnico certificado en altura: $40,000 COP/hora
   - Supervisor: $50,000 COP/hora
   - Ingeniero: $65,000 COP/hora
   - Recargo nocturno: +35%
   - Viáticos: $45,000/día/persona (rural/remoto)
4. **Cálculo de herramientas/equipos** — Tarifas diarias:
   - Taladro percutor: $50,000/día
   - Llave dinamométrica: $40,000/día
   - Nivel láser: $35,000/día
   - Andamio/canasta: $120,000/día
   - Equipo de soldadura: $80,000/día
   - EPP especializado altura: $25,000/día/persona
5. **Cálculo de transporte** — Según tipo de ubicación:
   - Urbano: $50,000/viaje
   - Rural: $85,000/viaje
   - Remoto: $120,000/viaje (+ viáticos automáticos)
6. **Margen sugerido**:
   - Base: 20%
   - +5% si trabajo en altura
   - +5% si trabajo nocturno
   - +5% si zona rural/remota
   - +5% si requiere certificación
   - -5% si el margen excede 35% → cap en 35%
   - Mínimo: 15%
7. **IVA** — 19% sobre materiales + herramientas + equipos + transporte
8. **Redondeo** — A miles de COP (ej: $6,174,288 → $6,175,000)
9. **Comparación con presupuesto** — Si `clientBudget` está presente
10. **Observaciones y acciones sugeridas** — Contextuales según tipo de actividad

**Catálogo de materiales típicos por actividad** (hardcoded como fallback cuando el catálogo no tiene ítems):

```typescript
const ACTIVITY_DEFAULT_MATERIALS: Record<CostProposalActivityType, CostMaterialTemplate[]> = {
  lifeline_horizontal: [
    { name: "Cable acero 3/8\"", unit: "m", qtyPerMeter: 1.1, typicalPrice: 22000 },
    { name: "Anclaje AB400", unit: "un", qtyPerAnchor: 1, typicalPrice: 85000 },
    { name: "Conector horquilla", unit: "un", qtyPerAnchor: 2, typicalPrice: 8500 },
    { name: "Tensor línea vida", unit: "un", qtyPerSegment: 1, typicalPrice: 45000 },
    { name: "Abrazadera cable", unit: "un", qtyPerAnchor: 2, typicalPrice: 3200 },
  ],
  // ... otros tipos de actividad
};
```

**Estructura arquitectónica del servicio:**

```typescript
// cost-suggest.service.ts
export async function suggestCosts(input: CostProposalInput): Promise<CostProposalResult> {
  // 1. Cargar catálogo relevante según tipo de actividad
  const catalogItems = await loadRelevantCatalog(input.activityType);

  // 2. Calcular materiales
  const materialLines = calculateMaterials(input, catalogItems);

  // 3. Calcular mano de obra
  const laborLines = calculateLabor(input);

  // 4. Calcular equipos/herramientas
  const equipmentLines = calculateEquipment(input, catalogItems);

  // 5. Calcular transporte
  const transportLines = calculateTransport(input);

  // 6. Calcular otros costos (certificación, pruebas, etc.)
  const otherLines = calculateOtherCosts(input);

  // 7. Consolidar subtotales
  const subtotals = consolidateSubtotals([...materialLines, ...laborLines, ...equipmentLines, ...transportLines, ...otherLines]);

  // 8. Calcular margen
  const margin = calculateMargin(input);

  // 9. Calcular impuestos
  const tax = calculateTax(subtotals, input);

  // 10. Generar observaciones
  const observations = generateObservations(input);

  // 11. Generar acciones sugeridas
  const suggestedActions = generateSuggestedActions(input);

  // 12. Comparar con presupuesto (si aplica)
  const budgetComparison = input.clientBudget ? compareWithBudget(subtotals, margin, tax, input.clientBudget) : undefined;

  return buildResult({...});
}
```

### 2.2 New controller function: `cost.controller.ts`

Agregar al controller existente (NO crear nuevo archivo — seguir patrón existente):

```typescript
// En cost.controller.ts (APPEND al final)
export async function suggestCosts(req: Request, res: Response): Promise<void> {
  const result = await CostSuggestService.suggestCosts(req.body);
  res.status(200).json({ success: true, data: result });
}
```

### 2.3 New route: `cost.routes.ts`

Agregar ruta ANTES de `export default router` (las rutas con parámetros dinámicos van al final para evitar colisiones):

```typescript
// POST /api/costs/suggest — Cost proposal assistant engine
router.post(
  "/suggest",
  authenticate,
  authorize(...INTERNAL_ROLES),
  validateBody(CostProposalInputSchema),
  CostController.suggestCosts,
);
```

**Ubicación:** Después de la línea 52 (`POST /catalog`) y antes de la línea 59 (`GET /order/:orderId`).

### 2.4 Unit tests

```
backend/tests/services/cost-suggest.service.test.ts   ← NEW
```

Casos de prueba mínimos:
1. Cálculo completo para línea de vida horizontal 40m
2. Cálculo con todos los materiales proporcionados por el usuario
3. Cálculo sin catálogo (fallback a defaults)
4. Margen sugerido para trabajo en altura + nocturno
5. Comparación con presupuesto (dentro/fuera)
6. Redondeo a miles

---

## Phase 3 — Frontend Component

### 3.1 Estructura de archivos

```
frontend/src/modules/costs/
├── ui/
│   └── CostProposalAssistant.tsx          ← NEW (componente principal)
│   └── CostProposalAssistantForm.tsx      ← NEW (formulario de entrada)
│   └── CostProposalAssistantResults.tsx   ← NEW (tabla de resultados)
│   └── CostProposalAssistantSummary.tsx   ← NEW (resumen + acciones)
├── hooks/
│   └── useCostSuggestion.ts               ← NEW (TanStack Query mutation)
├── queries.ts                             ← APPEND (query keys + mutation)
└── index.ts                               ← APPEND (barrel exports)
```

### 3.2 Componente: `CostProposalAssistant.tsx`

**Props:**
```typescript
interface CostProposalAssistantProps {
  /** Called when user wants to use the calculated costs to create a proposal */
  onApplyToProposal?: (result: CostProposalResult) => void;
  /** Pre-populated service case context */
  initialData?: Partial<CostProposalInput>;
  /** Display mode */
  mode?: "sidebar" | "standalone" | "embedded";
}
```

**Estados requeridos (según reglas frontend CERMONT):**
- **Loading:** Skeleton con placeholder para tabla
- **Error:** Mensaje de error + botón reintentar
- **Empty:** Formulario inicial con campos requeridos marcados
- **Result:** Tabla completa de desglose con botones de acción

**Comportamiento:**
1. El usuario llena el formulario con datos de la actividad
2. Hace clic en "Calcular costos"
3. Se muestra loading state mientras se consulta `POST /api/costs/suggest`
4. Se renderiza la tabla de resultados con el formato del prompt (💰 DESGLOSE DE COSTOS)
5. El usuario puede ajustar cualquier valor inline
6. Botones de acción: "Aplicar a propuesta", "Exportar", "Reiniciar"

### 3.3 TanStack Query: `useCostSuggestion.ts`

```typescript
export function useCostSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CostProposalInput): Promise<CostProposalResult> => {
      const body = await apiClient.post<CostSuggestionResponse>("/costs/suggest", input);
      if (body?.success === false || !body?.data) {
        throw new Error("No se pudo generar la sugerencia de costos");
      }
      return body.data;
    },
  });
}
```

### 3.4 Query Keys (APPEND a `queries.ts`)

```typescript
export const COSTS_KEYS = {
  // ... existing keys ...
  suggest: (input: CostProposalInput) => [...COSTS_KEYS.all, "suggest", input] as const,
} as const;
```

---

## Phase 4 — Integration Points

### 4.1 Página `/proposals/new` — Panel lateral

Modificar `frontend/src/app/(dashboard)/proposals/new/page.tsx`:

- Agregar botón "Asistente de costos" que abre un Drawer/Sheet (Radix Dialog) en el lado derecho
- El drawer contiene el `CostProposalAssistant` en modo `sidebar`
- Al hacer clic en "Aplicar a propuesta", los ítems calculados se transfieren al formulario de propuesta como `items[]`
- Se cierra el drawer

### 4.2 Página `/work-requests/[id]` — Botón de acción

Identificar la página de detalle de work request y agregar:
- Botón "Calcular costos estimados" en la barra de acciones
- Al hacer clic, abre modal/drawer con `CostProposalAssistant` en modo `standalone`
- Pre-llena datos del work request si están disponibles

### 4.3 Página `/costs` — Herramienta de apoyo

Agregar sección o botón en la página de costos:
- "Asistente de costos" que abre `CostProposalAssistant` en modo `embedded`
- Funciona como calculadora independiente

---

## Phase 5 — Validation Gates

Después de cada phase, ejecutar:

```bash
# Phase 1: Contract
npm run typecheck -w @cermont/shared-types
npm run build -w @cermont/shared-types
npm run contracts:check

# Phase 2: Backend
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend

# Phase 3-4: Frontend
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend

# Full verification
npm run verify
npx react-doctor@latest
```

---

## Matriz de Cumplimiento con el Prompt

| Requisito del Prompt | Cómo se implementa |
|---------------------|-------------------|
| Moneda COP | `currency: "COP"` en todos los cálculos |
| IVA 19% | `taxRate: 0.19` configurable por ítem |
| Tipos de costo (8 categorías) | `CostCategorySchema` existente |
| Catálogo de costos | `CostCatalogItem` model consultado en `cost-suggest.service.ts` |
| Estados de propuesta (draft→sent→approved→rejected) | Ya existen en `proposal.service.ts` |
| Tarifas de mano de obra por rol | Tabla de tarifas en `cost-suggest.service.ts` |
| Tarifas de herramientas/equipos | Tabla de tarifas diarias |
| Margen 20-35% contextual | Algoritmo de margen con ajustes por riesgo |
| Redondeo a miles | `Math.round(value / 1000) * 1000` |
| Formato de respuesta (tabla completa) | `CostProposalResult` schema + `CostProposalAssistantResults.tsx` |
| Observaciones proactivas | `generateObservations()` contextual |
| Acciones sugeridas | `generateSuggestedActions()` contextual |
| Datos incompletos → preguntar | Validación Zod en frontend (react-hook-form) |
| No asumir valores críticos | Campos requeridos en schema |
| Ajuste de valores por el usuario | Componente de tabla editable |
| Integración en 3 páginas | Phase 4 wiring |

---

## Orden de Implementación (Contract-First)

```
1. packages/shared-types/src/schemas/cost-suggest.schema.ts   [CREAR]
2. packages/shared-types/src/schemas/index.ts                   [APPEND export]
3. npm run typecheck -w @cermont/shared-types                   [VALIDAR]
4. backend/src/modules/cost/cost-suggest.service.ts             [CREAR]
5. backend/src/modules/cost/cost.controller.ts                  [APPEND suggestCosts]
6. backend/src/modules/cost/cost.routes.ts                      [APPEND route]
7. backend/tests/services/cost-suggest.service.test.ts          [CREAR]
8. npm run typecheck -w backend && npm run test -w backend      [VALIDAR]
9. frontend/src/modules/costs/hooks/useCostSuggestion.ts        [CREAR]
10. frontend/src/modules/costs/queries.ts                        [APPEND key + mutation]
11. frontend/src/modules/costs/ui/CostProposalAssistantForm.tsx  [CREAR]
12. frontend/src/modules/costs/ui/CostProposalAssistantResults.tsx [CREAR]
13. frontend/src/modules/costs/ui/CostProposalAssistantSummary.tsx [CREAR]
14. frontend/src/modules/costs/ui/CostProposalAssistant.tsx      [CREAR]
15. frontend/src/modules/costs/index.ts                          [APPEND exports]
16. frontend/src/app/(dashboard)/proposals/new/page.tsx          [MODIFY - add drawer]
17. npm run typecheck -w frontend && npm run build -w frontend   [VALIDAR]
18. npm run verify && npx react-doctor@latest                    [FINAL GATE]
```

---

## Estimación de Esfuerzo

| Phase | Tareas | Esfuerzo estimado |
|-------|--------|-------------------|
| Phase 1 — Contract | 2 archivos | 30 min |
| Phase 2 — Backend | 4 archivos (1 nuevo, 2 append, 1 test) | 2-3 horas |
| Phase 3 — Frontend | 6 archivos (5 nuevos, 1 append) | 3-4 horas |
| Phase 4 — Integration | 3 páginas (modify) | 1-2 horas |
| Phase 5 — Gates | Ejecución de comandos | 30 min |
| **Total** | **16 archivos** | **7-10 horas** |

---

## Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Catálogo de costos vacío o desactualizado | Fallback a precios hardcodeados por tipo de actividad; marcar ítems como `source: "estimated"` |
| El motor de margen puede sugerir valores no rentables | Mínimo de 15% garantizado; advertencia si < 20% |
| La integración en páginas existentes puede romper UI | Usar Drawer/Modal que no modifica el layout existente |
| Typecheck puede fallar en monorepo por dependencias cruzadas | Ejecutar `npm run build -w @cermont/shared-types` antes de typecheck en backend/frontend |

---

## Definición de "Done"

- [ ] Schema `cost-suggest.schema.ts` exportado desde `@cermont/shared-types`
- [ ] `POST /api/costs/suggest` devuelve respuesta válida para línea de vida 40m (mismo ejemplo del prompt)
- [ ] `CostProposalAssistant` renderiza formulario + tabla de resultados + resumen
- [ ] Los 5 estados (loading, error, empty, result, forbidden) están cubiertos en el frontend
- [ ] El botón "Aplicar a propuesta" transfiere ítems al formulario de `/proposals/new`
- [ ] `npm run typecheck` pasa en los 3 workspaces
- [ ] `npm run lint` pasa en los 3 workspaces
- [ ] `npm run test` pasa (tests nuevos + existentes)
- [ ] `npm run build` exitoso
- [ ] `npx react-doctor@latest` limpio
- [ ] `npm run verify` exitoso

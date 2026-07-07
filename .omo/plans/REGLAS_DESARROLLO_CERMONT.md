# Reglas de Desarrollo de Software — Cermont S.A.S.

**Propósito:** Este documento define las reglas obligatorias para desarrollar, refactorizar, auditar y desplegar el sistema Cermont S.A.S.  
**Aplicación:** Frontend, backend, paquetes compartidos, scripts, CI/CD, Docker, documentación y despliegue VPS.  
**Regla base:** No se debe eliminar funcionalidad existente sin reemplazarla, mejorarla o escalarla de forma verificada.

---

## 1. Principios Fundamentales

### SOLID

El código debe respetar los cinco principios SOLID:

- **Single Responsibility Principle:** cada módulo, clase, función o componente debe tener una sola responsabilidad clara.
- **Open/Closed Principle:** el sistema debe permitir extensión sin modificar innecesariamente código estable.
- **Liskov Substitution Principle:** las abstracciones deben poder sustituirse sin romper comportamiento.
- **Interface Segregation Principle:** no crear contratos grandes que obliguen a consumir datos o métodos innecesarios.
- **Dependency Inversion Principle:** las capas de alto nivel no deben depender directamente de detalles de bajo nivel.

### SDLC

Todo cambio debe seguir un ciclo de desarrollo ordenado:

1. Entender el problema.
2. Revisar documentación.
3. Revisar código existente.
4. Diseñar la solución mínima.
5. Implementar.
6. Probar.
7. Documentar.
8. Validar calidad.
9. Preparar entrega.

### DRY — Do Not Repeat Yourself

No duplicar lógica, tipos, rutas, permisos, estados, validaciones ni constantes.

**Prohibido:**

- Duplicar schemas Zod.
- Duplicar enums de estado.
- Duplicar arrays de roles.
- Duplicar rutas en componentes.
- Duplicar lógica de negocio en frontend y backend.

### KISS — Keep It Simple

Preferir soluciones simples, explícitas y mantenibles.

**Regla:** si una solución necesita demasiada explicación, probablemente debe simplificarse.

### YAGNI — You Aren't Gonna Need It

No construir abstracciones, módulos o dependencias que no resuelven una necesidad actual o claramente documentada.

---

## 2. Arquitectura y Diseño

### Composition over Inheritance

Preferir composición sobre herencia.

**Correcto:**

- Componentes pequeños combinables.
- Hooks reutilizables.
- Servicios separados.
- Helpers puros.

**Evitar:**

- Jerarquías profundas.
- Clases base genéricas innecesarias.
- Componentes monolíticos.

### Low Coupling and High Cohesion

El código debe tener bajo acoplamiento y alta cohesión.

- Cada módulo debe agrupar responsabilidades relacionadas.
- Los módulos no deben conocer detalles internos de otros módulos.
- Las dependencias entre capas deben ser explícitas y controladas.

### Feature-Sliced Design

El frontend debe organizarse por dominios o módulos de negocio.

**Regla:** cada módulo debe agrupar su UI, hooks, services, query keys, tipos y helpers relacionados.

Ejemplo:

```txt
modules/
  orders/
    api/
    hooks/
    ui/
    model/
    utils/
```

### One Module One Responsibility

Cada módulo debe representar una responsabilidad de negocio clara.

Ejemplos válidos:

- `work-requests`
- `proposals`
- `orders`
- `planning`
- `field-execution`
- `evidences`
- `costs`
- `reports`
- `service-entry-sheets`
- `invoices`
- `payments`

---

## 3. Fuente Única de Verdad

### SSOT — Single Source of Truth

Debe existir una única fuente de verdad para:

- Schemas.
- Tipos.
- Roles.
- Permisos.
- Rutas.
- Estados.
- Query keys.
- Configuración.
- Constantes de negocio.

### Contract-First Development

Antes de implementar frontend o backend, primero se debe definir o actualizar el contrato.

Orden correcto:

1. Schema Zod en `packages/shared-types`.
2. Tipo inferido desde Zod.
3. Modelo Mongoose alineado.
4. Servicio backend.
5. Controller delgado.
6. Ruta con validación.
7. API service frontend.
8. Query keys.
9. Hook TanStack Query.
10. UI.
11. Tests.

### RBAC as Single Source of Truth

Los roles y permisos deben venir de una fuente única.

**Prohibido:**

```ts
["gerente", "residente", "supervisor"]
```

en componentes, páginas o controllers si existe un helper o mapa central.

**Correcto:**

```ts
canAccessModule(userRole, "orders")
```

---

## 4. Calidad de Código

### Clean Code

El código debe ser claro, pequeño, legible y expresivo.

Reglas:

- Nombres descriptivos.
- Funciones pequeñas.
- Componentes pequeños.
- Sin código muerto.
- Sin comentarios innecesarios que expliquen código confuso.
- Sin lógica duplicada.
- Sin condiciones anidadas innecesarias.

### Semantic Code

Los nombres deben expresar intención de negocio.

**Correcto:**

```ts
WorkOrder
ServiceEntrySheet
DeliveryRecord
CostBaseline
ActualCost
```

**Incorrecto:**

```ts
Data
Info
Thing
Manager2
NewModule
```

### English Code Naming

El código interno debe estar en inglés.

**Correcto:**

```ts
createWorkOrder
approveServiceEntrySheet
calculateActualCost
```

**Incorrecto:**

```ts
crearOrden
aprobarSES
calcularCosto
```

La interfaz visible al usuario puede usar español si el producto lo requiere.

### No Spanglish

No mezclar español e inglés en nombres internos.

**Incorrecto:**

```ts
createOrdenTrabajo
getFacturaStatus
updateActaRecord
```

### No Duplicated Code

No copiar y pegar lógica entre módulos. Extraer helpers, services o componentes reutilizables cuando tenga sentido.

### No Spaghetti Code

Evitar flujos confusos, funciones gigantes, dependencias circulares y lógica mezclada entre capas.

### No Div Soup

La UI debe usar HTML semántico cuando aplique.

**Usar:**

- `header`
- `main`
- `section`
- `article`
- `aside`
- `nav`
- `ul`
- `li`
- `button`
- `form`
- `label`

No usar `div` para todo.

---

## 5. TypeScript Estricto

### Zero Any

Prohibido introducir `any` explícito.

**Incorrecto:**

```ts
const payload: any = data;
```

### Zero Unknown

Prohibido introducir `unknown` explícito salvo que exista una política aprobada de refinamiento seguro.

**Incorrecto:**

```ts
function parse(value: unknown) {}
```

### Zero Null

Prohibido introducir `null` explícito para representar ausencia.

**Incorrecto:**

```ts
serviceSheetId: null
```

**Correcto:**

```ts
serviceEntrySheet: {
  status: "not_created"
}
```

### Zero Undefined

Prohibido introducir `undefined` explícito para representar ausencia.

**Incorrecto:**

```ts
paymentReference: undefined
```

**Correcto:**

```ts
payment: {
  status: "pending"
}
```

### Typed Errors

Los errores deben tener códigos estables.

Ejemplos:

```txt
ORDER_NOT_FOUND
PLANNING_NOT_APPROVED
EVIDENCE_REQUIRED
SERVICE_ENTRY_SHEET_NOT_APPROVED
PAYMENT_REFERENCE_REQUIRED
```

No depender únicamente de mensajes de texto.

---

## 6. Reglas de Frontend

### Mobile First Responsiveness

Toda interfaz debe diseñarse primero para móvil y luego escalar a tablet y escritorio.

Reglas:

- Touch targets mínimos de 44 px.
- Tablas responsive.
- Sidebar como drawer en móvil.
- Layouts fluidos.
- Sin desbordamientos horizontales.
- Formularios usables en campo.

### Loading/Error/Empty/Offline States Required

Cada página crítica debe tener:

- Loading state.
- Error state.
- Empty state.
- Offline state.
- Forbidden state cuando aplique.

**Prohibido:** dejar una página en blanco si falla la API.

### No Direct Fetch in Components

Los componentes no deben llamar `fetch` directamente.

**Correcto:**

- `apiClient`
- TanStack Query
- Services por módulo

### Stable Query Keys

Las query keys deben ser estables y centralizadas.

**Correcto:**

```ts
orderKeys.detail(orderId)
orderKeys.list(filters)
```

**Incorrecto:**

```ts
useQuery({ queryKey: ["orders", Math.random()] })
```

### Stable Form Default Values

Los formularios deben tener default values completos, estables y tipados.

### No Business Logic in UI

La UI no debe decidir reglas de negocio complejas.

**Incorrecto:**

```tsx
const canClose = order.status === "executed" && evidences.length > 0;
```

**Correcto:**

```ts
canCloseWorkOrder(order)
```

### Accessibility by Design

Todo componente interactivo debe ser accesible.

Reglas:

- Inputs con `label`.
- Botones con texto o `aria-label`.
- Focus visible.
- Navegación por teclado.
- Modales con focus trap.
- Contraste adecuado.
- No depender solo del color para comunicar estado.

---

## 7. Reglas de Backend

### API Response Consistency

Todas las respuestas deben usar formato estándar.

Éxito:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Readable message"
  }
}
```

### Fail Fast

Validar temprano y fallar de forma explícita.

Orden recomendado en rutas:

```txt
authenticate → authorize → validateParams/validateQuery/validateBody → controller → service
```

### No Silent Catch

Prohibido capturar errores sin actuar.

**Incorrecto:**

```ts
try {
  await runTask();
} catch {}
```

### No Swallowed Errors

Si se captura un error, debe:

- agregarse contexto,
- registrarse si aplica,
- convertirse en error tipado,
- o relanzarse.

### Security by Design

La seguridad debe diseñarse desde el inicio, no agregarse al final.

Reglas:

- Validación Zod antes de lógica de negocio.
- RBAC en backend.
- Rate limiting.
- Helmet.
- CORS estricto.
- Sanitización.
- Logs sin secretos.
- Uploads con allowlist.
- Errores sin stack en producción.

### PoLP — Principle of Least Privilege

Cada rol debe tener solo los permisos mínimos necesarios.

### Defense in Depth

La seguridad debe existir en varias capas:

1. Proxy/rutas frontend.
2. Sidebar filtrado por rol.
3. Backend RBAC.
4. Service layer con validaciones de dominio.
5. Base de datos con restricciones/índices.
6. Auditoría.

### Integridad de Datos

- Los documentos y evidencias usan borrado lógico; las consultas ordinarias excluyen `lifecycleStatus: "deleted"`.
- Los documentos críticos de cierre se archivan con retención y nunca se eliminan físicamente.
- Los casos en estado `paid`, `archived` o `cancelled` son inmutables para envíos, evidencias y avances.
- Toda evidencia contextual debe pertenecer al `ServiceCase`, `WorkOrder` y `ExecutionSession` declarados.
- Los totales de propuestas se calculan nuevamente en backend antes de aprobar o convertir.
- Una factura debe coincidir con su SES aprobada en referencias, moneda, valores e ítems.
- La configuración requerida del backend se valida con Zod al iniciar y falla de forma explícita.

---

## 8. Offline-First y Degradación

### Offline-First / Graceful Degradation

Las funcionalidades de campo deben soportar conexión intermitente.

Aplica especialmente a:

- Field execution.
- Evidence.
- Checklists.
- Materials used.
- Labor hours.
- Field notes.
- Sync queue.

Reglas:

- Guardar en IndexedDB.
- Mostrar estado de sincronización.
- Reintentar sync.
- Evitar duplicados.
- Usar `clientMutationId` en mutaciones críticas.
- No mostrar como sincronizado lo que sigue pendiente.
- Conservar errores y conflictos en DLQ hasta reintento o descarte explícito.
- Resolver conflictos desde `/offline-sync`; nunca aplicar sobrescrituras silenciosas.
- Registrar listeners personalizados del service worker antes de los listeners de Serwist.

---

## 9. Observabilidad y Auditoría

### Observability by Design

El sistema debe ser diagnosticable.

Reglas:

- Request ID validado o generado en backend y propagado a respuesta, logs y auditoría.
- Logs estructurados en JSON para producción, con niveles y serialización de errores.
- Redacción recursiva de contraseñas, tokens, cookies, secretos y llaves.
- Health checks separados: `/api/health/live` para liveness y `/api/health/ready` para readiness de MongoDB.
- Errores tipados.
- Eventos críticos y los 14 pasos operativos auditados.
- Sin secretos en logs.

### Auditability by Default

Toda acción crítica debe dejar registro.

Los registros de auditoría son forenses: inmutables, sin TTL, indexados por entidad,
actor, acción y `requestId`, y consultables únicamente mediante RBAC administrativo.

Eventos mínimos:

- Crear solicitud.
- Registrar visita.
- Crear propuesta.
- Aprobar propuesta.
- Adjuntar PO.
- Convertir propuesta a orden.
- Aprobar planeación.
- Iniciar ejecución.
- Completar ejecución.
- Subir evidencia.
- Generar informe.
- Crear acta.
- Crear SES.
- Aprobar SES.
- Rechazar SES.
- Emitir factura.
- Marcar factura como pagada.
- Cambiar rol.
- Desactivar usuario.

---

## 10. Idempotencia y Consistencia

### Idempotency for Critical Actions

Las acciones críticas no deben duplicarse por doble clic, reintentos o sincronización offline.

Aplica a:

- Crear orden.
- Subir evidencia.
- Crear SES.
- Emitir factura.
- Marcar pago.
- Sincronizar operaciones offline.

Usar:

- `clientMutationId`
- `requestId`
- `operationId`

### Backward Compatibility

No romper APIs existentes sin transición.

Reglas:

- Mantener endpoint legacy si ya está en uso.
- Marcar deprecación.
- Crear endpoint nuevo.
- Agregar pruebas de compatibilidad.

---

## 11. CI/CD, DevOps y Despliegue

### CI/CD

Cada cambio debe pasar por quality gates:

- Install.
- Typecheck.
- Lint.
- Build.
- Tests.
- Coverage.
- E2E cuando aplique.
- Security audit.
- Qodana si existe.

### VPS Only Deployment

El despliegue productivo debe estar orientado a VPS.

**Prohibido:**

- Reemplazar despliegue por Vercel.
- Introducir dependencia obligatoria de plataformas externas no aprobadas.
- Romper Docker o scripts de VPS.

### No Qodana Issues

No introducir nuevos problemas detectables por Qodana.

---

## 12. Testing

### Test Before Refactor

Antes de refactorizar un flujo crítico, debe existir una prueba o checklist claro.

Flujos críticos:

- Auth.
- Work request.
- Proposal to order.
- Planning.
- Field execution.
- Evidence.
- Costs.
- Reports.
- Delivery records.
- SES.
- Invoice.
- Payment.
- RBAC.
- Offline sync.

### Every Critical Flow Must Have E2E Test

Todo flujo crítico debe tener prueba E2E o estar registrado como pendiente P1.

---

## 13. Performance

### Performance Budget

El sistema debe mantener límites de rendimiento razonables.

Reglas:

- Evitar bundles innecesarios.
- Lazy load en módulos pesados.
- Tablas paginadas o virtualizadas.
- Imágenes optimizadas.
- No renderizar listas grandes sin estrategia.
- No crear providers globales innecesarios.
- No guardar server state en Zustand.

### No Barrel Imports in Performance-Critical Paths

Evitar barrel imports en rutas críticas si afectan tree-shaking o bundle size.

---

## 14. Documentación

### Documentation as Code

La documentación debe vivir en el repositorio y actualizarse con el código.

Documentar:

- Rutas.
- Módulos.
- Contratos API.
- Roles.
- Permisos.
- Flujos críticos.
- Offline sync.
- Variables de entorno.
- Despliegue.

### Architecture Decision Records

Toda decisión arquitectónica importante debe tener ADR.

Ejemplos:

```txt
docs/adr/ADR-001-use-express-backend.md
docs/adr/ADR-002-offline-first-indexeddb.md
docs/adr/ADR-003-navigation-sidebar-ssot.md
```

---

## 15. Prohibiciones Explícitas

Está prohibido introducir:

- Código duplicado.
- Spaghetti code.
- Div soup.
- `any` explícito.
- `unknown` explícito.
- `null` explícito.
- `undefined` explícito.
- `console.log` en producción.
- `debugger`.
- `alert`.
- Código mock en producción.
- Fetch directo en componentes.
- Roles hardcodeados.
- Rutas hardcodeadas.
- Magic strings.
- Magic numbers.
- Catch vacío.
- Errores tragados.
- Rutas huérfanas.
- Componentes muertos.
- Exports no usados.
- Dependencias circulares.
- Lógica de negocio en UI.
- Datos sensibles en logs.
- Secretos en repositorio.
- Dependencias grandes sin justificación.
- Refactors masivos sin pruebas.

---

## 16. Checklist Obligatorio Antes de Commit

Antes de confirmar cambios, ejecutar:

```bash
npm run typecheck
npm run lint
npm run build
npm run test
```

Cuando aplique:

```bash
npm run test:ci
npm run test:e2e
npm run test:coverage
npm audit
```

Checklist:

- [ ] No se eliminó funcionalidad existente.
- [ ] No se duplicaron schemas.
- [ ] No se duplicaron roles.
- [ ] No se duplicaron rutas.
- [ ] No se introdujo `any`.
- [ ] No se introdujo `unknown`.
- [ ] No se introdujo `null`.
- [ ] No se introdujo `undefined`.
- [ ] No hay `console.log`.
- [ ] No hay errores de typecheck.
- [ ] No hay errores de lint.
- [ ] Build exitoso.
- [ ] Tests relevantes ejecutados.
- [ ] Estados loading/error/empty/offline cubiertos.
- [ ] RBAC validado.
- [ ] Documentación actualizada si aplica.
- [ ] Sin issues nuevos de Qodana.

---

## 17. Regla Final

Todo cambio debe mejorar una de estas dimensiones:

1. Funcionalidad.
2. Seguridad.
3. Mantenibilidad.
4. Accesibilidad.
5. Rendimiento.
6. Observabilidad.
7. Experiencia de usuario.
8. Confiabilidad.
9. Testabilidad.
10. Documentación.

Si un cambio no mejora ninguna de estas dimensiones, no debe hacerse.

---
title: "PROMPT MAESTRO CERMONT — Depuración, Refactorización, Maduración, Escalabilidad e Innovación"
artifact_type: "implementation-master-plan"
format: "Markdown"
language: "es"
execution_shell: "Bash"
git_policy: "NO_GIT_COMMANDS"
target_line_count: 3000
repository_windows_path: "C:\\Users\\camil\\Downloads\\cermont_aplicativo\\cermont_aplicativo"
repository_remote_reference: "https://github.com/JuanDiego30/cermont_aplicativo.git"
generated_for: "CERMONT S.A.S."
---

# PROMPT MAESTRO ÚNICO DE EJECUCIÓN

## DEPURAR, CORREGIR, REFACTORIZAR, COMPLETAR, MADURAR, ESCALAR E INNOVAR EL APLICATIVO CERMONT

## 0. INSTRUCCIÓN DE ACTIVACIÓN

Actúa como un equipo autónomo compuesto por Principal Software Architect, Staff Full-Stack Engineer, Domain Engineer, QA Automation Engineer, Security Engineer, DevOps Engineer y Product Engineer especializado en plataformas FSM, CMMS y ERP.
Trabaja directamente sobre el monorepo local de CERMONT y ejecuta el plan completo por fases atómicas.
No respondas con otro plan, con opciones ni con preguntas de prioridad.
No preguntes si debes continuar.
No preguntes qué módulo debes corregir primero.
No preguntes si debes arreglar pruebas o implementar funcionalidades.
La prioridad ya está definida: preservar todo lo avanzado, estabilizar el sistema, corregir causas raíz, completar cortes verticales parciales y continuar la maduración e innovación descrita en la documentación.
No reconstruyas la aplicación desde cero.
La landing, el login, el dashboard, el cockpit y numerosos módulos ya existen en un estado avanzado.
Primero inspecciona la implementación real.
Después mejora lo existente sin sustituirlo por versiones básicas o antiguas.
No declares éxito por compilar solamente.
El resultado final debe quedar integrado, probado, documentado y verificable.

## 1. OBJETIVO INNEGOCIABLE

El objetivo es convertir el aplicativo CERMONT en una plataforma operativa profesional, modular, segura, auditable, configurable, offline-first y escalable.
La plataforma debe conectar la operación de campo con el cierre técnico, administrativo y financiero.
Debe preservar trazabilidad desde la solicitud del cliente hasta el registro del pago y cierre definitivo.
Debe corregir errores, warnings, pruebas fallidas, contratos incompatibles y módulos parcialmente conectados.
Debe completar funcionalidades existentes antes de iniciar reemplazos.
Debe innovar únicamente después de estabilizar los quality gates.
Debe usar evidencia real y nunca presentar una interfaz simulada como integración terminada.
Debe mantener una arquitectura Contract-First.
Debe mantener una única fuente de verdad para schemas, tipos, estados, roles, permisos, rutas, query keys y reglas del dominio.
Debe dejar pasando, en este orden, los comandos:
```bash
npm run typecheck
npm run lint
npm run build
npm run verify
```
Después debe ejecutar los controles adicionales disponibles:
```bash
npm run contracts:check
npm run quality:strict
npm run verify:strict
npm run test:e2e
```
No modifiques los scripts para disminuir su alcance.
No ocultes errores para obtener código de salida cero.
No finalices mientras existan errores o warnings atribuibles al código intervenido.

## 2. FUENTES OBLIGATORIAS

Lee completamente los documentos antes de alterar la arquitectura.
Usa como fuente principal del dominio:
- `.sisyphus/plans/LTG_JUAN_DIEGO_AREVALO-3_markdown.md`
- `.sisyphus/plans/REGLAS_DESARROLLO_CERMONT.md`
- `.sisyphus/plans/07_DESARROLLO_DE_UN_APLICATIVO_WEB_PARA_APOYO_EN_LA_EJECUCION_Y_CIERRE_ADMINISTRATIVO_DE_LOS_TRABA3.md`
- `.sisyphus/plans/09_Observaciones_Anteproyecto_Juan_Diego2.md`
Lee también todos los planes de implementación, auditoría, bugfix, maduración, UX, Contract-First, formatos dinámicos, Playwright y despliegue presentes en `.sisyphus/plans/`.
No borres, muevas, renombres ni sobrescribas esos documentos.
No conviertas un plan histórico en verdad absoluta.
Compara cada plan con el código actual y con las reglas del dominio.
Cuando un plan contradiga un contrato vigente, registra la contradicción antes de decidir.
Cuando dos documentos discrepen, utiliza el siguiente orden de precedencia:
1. Proceso real de negocio CERMONT.
2. Flujo canónico de catorce pasos y sus invariantes.
3. Reglas de desarrollo obligatorias.
4. Contratos compartidos vigentes y validados.
5. Reglas de dominio probadas.
6. Código ejecutable actual.
7. Pruebas que representen comportamiento de negocio correcto.
8. Plan específico más reciente.
9. LTG como marco funcional y arquitectónico.
10. Planes históricos y propuestas futuras.
No inventes indicadores de impacto sin evidencia piloto.
Diferencia siempre entre implementado, parcialmente implementado, propuesto, experimental y bloqueado por integración externa.

## 3. COMPORTAMIENTO AUTÓNOMO

Toma decisiones técnicas apoyándote en código, documentación, pruebas y herramientas.
No transfieras decisiones rutinarias al usuario.
Si una tarea es grande, divídela internamente y continúa.
Si aparece un error nuevo, regístralo y corrígelo.
Si una integración externa no tiene credenciales, implementa el adaptador, el contrato, la degradación controlada y las pruebas locales sin fingir conexión real.
Si un módulo está incompleto, termina su corte vertical.
Si un componente está huérfano pero corresponde a un requisito vigente, conéctalo.
Si existe duplicación, selecciona una fuente canónica y migra consumidores de forma comprobada.
No borres la implementación duplicada hasta verificar todos los consumidores.
No ofrezcas varias opciones al final de cada fase.
Reporta avances con evidencia y continúa con la siguiente tarea desbloqueada.

## 4. POLÍTICA ABSOLUTA: NO USAR GIT

No ejecutes ningún comando Git.
No uses Git para inspección, respaldo, restauración, comparación, cambio de rama, commit, stash, merge ni recuperación.
Está prohibido ejecutar cualquier comando que empiece por `git`.
No ejecutes `git status`.
No ejecutes `git diff`.
No ejecutes `git log`.
No ejecutes `git checkout`.
No ejecutes `git restore`.
No ejecutes `git reset`.
No ejecutes `git clean`.
No ejecutes `git stash`.
No ejecutes `git switch`.
No ejecutes `git merge`.
No ejecutes `git rebase`.
No ejecutes `git cherry-pick`.
No ejecutes `git commit`.
No ejecutes `git push`.
No ejecutes herramientas que internamente reescriban el historial.
Trata el checkout como un directorio de trabajo ordinario.
La conservación se realizará mediante copias seguras, checksums y diffs del sistema de archivos.
No borres archivos para resolver conflictos.
No regreses archivos a versiones anteriores.
Toda reparación debe avanzar desde el estado actual.

## 5. BASH OBLIGATORIO

Usa Bash.
No uses PowerShell.
No uses `cmd.exe` para ejecutar tareas manuales.
El modelo debe detectar Git Bash o WSL sin preguntarle al usuario.
Usa este arranque:
```bash
set -euo pipefail

if [ -d "/c/Users/camil/Downloads/cermont_aplicativo/cermont_aplicativo" ]; then
  REPO_ROOT="/c/Users/camil/Downloads/cermont_aplicativo/cermont_aplicativo"
elif [ -d "/mnt/c/Users/camil/Downloads/cermont_aplicativo/cermont_aplicativo" ]; then
  REPO_ROOT="/mnt/c/Users/camil/Downloads/cermont_aplicativo/cermont_aplicativo"
else
  REPO_ROOT="$(pwd)"
fi

cd "$REPO_ROOT"
printf 'Repository root: %s\n' "$REPO_ROOT"
```
Comprueba que existan `package.json`, `frontend`, `backend` y `packages`.
No cambies de directorio de forma silenciosa.
Imprime el directorio antes de ejecutar un gate.
Usa comillas en todas las rutas.
No uses comandos destructivos.

## 6. PROHIBICIÓN DE BORRADO

No ejecutes manualmente:
```bash
rm
rm -r
rm -rf
rmdir
unlink
shred
truncate
find . -delete
xargs rm
```
No elimines documentos.
No elimines planes.
No elimines pruebas.
No elimines código parcialmente implementado.
No elimines archivos no rastreados.
No elimines imágenes, plantillas, PDFs, evidencias, uploads ni archivos operativos.
No elimines carpetas `.sisyphus`, `docs`, `tests`, `scripts`, `public`, `uploads` o equivalentes.
Los scripts oficiales de build pueden regenerar sus propios artefactos, pero el modelo no debe limpiar manualmente fuentes ni documentación.
Si un archivo parece obsoleto, clasifícalo y déjalo intacto hasta completar la migración de consumidores.
Si una eliminación fuera imprescindible por seguridad o duplicación, no la ejecutes: documenta la propuesta como pendiente de aprobación humana.

## 7. RESPALDO DE ARCHIVOS SIN GIT

Antes de editar cualquier archivo existente, crea una copia preservando su ruta.
Usa una carpeta nueva por sesión:
```bash
SESSION_STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_ROOT=".sisyphus/safe-backups/$SESSION_STAMP"
PROGRESS_FILE=".sisyphus/progress/cermont-master-execution-$SESSION_STAMP.md"
mkdir -p "$BACKUP_ROOT"
mkdir -p "$(dirname "$PROGRESS_FILE")"
```
Define esta función Bash:
```bash
backup_file() {
  local file="$1"
  if [ -f "$file" ]; then
    local target="$BACKUP_ROOT/$file"
    mkdir -p "$(dirname "$target")"
    cp -p "$file" "$target"
    sha256sum "$file" >> "$BACKUP_ROOT/original-sha256.txt"
  fi
}
```
Invoca `backup_file` antes de editar cada archivo.
No sobrescribas una copia previa.
No uses el mismo `SESSION_STAMP` para sesiones diferentes.
Después de editar, registra el checksum:
```bash
sha256sum "$FILE" >> "$BACKUP_ROOT/modified-sha256.txt"
```
Genera un diff sin Git:
```bash
diff -u "$BACKUP_ROOT/$FILE" "$FILE" > "$BACKUP_ROOT/$(basename "$FILE").diff" || true
```
No utilices `cp` para reemplazar masivamente directorios del proyecto.
Las copias solo son respaldo, no una estrategia para restaurar ciegamente.

## 8. USO OBLIGATORIO DE SKILLS Y HERRAMIENTAS

Antes de cambiar una API de una librería, consulta documentación actual.
Usa Context7 como fuente primaria para APIs de frameworks y librerías.
Primero ejecuta la herramienta equivalente a `Resolve Context7 Library ID`.
Después ejecuta la herramienta equivalente a `Query Documentation`.
Selecciona la versión que coincida con `package.json` y `package-lock.json`.
No consultes una versión genérica cuando el proyecto fija una versión concreta.
Registra en el archivo de progreso:
- Librería consultada.
- Context7 library ID.
- Versión.
- Pregunta realizada.
- Decisión técnica derivada.
Consulta Context7 para Next.js antes de cambiar Server Components, Client Components, Route Handlers, caching, Suspense, middleware/proxy o build.
Consulta Context7 para React antes de cambiar hooks, effects, transitions o APIs de React 19.
Consulta Context7 para Express antes de alterar propagación de errores asíncronos, middleware o rutas.
Consulta Context7 para Mongoose antes de cambiar schemas, modelos, queries, `lean`, `exec`, sesiones, transacciones o tipos.
Consulta Context7 para Zod antes de cambiar composición, refinements, transforms, error maps o inferencia.
Consulta Context7 para TanStack Query antes de cambiar query keys, invalidación, persistencia, optimistic updates o mutaciones offline.
Consulta Context7 para Vitest antes de cambiar mocks, fake timers, teardown, timeouts o configuración.
Consulta Context7 para Playwright antes de cambiar fixtures, auth state, locators, retries o trazas.
Consulta Context7 para Dexie y Serwist antes de cambiar IndexedDB o el Service Worker.
No pegues información confidencial, credenciales ni código propietario completo en las consultas.
Usa herramientas de búsqueda del repositorio para localizar definiciones y consumidores.
Usa Playwright o una skill de navegador para verificar flujos visuales y funcionales.
Usa la integración GitHub únicamente en modo lectura si necesitas contexto remoto; no ejecutes acciones de escritura.
No uses herramientas para instalar dependencias sin comprobar que ya no existe una capacidad equivalente.

## 9. ARQUITECTURA OBJETIVO

Conserva el monorepo actual.
La arquitectura física esperada es:
```text
packages/shared-types
packages/domain
packages/config
backend
frontend
```
`packages/shared-types` es la fuente única de contratos serializables.
`packages/domain` contiene reglas puras, máquinas de estados, permisos y cálculos de negocio reutilizables.
`packages/config` centraliza configuración compartida no secreta.
`backend` expone la API y coordina persistencia, seguridad, auditoría, archivos e integraciones.
`frontend` presenta la experiencia web, PWA y portal.
No migres la estructura hacia `apps/*`.
No introduzcas NestJS.
No introduzcas Prisma.
No cambies MongoDB por PostgreSQL.
No cambies npm por pnpm o Yarn.
No cambies Biome por una configuración paralela.
No cambies JWT/WebAuthn por otro sistema sin una ADR aprobada.
No cambies React DnD por otra librería solo por preferencia.
No agregues Axios si ya existe un cliente HTTP oficial.
No recrees un design system paralelo.

## 10. ARQUITECTURA CONTRACT-FIRST

Todo cambio funcional sigue esta cadena:
```text
Schema Zod compartido
→ tipo inferido
→ regla de dominio
→ mapper de entrada
→ modelo de persistencia
→ servicio backend
→ controller delgado
→ route y middleware
→ cliente API frontend
→ query key factory
→ hook TanStack Query
→ componente o página
→ pruebas unitarias
→ pruebas de integración
→ prueba E2E crítica
```
No dupliques schemas en frontend y backend.
No escribas enums de estado en componentes.
No escribas arrays de roles en controllers.
No expongas tipos de Mongoose como contratos de API.
No pases DTO de API directamente a `Model.create()` cuando requiera normalización.
Crea mappers explícitos entre transporte, dominio y persistencia.
Valida entrada y salida en fronteras críticas.
Mantén errores con códigos estables.
Mantén envelopes de API coherentes.
No uses TypeScript casts para forzar contratos incompatibles.

## 11. ARQUITECTURA DE DOMINIO

El dominio gira alrededor de un Service Case u orden transversal.
Debe relacionar los catorce pasos:
1. WorkRequest.
2. SiteVisit.
3. Proposal.
4. PurchaseOrder.
5. PlanningPacket.
6. ExecutionSession.
7. TechnicalReport.
8. DeliveryRecord.
9. ClientAcceptance.
10. ServiceEntrySheet.
11. SESApproval.
12. Invoice.
13. InvoiceApproval.
14. PaymentRecord y Closure.
Cada paso debe tener estado, actor, timestamps, artifacts, requisitos, blockers y auditoría.
Las transiciones deben controlarse en dominio o backend, no en la UI.
La UI puede solicitar una transición, pero no inventarla.
No permitas saltos silenciosos.
No permitas cerrar con documentos obligatorios pendientes.
No permitas factura sin SES aprobada cuando la regla aplique.
No permitas pago duplicado con la misma referencia.
No permitas evidencias sin vínculo estable con orden, ejecución y etapa.
Las reglas deben ser idempotentes y probadas.

## 12. ARQUITECTURA BACKEND

Conserva Express 5.
Usa:
```text
Router
→ middleware de autenticación/RBAC/validación
→ Controller
→ Service
→ Domain
→ Persistence
```
El controller no contiene reglas de negocio.
El service no importa `Request` ni `Response`.
Los errores asíncronos deben seguir el mecanismo oficial de Express 5.
El middleware global traduce errores tipados a HTTP.
Los servicios externos se encapsulan detrás de adapters.
La persistencia usa repositorios o mappers cuando la complejidad lo justifique.
No conviertas todos los módulos a clases si actualmente usan funciones coherentes.
Mantén cohesión por módulo.
Evita imports profundos entre módulos.
Evita dependencias circulares.
Registra auditoría para operaciones críticas.
Propaga `requestId` o correlation ID.

## 13. ARQUITECTURA MONGOOSE

Usa tipos de schema, documentos hidratados y objetos lean de forma explícita.
No fuerces overloads con casts.
Mongoose 9 aplica tipado más estricto en `create()` e `insertOne()`.
Mapea payloads antes de persistir.
Usa `lean()` cuando solo necesitas lectura serializable.
Usa documentos hidratados cuando necesitas métodos o `save()`.
Mantén orden correcto de `lean()` y transforms.
Usa `exec()` de forma coherente y refleja esa cadena en los mocks.
Cuando uses una sesión con `Model.create`, sigue la forma oficial compatible con la versión.
No dejes transacciones abiertas.
No inicies una sesión real en pruebas unitarias.
Crea seams de testabilidad para queries y transacciones.

## 14. ARQUITECTURA FRONTEND

Conserva Next.js 16 App Router y React 19.
Layouts y pages son Server Components por defecto.
Usa Client Components solo donde haya interacción, estado local o APIs del navegador.
Mantén la frontera `"use client"` lo más pequeña posible.
No conviertas páginas enteras en Client Components sin necesidad.
No llames Route Handlers internos desde Server Components si puedes acceder directamente al recurso del servidor.
Usa TanStack Query para estado remoto interactivo y mutaciones.
Usa query key factories centralizadas.
Usa Zustand para estado local de interfaz, no para duplicar datos del servidor.
Usa React Hook Form y schemas compartidos.
Implementa loading, error, empty, offline, forbidden y success.
Mantén `Suspense` donde una API de navegación o streaming lo requiera.
No hagas fetch directo dentro de componentes visuales.
No uses `useEffect` como sustituto general del data fetching.
No muestres códigos técnicos en inglés al usuario final.
La UI visible debe ser consistente en español.

## 15. ARQUITECTURA OFFLINE-FIRST

La operación offline es parcial y debe madurarse con evidencia.
Usa Serwist, Service Worker, Dexie/IndexedDB, persistencia de TanStack Query y cola de mutaciones.
Cada mutación offline debe tener `clientMutationId` o `idempotencyKey`.
Cada ítem debe tener estado:
```text
pending
syncing
synced
failed
conflict
dead_letter
```
Distingue conectividad del navegador de conectividad real del backend.
Implementa backoff exponencial acotado.
No reintentes errores de validación como si fueran fallos de red.
No marques sincronizado antes de confirmación del servidor.
No pierdas blobs o metadatos después de reiniciar.
No prometas operación offline total para SES, DIAN, facturación o pago sin confirmación backend.
Implementa centro de sincronización y resolución de conflictos.
Prueba reconexión, duplicados, orden de mutaciones y archivos.

## 16. ARQUITECTURA DOCUMENTAL

Los documentos deben ser artifacts trazables, versionados y vinculados al paso.
Distingue archivo binario, metadata, plantilla, formulario, versión, firma y aprobación.
No mezcles el almacenamiento físico con la entidad de dominio.
Mantén hash, MIME validado, tamaño, autor, timestamps y relación de negocio.
Valida magic bytes.
No confíes solo en extensión.
Implementa políticas por rol y propósito.
Los formatos dinámicos deben originarse en plantillas versionadas.
La extracción automática requiere revisión humana.
No declares OCR o IA funcional si solo existe un placeholder.
Permite exportar paquetes históricos con manifiesto.

## 17. ARQUITECTURA DE SEGURIDAD

Aplica defensa en profundidad:
- Proxy y CORS.
- Autenticación JWT y WebAuthn existente.
- Cookies HttpOnly cuando corresponda.
- Rotación y revocación de sesión.
- RBAC centralizado.
- Validación Zod en fronteras.
- Protección IDOR.
- Rate limiting.
- Headers de seguridad.
- Auditoría inmutable.
- Protección de datos en tránsito y reposo.
- Sanitización de archivos.
No registres tokens, contraseñas ni datos sensibles.
No confíes en ocultar botones como control de acceso.
El backend debe rechazar operaciones no autorizadas.
Todo mensaje visible debe ser seguro y comprensible.

## 18. ARQUITECTURA DE OBSERVABILIDAD

Usa logs estructurados.
Incluye request ID.
Registra duración, resultado, actor y entidad cuando sea apropiado.
No uses `console.log` productivo.
Implementa health live y health ready.
Diferencia dependencia degradada de proceso muerto.
Registra métricas operativas y técnicas.
No inventes KPIs.
Documenta fórmula, periodo, población y fuente.
Mantén trazabilidad de transición.
Mantén alertas de sincronización, SLA y documentos próximos a vencer.

## 19. CALIDAD DE CÓDIGO

Aplica SOLID, DRY, KISS, YAGNI, alta cohesión y bajo acoplamiento.
Prefiere composición.
Mantén funciones pequeñas.
Mantén nombres internos en inglés.
Evita Spanglish.
Usa HTML semántico.
No introduzcas:
```text
any
as any
as unknown as
@ts-ignore
@ts-expect-error
biome-ignore injustificado
catch vacío
promesas sin await
timeouts aumentados para ocultar bloqueos
datos mock en producción
```
No elimines una prueba válida para hacer pasar la suite.
No marques suites como skip.
No reduzcas quality gates.
No cambies cero por ausencia ni ausencia por cero sin semántica explícita.

## 20. CICLO ATÓMICO OBLIGATORIO

Cada tarea se ejecuta así:
1. Leer requisito y código relacionado.
2. Localizar definición canónica.
3. Localizar consumidores.
4. Consultar Context7 si se altera API de librería.
5. Respaldar cada archivo antes de editarlo.
6. Escribir o ajustar una prueba que reproduzca el problema.
7. Implementar la corrección mínima completa.
8. Ejecutar prueba específica.
9. Ejecutar gate del workspace.
10. Registrar evidencia.
11. Continuar con la siguiente tarea desbloqueada.
No edites veinte archivos antes de ejecutar una prueba.
No ejecutes toda la suite después de cada cambio mínimo.
Agrupa por causa raíz.
Cuando una causa raíz esté corregida, ejecuta suites relacionadas.
Al finalizar una fase, ejecuta el gate completo indicado.

## 21. REGISTRO DE PROGRESO

Crea el archivo de progreso sin modificar los planes fuente.
Incluye por tarea:
```text
Task ID:
Phase:
Status:
Requirement source:
Context7 references:
Files inspected:
Files backed up:
Files modified:
Root cause:
Implementation:
Tests:
Commands:
Result:
Risks:
Debt:
Next dependency:
```
Estados válidos:
```text
pending
investigating
in_progress
implemented
verified
blocked_external
```
No uses `verified` sin ejecutar el gate.
No ocultes fallos en el reporte.

## FASE 00 — PRESERVACIÓN Y ENTORNO BASH
**Objetivo de fase:** Proteger el estado actual sin Git y preparar una ejecución repetible.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-001 — Detectar automáticamente Git Bash o WSL y fijar REPO_ROOT
- **Objetivo atómico:** completar «Detectar automáticamente Git Bash o WSL y fijar REPO_ROOT» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-002 — Crear SESSION_STAMP, BACKUP_ROOT y PROGRESS_FILE sin sobrescribir sesiones previas
- **Objetivo atómico:** completar «Crear SESSION_STAMP, BACKUP_ROOT y PROGRESS_FILE sin sobrescribir sesiones previas» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-003 — Inventariar archivos fuente, documentos, pruebas y configuraciones mediante herramientas de solo lectura
- **Objetivo atómico:** completar «Inventariar archivos fuente, documentos, pruebas y configuraciones mediante herramientas de solo lectura» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-004 — Crear funciones Bash de respaldo, checksum y diff por archivo
- **Objetivo atómico:** completar «Crear funciones Bash de respaldo, checksum y diff por archivo» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
test -f package.json && test -d frontend && test -d backend && test -d packages
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 01 — INGESTA DOCUMENTAL Y MATRIZ DE VERDAD
**Objetivo de fase:** Convertir documentos y planes en requisitos trazables sin reimplementar desde cero.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-005 — Leer el LTG completo y extraer objetivos, límites, módulos, arquitectura y criterios de validación
- **Objetivo atómico:** completar «Leer el LTG completo y extraer objetivos, límites, módulos, arquitectura y criterios de validación» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-006 — Leer REGLAS_DESARROLLO_CERMONT y convertir cada regla en un control verificable
- **Objetivo atómico:** completar «Leer REGLAS_DESARROLLO_CERMONT y convertir cada regla en un control verificable» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-007 — Leer formatos operativos, fallas de negocio y observaciones del anteproyecto
- **Objetivo atómico:** completar «Leer formatos operativos, fallas de negocio y observaciones del anteproyecto» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-008 — Leer todos los planes Sisyphus y construir una matriz de contradicciones, duplicados y dependencias
- **Objetivo atómico:** completar «Leer todos los planes Sisyphus y construir una matriz de contradicciones, duplicados y dependencias» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
test -s "$PROGRESS_FILE"
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 02 — PROTOCOLO DE SKILLS Y CONTEXT7
**Objetivo de fase:** Asegurar que toda decisión de framework use documentación compatible con las versiones instaladas.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-009 — Extraer versiones exactas desde package.json y package-lock.json
- **Objetivo atómico:** completar «Extraer versiones exactas desde package.json y package-lock.json» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-010 — Resolver IDs Context7 para Next.js, React, Express, Mongoose, Zod, TanStack Query, Vitest y Playwright
- **Objetivo atómico:** completar «Resolver IDs Context7 para Next.js, React, Express, Mongoose, Zod, TanStack Query, Vitest y Playwright» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-011 — Crear un registro de consultas Context7 y decisiones técnicas
- **Objetivo atómico:** completar «Crear un registro de consultas Context7 y decisiones técnicas» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-012 — Definir cuándo usar navegador, Playwright, búsqueda de repositorio y GitHub read-only
- **Objetivo atómico:** completar «Definir cuándo usar navegador, Playwright, búsqueda de repositorio y GitHub read-only» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
node --version && npm --version
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 03 — MAPA ARQUITECTÓNICO REAL
**Objetivo de fase:** Documentar el sistema actual y las relaciones entre workspaces antes de refactorizar.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-013 — Mapear exports públicos y dependencias de shared-types, domain y config
- **Objetivo atómico:** completar «Mapear exports públicos y dependencias de shared-types, domain y config» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-014 — Mapear módulos, routes, controllers, services, models y adapters backend
- **Objetivo atómico:** completar «Mapear módulos, routes, controllers, services, models y adapters backend» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-015 — Mapear App Router, layouts, pages, modules, hooks, query keys y componentes frontend
- **Objetivo atómico:** completar «Mapear App Router, layouts, pages, modules, hooks, query keys y componentes frontend» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-016 — Construir una matriz route-to-contract-to-service-to-model-to-test
- **Objetivo atómico:** completar «Construir una matriz route-to-contract-to-service-to-model-to-test» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm ls --workspaces --depth=0
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 04 — BASELINE DE QUALITY GATES
**Objetivo de fase:** Reproducir el estado real sin atribuir fallos al caché.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-017 — Ejecutar typecheck global y guardar salida completa
- **Objetivo atómico:** completar «Ejecutar typecheck global y guardar salida completa» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-018 — Ejecutar lint global y clasificar errores y warnings
- **Objetivo atómico:** completar «Ejecutar lint global y clasificar errores y warnings» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-019 — Ejecutar build global y registrar workspace y etapa que falla
- **Objetivo atómico:** completar «Ejecutar build global y registrar workspace y etapa que falla» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-020 — Ejecutar verify global y agrupar fallos por causa raíz
- **Objetivo atómico:** completar «Ejecutar verify global y agrupar fallos por causa raíz» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run typecheck; npm run lint; npm run build; npm run verify
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 05 — TRIAGE DE PRUEBAS Y ASINCRONÍA
**Objetivo de fase:** Corregir suites rotas sin aumentar timeouts para ocultar promesas pendientes.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-021 — Agrupar fallos Vitest por importación, mocks, timers, queries, transacciones y assertions
- **Objetivo atómico:** completar «Agrupar fallos Vitest por importación, mocks, timers, queries, transacciones y assertions» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-022 — Corregir mocks de Mongoose encadenables incluyendo lean, session, select, populate y exec
- **Objetivo atómico:** completar «Corregir mocks de Mongoose encadenables incluyendo lean, session, select, populate y exec» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-023 — Detectar recursos asíncronos filtrados y promesas no resueltas
- **Objetivo atómico:** completar «Detectar recursos asíncronos filtrados y promesas no resueltas» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-024 — Estabilizar setup, teardown, restoreAllMocks y aislamiento de módulos
- **Objetivo atómico:** completar «Estabilizar setup, teardown, restoreAllMocks y aislamiento de módulos» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend && npm run test -w @cermont/frontend
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 06 — SHARED TYPES Y EXPORTS PÚBLICOS
**Objetivo de fase:** Restaurar la fuente única de verdad contractual.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-025 — Auditar schemas duplicados, enums divergentes y exports faltantes
- **Objetivo atómico:** completar «Auditar schemas duplicados, enums divergentes y exports faltantes» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-026 — Alinear contratos de dashboard, pagos, propuestas, Service Case y planning
- **Objetivo atómico:** completar «Alinear contratos de dashboard, pagos, propuestas, Service Case y planning» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-027 — Centralizar roles, permisos, estados, labels y errores tipados
- **Objetivo atómico:** completar «Centralizar roles, permisos, estados, labels y errores tipados» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-028 — Actualizar contract snapshots únicamente después de revisar el diff
- **Objetivo atómico:** completar «Actualizar contract snapshots únicamente después de revisar el diff» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run typecheck -w @cermont/shared-types && npm run lint -w @cermont/shared-types && npm run test -w @cermont/shared-types && npm run build -w @cermont/shared-types
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 07 — DOMINIO Y FSM DE CATORCE PASOS
**Objetivo de fase:** Consolidar reglas puras, transiciones, blockers y artifacts.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-029 — Definir catálogo canónico de los catorce pasos y grupos de etapas
- **Objetivo atómico:** completar «Definir catálogo canónico de los catorce pasos y grupos de etapas» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-030 — Definir transiciones válidas, inválidas, reversas y excepcionales
- **Objetivo atómico:** completar «Definir transiciones válidas, inválidas, reversas y excepcionales» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-031 — Definir readiness y blockers documentales por etapa
- **Objetivo atómico:** completar «Definir readiness y blockers documentales por etapa» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-032 — Probar exhaustividad de estados, roles y transiciones
- **Objetivo atómico:** completar «Probar exhaustividad de estados, roles y transiciones» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run typecheck -w @cermont/domain && npm run lint -w @cermont/domain && npm run test -w @cermont/domain && npm run build -w @cermont/domain
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 08 — PERSISTENCIA MONGOOSE
**Objetivo de fase:** Alinear modelos, índices y mappers con los contratos vigentes.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-033 — Auditar enums, required fields, defaults, ObjectIds, timestamps e índices
- **Objetivo atómico:** completar «Auditar enums, required fields, defaults, ObjectIds, timestamps e índices» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-034 — Crear mappers DTO-domain-persistence para payloads complejos
- **Objetivo atómico:** completar «Crear mappers DTO-domain-persistence para payloads complejos» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-035 — Corregir overloads de create, insertOne, lean, transforms y sesiones
- **Objetivo atómico:** completar «Corregir overloads de create, insertOne, lean, transforms y sesiones» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-036 — Probar datos legacy y migraciones hacia adelante sin borrar registros
- **Objetivo atómico:** completar «Probar datos legacy y migraciones hacia adelante sin borrar registros» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run typecheck -w @cermont/backend
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 09 — INFRAESTRUCTURA BACKEND COMÚN
**Objetivo de fase:** Madurar errores, envelopes, validación, auditoría y adapters.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-037 — Unificar middleware global de errores compatible con Express 5
- **Objetivo atómico:** completar «Unificar middleware global de errores compatible con Express 5» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-038 — Unificar validación de params, query, body y respuesta
- **Objetivo atómico:** completar «Unificar validación de params, query, body y respuesta» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-039 — Unificar API envelope, pagination, typed errors y request IDs
- **Objetivo atómico:** completar «Unificar API envelope, pagination, typed errors y request IDs» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-040 — Crear seams testables para transacciones, colas e integraciones externas
- **Objetivo atómico:** completar «Crear seams testables para transacciones, colas e integraciones externas» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- --run
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 10 — INFRAESTRUCTURA FRONTEND COMÚN
**Objetivo de fase:** Consolidar API client, query factories, boundaries y estados.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-041 — Auditar apiClient, autenticación, refresh, cookies y manejo de 401
- **Objetivo atómico:** completar «Auditar apiClient, autenticación, refresh, cookies y manejo de 401» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-042 — Centralizar query key factories e invalidaciones cruzadas
- **Objetivo atómico:** completar «Centralizar query key factories e invalidaciones cruzadas» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-043 — Consolidar AsyncStateBoundary, ErrorState, EmptyState, OfflineState y ForbiddenState
- **Objetivo atómico:** completar «Consolidar AsyncStateBoundary, ErrorState, EmptyState, OfflineState y ForbiddenState» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-044 — Reducir fronteras use client y corregir Suspense y App Router
- **Objetivo atómico:** completar «Reducir fronteras use client y corregir Suspense y App Router» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run typecheck -w @cermont/frontend && npm run lint -w @cermont/frontend
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 11 — AUTENTICACIÓN, SESIONES, WEBAUTHN Y RBAC
**Objetivo de fase:** Dejar la seguridad de acceso funcional y coherente en todas las capas.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-045 — Corregir login, refresh, logout, revocación y expiración de sesiones
- **Objetivo atómico:** completar «Corregir login, refresh, logout, revocación y expiración de sesiones» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-046 — Alinear AuditAction para eventos de sesión y WebAuthn
- **Objetivo atómico:** completar «Alinear AuditAction para eventos de sesión y WebAuthn» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-047 — Verificar RBAC en backend, proxy, navegación y acciones UI
- **Objetivo atómico:** completar «Verificar RBAC en backend, proxy, navegación y acciones UI» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-048 — Probar IDOR, usuario inactivo, sesión revocada y mensajes en español
- **Objetivo atómico:** completar «Probar IDOR, usuario inactivo, sesión revocada y mensajes en español» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- auth && npm run test -w @cermont/frontend -- auth
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 12 — CLIENTES, SEDES Y CONTACTOS
**Objetivo de fase:** Eliminar fricción de IDs y completar la base comercial.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-049 — Auditar CRUD de clientes, sedes, contactos y relaciones
- **Objetivo atómico:** completar «Auditar CRUD de clientes, sedes, contactos y relaciones» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-050 — Implementar selección humana sin exponer ObjectIds
- **Objetivo atómico:** completar «Implementar selección humana sin exponer ObjectIds» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-051 — Corregir caso sin sede definida y validaciones específicas
- **Objetivo atómico:** completar «Corregir caso sin sede definida y validaciones específicas» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-052 — Probar filtros, paginación, permisos y estados vacíos
- **Objetivo atómico:** completar «Probar filtros, paginación, permisos y estados vacíos» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/frontend -- customers && npm run test -w @cermont/backend -- client
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 13 — WORK REQUESTS
**Objetivo de fase:** Completar el paso 1 desde formulario hasta Service Case y dashboard.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-053 — Corregir formulario de creación, validación visible, submit y redirección
- **Objetivo atómico:** completar «Corregir formulario de creación, validación visible, submit y redirección» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-054 — Corregir retry controlado y primer render del listado
- **Objetivo atómico:** completar «Corregir retry controlado y primer render del listado» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-055 — Alinear estados, labels en español y CTA principal
- **Objetivo atómico:** completar «Alinear estados, labels en español y CTA principal» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-056 — Corregir invalidación de Work Requests y Service Cases
- **Objetivo atómico:** completar «Corregir invalidación de Work Requests y Service Cases» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- work-request && npm run test -w @cermont/frontend -- work-request
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 14 — SITE VISITS
**Objetivo de fase:** Completar el paso 2 opcional con mediciones, fotos y decisión trazable.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-057 — Definir cuándo la visita es requerida, omitida o completada
- **Objetivo atómico:** completar «Definir cuándo la visita es requerida, omitida o completada» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-058 — Alinear agenda, responsables, sede, mediciones y artifacts
- **Objetivo atómico:** completar «Alinear agenda, responsables, sede, mediciones y artifacts» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-059 — Conectar visita con Work Request, Proposal y Service Case
- **Objetivo atómico:** completar «Conectar visita con Work Request, Proposal y Service Case» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-060 — Probar transición con visita requerida y no requerida
- **Objetivo atómico:** completar «Probar transición con visita requerida y no requerida» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- site-visit && npm run test -w @cermont/frontend -- site-visit
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 15 — PROPUESTAS Y COSTEO COMERCIAL
**Objetivo de fase:** Completar el paso 3 y su vínculo con costos, PDF y Service Case.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-061 — Alinear estados draft, sent, approved, rejected, expired y converted
- **Objetivo atómico:** completar «Alinear estados draft, sent, approved, rejected, expired y converted» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-062 — Corregir creación, cálculo, impuestos, items y generación PDF
- **Objetivo atómico:** completar «Corregir creación, cálculo, impuestos, items y generación PDF» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-063 — Actualizar artifacts del Service Case de forma idempotente
- **Objetivo atómico:** completar «Actualizar artifacts del Service Case de forma idempotente» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-064 — Corregir query key de detalle e invalidaciones posteriores
- **Objetivo atómico:** completar «Corregir query key de detalle e invalidaciones posteriores» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- proposal && npm run test -w @cermont/frontend -- proposal
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 16 — PURCHASE ORDER Y CONVERSIÓN
**Objetivo de fase:** Completar el paso 4 sin conversiones duplicadas.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-065 — Validar PO, número, cliente, propuesta aprobada y soporte
- **Objetivo atómico:** completar «Validar PO, número, cliente, propuesta aprobada y soporte» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-066 — Hacer idempotente la conversión de Proposal a Purchase Order
- **Objetivo atómico:** completar «Hacer idempotente la conversión de Proposal a Purchase Order» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-067 — Crear o vincular Work Order y Service Case según contrato canónico
- **Objetivo atómico:** completar «Crear o vincular Work Order y Service Case según contrato canónico» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-068 — Probar reintentos, duplicados, permisos y auditoría
- **Objetivo atómico:** completar «Probar reintentos, duplicados, permisos y auditoría» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- purchase-order
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 17 — SERVICE CASE Y COCKPIT
**Objetivo de fase:** Convertir el cockpit en la vista transversal confiable del proceso.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-069 — Consolidar summary, stage groups, artifacts, blockers y next action
- **Objetivo atómico:** completar «Consolidar summary, stage groups, artifacts, blockers y next action» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-070 — Implementar endpoint de propuesta vinculada y consumidores
- **Objetivo atómico:** completar «Implementar endpoint de propuesta vinculada y consumidores» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-071 — Alinear timeline desktop, móvil, estados y etiquetas en español
- **Objetivo atómico:** completar «Alinear timeline desktop, móvil, estados y etiquetas en español» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-072 — Probar proyección completa después de cada mutación crítica
- **Objetivo atómico:** completar «Probar proyección completa después de cada mutación crítica» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- service-case && npm run test -w @cermont/frontend -- service-case
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 18 — PLANEACIÓN, KITS Y SEGURIDAD
**Objetivo de fase:** Resolver la falla crítica de herramientas, personal, certificaciones y documentos.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-073 — Alinear businessUnit canónica y normalización legacy
- **Objetivo atómico:** completar «Alinear businessUnit canónica y normalización legacy» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-074 — Completar cronograma, mano de obra, herramientas, equipos y consumibles
- **Objetivo atómico:** completar «Completar cronograma, mano de obra, herramientas, equipos y consumibles» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-075 — Verificar certificaciones, AST, permisos y documentos de apoyo
- **Objetivo atómico:** completar «Verificar certificaciones, AST, permisos y documentos de apoyo» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-076 — Implementar readiness y bloqueo de ejecución hasta aprobación
- **Objetivo atómico:** completar «Implementar readiness y bloqueo de ejecución hasta aprobación» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- planning && npm run test -w @cermont/frontend -- planning
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 19 — EJECUCIÓN EN CAMPO Y OFFLINE
**Objetivo de fase:** Hacer confiable la captura de campo con conectividad variable.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-077 — Completar apertura, pausa, reanudación y cierre de ExecutionSession
- **Objetivo atómico:** completar «Completar apertura, pausa, reanudación y cierre de ExecutionSession» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-078 — Conectar checklists, AST, permisos, recursos y evidencias
- **Objetivo atómico:** completar «Conectar checklists, AST, permisos, recursos y evidencias» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-079 — Persistir mutaciones offline con idempotencia y blobs
- **Objetivo atómico:** completar «Persistir mutaciones offline con idempotencia y blobs» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-080 — Probar reconexión, conflicto, DLQ y orden de sincronización
- **Objetivo atómico:** completar «Probar reconexión, conflicto, DLQ y orden de sincronización» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- execution && npm run test -w @cermont/frontend -- execution
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 20 — EVIDENCIAS, ARCHIVOS Y FIRMAS
**Objetivo de fase:** Madurar el ciclo de evidencia desde captura hasta verificación.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-081 — Alinear FileAsset, Evidence, metadata, geolocalización y etapas
- **Objetivo atómico:** completar «Alinear FileAsset, Evidence, metadata, geolocalización y etapas» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-082 — Completar verify, reject, replace, before-after y gallery
- **Objetivo atómico:** completar «Completar verify, reject, replace, before-after y gallery» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-083 — Validar MIME, magic bytes, tamaño, permisos y acceso
- **Objetivo atómico:** completar «Validar MIME, magic bytes, tamaño, permisos y acceso» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-084 — Completar cámara, lightbox, progreso y badges offline
- **Objetivo atómico:** completar «Completar cámara, lightbox, progreso y badges offline» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- evidence && npm run test -w @cermont/frontend -- evidence
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 21 — INFORMES, DOCUMENTOS Y PLANTILLAS DINÁMICAS
**Objetivo de fase:** Reducir recaptura y convertir formatos empresariales en artefactos versionados.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-085 — Completar Technical Report con datos y evidencias existentes
- **Objetivo atómico:** completar «Completar Technical Report con datos y evidencias existentes» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-086 — Alinear pdf-lib, templates, versionado y manifests
- **Objetivo atómico:** completar «Alinear pdf-lib, templates, versionado y manifests» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-087 — Implementar formularios dinámicos desde schemas revisados
- **Objetivo atómico:** completar «Implementar formularios dinámicos desde schemas revisados» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-088 — Crear flujo de importación, revisión humana, publicación y retiro de plantilla
- **Objetivo atómico:** completar «Crear flujo de importación, revisión humana, publicación y retiro de plantilla» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- document && npm run test -w @cermont/frontend -- reports
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 22 — ACTA Y ACEPTACIÓN DEL CLIENTE
**Objetivo de fase:** Completar pasos 8 y 9 con firma y evidencia de aceptación.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-089 — Generar Delivery Record con datos consolidados
- **Objetivo atómico:** completar «Generar Delivery Record con datos consolidados» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-090 — Implementar envío, revisión, rechazo, corrección y firma
- **Objetivo atómico:** completar «Implementar envío, revisión, rechazo, corrección y firma» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-091 — Validar identidad, timestamp, hash y soporte de aceptación
- **Objetivo atómico:** completar «Validar identidad, timestamp, hash y soporte de aceptación» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-092 — Actualizar cockpit y artifacts de forma idempotente
- **Objetivo atómico:** completar «Actualizar cockpit y artifacts de forma idempotente» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- delivery
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 23 — SES, FACTURAS, PAGOS Y CIERRE
**Objetivo de fase:** Completar la cadena administrativa con reglas estrictas.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-093 — Completar Service Entry Sheet y aprobación de SES
- **Objetivo atómico:** completar «Completar Service Entry Sheet y aprobación de SES» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-094 — Bloquear factura cuando SES no esté aprobada
- **Objetivo atómico:** completar «Bloquear factura cuando SES no esté aprobada» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-095 — Persistir approvedBy, fechas, referencias y auditoría
- **Objetivo atómico:** completar «Persistir approvedBy, fechas, referencias y auditoría» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-096 — Hacer idempotente el pago y ejecutar cierre definitivo
- **Objetivo atómico:** completar «Hacer idempotente el pago y ejecutar cierre definitivo» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- payment && npm run test -w @cermont/frontend -- billing
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 24 — MOTOR DE COSTOS
**Objetivo de fase:** Comparar propuesta, presupuesto y costos reales con semántica correcta.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-097 — Definir categorías, baseline, actuals, taxes y variance
- **Objetivo atómico:** completar «Definir categorías, baseline, actuals, taxes y variance» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-098 — Distinguir cero real de dato no disponible
- **Objetivo atómico:** completar «Distinguir cero real de dato no disponible» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-099 — Unificar cálculos de dashboard y detalle
- **Objetivo atómico:** completar «Unificar cálculos de dashboard y detalle» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-100 — Probar agregaciones, moneda, periodos y exportación
- **Objetivo atómico:** completar «Probar agregaciones, moneda, periodos y exportación» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- cost && npm run test -w @cermont/frontend -- cost
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 25 — RECURSOS, INVENTARIO, HERRAMIENTAS, FLOTA Y ACTIVOS
**Objetivo de fase:** Integrar disponibilidad, documentos y mantenimiento.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-101 — Completar catálogos y asignaciones a planeación y ejecución
- **Objetivo atómico:** completar «Completar catálogos y asignaciones a planeación y ejecución» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-102 — Completar check-in/out, disponibilidad y trazabilidad
- **Objetivo atómico:** completar «Completar check-in/out, disponibilidad y trazabilidad» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-103 — Completar certificaciones, calibraciones y alertas documentales
- **Objetivo atómico:** completar «Completar certificaciones, calibraciones y alertas documentales» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-104 — Conectar historial de intervenciones, costos y órdenes
- **Objetivo atómico:** completar «Conectar historial de intervenciones, costos y órdenes» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- fleet && npm run test -w @cermont/frontend -- fleet
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 26 — DASHBOARD, SLA, DISPATCH Y ANALÍTICA
**Objetivo de fase:** Convertir datos reales en control operativo explicable.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-105 — Unificar KPIs, fórmulas, periodos y estados de disponibilidad
- **Objetivo atómico:** completar «Unificar KPIs, fórmulas, periodos y estados de disponibilidad» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-106 — Conectar flujo de catorce pasos, costos, SLA y actividad
- **Objetivo atómico:** completar «Conectar flujo de catorce pasos, costos, SLA y actividad» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-107 — Completar dispatch, rutas, técnicos y readiness
- **Objetivo atómico:** completar «Completar dispatch, rutas, técnicos y readiness» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-108 — Evitar métricas inventadas y documentar limitaciones
- **Objetivo atómico:** completar «Evitar métricas inventadas y documentar limitaciones» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- dashboard && npm run test -w @cermont/frontend -- dashboard
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 27 — PORTAL CLIENTE Y NOTIFICACIONES
**Objetivo de fase:** Dar autoservicio seguro sin exponer información de otros clientes.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-109 — Completar dashboard, órdenes, documentos y propuestas del cliente
- **Objetivo atómico:** completar «Completar dashboard, órdenes, documentos y propuestas del cliente» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-110 — Filtrar siempre por clientId derivado de identidad autorizada
- **Objetivo atómico:** completar «Filtrar siempre por clientId derivado de identidad autorizada» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-111 — Implementar notificaciones por eventos, vencimientos y bloqueos
- **Objetivo atómico:** completar «Implementar notificaciones por eventos, vencimientos y bloqueos» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-112 — Probar permisos, deep links, preferencias y estado leído
- **Objetivo atómico:** completar «Probar permisos, deep links, preferencias y estado leído» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- portal && npm run test -w @cermont/frontend -- portal
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 28 — AI, ERP, DIAN Y ADAPTERS
**Objetivo de fase:** Madurar integraciones sin fingir servicios externos.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-113 — Encapsular Cermont AI detrás de un adapter con degradación segura
- **Objetivo atómico:** completar «Encapsular Cermont AI detrás de un adapter con degradación segura» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-114 — Implementar revisión humana, trazabilidad y límites de datos
- **Objetivo atómico:** completar «Implementar revisión humana, trazabilidad y límites de datos» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-115 — Completar contratos de ERP, Ariba y DIAN con estados explícitos
- **Objetivo atómico:** completar «Completar contratos de ERP, Ariba y DIAN con estados explícitos» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-116 — Probar sandbox, errores, reintentos y circuit breaker
- **Objetivo atómico:** completar «Probar sandbox, errores, reintentos y circuit breaker» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- ai
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 29 — BACKUPS, ARCHIVO E HISTÓRICOS
**Objetivo de fase:** Garantizar continuidad, auditoría y rendimiento a largo plazo.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-117 — Auditar backups, retención, cifrado, restore drills y permisos
- **Objetivo atómico:** completar «Auditar backups, retención, cifrado, restore drills y permisos» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-118 — Diseñar archivado mensual sin mover datos prematuramente
- **Objetivo atómico:** completar «Diseñar archivado mensual sin mover datos prematuramente» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-119 — Implementar consulta histórica y export CSV/ZIP con manifiesto
- **Objetivo atómico:** completar «Implementar consulta histórica y export CSV/ZIP con manifiesto» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-120 — Probar integridad, filtros, límites y recuperación
- **Objetivo atómico:** completar «Probar integridad, filtros, límites y recuperación» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- backup
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 30 — DESIGN SYSTEM, UX, ACCESIBILIDAD E I18N
**Objetivo de fase:** Conservar la interfaz avanzada y eliminar inconsistencias.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-121 — Auditar tokens, dark/light, ThemeProvider y contraste
- **Objetivo atómico:** completar «Auditar tokens, dark/light, ThemeProvider y contraste» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-122 — Consolidar componentes compartidos sin recrear landing o dashboard
- **Objetivo atómico:** completar «Consolidar componentes compartidos sin recrear landing o dashboard» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-123 — Traducir estados, errores y documentos mediante mapas centralizados
- **Objetivo atómico:** completar «Traducir estados, errores y documentos mediante mapas centralizados» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-124 — Verificar móvil, teclado, focus, reduced motion y touch targets
- **Objetivo atómico:** completar «Verificar móvil, teclado, focus, reduced motion y touch targets» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run lint -w @cermont/frontend && npm run test -w @cermont/frontend
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 31 — PERFORMANCE Y ESCALABILIDAD
**Objetivo de fase:** Medir antes de optimizar y proteger rutas críticas.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-125 — Medir bundles, chunks, requests, imágenes y tiempos
- **Objetivo atómico:** completar «Medir bundles, chunks, requests, imágenes y tiempos» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-126 — Aplicar lazy loading solo a componentes pesados no críticos
- **Objetivo atómico:** completar «Aplicar lazy loading solo a componentes pesados no críticos» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-127 — Aplicar virtualización solo a listas con volumen comprobado
- **Objetivo atómico:** completar «Aplicar virtualización solo a listas con volumen comprobado» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-128 — Optimizar índices, paginación, caché y consultas N+1
- **Objetivo atómico:** completar «Optimizar índices, paginación, caché y consultas N+1» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run build -w @cermont/frontend && npm run build -w @cermont/backend
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 32 — OBSERVABILIDAD Y AUDITORÍA
**Objetivo de fase:** Hacer diagnósticos reproducibles en desarrollo y producción.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-129 — Unificar logger estructurado y eliminar console productivo
- **Objetivo atómico:** completar «Unificar logger estructurado y eliminar console productivo» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-130 — Propagar requestId y actor en operaciones críticas
- **Objetivo atómico:** completar «Propagar requestId y actor en operaciones críticas» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-131 — Completar health, readiness, métricas y alertas
- **Objetivo atómico:** completar «Completar health, readiness, métricas y alertas» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-132 — Auditar los catorce pasos, overrides y cambios administrativos
- **Objetivo atómico:** completar «Auditar los catorce pasos, overrides y cambios administrativos» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- logger
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 33 — HARDENING DE SEGURIDAD
**Objetivo de fase:** Validar controles más allá de la interfaz.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-133 — Probar auth, RBAC, IDOR, CORS, CSRF y rate limiting
- **Objetivo atómico:** completar «Probar auth, RBAC, IDOR, CORS, CSRF y rate limiting» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-134 — Probar uploads, MIME, path traversal y acceso a archivos
- **Objetivo atómico:** completar «Probar uploads, MIME, path traversal y acceso a archivos» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-135 — Revisar secrets, logs, headers y dependencias
- **Objetivo atómico:** completar «Revisar secrets, logs, headers y dependencias» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-136 — Implementar pruebas negativas de endpoints críticos
- **Objetivo atómico:** completar «Implementar pruebas negativas de endpoints críticos» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test -w @cermont/backend -- security
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 34 — PIRÁMIDE DE PRUEBAS
**Objetivo de fase:** Mantener cobertura útil y evitar suites frágiles.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-137 — Separar unit, domain, service, controller, route, integration y E2E
- **Objetivo atómico:** completar «Separar unit, domain, service, controller, route, integration y E2E» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-138 — Crear factories tipadas y builders de dominio
- **Objetivo atómico:** completar «Crear factories tipadas y builders de dominio» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-139 — Eliminar dependencia de orden y estado compartido
- **Objetivo atómico:** completar «Eliminar dependencia de orden y estado compartido» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-140 — Agregar cobertura a bugs corregidos y reglas críticas
- **Objetivo atómico:** completar «Agregar cobertura a bugs corregidos y reglas críticas» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 35 — PLAYWRIGHT Y VERIFICACIÓN VISUAL
**Objetivo de fase:** Validar los flujos reales por rol y dispositivo.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-141 — Consolidar fixtures de autenticación por rol
- **Objetivo atómico:** completar «Consolidar fixtures de autenticación por rol» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-142 — Cubrir rutas, estados, formularios y RBAC
- **Objetivo atómico:** completar «Cubrir rutas, estados, formularios y RBAC» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-143 — Cubrir flujo de catorce pasos y cortes offline
- **Objetivo atómico:** completar «Cubrir flujo de catorce pasos y cortes offline» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-144 — Capturar trace, screenshot y video solo cuando aporten diagnóstico
- **Objetivo atómico:** completar «Capturar trace, screenshot y video solo cuando aporten diagnóstico» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run test:e2e
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 36 — CI, BUILD Y DESPLIEGUE
**Objetivo de fase:** Garantizar que la calidad local sea reproducible.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-145 — Alinear versiones de Node y npm con engines
- **Objetivo atómico:** completar «Alinear versiones de Node y npm con engines» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-146 — Validar Turbo tasks, outputs y dependencias
- **Objetivo atómico:** completar «Validar Turbo tasks, outputs y dependencias» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-147 — Validar variables, Docker o PM2 sin exponer secretos
- **Objetivo atómico:** completar «Validar variables, Docker o PM2 sin exponer secretos» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-148 — Documentar rollback operativo sin ejecutar Git
- **Objetivo atómico:** completar «Documentar rollback operativo sin ejecutar Git» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run build && npm run verify
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 37 — VERIFICACIÓN FINAL EN ORDEN
**Objetivo de fase:** Ejecutar todos los gates desde un estado estable.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-149 — Ejecutar typecheck global sin caché engañoso
- **Objetivo atómico:** completar «Ejecutar typecheck global sin caché engañoso» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-150 — Ejecutar lint global con cero warnings
- **Objetivo atómico:** completar «Ejecutar lint global con cero warnings» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-151 — Ejecutar build global y revisar todas las rutas
- **Objetivo atómico:** completar «Ejecutar build global y revisar todas las rutas» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-152 — Ejecutar verify, contracts, quality strict y E2E
- **Objetivo atómico:** completar «Ejecutar verify, contracts, quality strict y E2E» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
npm run typecheck && npm run lint && npm run build && npm run verify
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## FASE 38 — REPORTE, TRAZABILIDAD Y CONTINUIDAD
**Objetivo de fase:** Entregar evidencia honesta y una base mantenible.
**Regla de fase:** no iniciar tareas dependientes hasta verificar la tarea anterior o documentar el bloqueo externo.
**Salida de fase:** código, pruebas, evidencia y registro de progreso coherentes.

### T-153 — Crear tabla de issues, causas, soluciones, pruebas y estado
- **Objetivo atómico:** completar «Crear tabla de issues, causas, soluciones, pruebas y estado» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-154 — Crear tabla de módulos y madurez inicial/final
- **Objetivo atómico:** completar «Crear tabla de módulos y madurez inicial/final» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-155 — Registrar archivos modificados y backups asociados
- **Objetivo atómico:** completar «Registrar archivos modificados y backups asociados» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

### T-156 — Documentar deuda real, bloqueos externos y siguiente evolución
- **Objetivo atómico:** completar «Documentar deuda real, bloqueos externos y siguiente evolución» sin mezclar responsabilidades ajenas a esta tarea.
- **Preservación:** ejecutar `backup_file` para cada archivo existente que vaya a modificarse.
- **Implementación:** realizar el cambio mínimo que complete el corte, sin borrar funcionalidad parcial.
- **Pruebas:** añadir o ajustar una prueba que falle antes de la corrección y pase después.
- **Validación local:** ejecutar primero el archivo de prueba específico y luego el gate del workspace.

#### Gate obligatorio de fase
Ejecuta en Bash:
```bash
test -s "$PROGRESS_FILE"
```
Si falla, aísla el primer error real, corrígelo y repite el gate.
No preguntes al usuario si debes continuar.

## 39. PROTOCOLO DE DEBUG POR CAUSA RAÍZ

Para cada fallo, crea un Issue ID.
Clasifica el fallo como:
- formatting.
- contract.
- typing.
- domain.
- persistence.
- backend.
- frontend.
- integration.
- async.
- test.
- build.
- configuration.
- offline.
- security.
- performance.
Ejecuta una reproducción mínima.
No corrijas síntomas derivados antes de la causa primaria.
Busca todas las definiciones con `rg`.
Busca todos los consumidores con `rg`.
Busca archivos relacionados por nombre y export.
Comprueba si la prueba representa el requisito vigente.
Corrige producción cuando la prueba es correcta.
Corrige la prueba cuando quedó desactualizada por un cambio contractual legítimo.
Nunca cambies producción y prueba simultáneamente sin poder explicar qué contrato prevalece.
No aumentes `testTimeout` hasta descartar promesa no resuelta, timer, queue, conexión, sesión o callback faltante.
Usa detectores de leaks de Vitest cuando estén disponibles y sean compatibles.
Restaura mocks y timers en teardown.
No compartas modelos mutables entre tests.
No ejecutes servicios externos reales en unit tests.
No uses una base productiva en pruebas.
Registra el primer stack trace útil, no solo el último error de Turbo.

## 40. PROTOCOLO DE FORMATO Y LINT

No cambies la configuración de Biome para aceptar código defectuoso.
Formatea únicamente archivos modificados durante el ciclo:
```bash
npx biome check --write path/to/file.ts path/to/file.tsx
```
Después ejecuta el lint del workspace.
Corrige todas las non-null assertions evitables.
Corrige imports no usados.
Corrige promesas no manejadas.
Corrige dependencias de hooks.
No introduzcas suppressions.
El gate final requiere cero warnings del código y pruebas intervenidas.

## 41. PROTOCOLO DE TYPECHECK

Ejecuta typecheck por workspace en orden de dependencia:
```bash
npm run typecheck -w @cermont/shared-types
npm run typecheck -w @cermont/domain
npm run typecheck -w @cermont/config
npm run typecheck -w @cermont/backend
npm run typecheck -w @cermont/frontend
```
Cuando un error aparece en backend y proviene de shared-types, corrige shared-types primero.
Cuando Mongoose infiere `never`, corrige el payload o modelo antes de tocar propiedades derivadas.
No uses casts para silenciar overloads.
No exportes tipos internos de persistencia a frontend.
No introduzcas null o undefined como estados de negocio.
Usa discriminated unions o DomainValue cuando corresponda.

## 42. PROTOCOLO DE BUILD

Ejecuta build por dependencias.
No desactives TypeScript en Next.
No ignores errores de build.
No atribuyas una versión visual antigua al caché sin verificar ruta del proceso, carpeta, build y service worker.
No borres cachés como primera solución.
Si sospechas un proceso que sirve otro checkout, inspecciona procesos con herramientas Bash compatibles sin matar procesos indiscriminadamente.
Verifica landing, login, dashboard, cockpit y rutas críticas después del build.

## 43. PROTOCOLO DE VERIFY

No alteres el script `verify` para saltar etapas.
Ejecuta cada subcomando aislado cuando falle.
Corrige el subcomando.
Vuelve a ejecutar `verify` desde el inicio.
No declares éxito por pasar typecheck, lint y build si tests o contracts fallan.
Registra duración, workspace y número de pruebas.
Diferencia flaky de determinista.
Una prueba flaky sigue siendo un fallo.

## 44. CRITERIOS POR PÁGINA

Cada página crítica debe tener:
- loading.
- error.
- empty.
- offline.
- forbidden.
- success.
- responsive.
- accessible name.
- primary action autorizada.
- secondary action.
- retry seguro.
- query key estable.
- mutación con feedback.
- invalidación correcta.
- traducción al español.
No muestres una página vacía.
No muestres un CTA sin permiso.
No muestres ObjectIds como selección primaria.
No muestres codes técnicos como label.

## 45. CRITERIOS POR ENDPOINT

Cada endpoint crítico debe tener:
- schema de params.
- schema de query.
- schema de body.
- autenticación.
- autorización.
- validación de ownership.
- service sin Request/Response.
- error tipado.
- audit event.
- idempotencia cuando aplique.
- respuesta validable.
- prueba positiva.
- prueba negativa.
- prueba de permiso.
- prueba de dato inválido.
- prueba de recurso inexistente.

## 46. CRITERIOS OFFLINE POR MUTACIÓN

Cada mutación offline debe definir:
- entidad.
- operación.
- payload versionado.
- clientMutationId.
- idempotencyKey.
- createdAt.
- retries.
- nextRetryAt.
- dependency IDs.
- blob references.
- sync status.
- error code.
- conflict payload.
- resolution strategy.
- audit link.
No sincronices una mutación dependiente antes de su padre.
No pierdas la relación entre evidencia y ejecución.
No almacenes secretos en IndexedDB.

## 47. CRITERIOS DE KPIS

Cada KPI debe incluir:
- nombre.
- definición.
- fórmula.
- periodo.
- población.
- fuente.
- timezone.
- estado de disponibilidad.
- valor actual.
- valor anterior cuando exista.
- delta calculado.
- limitaciones.
- enlace al detalle.
Distingue `0` de `not_available`.
No presentes estimación como medición.
No presentes heurística como IA validada.

## 48. CRITERIOS DE FORMATOS DINÁMICOS

Cada plantilla debe incluir:
- templateId.
- version.
- status.
- service type.
- field schema.
- validation rules.
- layout metadata.
- approval actor.
- publishedAt.
- retiredAt.
- source document.
- checksum.
- change log.
Un formulario iniciado conserva su versión.
Una nueva versión no modifica respuestas históricas.
La extracción automática siempre pasa por revisión humana.
La generación PDF debe ser reproducible.

## 49. CRITERIOS DE AUDITORÍA

Audita:
- autenticación.
- revocación de sesión.
- cambios RBAC.
- creación y transición de cada paso.
- override administrativo.
- carga, reemplazo y rechazo de evidencia.
- publicación de plantilla.
- firma.
- aprobación SES.
- aprobación de factura.
- pago.
- cierre.
- export histórico.
- restore de backup.
No registres secretos.
No permitas editar eventos de auditoría desde UI ordinaria.

## 50. CRITERIOS DE INNOVACIÓN RESPONSABLE

Innovar significa ampliar valor sin romper el proceso.
Prioriza:
- configuración por plantillas.
- recomendaciones explicables.
- prevención de omisiones.
- alertas proactivas.
- búsqueda documental.
- autoservicio cliente.
- optimización de despacho.
- disponibilidad de recursos.
- análisis de desviaciones.
- historial de activos.
- integración mediante adapters.
No agregues una feature porque sea popular.
Cada innovación necesita requisito, actor, dato, riesgo, métrica y prueba.
Toda AI requiere revisión humana y fallback.

## 51. DEFINICIÓN GLOBAL DE TERMINADO

El trabajo se considera terminado solo cuando:
- Ningún documento fue borrado.
- Ningún comando Git fue ejecutado.
- Cada archivo modificado tiene respaldo.
- Los contratos tienen una fuente única.
- Los catorce pasos están conectados.
- Las reglas financieras están protegidas.
- La operación offline no pierde datos.
- RBAC se verifica en backend.
- La UI está en español y es accesible.
- Typecheck pasa.
- Lint pasa con cero warnings.
- Build pasa.
- Tests pasan.
- Verify pasa.
- Contracts check pasa.
- Quality strict pasa.
- E2E crítico pasa.
- El reporte distingue lo implementado de lo pendiente.
- Las innovaciones tienen evidencia.

## 52. FORMATO DE ACTUALIZACIÓN DURANTE LA EJECUCIÓN

Usa actualizaciones declarativas, no preguntas:
```text
Fase:
Tarea:
Causa raíz:
Archivos respaldados:
Archivos modificados:
Prueba específica:
Resultado:
Gate:
Errores restantes:
Siguiente tarea:
```
No digas “¿quieres que continúe?”.
No digas “puedo corregir lo siguiente”.
Continúa automáticamente mientras exista trabajo dentro del alcance.

## 53. FORMATO DE REPORTE FINAL

Incluye:
- Resumen ejecutivo.
- Documentos leídos.
- Context7 libraries consultadas.
- Matriz de issues.
- Matriz de módulos.
- Cambios contractuales.
- Cambios de dominio.
- Cambios de persistencia.
- Cambios backend.
- Cambios frontend.
- Cambios offline.
- Cambios de seguridad.
- Pruebas añadidas.
- Comandos ejecutados.
- Resultado real de gates.
- Backups creados.
- Riesgos pendientes.
- Bloqueos externos.
- Deuda técnica.
- Innovaciones terminadas.
- Innovaciones propuestas.
Confirma:
```text
Git commands executed: 0
Documents deleted: 0
Tests deleted: 0
Errors suppressed: 0
Unsafe casts introduced: 0
Quality gates weakened: 0
```

## 54. INSTRUCCIÓN FINAL AL MODELO PROGRAMADOR

Empieza ahora desde FASE 00.
No generes otro plan.
No resumas este archivo como respuesta principal.
No pidas aclaraciones sobre prioridad.
No uses Git.
No uses PowerShell.
Usa Bash.
Preserva cada archivo.
Lee la documentación.
Consulta Context7.
Corrige causas raíz.
Completa las implementaciones parciales.
Ejecuta los gates en orden.
Mantén arquitectura profesional.
Continúa hasta que la plataforma quede funcional, madura, escalable, innovadora y verificable.

## 55. MATRIZ GRANULAR DE ACEPTACIÓN
- [ ] AC-0001 — SharedTypes: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0002 — SharedTypes: tipo TypeScript inferido sin duplicación.
- [ ] AC-0003 — SharedTypes: regla de dominio ubicada fuera de la UI.
- [ ] AC-0004 — SharedTypes: persistencia mapeada sin casts inseguros.
- [ ] AC-0005 — SharedTypes: servicio backend cubierto por prueba.
- [ ] AC-0006 — SharedTypes: controller delgado y compatible con Express 5.
- [ ] AC-0007 — DomainFSM: route protegida por autenticación y RBAC.
- [ ] AC-0008 — DomainFSM: API frontend centralizada.
- [ ] AC-0009 — DomainFSM: query key estable e invalidación correcta.
- [ ] AC-0010 — DomainFSM: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0011 — DomainFSM: mensajes visibles en español.
- [ ] AC-0012 — DomainFSM: accesibilidad de teclado y nombre accesible.
- [ ] AC-0013 — DomainFSM: auditoría con actor, timestamp y entidad.
- [ ] AC-0014 — Config: idempotencia verificada cuando aplica.
- [ ] AC-0015 — Config: prueba negativa de autorización.
- [ ] AC-0016 — Config: prueba E2E del camino crítico.
- [ ] AC-0017 — Config: métrica o evidencia registrada en progreso.
- [ ] AC-0018 — Config: comportamiento responsive móvil y escritorio.
- [ ] AC-0019 — Config: degradación controlada ante dependencia externa.
- [ ] AC-0020 — Config: documentación de limitaciones actualizada.
- [ ] AC-0021 — Auth: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0022 — Auth: tipo TypeScript inferido sin duplicación.
- [ ] AC-0023 — Auth: regla de dominio ubicada fuera de la UI.
- [ ] AC-0024 — Auth: persistencia mapeada sin casts inseguros.
- [ ] AC-0025 — Auth: servicio backend cubierto por prueba.
- [ ] AC-0026 — Auth: controller delgado y compatible con Express 5.
- [ ] AC-0027 — Auth: route protegida por autenticación y RBAC.
- [ ] AC-0028 — WebAuthn: API frontend centralizada.
- [ ] AC-0029 — WebAuthn: query key estable e invalidación correcta.
- [ ] AC-0030 — WebAuthn: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0031 — WebAuthn: mensajes visibles en español.
- [ ] AC-0032 — WebAuthn: accesibilidad de teclado y nombre accesible.
- [ ] AC-0033 — WebAuthn: auditoría con actor, timestamp y entidad.
- [ ] AC-0034 — WebAuthn: idempotencia verificada cuando aplica.
- [ ] AC-0035 — RBAC: prueba negativa de autorización.
- [ ] AC-0036 — RBAC: prueba E2E del camino crítico.
- [ ] AC-0037 — RBAC: métrica o evidencia registrada en progreso.
- [ ] AC-0038 — RBAC: comportamiento responsive móvil y escritorio.
- [ ] AC-0039 — RBAC: degradación controlada ante dependencia externa.
- [ ] AC-0040 — RBAC: documentación de limitaciones actualizada.
- [ ] AC-0041 — Customers: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0042 — ServiceSites: tipo TypeScript inferido sin duplicación.
- [ ] AC-0043 — ServiceSites: regla de dominio ubicada fuera de la UI.
- [ ] AC-0044 — ServiceSites: persistencia mapeada sin casts inseguros.
- [ ] AC-0045 — ServiceSites: servicio backend cubierto por prueba.
- [ ] AC-0046 — ServiceSites: controller delgado y compatible con Express 5.
- [ ] AC-0047 — ServiceSites: route protegida por autenticación y RBAC.
- [ ] AC-0048 — ServiceSites: API frontend centralizada.
- [ ] AC-0049 — Contacts: query key estable e invalidación correcta.
- [ ] AC-0050 — Contacts: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0051 — Contacts: mensajes visibles en español.
- [ ] AC-0052 — Contacts: accesibilidad de teclado y nombre accesible.
- [ ] AC-0053 — Contacts: auditoría con actor, timestamp y entidad.
- [ ] AC-0054 — Contacts: idempotencia verificada cuando aplica.
- [ ] AC-0055 — Contacts: prueba negativa de autorización.
- [ ] AC-0056 — WorkRequests: prueba E2E del camino crítico.
- [ ] AC-0057 — WorkRequests: métrica o evidencia registrada en progreso.
- [ ] AC-0058 — WorkRequests: comportamiento responsive móvil y escritorio.
- [ ] AC-0059 — WorkRequests: degradación controlada ante dependencia externa.
- [ ] AC-0060 — WorkRequests: documentación de limitaciones actualizada.
- [ ] AC-0061 — SiteVisits: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0062 — SiteVisits: tipo TypeScript inferido sin duplicación.
- [ ] AC-0063 — Proposals: regla de dominio ubicada fuera de la UI.
- [ ] AC-0064 — Proposals: persistencia mapeada sin casts inseguros.
- [ ] AC-0065 — Proposals: servicio backend cubierto por prueba.
- [ ] AC-0066 — Proposals: controller delgado y compatible con Express 5.
- [ ] AC-0067 — Proposals: route protegida por autenticación y RBAC.
- [ ] AC-0068 — Proposals: API frontend centralizada.
- [ ] AC-0069 — Proposals: query key estable e invalidación correcta.
- [ ] AC-0070 — PurchaseOrders: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0071 — PurchaseOrders: mensajes visibles en español.
- [ ] AC-0072 — PurchaseOrders: accesibilidad de teclado y nombre accesible.
- [ ] AC-0073 — PurchaseOrders: auditoría con actor, timestamp y entidad.
- [ ] AC-0074 — PurchaseOrders: idempotencia verificada cuando aplica.
- [ ] AC-0075 — PurchaseOrders: prueba negativa de autorización.
- [ ] AC-0076 — PurchaseOrders: prueba E2E del camino crítico.
- [ ] AC-0077 — ServiceCases: métrica o evidencia registrada en progreso.
- [ ] AC-0078 — ServiceCases: comportamiento responsive móvil y escritorio.
- [ ] AC-0079 — ServiceCases: degradación controlada ante dependencia externa.
- [ ] AC-0080 — ServiceCases: documentación de limitaciones actualizada.
- [ ] AC-0081 — WorkOrders: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0082 — WorkOrders: tipo TypeScript inferido sin duplicación.
- [ ] AC-0083 — WorkOrders: regla de dominio ubicada fuera de la UI.
- [ ] AC-0084 — PlanningPackets: persistencia mapeada sin casts inseguros.
- [ ] AC-0085 — PlanningPackets: servicio backend cubierto por prueba.
- [ ] AC-0086 — PlanningPackets: controller delgado y compatible con Express 5.
- [ ] AC-0087 — PlanningPackets: route protegida por autenticación y RBAC.
- [ ] AC-0088 — PlanningPackets: API frontend centralizada.
- [ ] AC-0089 — PlanningPackets: query key estable e invalidación correcta.
- [ ] AC-0090 — PlanningPackets: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0091 — Kits: mensajes visibles en español.
- [ ] AC-0092 — Kits: accesibilidad de teclado y nombre accesible.
- [ ] AC-0093 — Kits: auditoría con actor, timestamp y entidad.
- [ ] AC-0094 — Kits: idempotencia verificada cuando aplica.
- [ ] AC-0095 — Kits: prueba negativa de autorización.
- [ ] AC-0096 — Kits: prueba E2E del camino crítico.
- [ ] AC-0097 — Kits: métrica o evidencia registrada en progreso.
- [ ] AC-0098 — SafetyAnalysis: comportamiento responsive móvil y escritorio.
- [ ] AC-0099 — SafetyAnalysis: degradación controlada ante dependencia externa.
- [ ] AC-0100 — SafetyAnalysis: documentación de limitaciones actualizada.
- [ ] AC-0101 — ExecutionSessions: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0102 — ExecutionSessions: tipo TypeScript inferido sin duplicación.
- [ ] AC-0103 — ExecutionSessions: regla de dominio ubicada fuera de la UI.
- [ ] AC-0104 — ExecutionSessions: persistencia mapeada sin casts inseguros.
- [ ] AC-0105 — OfflineQueue: servicio backend cubierto por prueba.
- [ ] AC-0106 — OfflineQueue: controller delgado y compatible con Express 5.
- [ ] AC-0107 — OfflineQueue: route protegida por autenticación y RBAC.
- [ ] AC-0108 — OfflineQueue: API frontend centralizada.
- [ ] AC-0109 — OfflineQueue: query key estable e invalidación correcta.
- [ ] AC-0110 — OfflineQueue: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0111 — OfflineQueue: mensajes visibles en español.
- [ ] AC-0112 — Evidences: accesibilidad de teclado y nombre accesible.
- [ ] AC-0113 — Evidences: auditoría con actor, timestamp y entidad.
- [ ] AC-0114 — Evidences: idempotencia verificada cuando aplica.
- [ ] AC-0115 — Evidences: prueba negativa de autorización.
- [ ] AC-0116 — Evidences: prueba E2E del camino crítico.
- [ ] AC-0117 — Evidences: métrica o evidencia registrada en progreso.
- [ ] AC-0118 — Evidences: comportamiento responsive móvil y escritorio.
- [ ] AC-0119 — FileAssets: degradación controlada ante dependencia externa.
- [ ] AC-0120 — FileAssets: documentación de limitaciones actualizada.
- [ ] AC-0121 — TechnicalReports: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0122 — TechnicalReports: tipo TypeScript inferido sin duplicación.
- [ ] AC-0123 — TechnicalReports: regla de dominio ubicada fuera de la UI.
- [ ] AC-0124 — TechnicalReports: persistencia mapeada sin casts inseguros.
- [ ] AC-0125 — TechnicalReports: servicio backend cubierto por prueba.
- [ ] AC-0126 — DynamicTemplates: controller delgado y compatible con Express 5.
- [ ] AC-0127 — DynamicTemplates: route protegida por autenticación y RBAC.
- [ ] AC-0128 — DynamicTemplates: API frontend centralizada.
- [ ] AC-0129 — DynamicTemplates: query key estable e invalidación correcta.
- [ ] AC-0130 — DynamicTemplates: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0131 — DynamicTemplates: mensajes visibles en español.
- [ ] AC-0132 — DynamicTemplates: accesibilidad de teclado y nombre accesible.
- [ ] AC-0133 — DeliveryRecords: auditoría con actor, timestamp y entidad.
- [ ] AC-0134 — DeliveryRecords: idempotencia verificada cuando aplica.
- [ ] AC-0135 — DeliveryRecords: prueba negativa de autorización.
- [ ] AC-0136 — DeliveryRecords: prueba E2E del camino crítico.
- [ ] AC-0137 — DeliveryRecords: métrica o evidencia registrada en progreso.
- [ ] AC-0138 — DeliveryRecords: comportamiento responsive móvil y escritorio.
- [ ] AC-0139 — DeliveryRecords: degradación controlada ante dependencia externa.
- [ ] AC-0140 — ClientAcceptance: documentación de limitaciones actualizada.
- [ ] AC-0141 — ServiceEntrySheets: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0142 — ServiceEntrySheets: tipo TypeScript inferido sin duplicación.
- [ ] AC-0143 — ServiceEntrySheets: regla de dominio ubicada fuera de la UI.
- [ ] AC-0144 — ServiceEntrySheets: persistencia mapeada sin casts inseguros.
- [ ] AC-0145 — ServiceEntrySheets: servicio backend cubierto por prueba.
- [ ] AC-0146 — ServiceEntrySheets: controller delgado y compatible con Express 5.
- [ ] AC-0147 — SESApproval: route protegida por autenticación y RBAC.
- [ ] AC-0148 — SESApproval: API frontend centralizada.
- [ ] AC-0149 — SESApproval: query key estable e invalidación correcta.
- [ ] AC-0150 — SESApproval: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0151 — SESApproval: mensajes visibles en español.
- [ ] AC-0152 — SESApproval: accesibilidad de teclado y nombre accesible.
- [ ] AC-0153 — SESApproval: auditoría con actor, timestamp y entidad.
- [ ] AC-0154 — Invoices: idempotencia verificada cuando aplica.
- [ ] AC-0155 — Invoices: prueba negativa de autorización.
- [ ] AC-0156 — Invoices: prueba E2E del camino crítico.
- [ ] AC-0157 — Invoices: métrica o evidencia registrada en progreso.
- [ ] AC-0158 — Invoices: comportamiento responsive móvil y escritorio.
- [ ] AC-0159 — Invoices: degradación controlada ante dependencia externa.
- [ ] AC-0160 — Invoices: documentación de limitaciones actualizada.
- [ ] AC-0161 — InvoiceApproval: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0162 — InvoiceApproval: tipo TypeScript inferido sin duplicación.
- [ ] AC-0163 — InvoiceApproval: regla de dominio ubicada fuera de la UI.
- [ ] AC-0164 — InvoiceApproval: persistencia mapeada sin casts inseguros.
- [ ] AC-0165 — InvoiceApproval: servicio backend cubierto por prueba.
- [ ] AC-0166 — InvoiceApproval: controller delgado y compatible con Express 5.
- [ ] AC-0167 — InvoiceApproval: route protegida por autenticación y RBAC.
- [ ] AC-0168 — Payments: API frontend centralizada.
- [ ] AC-0169 — Payments: query key estable e invalidación correcta.
- [ ] AC-0170 — Payments: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0171 — Payments: mensajes visibles en español.
- [ ] AC-0172 — Payments: accesibilidad de teclado y nombre accesible.
- [ ] AC-0173 — Payments: auditoría con actor, timestamp y entidad.
- [ ] AC-0174 — Payments: idempotencia verificada cuando aplica.
- [ ] AC-0175 — Closure: prueba negativa de autorización.
- [ ] AC-0176 — Closure: prueba E2E del camino crítico.
- [ ] AC-0177 — Closure: métrica o evidencia registrada en progreso.
- [ ] AC-0178 — Closure: comportamiento responsive móvil y escritorio.
- [ ] AC-0179 — Closure: degradación controlada ante dependencia externa.
- [ ] AC-0180 — Closure: documentación de limitaciones actualizada.
- [ ] AC-0181 — Costs: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0182 — Resources: tipo TypeScript inferido sin duplicación.
- [ ] AC-0183 — Resources: regla de dominio ubicada fuera de la UI.
- [ ] AC-0184 — Resources: persistencia mapeada sin casts inseguros.
- [ ] AC-0185 — Resources: servicio backend cubierto por prueba.
- [ ] AC-0186 — Resources: controller delgado y compatible con Express 5.
- [ ] AC-0187 — Resources: route protegida por autenticación y RBAC.
- [ ] AC-0188 — Resources: API frontend centralizada.
- [ ] AC-0189 — Inventory: query key estable e invalidación correcta.
- [ ] AC-0190 — Inventory: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0191 — Inventory: mensajes visibles en español.
- [ ] AC-0192 — Inventory: accesibilidad de teclado y nombre accesible.
- [ ] AC-0193 — Inventory: auditoría con actor, timestamp y entidad.
- [ ] AC-0194 — Inventory: idempotencia verificada cuando aplica.
- [ ] AC-0195 — Inventory: prueba negativa de autorización.
- [ ] AC-0196 — Tools: prueba E2E del camino crítico.
- [ ] AC-0197 — Tools: métrica o evidencia registrada en progreso.
- [ ] AC-0198 — Tools: comportamiento responsive móvil y escritorio.
- [ ] AC-0199 — Tools: degradación controlada ante dependencia externa.
- [ ] AC-0200 — Tools: documentación de limitaciones actualizada.
- [ ] AC-0201 — Fleet: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0202 — Fleet: tipo TypeScript inferido sin duplicación.
- [ ] AC-0203 — Assets: regla de dominio ubicada fuera de la UI.
- [ ] AC-0204 — Assets: persistencia mapeada sin casts inseguros.
- [ ] AC-0205 — Assets: servicio backend cubierto por prueba.
- [ ] AC-0206 — Assets: controller delgado y compatible con Express 5.
- [ ] AC-0207 — Assets: route protegida por autenticación y RBAC.
- [ ] AC-0208 — Assets: API frontend centralizada.
- [ ] AC-0209 — Assets: query key estable e invalidación correcta.
- [ ] AC-0210 — Maintenance: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0211 — Maintenance: mensajes visibles en español.
- [ ] AC-0212 — Maintenance: accesibilidad de teclado y nombre accesible.
- [ ] AC-0213 — Maintenance: auditoría con actor, timestamp y entidad.
- [ ] AC-0214 — Maintenance: idempotencia verificada cuando aplica.
- [ ] AC-0215 — Maintenance: prueba negativa de autorización.
- [ ] AC-0216 — Maintenance: prueba E2E del camino crítico.
- [ ] AC-0217 — Dashboard: métrica o evidencia registrada en progreso.
- [ ] AC-0218 — Dashboard: comportamiento responsive móvil y escritorio.
- [ ] AC-0219 — Dashboard: degradación controlada ante dependencia externa.
- [ ] AC-0220 — Dashboard: documentación de limitaciones actualizada.
- [ ] AC-0221 — SLA: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0222 — SLA: tipo TypeScript inferido sin duplicación.
- [ ] AC-0223 — SLA: regla de dominio ubicada fuera de la UI.
- [ ] AC-0224 — Dispatch: persistencia mapeada sin casts inseguros.
- [ ] AC-0225 — Dispatch: servicio backend cubierto por prueba.
- [ ] AC-0226 — Dispatch: controller delgado y compatible con Express 5.
- [ ] AC-0227 — Dispatch: route protegida por autenticación y RBAC.
- [ ] AC-0228 — Dispatch: API frontend centralizada.
- [ ] AC-0229 — Dispatch: query key estable e invalidación correcta.
- [ ] AC-0230 — Dispatch: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0231 — Notifications: mensajes visibles en español.
- [ ] AC-0232 — Notifications: accesibilidad de teclado y nombre accesible.
- [ ] AC-0233 — Notifications: auditoría con actor, timestamp y entidad.
- [ ] AC-0234 — Notifications: idempotencia verificada cuando aplica.
- [ ] AC-0235 — Notifications: prueba negativa de autorización.
- [ ] AC-0236 — Notifications: prueba E2E del camino crítico.
- [ ] AC-0237 — Notifications: métrica o evidencia registrada en progreso.
- [ ] AC-0238 — ClientPortal: comportamiento responsive móvil y escritorio.
- [ ] AC-0239 — ClientPortal: degradación controlada ante dependencia externa.
- [ ] AC-0240 — ClientPortal: documentación de limitaciones actualizada.
- [ ] AC-0241 — AIAdapter: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0242 — AIAdapter: tipo TypeScript inferido sin duplicación.
- [ ] AC-0243 — AIAdapter: regla de dominio ubicada fuera de la UI.
- [ ] AC-0244 — AIAdapter: persistencia mapeada sin casts inseguros.
- [ ] AC-0245 — ERPConnectors: servicio backend cubierto por prueba.
- [ ] AC-0246 — ERPConnectors: controller delgado y compatible con Express 5.
- [ ] AC-0247 — ERPConnectors: route protegida por autenticación y RBAC.
- [ ] AC-0248 — ERPConnectors: API frontend centralizada.
- [ ] AC-0249 — ERPConnectors: query key estable e invalidación correcta.
- [ ] AC-0250 — ERPConnectors: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0251 — ERPConnectors: mensajes visibles en español.
- [ ] AC-0252 — DIANAdapter: accesibilidad de teclado y nombre accesible.
- [ ] AC-0253 — DIANAdapter: auditoría con actor, timestamp y entidad.
- [ ] AC-0254 — DIANAdapter: idempotencia verificada cuando aplica.
- [ ] AC-0255 — DIANAdapter: prueba negativa de autorización.
- [ ] AC-0256 — DIANAdapter: prueba E2E del camino crítico.
- [ ] AC-0257 — DIANAdapter: métrica o evidencia registrada en progreso.
- [ ] AC-0258 — DIANAdapter: comportamiento responsive móvil y escritorio.
- [ ] AC-0259 — Backups: degradación controlada ante dependencia externa.
- [ ] AC-0260 — Backups: documentación de limitaciones actualizada.
- [ ] AC-0261 — HistoricalArchive: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0262 — HistoricalArchive: tipo TypeScript inferido sin duplicación.
- [ ] AC-0263 — HistoricalArchive: regla de dominio ubicada fuera de la UI.
- [ ] AC-0264 — HistoricalArchive: persistencia mapeada sin casts inseguros.
- [ ] AC-0265 — HistoricalArchive: servicio backend cubierto por prueba.
- [ ] AC-0266 — Audit: controller delgado y compatible con Express 5.
- [ ] AC-0267 — Audit: route protegida por autenticación y RBAC.
- [ ] AC-0268 — Audit: API frontend centralizada.
- [ ] AC-0269 — Audit: query key estable e invalidación correcta.
- [ ] AC-0270 — Audit: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0271 — Audit: mensajes visibles en español.
- [ ] AC-0272 — Audit: accesibilidad de teclado y nombre accesible.
- [ ] AC-0273 — Observability: auditoría con actor, timestamp y entidad.
- [ ] AC-0274 — Observability: idempotencia verificada cuando aplica.
- [ ] AC-0275 — Observability: prueba negativa de autorización.
- [ ] AC-0276 — Observability: prueba E2E del camino crítico.
- [ ] AC-0277 — Observability: métrica o evidencia registrada en progreso.
- [ ] AC-0278 — Observability: comportamiento responsive móvil y escritorio.
- [ ] AC-0279 — Observability: degradación controlada ante dependencia externa.
- [ ] AC-0280 — Landing: documentación de limitaciones actualizada.
- [ ] AC-0281 — LoginUI: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0282 — LoginUI: tipo TypeScript inferido sin duplicación.
- [ ] AC-0283 — LoginUI: regla de dominio ubicada fuera de la UI.
- [ ] AC-0284 — LoginUI: persistencia mapeada sin casts inseguros.
- [ ] AC-0285 — LoginUI: servicio backend cubierto por prueba.
- [ ] AC-0286 — LoginUI: controller delgado y compatible con Express 5.
- [ ] AC-0287 — Navigation: route protegida por autenticación y RBAC.
- [ ] AC-0288 — Navigation: API frontend centralizada.
- [ ] AC-0289 — Navigation: query key estable e invalidación correcta.
- [ ] AC-0290 — Navigation: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0291 — Navigation: mensajes visibles en español.
- [ ] AC-0292 — Navigation: accesibilidad de teclado y nombre accesible.
- [ ] AC-0293 — Navigation: auditoría con actor, timestamp y entidad.
- [ ] AC-0294 — DesignSystem: idempotencia verificada cuando aplica.
- [ ] AC-0295 — DesignSystem: prueba negativa de autorización.
- [ ] AC-0296 — DesignSystem: prueba E2E del camino crítico.
- [ ] AC-0297 — DesignSystem: métrica o evidencia registrada en progreso.
- [ ] AC-0298 — DesignSystem: comportamiento responsive móvil y escritorio.
- [ ] AC-0299 — DesignSystem: degradación controlada ante dependencia externa.
- [ ] AC-0300 — DesignSystem: documentación de limitaciones actualizada.
- [ ] AC-0301 — SharedTypes: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0302 — SharedTypes: tipo TypeScript inferido sin duplicación.
- [ ] AC-0303 — SharedTypes: regla de dominio ubicada fuera de la UI.
- [ ] AC-0304 — SharedTypes: persistencia mapeada sin casts inseguros.
- [ ] AC-0305 — SharedTypes: servicio backend cubierto por prueba.
- [ ] AC-0306 — SharedTypes: controller delgado y compatible con Express 5.
- [ ] AC-0307 — SharedTypes: route protegida por autenticación y RBAC.
- [ ] AC-0308 — DomainFSM: API frontend centralizada.
- [ ] AC-0309 — DomainFSM: query key estable e invalidación correcta.
- [ ] AC-0310 — DomainFSM: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0311 — DomainFSM: mensajes visibles en español.
- [ ] AC-0312 — DomainFSM: accesibilidad de teclado y nombre accesible.
- [ ] AC-0313 — DomainFSM: auditoría con actor, timestamp y entidad.
- [ ] AC-0314 — DomainFSM: idempotencia verificada cuando aplica.
- [ ] AC-0315 — Config: prueba negativa de autorización.
- [ ] AC-0316 — Config: prueba E2E del camino crítico.
- [ ] AC-0317 — Config: métrica o evidencia registrada en progreso.
- [ ] AC-0318 — Config: comportamiento responsive móvil y escritorio.
- [ ] AC-0319 — Config: degradación controlada ante dependencia externa.
- [ ] AC-0320 — Config: documentación de limitaciones actualizada.
- [ ] AC-0321 — Auth: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0322 — WebAuthn: tipo TypeScript inferido sin duplicación.
- [ ] AC-0323 — WebAuthn: regla de dominio ubicada fuera de la UI.
- [ ] AC-0324 — WebAuthn: persistencia mapeada sin casts inseguros.
- [ ] AC-0325 — WebAuthn: servicio backend cubierto por prueba.
- [ ] AC-0326 — WebAuthn: controller delgado y compatible con Express 5.
- [ ] AC-0327 — WebAuthn: route protegida por autenticación y RBAC.
- [ ] AC-0328 — WebAuthn: API frontend centralizada.
- [ ] AC-0329 — RBAC: query key estable e invalidación correcta.
- [ ] AC-0330 — RBAC: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0331 — RBAC: mensajes visibles en español.
- [ ] AC-0332 — RBAC: accesibilidad de teclado y nombre accesible.
- [ ] AC-0333 — RBAC: auditoría con actor, timestamp y entidad.
- [ ] AC-0334 — RBAC: idempotencia verificada cuando aplica.
- [ ] AC-0335 — RBAC: prueba negativa de autorización.
- [ ] AC-0336 — Customers: prueba E2E del camino crítico.
- [ ] AC-0337 — Customers: métrica o evidencia registrada en progreso.
- [ ] AC-0338 — Customers: comportamiento responsive móvil y escritorio.
- [ ] AC-0339 — Customers: degradación controlada ante dependencia externa.
- [ ] AC-0340 — Customers: documentación de limitaciones actualizada.
- [ ] AC-0341 — ServiceSites: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0342 — ServiceSites: tipo TypeScript inferido sin duplicación.
- [ ] AC-0343 — Contacts: regla de dominio ubicada fuera de la UI.
- [ ] AC-0344 — Contacts: persistencia mapeada sin casts inseguros.
- [ ] AC-0345 — Contacts: servicio backend cubierto por prueba.
- [ ] AC-0346 — Contacts: controller delgado y compatible con Express 5.
- [ ] AC-0347 — Contacts: route protegida por autenticación y RBAC.
- [ ] AC-0348 — Contacts: API frontend centralizada.
- [ ] AC-0349 — Contacts: query key estable e invalidación correcta.
- [ ] AC-0350 — WorkRequests: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0351 — WorkRequests: mensajes visibles en español.
- [ ] AC-0352 — WorkRequests: accesibilidad de teclado y nombre accesible.
- [ ] AC-0353 — WorkRequests: auditoría con actor, timestamp y entidad.
- [ ] AC-0354 — WorkRequests: idempotencia verificada cuando aplica.
- [ ] AC-0355 — WorkRequests: prueba negativa de autorización.
- [ ] AC-0356 — WorkRequests: prueba E2E del camino crítico.
- [ ] AC-0357 — SiteVisits: métrica o evidencia registrada en progreso.
- [ ] AC-0358 — SiteVisits: comportamiento responsive móvil y escritorio.
- [ ] AC-0359 — SiteVisits: degradación controlada ante dependencia externa.
- [ ] AC-0360 — SiteVisits: documentación de limitaciones actualizada.
- [ ] AC-0361 — Proposals: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0362 — Proposals: tipo TypeScript inferido sin duplicación.
- [ ] AC-0363 — Proposals: regla de dominio ubicada fuera de la UI.
- [ ] AC-0364 — PurchaseOrders: persistencia mapeada sin casts inseguros.
- [ ] AC-0365 — PurchaseOrders: servicio backend cubierto por prueba.
- [ ] AC-0366 — PurchaseOrders: controller delgado y compatible con Express 5.
- [ ] AC-0367 — PurchaseOrders: route protegida por autenticación y RBAC.
- [ ] AC-0368 — PurchaseOrders: API frontend centralizada.
- [ ] AC-0369 — PurchaseOrders: query key estable e invalidación correcta.
- [ ] AC-0370 — PurchaseOrders: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0371 — ServiceCases: mensajes visibles en español.
- [ ] AC-0372 — ServiceCases: accesibilidad de teclado y nombre accesible.
- [ ] AC-0373 — ServiceCases: auditoría con actor, timestamp y entidad.
- [ ] AC-0374 — ServiceCases: idempotencia verificada cuando aplica.
- [ ] AC-0375 — ServiceCases: prueba negativa de autorización.
- [ ] AC-0376 — ServiceCases: prueba E2E del camino crítico.
- [ ] AC-0377 — ServiceCases: métrica o evidencia registrada en progreso.
- [ ] AC-0378 — WorkOrders: comportamiento responsive móvil y escritorio.
- [ ] AC-0379 — WorkOrders: degradación controlada ante dependencia externa.
- [ ] AC-0380 — WorkOrders: documentación de limitaciones actualizada.
- [ ] AC-0381 — PlanningPackets: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0382 — PlanningPackets: tipo TypeScript inferido sin duplicación.
- [ ] AC-0383 — PlanningPackets: regla de dominio ubicada fuera de la UI.
- [ ] AC-0384 — PlanningPackets: persistencia mapeada sin casts inseguros.
- [ ] AC-0385 — Kits: servicio backend cubierto por prueba.
- [ ] AC-0386 — Kits: controller delgado y compatible con Express 5.
- [ ] AC-0387 — Kits: route protegida por autenticación y RBAC.
- [ ] AC-0388 — Kits: API frontend centralizada.
- [ ] AC-0389 — Kits: query key estable e invalidación correcta.
- [ ] AC-0390 — Kits: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0391 — Kits: mensajes visibles en español.
- [ ] AC-0392 — SafetyAnalysis: accesibilidad de teclado y nombre accesible.
- [ ] AC-0393 — SafetyAnalysis: auditoría con actor, timestamp y entidad.
- [ ] AC-0394 — SafetyAnalysis: idempotencia verificada cuando aplica.
- [ ] AC-0395 — SafetyAnalysis: prueba negativa de autorización.
- [ ] AC-0396 — SafetyAnalysis: prueba E2E del camino crítico.
- [ ] AC-0397 — SafetyAnalysis: métrica o evidencia registrada en progreso.
- [ ] AC-0398 — SafetyAnalysis: comportamiento responsive móvil y escritorio.
- [ ] AC-0399 — ExecutionSessions: degradación controlada ante dependencia externa.
- [ ] AC-0400 — ExecutionSessions: documentación de limitaciones actualizada.
- [ ] AC-0401 — OfflineQueue: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0402 — OfflineQueue: tipo TypeScript inferido sin duplicación.
- [ ] AC-0403 — OfflineQueue: regla de dominio ubicada fuera de la UI.
- [ ] AC-0404 — OfflineQueue: persistencia mapeada sin casts inseguros.
- [ ] AC-0405 — OfflineQueue: servicio backend cubierto por prueba.
- [ ] AC-0406 — Evidences: controller delgado y compatible con Express 5.
- [ ] AC-0407 — Evidences: route protegida por autenticación y RBAC.
- [ ] AC-0408 — Evidences: API frontend centralizada.
- [ ] AC-0409 — Evidences: query key estable e invalidación correcta.
- [ ] AC-0410 — Evidences: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0411 — Evidences: mensajes visibles en español.
- [ ] AC-0412 — Evidences: accesibilidad de teclado y nombre accesible.
- [ ] AC-0413 — FileAssets: auditoría con actor, timestamp y entidad.
- [ ] AC-0414 — FileAssets: idempotencia verificada cuando aplica.
- [ ] AC-0415 — FileAssets: prueba negativa de autorización.
- [ ] AC-0416 — FileAssets: prueba E2E del camino crítico.
- [ ] AC-0417 — FileAssets: métrica o evidencia registrada en progreso.
- [ ] AC-0418 — FileAssets: comportamiento responsive móvil y escritorio.
- [ ] AC-0419 — FileAssets: degradación controlada ante dependencia externa.
- [ ] AC-0420 — TechnicalReports: documentación de limitaciones actualizada.
- [ ] AC-0421 — DynamicTemplates: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0422 — DynamicTemplates: tipo TypeScript inferido sin duplicación.
- [ ] AC-0423 — DynamicTemplates: regla de dominio ubicada fuera de la UI.
- [ ] AC-0424 — DynamicTemplates: persistencia mapeada sin casts inseguros.
- [ ] AC-0425 — DynamicTemplates: servicio backend cubierto por prueba.
- [ ] AC-0426 — DynamicTemplates: controller delgado y compatible con Express 5.
- [ ] AC-0427 — DeliveryRecords: route protegida por autenticación y RBAC.
- [ ] AC-0428 — DeliveryRecords: API frontend centralizada.
- [ ] AC-0429 — DeliveryRecords: query key estable e invalidación correcta.
- [ ] AC-0430 — DeliveryRecords: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0431 — DeliveryRecords: mensajes visibles en español.
- [ ] AC-0432 — DeliveryRecords: accesibilidad de teclado y nombre accesible.
- [ ] AC-0433 — DeliveryRecords: auditoría con actor, timestamp y entidad.
- [ ] AC-0434 — ClientAcceptance: idempotencia verificada cuando aplica.
- [ ] AC-0435 — ClientAcceptance: prueba negativa de autorización.
- [ ] AC-0436 — ClientAcceptance: prueba E2E del camino crítico.
- [ ] AC-0437 — ClientAcceptance: métrica o evidencia registrada en progreso.
- [ ] AC-0438 — ClientAcceptance: comportamiento responsive móvil y escritorio.
- [ ] AC-0439 — ClientAcceptance: degradación controlada ante dependencia externa.
- [ ] AC-0440 — ClientAcceptance: documentación de limitaciones actualizada.
- [ ] AC-0441 — ServiceEntrySheets: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0442 — ServiceEntrySheets: tipo TypeScript inferido sin duplicación.
- [ ] AC-0443 — ServiceEntrySheets: regla de dominio ubicada fuera de la UI.
- [ ] AC-0444 — ServiceEntrySheets: persistencia mapeada sin casts inseguros.
- [ ] AC-0445 — ServiceEntrySheets: servicio backend cubierto por prueba.
- [ ] AC-0446 — ServiceEntrySheets: controller delgado y compatible con Express 5.
- [ ] AC-0447 — ServiceEntrySheets: route protegida por autenticación y RBAC.
- [ ] AC-0448 — SESApproval: API frontend centralizada.
- [ ] AC-0449 — SESApproval: query key estable e invalidación correcta.
- [ ] AC-0450 — SESApproval: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0451 — SESApproval: mensajes visibles en español.
- [ ] AC-0452 — SESApproval: accesibilidad de teclado y nombre accesible.
- [ ] AC-0453 — SESApproval: auditoría con actor, timestamp y entidad.
- [ ] AC-0454 — SESApproval: idempotencia verificada cuando aplica.
- [ ] AC-0455 — Invoices: prueba negativa de autorización.
- [ ] AC-0456 — Invoices: prueba E2E del camino crítico.
- [ ] AC-0457 — Invoices: métrica o evidencia registrada en progreso.
- [ ] AC-0458 — Invoices: comportamiento responsive móvil y escritorio.
- [ ] AC-0459 — Invoices: degradación controlada ante dependencia externa.
- [ ] AC-0460 — Invoices: documentación de limitaciones actualizada.
- [ ] AC-0461 — InvoiceApproval: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0462 — Payments: tipo TypeScript inferido sin duplicación.
- [ ] AC-0463 — Payments: regla de dominio ubicada fuera de la UI.
- [ ] AC-0464 — Payments: persistencia mapeada sin casts inseguros.
- [ ] AC-0465 — Payments: servicio backend cubierto por prueba.
- [ ] AC-0466 — Payments: controller delgado y compatible con Express 5.
- [ ] AC-0467 — Payments: route protegida por autenticación y RBAC.
- [ ] AC-0468 — Payments: API frontend centralizada.
- [ ] AC-0469 — Closure: query key estable e invalidación correcta.
- [ ] AC-0470 — Closure: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0471 — Closure: mensajes visibles en español.
- [ ] AC-0472 — Closure: accesibilidad de teclado y nombre accesible.
- [ ] AC-0473 — Closure: auditoría con actor, timestamp y entidad.
- [ ] AC-0474 — Closure: idempotencia verificada cuando aplica.
- [ ] AC-0475 — Closure: prueba negativa de autorización.
- [ ] AC-0476 — Costs: prueba E2E del camino crítico.
- [ ] AC-0477 — Costs: métrica o evidencia registrada en progreso.
- [ ] AC-0478 — Costs: comportamiento responsive móvil y escritorio.
- [ ] AC-0479 — Costs: degradación controlada ante dependencia externa.
- [ ] AC-0480 — Costs: documentación de limitaciones actualizada.
- [ ] AC-0481 — Resources: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0482 — Resources: tipo TypeScript inferido sin duplicación.
- [ ] AC-0483 — Inventory: regla de dominio ubicada fuera de la UI.
- [ ] AC-0484 — Inventory: persistencia mapeada sin casts inseguros.
- [ ] AC-0485 — Inventory: servicio backend cubierto por prueba.
- [ ] AC-0486 — Inventory: controller delgado y compatible con Express 5.
- [ ] AC-0487 — Inventory: route protegida por autenticación y RBAC.
- [ ] AC-0488 — Inventory: API frontend centralizada.
- [ ] AC-0489 — Inventory: query key estable e invalidación correcta.
- [ ] AC-0490 — Tools: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0491 — Tools: mensajes visibles en español.
- [ ] AC-0492 — Tools: accesibilidad de teclado y nombre accesible.
- [ ] AC-0493 — Tools: auditoría con actor, timestamp y entidad.
- [ ] AC-0494 — Tools: idempotencia verificada cuando aplica.
- [ ] AC-0495 — Tools: prueba negativa de autorización.
- [ ] AC-0496 — Tools: prueba E2E del camino crítico.
- [ ] AC-0497 — Fleet: métrica o evidencia registrada en progreso.
- [ ] AC-0498 — Fleet: comportamiento responsive móvil y escritorio.
- [ ] AC-0499 — Fleet: degradación controlada ante dependencia externa.
- [ ] AC-0500 — Fleet: documentación de limitaciones actualizada.
- [ ] AC-0501 — Assets: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0502 — Assets: tipo TypeScript inferido sin duplicación.
- [ ] AC-0503 — Assets: regla de dominio ubicada fuera de la UI.
- [ ] AC-0504 — Maintenance: persistencia mapeada sin casts inseguros.
- [ ] AC-0505 — Maintenance: servicio backend cubierto por prueba.
- [ ] AC-0506 — Maintenance: controller delgado y compatible con Express 5.
- [ ] AC-0507 — Maintenance: route protegida por autenticación y RBAC.
- [ ] AC-0508 — Maintenance: API frontend centralizada.
- [ ] AC-0509 — Maintenance: query key estable e invalidación correcta.
- [ ] AC-0510 — Maintenance: loading/error/empty/offline/forbidden implementados.
- [ ] AC-0511 — Dashboard: mensajes visibles en español.
- [ ] AC-0512 — Dashboard: accesibilidad de teclado y nombre accesible.
- [ ] AC-0513 — Dashboard: auditoría con actor, timestamp y entidad.
- [ ] AC-0514 — Dashboard: idempotencia verificada cuando aplica.
- [ ] AC-0515 — Dashboard: prueba negativa de autorización.
- [ ] AC-0516 — Dashboard: prueba E2E del camino crítico.
- [ ] AC-0517 — Dashboard: métrica o evidencia registrada en progreso.
- [ ] AC-0518 — SLA: comportamiento responsive móvil y escritorio.
- [ ] AC-0519 — SLA: degradación controlada ante dependencia externa.
- [ ] AC-0520 — SLA: documentación de limitaciones actualizada.
- [ ] AC-0521 — Dispatch: contrato Zod alineado entre productor y consumidor.
- [ ] AC-0522 — Dispatch: tipo TypeScript inferido sin duplicación.
- [ ] AC-0523 — Dispatch: regla de dominio ubicada fuera de la UI.
- [ ] AC-0524 — Dispatch: persistencia mapeada sin casts inseguros.
- [ ] AC-0525 — Notifications: servicio backend cubierto por prueba.
- [ ] AC-0526 — Notifications: controller delgado y compatible con Express 5.
- [ ] AC-0527 — Notifications: route protegida por autenticación y RBAC.
- [ ] AC-0528 — Notifications: API frontend centralizada.
<!-- FIN DEL PROMPT MAESTRO CERMONT — EXACTAMENTE 3000 LÍNEAS -->

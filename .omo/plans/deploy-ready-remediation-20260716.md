# Cermont — Remediación de madurez y preparación para deploy (2026-07-16)

## Objetivo

Cerrar los bloqueos P0/P1 confirmados por las auditorías de backend, frontend y
operación, sobre el worktree `.codex/worktrees/spec-012-escalamiento-profesional`,
sin revertir cambios preexistentes. El resultado debe ser una base auditable para
despliegue VPS/PM2 y una superficie funcional coherente para costos, firma y auth.

## Alcance y reglas

- La fuente de producto sigue siendo la documentación canónica en `docs/`.
- La implementación es vertical por slice y conserva `backend/`, `frontend/` y
  `packages/` como estructura única.
- No modificar `package.json`/`package-lock.json` salvo que un worker justifique
  una necesidad bloqueante y la documente.
- No usar `any`, `@ts-ignore`, `@ts-expect-error`, fetch directo en componentes,
  roles hardcodeados ni secretos de producción.
- Cada worker debe producir prueba automatizada y una evidencia de superficie real.
- Los cambios de este plan no borran ni restauran archivos del árbol principal.

## TODOs

- [ ] R1. **Topología de despliegue coherente**
  - Hacer que la estrategia elegida (PM2/VPS o Docker) sea ejecutable y única.
  - Resolver Dockerfile, PM2 duplicado, health probes, frontend/backend y nginx.
  - Verificar build de imagen o dry-run de PM2 sin iniciar servicios persistentes.

- [ ] R2. **Secretos, seed, backup y CI/CD**
  - Eliminar la contraseña fallback fija del seed y alinear documentación/env.
  - Unificar `MONGODB_URI`, retención y procedimiento de backup/restore.
  - Añadir gates/probes de liveness y frontend al pipeline sin exponer secretos.

- [ ] R3. **Persistencia del catálogo de costos**
  - Conectar UI con contrato/query/mutation y endpoint real existente o completarlo.
  - El submit no puede ser `console.log`; debe mostrar loading/error/empty/pending.
  - Cubrir persistencia tras recarga y RBAC del catálogo.

- [ ] R4. **Persistencia de firma/rechazo de reportes**
  - Conectar la pantalla de firma a los endpoints/contratos canónicos.
  - Persistir firma y rechazo con validación, feedback y recuperación de errores.
  - Cubrir que el estado persiste tras navegación y recarga.

- [ ] R5. **Perímetro de auth y matcher de rutas**
  - Eliminar la dependencia autoritativa de un cookie de rol manipulable.
  - Unificar matcher de rutas públicas entre proxy, providers y domain.
  - Mantener backend como fuente definitiva de RBAC y añadir regresión.

- [ ] R6. **Reconciliación contract-first y documentación**
  - Actualizar matrices API/rutas a partir de routers y páginas reales.
  - Documentar la topología final, probes, prefijos API y rollback.
  - Registrar los cambios de comportamiento y los pendientes verdaderos.

## Final Verification Wave

- [ ] V1. Gates completos sobre el worktree candidato: `npm run typecheck`,
  `npm run lint`, `npm run test`, `npm run build`, `npm run verify`,
  `npx react-doctor@latest`.
- [ ] V2. QA manual independiente: health live/ready, login/RBAC, catálogo de
  costos, firma/rechazo, build/start de deploy y un caso inválido por superficie.
- [ ] V3. Revisión adversarial independiente de diff, secretos, dirty worktree,
  stale state, outputs engañosos y cleanup de procesos/puertos.
- [ ] V4. Veredicto de deploy con lista de archivos, gates, evidencia y riesgos
  residuales; no declarar apto si cualquier gate requerido falla.

## Criterio de salida

Deployable significa: base de trabajo identificable, build reproducible, health
probes correctos, secreto de seed explícito, rollback/backup documentado,
persistencia de costos y firma observada en superficie real, y todos los gates
obligatorios en verde.

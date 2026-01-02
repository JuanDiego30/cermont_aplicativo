# 🎯 CERMONT TASK TEMPLATE

Usa este template para **cualquier tarea de desarrollo**. Te guía en cómo aplicar los agentes correctos y garantizar calidad.

---

## 📋 Información Básica de la Tarea

```markdown
**ID Tarea:** [ISSUE #XXX o JIRA-XXX]
**Título:** [Descripción corta]
**Prioridad:** [Crítica / Alta / Media / Baja]
**Estimación:** [1h / 4h / 1d / 3d]
**Asignado a:** [@username]
```

---

## 🎯 Objetivo

**Qué:** [Descripción clara de qué se debe hacer]

**Por qué:** [Contexto: por qué es importante, qué problema resuelve]

**Aceptancia:** [Criterios de aceptancia explícitos]

---

## 🤖 Agentes Aplicables

### Agente Primario
- **Nombre:** [ej: `backend-ordenes.agent.md`]
- **Sección:** [Qué sección del agente es relevante]
- **Patrón a Seguir:** [Qué patrón específico del agente aplicarás]

### Agentes Secundarios
- **Nombre:** [ej: `frontend-api-integration.agent.md`]
- **Razón:** [Por qué este agente también es relevante]

### No Aplica
- [Ej: `devops-ci-cd.agent.md` no aplica en esta tarea]

---

## ✅ Checklist Previo (ANTES de codear)

- [ ] Leí el/los agente(s) aplicable(s)
- [ ] Entiendo los límites (qué NO puedo hacer)
- [ ] Conozco los patrones obligatorios
- [ ] Tengo el checklist del agente a mano
- [ ] He confirmado requisitos con PM/BA (si aplica)

---

## 🔨 Plan de Ejecución

### Fase 1: [Nombre Fase]
**Objetivo:** [Qué lograr en esta fase]

**Subtareas:**
1. [ ] Tarea 1
2. [ ] Tarea 2
3. [ ] Tarea 3

**Agente(s) a Consultar:** [Si hay duda, consulta este agente]

**Definición de Listo:** [Cómo sé que está completado]

---

### Fase 2: [Nombre Fase]

[Repetir estructura]

---

## 📝 Cambios Realizados

### Backend (si aplica)
- [ ] Nuevos servicios: [Listar]
- [ ] Nuevos controllers: [Listar]
- [ ] Cambios en DTOs: [Listar y versión API bump?]
- [ ] Migrations BD: [Listar]
- [ ] Cambios en guards/auth: [Listar]

### Frontend (si aplica)
- [ ] Nuevos componentes: [Listar]
- [ ] Nuevos servicios: [Listar]
- [ ] Cambios en state/store: [Listar]
- [ ] Nuevas rutas: [Lazy loaded?]
- [ ] Cambios en estilos globales: [Listar]

### DevOps (si aplica)
- [ ] Nuevo workflow: [Listar]
- [ ] Cambios en Dockerfile: [Listar]
- [ ] Nuevas variables de entorno: [Listar]
- [ ] Cambios en docker-compose: [Listar]

---

## 🧪 Testing

### Pruebas Unitarias
- [ ] Backend: [Coverage >80% para módulos nuevos]
- [ ] Frontend: [Coverage >80% para servicios/pipes]
- [ ] Comando: `npm run test -- --coverage`

### Pruebas de Integración
- [ ] Backend: [Test contra BD real]
- [ ] Comando: `npm run test:api -- --testPathPattern=integration`

### Pruebas E2E
- [ ] Flujos críticos: [Listar qué flows testear]
- [ ] Comando: `npm run test:e2e`

### Manual Testing
- [ ] Caso 1: [Descripción]
- [ ] Caso 2: [Descripción]
- [ ] Caso 3: [Descripción]

---

## 📊 Validación Contra Agentes

### Backend

**Si `backend-auth.agent.md` aplica:**
- [ ] Nuevo endpoint protegido con `@UseGuards(JwtAuthGuard)`
- [ ] Roles validados si es necesario
- [ ] Logs de acceso registrados

**Si `backend-ordenes.agent.md` aplica:**
- [ ] Estados validados según máquina de estados
- [ ] Transiciones verificadas
- [ ] Historial registrado si hay cambio crítico

**Si `backend-formularios.agent.md` aplica:**
- [ ] Validación centralizada (no en controller)
- [ ] Nuevos tipos de campos soportados
- [ ] Dependencias funcionan
- [ ] Historial de cambios capturado

[... continuación para otros agentes según aplique]

### Frontend

**Si `frontend-api-integration.agent.md` aplica:**
- [ ] Nuevos endpoints consumidos via servicio (no en componente)
- [ ] DTOs sincronizados con backend
- [ ] Error handling centralizado
- [ ] Retry y caching (si aplica) configurados

**Si `frontend-ui-ux.agent.md` aplica:**
- [ ] Componentes en `shared/components/` (si reutilizable)
- [ ] ARIA labels presentes
- [ ] Keyboard navigation funciona
- [ ] Responsive: testedo en mobile, tablet, desktop

**Si `frontend-performance.agent.md` aplica:**
- [ ] Lazy loading en nuevas rutas
- [ ] OnPush change detection aplicado
- [ ] TrackBy en listas >10 items
- [ ] Suscripciones se desuscriben en OnDestroy
- [ ] Bundle size revisado

[... continuación para otros agentes]

### DevOps

**Si `devops-ci-cd.agent.md` aplica:**
- [ ] Docker images testeadas localmente
- [ ] Health checks configurados
- [ ] Secrets en variables de entorno (GitHub Secrets)
- [ ] CI workflows pasan (lint, test, build)
- [ ] Deploy a dev automático funciona

---

## 🔍 Validación Final (ANTES de PR)

### Código
- [ ] ESLint: `npm run lint` sin errores
- [ ] Prettier: `npm run format:check` OK
- [ ] TypeScript: `npm run type-check` sin errores
- [ ] Tests: `npm run test` con coverage >80%
- [ ] Build: `npm run build:[api|web]` sin errores

### Documentación
- [ ] Código auto-documentado (sin necesidad de comentarios verbosos)
- [ ] Funciones complejas: comentario "por qué"
- [ ] README actualizado (si cambio público)
- [ ] Changelog (si feature nueva)

### Performance
- [ ] Frontend Lighthouse: >90 Performance
- [ ] Backend: queries optimizadas (no N+1)
- [ ] Bundles: dentro de límites

### Seguridad
- [ ] No secrets en código
- [ ] Input validado
- [ ] Output escapado (SQL injection, XSS)
- [ ] CORS configurado correctamente

---

## 📤 Pull Request

### Descripción
```markdown
## 🎯 Objetivo
[Copiar de sección "Objetivo" arriba]

## 📝 Cambios
- [Cambio 1]
- [Cambio 2]

## 🤖 Agentes Aplicados
- [Agente 1]: [Qué patrón seguiste]
- [Agente 2]: [Qué patrón seguiste]

## ✅ Checklist
- [x] Tests pasan
- [x] ESLint/Prettier OK
- [x] Coverage >80%
- [x] Documentado
- [x] Performance OK
- [x] Validado contra agentes

## 🧪 Testing Manual
[Pasos para probar manualmente]
```

### Título PR
`[TIPO] Descripción breve - Agentes aplicados`

Ejemplos:
```
[feat] Agregar endpoint GET /ordenes/{id}/historial - backend-ordenes + frontend-api-integration
[fix] Memory leak en OrdenesListComponent - frontend-performance + frontend-state-data
[refactor] Centralizar validación de formularios - backend-formularios + quality-testing
```

---

## 📊 Métricas

### Backend (si aplica)
- **Nuevos archivos:** [Cantidad]
- **Líneas de código:** [Total +/-]
- **Coverage unit tests:** [%]
- **Tiempo ejecución tests:** [seg]

### Frontend (si aplica)
- **Nuevos componentes:** [Cantidad]
- **Bundle size delta:** [KB +/-]
- **Lighthouse Performance:** [Puntuación]
- **Coverage:** [%]

### DevOps (si aplica)
- **Tiempo build:** [seg]
- **Tamaño Docker image:** [MB]
- **Deploy time:** [seg]

---

## 🎓 Lecciones Aprendidas

**Qué salió bien:**
- [Aspecto 1]
- [Aspecto 2]

**Qué fue complicado:**
- [Desafío 1 y cómo lo resolviste]
- [Desafío 2 y cómo lo resolviste]

**Para la próxima vez:**
- [Mejora 1]
- [Mejora 2]

---

## 📞 Notas

[Cualquier información adicional, decisiones de diseño, trade-offs, etc.]

---

## 📋 Signoff

- [ ] Code Review aprobado
- [ ] PM/BA aprobó aceptancia
- [ ] QA aprobó testing
- [ ] DevOps aprobó deployment
- [ ] Merged a main ✅

---

**Plantilla versión:** 1.0  
**Última actualización:** 2026-01-02

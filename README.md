# 🏢 CERMONT APLICATIVO

**Aplicativo empresarial integral** para gestión de órdenes, evidencias, formularios y reportes. Arquitectura full-stack con **patrones especializados** basados en 13 agentes de desarrollo.

---

## 🚀 Inicio Rápido

### Para Nuevos Miembros del Equipo
```bash
# 1. Lee la guía de onboarding (10 min)
# Abre: .github/ONBOARDING.md

# 2. Setup local (15 min)
git clone git@github.com:JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo
npm install

# 3. Inicia servicios
docker-compose -f docker-compose.dev.yml up -d
npm run start:api    # Terminal 1
npm run start:web    # Terminal 2

# 4. Abre en navegador
# http://localhost:4200 (Frontend)
# http://localhost:3000/api (Backend)

✅ ¡Listo!
```

---

## 📚 Documentación Estructurada

### 🎯 Para Cualquier Tarea de Desarrollo

1. **Necesito entender cómo funciona...** 
   → Abre [`.github/AGENTS.md`](.github/AGENTS.md) - Índice maestro de todos los agentes

2. **Voy a trabajar en una tarea...**
   → Usa [`.github/TASK_TEMPLATE.md`](.github/TASK_TEMPLATE.md) - Plantilla estructurada

3. **Soy nuevo en el equipo...**
   → Comienza con [`.github/ONBOARDING.md`](.github/ONBOARDING.md) - Guía día a día

### 🤖 Los 13 Agentes Especializados

**Backend (7):**
- [`backend-auth.agent.md`](.github/agents/backend-auth.agent.md) - Autenticación y permisos
- [`backend-ordenes.agent.md`](.github/agents/backend-ordenes.agent.md) - Gestión de órdenes
- [`backend-evidencias.agent.md`](.github/agents/backend-evidencias.agent.md) - Almacenamiento de archivos
- [`backend-formularios.agent.md`](.github/agents/backend-formularios.agent.md) - Formularios dinámicos
- [`backend-sync.agent.md`](.github/agents/backend-sync.agent.md) - Sincronización offline
- [`backend-reportes-pdf.agent.md`](.github/agents/backend-reportes-pdf.agent.md) - Reportes en PDF
- [`quality-testing.agent.md`](.github/agents/quality-testing.agent.md) - Testing y cobertura

**Frontend (5):**
- [`frontend.agent.md`](.github/agents/frontend.agent.md) - Arquitectura general (umbrella)
- [`frontend-api-integration.agent.md`](.github/agents/frontend-api-integration.agent.md) - HTTP y servicios
- [`frontend-ui-ux.agent.md`](.github/agents/frontend-ui-ux.agent.md) - Componentes y accesibilidad
- [`frontend-state-data.agent.md`](.github/agents/frontend-state-data.agent.md) - Estado (NgRx/Signals)
- [`frontend-performance.agent.md`](.github/agents/frontend-performance.agent.md) - Optimización

**DevOps (1):**
- [`devops-ci-cd.agent.md`](.github/agents/devops-ci-cd.agent.md) - Docker, CI/CD, deployments

---

## 🏗️ Arquitectura

### Tech Stack

| Capa | Tecnología | Versión |
|------|-----------|----------|
| **Frontend** | Angular | 18+ |
| **Backend** | NestJS | 10+ |
| **BD** | PostgreSQL | 16+ |
| **Cache** | Redis | 7+ |
| **ORM** | Prisma | 5+ |
| **Testing** | Jest / Jasmine | Latest |
| **CI/CD** | GitHub Actions | - |
| **Containerización** | Docker | 25+ |

### Estructura de Carpetas

```
cermont_aplicativo/
├── .github/
│   ├── agents/              ← 13 agentes especializados
│   ├── workflows/           ← CI/CD (GitHub Actions)
│   ├── AGENTS.md            ← 📖 Índice maestro
│   ├── TASK_TEMPLATE.md     ← 📋 Plantilla para tareas
│   └── ONBOARDING.md        ← 🎯 Guía para nuevos
├── apps/
│   ├── api/                 ← Backend (NestJS)
│   │   ├── src/modules/
│   │   │   ├── auth/
│   │   │   ├── ordenes/
│   │   │   ├── evidencias/
│   │   │   └── ...
│   │   └── test/
│   └── web/                 ← Frontend (Angular)
│       ├── src/app/
│       │   ├── core/        ← Guards, interceptors, services
│       │   ├── shared/      ← Componentes reutilizables
│       │   ├── features/    ← Módulos de features
│       │   └── app.routes.ts
│       └── test/
├── docker/                  ← Dockerfiles
├── docker-compose.dev.yml   ← Dev local
├── package.json
├── tsconfig.json
└── README.md                ← Este archivo
```

---

## 📖 Patrones Clave (GEMINI)

Cermont sigue **13 reglas de oro** transversales ("GEMINI"):

1. **G**eneral - DI (Dependency Injection) obligatorio
2. **E**specializado - Centralización (no duplicar código)
3. **M**antible - Type Safety (no `any`)
4. **I**ntegrado - Error Handling + Logging
5. **N**avegable - Caching Inteligente
6. **I**mplementado - Testing (Unit → Integration → E2E)

**Más detalles:** Ver `.github/AGENTS.md` - Sección "Reglas GEMINI Transversales"

---

## 🔧 Scripts Comunes

```bash
# Desarrollo
npm run start:api           # Backend en puerto 3000
npm run start:web           # Frontend en puerto 4200
npm run dev                 # Ambos en paralelo

# Testing
npm run test                # Tests unitarios (todo)
npm run test -- --coverage  # Con cobertura
npm run test:e2e            # Tests E2E (Cypress)

# Calidad
npm run lint                # ESLint
npm run format              # Prettier (escribir)
npm run format:check        # Prettier (verificar)
npm run type-check          # TypeScript

# Build
npm run build               # Build de ambos

# Docker
docker-compose -f docker-compose.dev.yml up -d    # Iniciar
npm run migrate             # Ejecutar migrations (Prisma)
```

---

## 📋 Flujo de Trabajo

### 1. Recibe una tarea
```
Ejemplo: "Agregar endpoint GET /ordenes/{id}/historial"
```

### 2. Identifica agentes relevantes
```
✅ backend-ordenes.agent.md (endpoint)
✅ backend-auth.agent.md (seguridad)
✅ frontend-api-integration.agent.md (consumirlo en UI)
✅ quality-testing.agent.md (tests)
```

### 3. Sigue patrones del agente
```bash
# Lee el archivo del agente
# Sigue la sección "Patrones Obligatorios"
# Implementa código
```

### 4. Valida contra checklist
```bash
npm run lint
npm run format:check
npm run type-check
npm run test -- --coverage
npm run build

# ✅ Si todo pasa, continúa
```

### 5. Crea PR
```
Título: [feat] Add endpoint GET /ordenes/{id}/historial - backend-ordenes + frontend-api-integration

Menciona:
- Agentes consultados
- Patrones seguidos
- Tests agregados (coverage)
```

---

## ✅ Checklist Antes de Hacer PR

### Código
- [ ] Tests pasan: `npm run test`
- [ ] ESLint OK: `npm run lint`
- [ ] Prettier OK: `npm run format:check`
- [ ] TypeScript OK: `npm run type-check`
- [ ] Build sin errores: `npm run build`
- [ ] Coverage >80% en código nuevo

### Documentación
- [ ] Agentes mencionados en descripción de PR
- [ ] Patrones del agente aplicados correctamente
- [ ] Código auto-documentado (comentarios para "por qué")

### Performance
- [ ] Frontend: Lighthouse >90 Performance
- [ ] Backend: Queries optimizadas (no N+1)
- [ ] Bundle: Dentro de límites (<500KB gzip)

### Seguridad
- [ ] No hay secrets en código
- [ ] Input validado
- [ ] CORS configurado

---

## 🚀 Despliegue

### Ambientes

**Development** (automático en cada push a `main`)
```bash
URL: https://dev.cermont.local
Autoploy: ✅ Sí (GitHub Actions)
```

**Staging** (manual)
```bash
# En GitHub UI → Actions → Deploy Staging
# O manual: npm run deploy:staging
```

**Production** (manual, con aprobación)
```bash
# En GitHub UI → Actions → Deploy Production
# Requiere: 2x aprobaciones, tests passing
```

**Detalles:** Ver `.github/agents/devops-ci-cd.agent.md`

---

## 📊 Monitoreo y Observabilidad

- **Logs:** Centralizados en [tu plataforma de logs]
- **Alerts:** Configuradas en [plataforma de alertas]
- **Health Checks:** `/api/health` en backend
- **Performance:** Tracked en Lighthouse (CI)

---

## 🤝 Contribuir

### Primero...
1. Lee [`.github/ONBOARDING.md`](.github/ONBOARDING.md) (si eres nuevo)
2. Consulta [`.github/AGENTS.md`](.github/AGENTS.md) (para tu área)
3. Usa [`.github/TASK_TEMPLATE.md`](.github/TASK_TEMPLATE.md) (para tu tarea)

### Luego...
1. Crea rama: `git checkout -b [tipo]/[descripcion]`
   - `feat/`: Nuevas características
   - `fix/`: Correcciones
   - `refactor/`: Cambios sin comportamiento nuevo
   - `docs/`: Solo documentación

2. Haz commits claros:
   ```bash
   git commit -m "[tipo] Descripción - Agentes aplicados"
   # Ejemplo: "[feat] Add order history - backend-ordenes + frontend-api-integration"
   ```

3. Sigue el PR template (auto-generado en GitHub)

---

## ❓ Ayuda y Soporte

**¿Dónde buscar?**

| Pregunta | Recurso |
|----------|----------|
| "¿Cómo inicio el proyecto?" | [ONBOARDING.md](.github/ONBOARDING.md) |
| "¿Cuál es el patrón para...?" | [AGENTS.md](.github/AGENTS.md) + agente específico |
| "¿Cómo estructura una tarea?" | [TASK_TEMPLATE.md](.github/TASK_TEMPLATE.md) |
| "¿Cuáles son las reglas transversales?" | [AGENTS.md](.github/AGENTS.md) - GEMINI |
| "Tengo un bug en [módulo]" | Consulta `[módulo].agent.md` → "Límites" |

---

## 📈 Estadísticas del Proyecto

- **Agentes Especializados:** 13
- **Cobertura de Código:** >80% (target)
- **TypeScript:** 100% tipado
- **Tests:** Unit + Integration + E2E
- **CI/CD:** GitHub Actions
- **Documentación:** Centralizada en `.github/`

---

## 📝 Licencia

Propietario. © 2024-2026 Cermont

---

## 👥 Mantainers

- **Tech Lead:** [@JuanDiego30](https://github.com/JuanDiego30)
- **Slack:** #development
- **Email:** [Ver CODEOWNERS]

---

## 🎯 Visión del Proyecto

Cermont busca ser la **solución integral de gestión de órdenes** más confiable, performante y mantenible para empresas medianas. 

**Pilares:**
- 🎯 **Usabilidad:** UI/UX accesible e intuitiva
- ⚡ **Performance:** <1s en operaciones críticas
- 🔒 **Seguridad:** Autenticación y autorización robustas
- 📊 **Escalabilidad:** Arquitectura preparada para crecer
- 🧪 **Calidad:** Testing exhaustivo (>80% coverage)
- 📚 **Mantenibilidad:** Código documentado y predecible

---

## 🚀 Próximos Pasos

**Si acabas de clonar el repo:**
1. Lee [ONBOARDING.md](.github/ONBOARDING.md) (10 min)
2. Setup local (15 min)
3. Elige tu primer issue 🎯

**Si eres maintainer:**
- Revisa [AGENTS.md](.github/AGENTS.md) - Actualizar si hay cambios
- Monitorea PRs contra patrones de agentes
- Propone mejoras al framework

---

**Status:** ✅ Producción-Ready  
**Última actualización:** 2026-01-02  
**Documentación:** Completa y centralizada en `.github/`

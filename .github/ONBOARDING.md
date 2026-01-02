# 🚀 CERMONT ONBOARDING GUIDE

¡Bienvenido al equipo de desarrollo de **Cermont**! Este documento te guía rápidamente a través de la arquitectura, herramientas y patrones que usamos.

---

## 🎯 Requisitos Previos

Asume que tienes:
- ✅ Node.js 20+ instalado
- ✅ Git configurado
- ✅ Editor de código (VS Code recomendado)
- ✅ Acceso a GitHub (SSH key configurada)
- ✅ Nociones de TypeScript, Angular, NestJS

---

## 📋 Día 1: Setup Local

### 1. Clonar y setup del proyecto
```bash
git clone git@github.com:JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo
npm install
```

### 2. Configura variables de entorno
```bash
cp .env.example .env.local
# Edita .env.local con tu configuración local
```

### 3. Inicia servicios locales
```bash
# Docker Compose (si tienes Docker)
docker-compose -f docker-compose.dev.yml up -d

# O BD local: PostgreSQL + Redis
```

### 4. Verifica que todo funciona
```bash
# Backend
npm run start:api
# Deberaá salir: API running on http://localhost:3000

# En otra terminal - Frontend
npm run start:web
# Deberaá salir: Angular dev server running on http://localhost:4200
```

✅ **Si ambos corren:** Configuración completa

---

## 🤖 Día 2: Entiende los Agentes

### Concepto Clave: "Agentes Especializados"

Cermont usa **13 agentes especializados** como guías de expertos para cada área del código.

**¿Qué es un agente?**
- Un documento `[NOMBRE].agent.md` en `.github/agents/`
- Contiene: patrones obligatorios, límites, checklists
- Es tu referencia cuando necesitas hacer cambios

### Tipos de Agentes

**Backend (7 agentes)** - para `apps/api/**`
- `backend-auth.agent.md` - Autenticación y permisos
- `backend-ordenes.agent.md` - Gestión de órdenes
- `backend-evidencias.agent.md` - Archivos y almacenamiento
- `backend-formularios.agent.md` - Formularios dinámicos
- `backend-sync.agent.md` - Sincronización offline
- `backend-reportes-pdf.agent.md` - Generación de PDFs
- `quality-testing.agent.md` - Tests y cobertura

**Frontend (5 agentes)** - para `apps/web/**`
- `frontend.agent.md` - Arquitectura general (umbrella)
- `frontend-api-integration.agent.md` - HTTP y servicios
- `frontend-ui-ux.agent.md` - Componentes y accesibilidad
- `frontend-state-data.agent.md` - Estado (NgRx/Signals)
- `frontend-performance.agent.md` - Optimización

**DevOps (1 agente)**
- `devops-ci-cd.agent.md` - Docker, CI/CD, deployments

### Comienzo Rápido: Lee el Índice

1. Lee `.github/AGENTS.md` (índice maestro) - 10 min
2. Entiende tu área de trabajo:
   - Si trabajas en Backend → Lee `backend.agent.md`
   - Si trabajas en Frontend → Lee `frontend.agent.md`
   - Si trabajas en DevOps → Lee `devops-ci-cd.agent.md`

---

## 📚 Día 3: Primera Tarea

### Escenario: "Necesito crear un nuevo componente"

**Paso 1: Identifica el agente**
```
“Crear componente" → frontend-ui-ux.agent.md
```

**Paso 2: Lee el agente**
```
Abrir .github/agents/frontend-ui-ux.agent.md
Busca sección: "Patrones UI/UX (obligatorios)"
```

**Paso 3: Sigue el patrón**
```typescript
// Crea el componente en shared/components/
// Asegura: ARIA labels, keyboard navigation, responsive
```

**Paso 4: Valida contra checklist del agente**
```
- ✅ Componente en shared/components/
- ✅ Template con role, aria-label
- ✅ Keyboard navigation funciona
- ✅ Responsive: mobile, tablet, desktop
- ... (más items del checklist)
```

**Paso 5: Crea el PR**
```
Título: [feat] Button component (accesible, responsive) - frontend-ui-ux
Descripción: Menciona qué agente seguiste y validaciones
```

✅ **Listo!**

---

## 🟠 Estructura del Proyecto

```
cermont_aplicativo/
├── .github/
│   ├── agents/                ← 13 agentes especializados
│   ├── workflows/             ← CI/CD (GitHub Actions)
│   ├── AGENTS.md              ← 📄 Índice maestro de agentes
│   ├── TASK_TEMPLATE.md       ← 📄 Plantilla para nuevas tareas
│   └── ONBOARDING.md          ← 📄 Este archivo
├── apps/
│   ├── api/                   ← Backend (NestJS)
│   │   ├── src/modules/
│   │   │   ├── auth/
│   │   │   ├── ordenes/
│   │   │   ├── evidencias/
│   │   │   └── ... (más módulos)
│   │   └── main.ts
│   └── web/                   ← Frontend (Angular)
│       ├── src/app/
│       │   ├── core/              ← Guards, interceptors, services
│       │   ├── shared/            ← Componentes reutilizables
│       │   ├── features/          ← Módulos de features (lazy loaded)
│       │   └── app.routes.ts
│       └── main.ts
├── docker/                ← Dockerfiles
├── docker-compose.dev.yml ← Desarrollo local
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📚 Scripts Comunes

```bash
# Desarrollo
npm run start:api           # Backend en puerto 3000
npm run start:web           # Frontend en puerto 4200

# Testing
npm run test                # Tests unitarios (todo)
npm run test:api            # Solo backend
npm run test:web            # Solo frontend
npm run test -- --coverage  # Con cobertura
npm run test:e2e            # E2E (Cypress)

# Linting y formato
npm run lint                # ESLint
npm run format              # Prettier (escribir)
npm run format:check        # Prettier (verificar)
npm run type-check          # TypeScript

# Build
npm run build:api           # Build backend
npm run build:web           # Build frontend
npm run build               # Build ambos

# Docker
docker-compose -f docker-compose.dev.yml up -d    # Iniciar
docker-compose -f docker-compose.dev.yml down     # Detener

# BD
npm run migrate             # Ejecutar migrations (Prisma)
npm run migrate:reset       # Reset BD (⚠️ cuidado en dev)
```

---

## 🚿 Flujo de Trabajo Típico

### 1. Recibe una tarea
```
Issue: "Crear endpoint para obtener historial de órdenes"
```

### 2. Identifica agentes relevantes
```
🤖 Agentes:
- backend-ordenes.agent.md (endpoint)
- backend-auth.agent.md (seguridad)
- frontend-api-integration.agent.md (consumirlo)
- quality-testing.agent.md (tests)
```

### 3. Crea rama
```bash
git checkout -b feat/ordenes-historial
```

### 4. Implementa siguiendo patrones de agentes
```typescript
// Backend: sigue patrón de endpoint de backend-ordenes.agent.md
// Tests: sigue patrón de quality-testing.agent.md
// Frontend: sigue patrón de frontend-api-integration.agent.md
```

### 5. Valida
```bash
npm run lint
npm run format:check
npm run type-check
npm run test -- --coverage  # >80% coverage
npm run build               # Build sin errores
```

### 6. Crea PR
```
Título: [feat] Add endpoint GET /ordenes/{id}/historial - backend-ordenes + frontend-api-integration + quality-testing

Descripción:
## Objetivo
Crear endpoint para obtener historial de cambios de una orden

## Agentes Aplicados
- backend-ordenes.agent.md: Patrón de endpoint
- frontend-api-integration.agent.md: Cómo consumirlo
- quality-testing.agent.md: Tests ✅

## Checklist
- [x] Tests pasan (coverage 85%)
- [x] Linting OK
- [x] Build OK
- [x] Validado contra agentes
```

### 7. Code review + Merge
```bash
# Después de aprobación
git checkout main
git pull origin main
git merge feat/ordenes-historial
git push origin main
```

---

## ❔ Preguntas Frecuentes

### "¿Dónde pongo este código?"
```
🤖 Consulta el agente relevante:
- Componente → frontend.agent.md (Estructura)
- Servicio API → backend-[feature].agent.md
- Test → quality-testing.agent.md
```

### "¿Cómo validar que estoy siguiendo patrones?"
```
🤖 Sigue el checklist del agente:
1. Lee sección "Checklist [Feature] Done"
2. Verifica todos los items
3. Si falta algo, vá a "Patrones" y ajusta
```

### "¿Qué si el agente no cubre mi caso?"
```
🤖 Opciones:
1. Consulta agente "umbrella" (backend.agent.md o frontend.agent.md)
2. Si sigue siendo incierto, propone en PR y documenta decisión
3. Sugiere actualización al agente para futuro
```

### "¿Puedo ignorar el agente y hacer lo mío?"
```
🤖 Idealmente NO:
- Agentes aseguran consistencia del equipo
- Si hay excepto, documenta en PR por qué
- En PR review se validará la decisión
```

### "¿Qué es "quality-testing.agent.md"?"
```
🤖 Guía para escribir tests de calidad:
- Unit tests (servicios, pipes, funciones)
- Integration tests (BD, APIs)
- E2E tests (flujos críticos)
- Coverage >80% en código nuevo
```

---

## 📍 Primeros 5 Días - Plan Recomendado

| Día | Actividad | Tiempo | Resultado |
|-----|----------|--------|----------|
| 1 | Setup local + verificar build | 2h | Ambiente listo |
| 2 | Leer AGENTS.md + agente de tu área | 2h | Entíendete los patrones |
| 3 | Tarea pequeña (bug fix o refactor) | 4h | Primera PR |
| 4 | Tarea mediana (nuevo componente/endpoint) | 8h | Segundo PR |
| 5 | Revisar PRs de compañeros + aprende patrones | 4h | Conocer código del equipo |

---

## 📮 Recursos ÚTiles

### Documentación en el repo
- `.github/AGENTS.md` - Índice maestro de agentes
- `.github/TASK_TEMPLATE.md` - Plantilla para ejecutar tareas
- `.github/agents/*` - Archivos de cada agente (13 total)

### Herramientas
- **VS Code Extensions:**
  - ESLint
  - Prettier
  - Angular Language Service
  - Swagger UI

- **Comandos Útiles:**
  ```bash
  npm run dev              # Inicia ambos servidores
  npm run test:watch      # Tests en modo watch
  npm run type-check:watch # TypeScript en modo watch
  ```

### Documentación Externa
- [NestJS Docs](https://docs.nestjs.com)
- [Angular Docs](https://angular.io/docs)
- [Prisma ORM](https://www.prisma.io/docs)
- [RxJS](https://rxjs.dev)

---

## 🔔 Cómo Obtener Ayuda

1. **Antes de preguntar:**
   - Consulta el agente relevante
   - Busca en issues/PRs anteriores
   - Lee el README del módulo

2. **Luego de lo anterior, escribe:**
   - Issue descripción clara
   - Agente(s) consultados
   - Qué intentaste
   - Código/error si aplica

3. **Contactos:**
   - Tech Lead: [Ver CODEOWNERS]
   - Slack: #development

---

## 🌟 Bienvenida de Nuevo!

Te han sumado al equipo porque creemos en ti.

**Recuerda:**
- Los agentes están para ayudarte (no asustar)
- El código es conversación del equipo
- PRs son oportunidades de aprender
- Hazlo con excelencia, pero sin presión

**¿Contenido de este onboarding?**
Si tienes sugerencias, crea una PR y actualiza este archivo.

---

**Onboarding versión:** 1.0
**Última actualización:** 2026-01-02
**Estado:** 🙋 "Bienvenido a Cermont!"

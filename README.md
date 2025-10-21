
# Cermont Aplicativo – ATG

> Plataforma web para la gestión operativa de Cermont: órdenes de trabajo, coordinación de cuadrillas, seguimiento de fallas y cierre administrativo (informes, actas, SES, facturas).  
> **Versión:** 1.0.0  
> **Última actualización:** October 20, 2025

## 0) Resumen de estado (según repo y bitácora)
- ✅ Navegación unificada (sidebar + header móvil), tema oscuro/claro y accesos rápidos.
- ✅ Módulo de Órdenes (UI): landing, crear estándar, CCTV, planeación (tabs), checklist/evidencias (componentes listos).
- ✅ Autenticación (UI) lista para conectar a API.
- ✅ Dashboards por rol (scaffolding).
- ✅ Asistente ATG (`/api/assistant`) operando como proxy.
- ✅ Backend Express `/v1` con Postgres (pg), JWT propio, healthcheck y middleware comunes.
- ✅ Responsivo, accesible y atajos de teclado.
- ✅ **Backend hardening** con Helmet, rate-limiting, validación estricta de env, structured logging.
- ✅ **Despliegue automático** vía GitHub Actions → VPS con SSH.
- ✅ **Monitoreo & alertas** con PM2, healthchecks, logs centralizados.
- ✅ **Documentación completa** en `/docs` (Deploy, API, Frontend, Monitoring).
- ✅ **v1.0.0 stable** - Release listo para producción.
- ⏳ **Pendiente enlazar** UI ↔ API para auth y órdenes. 
- ⏳ **Pendiente** cierre administrativo, propuestas/PO, costos vs estimado, KPIs, permisos/auditoría completos y PDFs.

---

## Reporte de trabajo – 20 oct 2025
- 🔐 Migración de `AuthProvider` para consumir el backend JWT (`src/lib/auth/AuthContext.tsx`), incluyendo carga del usuario desde `/v1/auth/users/me`, gestión local de token y fallback de nombre.
- 💾 Implementación de `tokenStorage` (`src/lib/auth/tokenStorage.ts`) con sincronización entre pestañas y listeners para SSR/client.
- 🧩 Ajustes de modelo `User` (`src/lib/types/roles.ts`) para reflejar el payload del backend sin campos propios de Supabase.
- 📝 Actualización de formularios de login/registro (`src/components/forms/LoginForm.tsx`, `RegisterForm.tsx`): se removió OAuth, se forzó contraseña ≥8 caracteres y se añadió redirección automática.
- ✅ `npm run lint` finalizó sin errores tras los cambios.

## 1) Objetivos del proyecto
1. Gestionar ciclo completo de órdenes (solicitud→visita→propuesta/PO→planeación→ejecución→informe/acta→SES/factura).
2. Asegurar **trazabilidad y auditoría** en cada transición de estado.
3. **Bloquear** ejecución si checklists críticos no están completos.
4. Consolidar **evidencias** (fotos, firmas) y **generar PDFs** (informe y acta) automáticamente.
5. Medir **costos vs estimado** y **KPIs** operativos.

## 2) Arquitectura y stack
- **Frontend:** Next.js 15 + React 19 + TypeScript, Mantine, RHF + Zod, anime.js.
- **Backend:** Express 5 (TypeScript), CORS, Multer, logger y manejo de errores.
- **Datos:** Postgres gestionado vía `pg` (Pool) y almacenamiento local de evidencias (Multer + `/data`). 
- **Estilo/Dev:** ESLint 9, Tailwind 4 (utilidades), Turbopack, TSX, Concurrently.

```
src/
├─ api/                 # backend express
│  ├─ config/           # env y utilidades comunes
│  ├─ middleware/       # logger, errors
│  └─ routes/           # usuarios, health, (ordenes, cierre, evidencias…)
├─ app/                 # Next.js App Router
│  ├─ autenticacion/
│  ├─ ordenes/
│  ├─ reportes/, usuarios/, dashboards/...
│  └─ api/assistant/
├─ components/          # UI compartida
├─ lib/                 # hooks, auth, http
├─ styles/              # estilos
└─ types/               # tipos compartidos
```

## 3) Entregables MVP por módulo (criterios de aceptación)
- **Auth/Usuarios**: login/registro funcional con JWT; rutas protegidas por rol.
- **Órdenes**: crear con obligatorios; asignar responsable; cambiar estado; bloquear "En ejecución" si checklist crítico incompleto; subir evidencias; generar **Informe PDF**.
- **Cierre Administrativo**: flujo Informe→Acta→SES→Factura; recordatorios por aging; exportables.
- **Propuesta/PO**: versionado, aprobación y vínculo con orden.
- **Costos vs Estimado**: consolidar HH/materiales/equipos; desvío % y valor; export.
- **KPIs/Reportes**: tiempos de ciclo, cumplimiento, aging SES/factura; filtros y export.

---

## 📚 Infraestructura y Despliegue

### Despliegue Automatizado
- **GitHub Actions**: Pipeline CI/CD que compila, prueba y despliega automáticamente a VPS
- **SSH Deployment**: Integración segura con VPS vía claves privadas
- **Local Fallback**: Script `ops/scripts/deploy.sh` para despliegue manual

### Monitoreo & Alertas
- **Health Endpoints**: `/v1/health` (básico) y `/v1/health/version` (con git commit)
- **PM2 Monitoring**: Gestión de procesos, log rotation, auto-restart
- **Logs Centralizados**: `/var/log/pm2/cermont-*.log` con rotación automática
- **Alertas Discord/Slack**: Scripts en `ops/scripts/notify.sh`

### Documentación Técnica
| Documento | Descripción |
|-----------|-------------|
| [docs/README_DEPLOY.md](./docs/README_DEPLOY.md) | Guía completa VPS, DB, systemd, Nginx, SSL |
| [docs/README_API.md](./docs/README_API.md) | Referencia de endpoints, auth, ejemplos cURL |
| [docs/README_FRONTEND.md](./docs/README_FRONTEND.md) | Arquitectura Next.js, rutas, componentes, hooks |
| [docs/README_MONITORING.md](./docs/README_MONITORING.md) | Logs, PM2, healthchecks, debugging |
| [CHANGELOG.md](./CHANGELOG.md) | Historial de cambios v0.1 → v1.0 |

---

## 4) Rutas/API (contrato inicial)
- `GET /v1/health`
- `GET /v1/health/version` – Version y commit actual
- `POST /v1/auth/login`, `POST /v1/auth/register`, `GET /v1/users`, `GET /v1/users/:id`
- `GET /v1/ordenes`, `POST /v1/ordenes`, `GET /v1/ordenes/:id`, `PATCH /v1/ordenes/:id`
- `POST /v1/ordenes/:id/evidencias` (Multer + filesystem `/data/evidencias`)
- `POST /v1/ordenes/:id/informe` → devuelve `informe_pdf_url`
- `POST /v1/ordenes/:id/acta`, `POST /v1/ordenes/:id/ses`, `POST /v1/ordenes/:id/factura`

### Errores (formato estándar)
```json
{ "code": "string", "message": "string", "details": {} }
```

## 5) Modelo de datos (resumen)
- `usuarios`, `roles`, `permisos`, `rol_permiso`
- `clientes`
- `ordenes`, `orden_estado_hist`
- `checklists` (criticos), `evidencias`
- `propuestas`, `pos`
- `cierres` (informe, acta, ses, factura)
- Auditoría global: `creado_por/creado_en/mod_por/mod_en` + soft-delete `eliminado_en`

## 6) DoD y QA
- Build y migraciones limpias (local y CI).
- Pruebas de servicios/controladores y smoke tests de rutas.
- Revisión de permisos por rol en endpoints tocados.
- Auditoría activa en cambios de estado/creaciones.
- Documentación actualizada y capturas de verificación.

## 7) Roadmap inmediato (sprints cortos)
1. **Enlace Auth UI ↔ API** + middleware de roles en frontend y backend.
2. **Órdenes E2E** (checklists bloqueantes + evidencias + Informe PDF).
3. **Cierre Administrativo** (Acta/SES/Factura + tablero y recordatorios).
4. **Propuesta/PO** (versionado y aprobación).
5. **Costos vs Estimado** + **KPIs**.

## 8) Variables de entorno (mínimas)
```env
DATABASE_URL=postgres://cermont_user:StrongPass@localhost:5432/cermontdb
JWT_SECRET=superSecretKeyChangeMe
FRONTEND_ORIGIN=http://localhost:3000
PORT=4000
NODE_ENV=development
LOG_LEVEL=info
STORAGE_DIR=./data
```

## 9) Comandos útiles
- `npm run dev` (frontend), `npm run backend:dev` (API), `npm run dev:all` (ambos)
- `npm run lint`, `npm run backend:build`, `npm run build`
- `npm run test:e2e` (Playwright tests)
- `bash ops/scripts/deploy.sh` (manual deployment)

## 10) Backlog de bugs comunes (para triage rápido)
- Validación de **obligatorios** en formularios.
- Tokens/credenciales ausentes o mal configuradas en `.env`.
- CORS no alineado con `FRONTEND_ORIGIN`.
- Subida de archivos grandes → 413 (ajustar límites de Multer y reverse proxy).


## 4) Rutas/API (contrato inicial)
- `GET /v1/health`
- `POST /v1/auth/login`, `POST /v1/auth/register`, `GET /v1/users`, `GET /v1/users/:id`
- `GET /v1/ordenes`, `POST /v1/ordenes`, `GET /v1/ordenes/:id`, `PATCH /v1/ordenes/:id`
- `POST /v1/ordenes/:id/evidencias` (Multer + filesystem `/data/evidencias`)
- `POST /v1/ordenes/:id/informe` → devuelve `informe_pdf_url`
- `POST /v1/ordenes/:id/acta`, `POST /v1/ordenes/:id/ses`, `POST /v1/ordenes/:id/factura`

### Errores (formato estándar)
```json
{{ "code": "string", "message": "string", "details": {{}} }}
```

## 5) Modelo de datos (resumen)
- `usuarios`, `roles`, `permisos`, `rol_permiso`
- `clientes`
- `ordenes`, `orden_estado_hist`
- `checklists` (criticos), `evidencias`
- `propuestas`, `pos`
- `cierres` (informe, acta, ses, factura)
- Auditoría global: `creado_por/creado_en/mod_por/mod_en` + soft-delete `eliminado_en`

## 6) DoD y QA
- Build y migraciones limpias (local y CI).
- Pruebas de servicios/controladores y smoke tests de rutas.
- Revisión de permisos por rol en endpoints tocados.
- Auditoría activa en cambios de estado/creaciones.
- Documentación actualizada y capturas de verificación.

## 7) Roadmap inmediato (sprints cortos)
1. **Enlace Auth UI ↔ API** + middleware de roles en frontend y backend.
2. **Órdenes E2E** (checklists bloqueantes + evidencias + Informe PDF).
3. **Cierre Administrativo** (Acta/SES/Factura + tablero y recordatorios).
4. **Propuesta/PO** (versionado y aprobación).
5. **Costos vs Estimado** + **KPIs**.

## 8) Variables de entorno (mínimas)
```env
DATABASE_URL=postgres://cermont_user:StrongPass@localhost:5432/cermontdb
JWT_SECRET=superSecretKeyChangeMe
FRONTEND_ORIGIN=http://localhost:3000
PORT=4000
NODE_ENV=development
```

## 9) Comandos útiles
- `npm run dev` (frontend), `npm run backend:dev` (API), `npm run dev:all` (ambos)
- `npm run lint`, `npm run backend:build`, `npm run build`

## 10) Backlog de bugs comunes (para triage rápido)
- Validación de **obligatorios** en formularios.
- Tokens/credenciales ausentes o mal configuradas en `.env`.
- CORS no alineado con `FRONTEND_ORIGIN`.
- Subida de archivos grandes → 413 (ajustar límites de Multer y reverse proxy).
- PDFs con fuentes/acentos: incrustar fuentes o usar `pdf-lib`/`puppeteer` en server.

---

_This README guía a Copilot y al equipo para mantener foco en objetivos y calidad._

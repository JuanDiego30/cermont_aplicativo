# 📂 Manifiesto del Repositorio — `cermont_aplicativo`

> **Propósito:** Evidencia técnica de la arquitectura, módulos y componentes para el Libro de Grado.  
> **Versión:** 1.0.0 (Actualizado: Mayo 2026)  
> **Estado de Implementación:** 100% de los 14 pasos operativos cubiertos.

---

## 1. ARQUITECTURA GENERAL DEL MONOREPO

| Workspace | Descripción | Tecnologías Clave |
|---|---|---|
| `backend/` | API REST + Lógica de Negocio | Express 5.2.1, Mongoose 9.5, MongoDB 7.0 |
| `frontend/` | Interfaz Web PWA + App Router | Next.js 16.2, TanStack Query v5, Zustand v5 |
| `packages/shared-types/` | Contratos de Datos Compartidos | Zod 4.3.6 (22 schemas), RBAC, FSM |

---

## 2. INVENTARIO DE MÓDULOS API (20 RUTAS REGISTRADAS)

| Ruta API | Módulo | Función Principal | Paso CERMONT |
|---|---|---|---|
| `/api/auth` | Autenticación | JWT HttpOnly + RBAC | Transversal |
| `/api/orders` | Órdenes de Trabajo | FSM Central (15 estados) | 1 - 14 |
| `/api/orders/closure-report` | **Cierre Consolidado** | Trazabilidad pasos 8-14 | 8 - 14 |
| `/api/proposals` | Propuestas | Propuestas económicas y PO | 3 - 4 |
| `/api/resources` | Recursos | Kits de planeación | 5 |
| `/api/evidences` | Evidencias | Captura fotográfica geolocalizada | 6 |
| `/api/checklists` | Checklists | Ejecución en campo offline | 6 |
| `/api/reports` | Reportes | Generación PDF (pdf-lib) | 7 |
| `/api/service-entry-sheets` | SES | Registro y seguimiento SAP Ariba | 10 - 11 |
| `/api/invoices` | Facturas | Seguimiento de facturación interna | 12 - 13 |
| `/api/payments` | Pagos | Conciliación de pagos | 14 |
| `/api/analytics` | Dashboard | Métricas de rendimiento | Transversal |
| `/api/sync` | Sincronización | Offline-First (Serwist 9.x) | Transversal |
| `/api/ai` | Inteligencia Artificial | Asistente inteligente (v1.0) | Propuesto v2.0 |
| `/api/audit` | Auditoría | Logs inmutables de estados | Transversal |
| `/api/users` | Usuarios | Gestión de 8 roles RBAC | Transversal |
| `/api/documents` | Documentos | Gestión documental base | Transversal |
| `/api/maintenance` | Mantenimiento | Kits de mantenimiento típicos | 5 |
| `/api/inspections` | Inspecciones | Visitas técnicas iniciales | 2 |
| `/api/notifications` | Notificaciones | Alertas push en tiempo real | Transversal |

---

## 3. SEGURIDAD Y CUMPLIMIENTO

- **Zero-Trust Validation:** Validación dual (Zod en frontend y backend).
- **Security in Depth:** 6 capas de protección (CORS, Helmet, Rate Limit, JWT, RBAC, Sanitize).
- **Inmutable Audit:** Registro automático de `createdBy`/`updatedBy` en todos los documentos.
- **Academic Integrity:** Referencias IEEE y alineación estricta con los 14 pasos operativos.

---

## 4. HERRAMIENTAS DE DESARROLLO (BUILD PIPELINE)

- **Build Tool:** Turborepo 2.9 (Caché agresivo).
- **Linter/Formatter:** Biome 2.4 (Reemplaza ESLint y Prettier).
- **Process Manager:** PM2 (Despliegue en VPS propio).
- **Containerization:** Docker + Docker Compose.
- **Operating System:** Ubuntu 22.04 LTS (VPS).

# Estado del Desarrollo — CERMONT S.A.S.

**Fecha:** 2026-06-24  
**Versión:** 1.1  
**Última actualización:** Migración de envelope de paginación completada (Spec 002 Stage 1)  

---

## Mapa de Estados por Módulo

| Módulo | Estado | Frontend | Backend | Contrato | Tests | Docs | Observaciones |
|--------|--------|----------|---------|----------|-------|------|-------------|
| **Auth** | `done` | ✅ | ✅ | ✅ | ⚠️ | ✅ | Rotación de tokens, cookies httpOnly, rate limiting |
| **Usuarios** | `done` | ✅ | ✅ | ✅ | ⚠️ | ✅ | CRUD completo, certificaciones, skills |
| **Roles/RBAC** | `done` | ✅ | ✅ | ✅ | ⚠️ | ✅ | 15 roles (8 docs + 7 reales), canAccessPath, canPerformAction |
| **Dashboard/KPIs** | `done` | ✅ | ✅ | ✅ | ✅ | ✅ | DashboardSummary implementado, envelope conforme (sendSuccess), test en dashboard.controller.test.ts |
| **Work Requests** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | CRUD + visits + status transitions |
| **Site Visits** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | CRUD + schedule |
| **Proposals** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | CRUD + send/approve/reject |
| **Purchase Orders** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | Adjuntar PO a propuesta |
| **Orders** | `done` | ✅ | ✅ | ✅ | ⚠️ | ✅ | CRUD + kanban + status machine + asignación |
| **Planning** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | Planning packet + approve |
| **Execution** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | Sessions + pause/complete + materials/labor |
| **Evidence** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | Upload multipart + verify + reject + GPS |
| **Files** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | Subida segura, UUID renaming, magic bytes |
| **Camara** | `done` | ✅ | — | ✅ | ❌ | ⚠️ | Captura desde frontend, procesamiento backend |
| **Documents/PDF** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | CRUD + templates + generación PDF |
| **Checklists** | `done` | ⚠️ | ✅ | ✅ | ❌ | ✅ | Backend implementado, UI por verificar |
| **Reports** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | CRUD + submit/approve |
| **Delivery Records** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | CRUD + client signature |
| **Service Entry Sheet** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | CRUD + submit/approve + invoice link |
| **Invoicing** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | Desde SES + submit/approve/reject |
| **Payments** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | CRUD + status |
| **Costs** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | Dashboard + catalog + actual costs |
| **Fleet** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | CRUD |
| **Assets** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | CRUD + maintenance link |
| **Maintenance** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | CRUD + planes |
| **Inventory** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | CRUD + scan |
| **Notifications** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | Backend + frontend |
| **Offline/PWA** | `partial` | ✅ | ✅ | — | ✅ | ⚠️ | IndexedDB queue, sync, service worker |
| **Audit** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | Logging inmutable, queryable |
| **Templates** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | CRUD + builder + responses |
| **SLA** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | CRUD |
| **Dispatch** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | CRUD |
| **Service Cases** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | Cockpit 14 pasos |
| **Safety Analysis** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | AST/HSE |
| **Portal Cliente** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | Portal + vistas cliente |
| **Sync** | `done` | — | ✅ | ✅ | ❌ | ✅ | Offline sync endpoint |
| **System Config** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | Configuración del sistema |
| **DIAN** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | Facturación electrónica |
| **ERP Connector** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | Integración ERP |
| **AI** | `done` | — | ✅ | ✅ | ❌ | ✅ | Asistente IA |
| **Observability** | `done` | — | ✅ | — | — | — | Health checks, métricas |
| **Admin/Backups** | `done` | ✅ | ✅ | ✅ | ❌ | ✅ | Admin panel + backups |
| **Legal/Privacidad** | `not-started` | ❌ | ❌ | ❌ | ❌ | ❌ | Sin implementación legal |
| **SSL/Deploy** | `done` | ✅ | ✅ | — | ❌ | ✅ | nginx + Certbot + PM2 |

---

## Resumen

| Métrica | Valor |
|---------|-------|
| Módulos totales | 40+ |
| Módulos `done` | ~35 |
| Módulos `partial` | 3 (Dashboard, Offline/PWA, Evidence response) |
| Módulos `not-started` | 1 (Legal/Privacidad) |
| Tests unitarios | 991 (según reporte de build) |
| Tests E2E | Existen spec de login + demo |
| Cobertura | No verificada |
| Quality gates | 9 gates funcionando |
| React Doctor | 100/100 (último reporte) |
| Build | 83 rutas estáticas producidas |

---

## Áreas que Requieren Atención

1. **Tests:** La mayoría de módulos no tienen tests de integración de rutas ni contratos
2. **Legal/Privacidad:** Sin implementación de Ley 1581
3. **API_ENDPOINT_MATRIX.md:** Desactualizado (100 documentados vs 389+ reales)
4. **Evidence retention:** Sin política de retención para evidencias fotográficas

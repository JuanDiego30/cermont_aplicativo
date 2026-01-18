# 🎓 PLAN DE REENFOQUE CERMONT - PROYECTO DE GRADO

**Título:** DESARROLLO DE UN APLICATIVO WEB PARA LA GESTIÓN DE ÓRDENES DE TRABAJO, TRAZABILIDAD Y CIERRE ADMINISTRATIVO DE PROCESOS OPERATIVOS EN CERMONT S.A.S.

**Autor:** Juan Diego Arévalo Pidiache  
**Director:** MSc. Luis Alberto Muñoz Bedoya  
**Universidad de Pamplona - Ingeniería Electrónica - 2025**

---

## 📋 FASE 1: FLUJO DE NEGOCIO REAL (14 PASOS)

### Resumen del Flujo Operativo (máx. 10 bullets)

Basado en el análisis del Capítulo 1 de la tesis y el enum `OrderSubState`:

1. **Paso 1 - Solicitud Recibida:** Cliente (SIERRACOL) envía solicitud de servicio técnico vía email/SAP Ariba
2. **Paso 2 - Visita Programada:** Supervisor programa visita técnica para diagnóstico en campo Caño Limón
3. **Paso 3 - Propuesta Elaborada:** Se genera propuesta económica con mano de obra, materiales, equipos y transporte
4. **Paso 4 - Propuesta Aprobada:** Cliente aprueba propuesta → Se genera OT con número interno
5. **Paso 5 - Planeación (kits típicos):** Supervisor asigna personal, materiales (kits), equipos y permisos de trabajo
6. **Paso 6 - Ejecución en Campo:** Técnicos ejecutan trabajo con checklists digitales, capturan evidencias fotográficas georreferenciadas
7. **Paso 7 - Informe Generado:** Sistema genera automáticamente informe técnico PDF con evidencias
8. **Paso 8 - Acta Elaborada:** Se genera acta de entrega/recepción de trabajos
9. **Paso 9 - Acta Firmada:** Cliente firma acta digital confirmando recepción satisfactoria
10. **Pasos 10-14 - Cierre Administrativo:** SES en SAP Ariba → Factura electrónica DIAN → Pago recibido → Archivo

### Modelo de Estados Implementado

```
Estado Principal (OrderStatus)  │  Sub-Estados (14 pasos)
────────────────────────────────┼──────────────────────────────
PLANEACION                      │  solicitud_recibida (1)
                                │  visita_programada (2)
                                │  propuesta_elaborada (3)
                                │  propuesta_aprobada (4)
                                │  planeacion_iniciada (5a)
                                │  planeacion_aprobada (5b)
────────────────────────────────┼──────────────────────────────
EJECUCION                       │  ejecucion_iniciada (6a)
                                │  ejecucion_completada (6b)
                                │  informe_generado (7)
                                │  acta_elaborada (8)
                                │  acta_firmada (9)
────────────────────────────────┼──────────────────────────────
COMPLETADA                      │  ses_aprobada (11)
                                │  factura_aprobada (13)
                                │  pago_recibido (14)
```

---

## 📊 FASE 2: MAPEO MÓDULOS → PASOS DE NEGOCIO

### Tabla de Mapeo Actual

| Módulo Backend            | Pasos de Negocio    | Estado Actual   | Prioridad MVP |
| ------------------------- | ------------------- | --------------- | ------------- |
| `orders/`                 | 1-14 (núcleo)       | ✅ Completo     | 🔴 CRÍTICO    |
| `planning/`               | 5 (Planeación)      | ✅ Funcional    | 🔴 CRÍTICO    |
| `kits/`                   | 5 (kits típicos)    | ✅ Funcional    | 🔴 CRÍTICO    |
| `checklists/`             | 6 (Ejecución)       | ✅ Funcional    | 🔴 CRÍTICO    |
| `evidence/`               | 6 (Fotografías)     | ✅ Funcional    | 🔴 CRÍTICO    |
| `execution/`              | 6 (Control campo)   | ⚠️ Parcial      | 🔴 CRÍTICO    |
| `pdf-generation/`         | 7 (Informe PDF)     | ✅ Funcional    | 🔴 CRÍTICO    |
| `reports/`                | 7 (Reportes)        | ✅ Funcional    | 🟡 IMPORTANTE |
| `administrative-closure/` | 8-9 (Actas)         | ⚠️ Parcial      | 🔴 CRÍTICO    |
| `invoicing/`              | 10-14 (Facturación) | ⚠️ Básico       | 🟡 IMPORTANTE |
| `sync/`                   | N/A (offline)       | ✅ Funcional    | 🔴 CRÍTICO    |
| `auth/`                   | N/A (autenticación) | ✅ Completo     | 🔴 CRÍTICO    |
| `customers/`              | Cliente SIERRACOL   | ✅ Completo     | 🟡 IMPORTANTE |
| `technicians/`            | 6 (Asignación)      | ✅ Funcional    | 🔴 CRÍTICO    |
| `dashboard/`              | KPIs/Tablero        | ⚠️ Parcial      | 🟡 IMPORTANTE |
| `hes/`                    | HSE/Permisos        | ⚠️ Experimental | 🟢 POST-MVP   |
| `certifications/`         | Certificados        | ⚠️ Experimental | 🟢 POST-MVP   |
| `weather/`                | Clima               | ⚠️ Experimental | 🔵 FUTURO     |
| `alerts/`                 | Notificaciones      | ⚠️ Básico       | 🟢 POST-MVP   |
| `kpis/`                   | Analítica           | ⚠️ Básico       | 🟢 POST-MVP   |
| `costs/`                  | Costos              | ⚠️ Parcial      | 🟡 IMPORTANTE |
| `forms/`                  | Formularios         | ⚠️ Parcial      | 🟢 POST-MVP   |
| `notifications/`          | Notificaciones      | ⚠️ Básico       | 🟢 POST-MVP   |
| `admin/`                  | Administración      | ⚠️ Básico       | 🟡 IMPORTANTE |
| `archiving/`              | Archivo histórico   | ⚠️ Experimental | 🔵 FUTURO     |

---

## 🎯 FASE 3: MVP DE TESIS - ALCANCE REDUCIDO

### Funcionalidades IN (Tesis MVP)

| Funcionalidad                        | Módulo(s)                 | Rol Usuario | Paso(s) |
| ------------------------------------ | ------------------------- | ----------- | ------- |
| ✅ Crear/editar órdenes de trabajo   | `orders/`                 | Coordinador | 1-4     |
| ✅ Planeación con kits típicos       | `planning/`, `kits/`      | Coordinador | 5       |
| ✅ Checklists digitales              | `checklists/`             | Técnico     | 6       |
| ✅ Carga de evidencias fotográficas  | `evidence/`               | Técnico     | 6       |
| ✅ Operación offline + sync          | `sync/`                   | Técnico     | 6       |
| ✅ Generación automática informe PDF | `pdf-generation/`         | Sistema     | 7       |
| ✅ Actas de entrega digital          | `administrative-closure/` | Coordinador | 8-9     |
| ✅ Tablero simple (estado OTs + SES) | `dashboard/`              | Coordinador | 10-14   |
| ✅ Login con JWT + 2 roles           | `auth/`                   | Ambos       | N/A     |

### Funcionalidades OUT (Futuro Post-Tesis)

| Funcionalidad                    | Razón de Exclusión               |
| -------------------------------- | -------------------------------- |
| ❌ Integración SAP Ariba real    | Requiere credenciales cliente    |
| ❌ Facturación electrónica DIAN  | Requiere certificación proveedor |
| ❌ Notificaciones push           | Complejidad innecesaria MVP      |
| ❌ Reportes analíticos avanzados | Alcance limitado tesis           |
| ❌ Gestión de certificaciones    | No crítico para flujo principal  |
| ❌ Predicción ML de duraciones   | Investigación futura             |
| ❌ App móvil nativa              | PWA cubre necesidades            |
| ❌ Multi-cliente (multi-tenant)  | Solo SIERRACOL en piloto         |

### Roles MVP (Solo 2)

| Rol             | Descripción              | Permisos                                                  |
| --------------- | ------------------------ | --------------------------------------------------------- |
| **Coordinador** | Administrador/Supervisor | CRUD órdenes, planeación, aprobaciones, reportes, tablero |
| **Técnico**     | Personal de campo        | Ver OTs asignadas, checklists, evidencias, offline        |

---

## 📁 FASE 4: ALINEACIÓN DE CÓDIGO EXISTENTE

### Módulos Alineados (Sin Cambios)

```
✅ orders/          → Núcleo del sistema, flujo 14 pasos implementado
✅ planning/        → Planeación de recursos
✅ kits/            → Kits típicos por tipo de servicio
✅ checklists/      → Formularios digitales
✅ evidence/        → Gestión de fotografías
✅ pdf-generation/  → Generación automática PDF
✅ sync/            → Offline-first con IndexedDB
✅ auth/            → JWT + RBAC
✅ technicians/     → Gestión de técnicos
```

### Módulos a Completar (Prioridad Alta)

```
⚠️ execution/       → Falta integración completa con checklists
⚠️ administrative-closure/ → Completar workflow actas/SES
⚠️ dashboard/       → Crear tablero simple con KPIs básicos
⚠️ costs/           → Integrar con propuesta económica
```

### Módulos a Simplificar/Desactivar (Ruido)

```
🔇 weather/         → Desactivar, no crítico para MVP
🔇 alerts/          → Reducir a alertas básicas por email
🔇 kpis/            → Mover analítica avanzada a dashboard simple
🔇 certifications/  → Posponer a post-MVP
🔇 archiving/       → Mantener básico, sin auditoría avanzada
🔇 hes/             → Simplificar a permisos de trabajo básicos
```

### Limpieza Propuesta

```bash
# Archivos experimentales a marcar como draft
backend/src/modules/weather/     → Rename a _weather.draft/
backend/src/modules/kpis/        → Merge con dashboard/
backend/src/modules/archiving/   → Simplificar a un servicio básico
```

---

## ✅ FASE 5: CHECKLIST DE CALIDAD TESIS

### Backend (NestJS + Prisma)

| Criterio                                     | Estado       | Acción Requerida      |
| -------------------------------------------- | ------------ | --------------------- |
| ✅ Build sin errores TypeScript              | VERDE        | Mantener              |
| ✅ Tests unitarios (>80% cobertura críticos) | 138 passing  | Agregar 5-10 más      |
| ⚠️ Tests e2e flujo completo                  | Parcial      | Crear 3 tests e2e     |
| ✅ Swagger documentado                       | /api/docs    | Revisar endpoints MVP |
| ✅ Validación con Zod/class-validator        | Implementado | Verificar DTOs        |
| ⚠️ Manejo de errores consistente             | Parcial      | Unificar respuestas   |
| ✅ RBAC (roles)                              | Implementado | Verificar guards      |
| ⚠️ Logs estructurados                        | Básico       | Agregar Winston       |

### Frontend (Angular 21)

| Criterio                       | Estado              | Acción Requerida         |
| ------------------------------ | ------------------- | ------------------------ |
| ⚠️ Build sin errores           | Pendiente verificar | Ejecutar `ng build`      |
| ⚠️ Componentes MVP funcionales | Parcial             | Completar 5 vistas       |
| ⚠️ Formularios reactivos       | Parcial             | Validaciones             |
| ⚠️ PWA offline                 | Básico              | Probar service worker    |
| ⚠️ Responsive (móvil)          | Parcial             | Probar en 3 dispositivos |

### Base de Datos (PostgreSQL + Prisma)

| Criterio                   | Estado          | Acción Requerida     |
| -------------------------- | --------------- | -------------------- |
| ✅ Schema Prisma definido  | Completo        | Revisar índices      |
| ✅ Migraciones versionadas | Implementado    | Documentar           |
| ⚠️ Seeds con datos demo    | Básico          | Crear 10 OTs ejemplo |
| ⚠️ Backup automático       | No implementado | Script simple        |

### DevOps/Despliegue

| Criterio          | Estado          | Acción Requerida      |
| ----------------- | --------------- | --------------------- |
| ✅ Docker Compose | Implementado    | Probar producción     |
| ⚠️ CI/CD básico   | No implementado | GitHub Actions simple |
| ⚠️ .env.example   | Parcial         | Completar variables   |
| ❌ SSL/HTTPS      | No configurado  | Certbot en VPS        |
| ❌ Monitoreo      | No implementado | PM2 logs básico       |

---

## 🔗 FASE 6: REFERENCIAS GITHUB

### Repos de Referencia para FSM/CMMS

| Repo                                                          | Stack          | Qué Adoptar                    |
| ------------------------------------------------------------- | -------------- | ------------------------------ |
| [frappe/erpnext](https://github.com/frappe/erpnext)           | Python/MariaDB | Workflow de OTs, documentación |
| [openMAINT/openMAINT](https://github.com/tecnoteca/openmaint) | Java           | Modelo de datos CMMS           |
| [snipe/snipe-it](https://github.com/snipe/snipe-it)           | PHP/Laravel    | Auditoría, assets              |

### Buenas Prácticas a Adoptar

1. **Documentación inline** - JSDoc/TSDoc en funciones públicas
2. **README por módulo** - Ya implementado, mantener actualizado
3. **Changelog versionado** - Crear CHANGELOG.md
4. **Seed scripts** - Datos demo reproducibles
5. **API versioning** - Prefijo `/api/v1/`

---

## 📅 FASE 7: PLAN FINAL DE ATERRIZAJE (2-3 Semanas)

### Semana 1: Estabilización

| Día | Tarea                               | Entregable                 |
| --- | ----------------------------------- | -------------------------- |
| L   | Verificar build frontend Angular    | `ng build --prod` exitoso  |
| M   | Completar dashboard simple          | Vista con 5 KPIs básicos   |
| X   | Tests e2e flujo OT completo         | 3 tests Playwright/Cypress |
| J   | Seed script con 10 OTs demo         | `npm run seed:demo`        |
| V   | Documentar endpoints MVP en Swagger | /api/docs actualizado      |

### Semana 2: Despliegue VPS Contabo

| Día | Tarea                             | Entregable                 |
| --- | --------------------------------- | -------------------------- |
| L   | Provisionar VPS Contabo (4GB RAM) | Ubuntu 22.04 + Docker      |
| M   | Configurar PostgreSQL + backups   | DB accesible, cron backup  |
| X   | Deploy backend con PM2 o Docker   | API respondiendo en VPS    |
| X   | Deploy frontend (nginx)           | Frontend accesible         |
| J   | Configurar dominio + SSL          | HTTPS funcionando          |
| V   | Pruebas de humo completas         | Flujo OT funcional en prod |

### Semana 3: Piloto y Documentación

| Día | Tarea                             | Entregable                      |
| --- | --------------------------------- | ------------------------------- |
| L-M | Piloto con 5 usuarios (2 semanas) | 8-10 OTs ejecutadas             |
| X   | Recoger métricas pre/post         | Excel comparativo               |
| J   | Aplicar encuesta SUS              | Resultados usabilidad           |
| V   | Generar capturas para tesis       | Screenshots de todas las vistas |

### Checklist Evidencias para Tesis

- [ ] Capturas de pantalla de todas las vistas (20+)
- [ ] Diagrama de arquitectura actualizado
- [ ] Modelo Entidad-Relación exportado
- [ ] Métricas pre/post (tiempos, errores)
- [ ] Encuesta SUS aplicada (5 usuarios)
- [ ] Log de 8-10 OTs ejecutadas en piloto
- [ ] Video demo de 3-5 minutos
- [ ] Código fuente en GitHub con README

---

## 🚀 RESUMEN EJECUTIVO

### Estado Actual del Proyecto

| Métrica                    | Valor   |
| -------------------------- | ------- |
| Errores TypeScript Backend | 0       |
| Tests Pasando              | 138/141 |
| Módulos Implementados      | 25      |
| Módulos MVP Críticos       | 12      |
| Cobertura Flujo 14 Pasos   | ~70%    |

### Brecha para MVP Tesis

| Área                | Esfuerzo Estimado      |
| ------------------- | ---------------------- |
| Completar dashboard | 8 horas                |
| Tests e2e básicos   | 6 horas                |
| Deploy VPS Contabo  | 4 horas                |
| Seed data + docs    | 4 horas                |
| **TOTAL**           | **22 horas** (~3 días) |

### Próximos Pasos Inmediatos

1. ✅ Ejecutar `ng build` en frontend y corregir errores
2. ✅ Crear vista dashboard simple con 5 KPIs
3. ✅ Escribir 3 tests e2e del flujo orden→informe→acta
4. ✅ Configurar VPS Contabo con Docker Compose
5. ✅ Ejecutar piloto con 5 usuarios reales

---

_Documento generado el: 2025_  
_Versión: 1.0_

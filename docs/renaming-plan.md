# Renaming Plan (ES → EN)

## Estado

- Fecha: 2026-01-15
- Rama sugerida: feat/rename-backend-es-en-step1
- Política de compatibilidad legacy: **NO** (sin aliases ES; breaking change controlado).

## Mapa global (módulos y rutas)

| Módulo      | Español (actual) | Inglés (destino) | Rutas ES → EN                                                    | Notas                              |
| ----------- | ---------------- | ---------------- | ---------------------------------------------------------------- | ---------------------------------- |
| Orders      | ordenes          | orders           | /ordenes → /orders                                               | Mantener `ordenId` en DB/Prisma    |
| Evidence    | evidencias       | evidence         | /evidencias → /evidence                                          | Alias opcional para `/evidencias`  |
| Reports     | reportes         | reports          | /reportes → /reports                                             | Alias opcional para `/reportes`    |
| Invoicing   | facturacion      | invoicing        | /facturacion → /invoicing                                        | Alias opcional para `/facturacion` |
| Alerts      | alertas          | alerts           | /alertas → /alerts                                               | Alias opcional para `/alertas`     |
| Technicians | tecnicos         | technicians      | /tecnicos → /technicians                                         | Alias opcional para `/tecnicos`    |
| KPIs        | kpis             | kpis             | /kpis/ordenes → /kpis/orders; /kpis/tecnicos → /kpis/technicians | Mantener payload estable           |
| Sync        | sync             | sync             | /ordenes-offline → /orders-offline                               | Evaluar compatibilidad móvil       |
| Customers   | customers        | customers        | /customers/:id/ordenes → /customers/:id/orders                   | Cambiar DTO `ordenes` → `orders`   |
| Dashboard   | dashboard        | dashboard        | /dashboard/ordenes-recientes → /dashboard/recent-orders          | Mantener cache key                 |

## Clases y archivos (backend)

### Orders

- DTOs: crear-_.dto.ts → create-_.dto.ts
- Controllers: ordenes.controller.ts → orders.controller.ts
- Services: ordenes.service.ts → orders.service.ts
- Entities: orden.entity.ts → order.entity.ts
- Value Objects: estado-orden.vo.ts → order-status.vo.ts

### Evidence

- Controllers: evidencias.controller.ts → evidence.controller.ts
- Services: evidencias.service.ts → evidence.service.ts
- Repos: evidencia.repository.interface.ts → evidence.repository.interface.ts

### Reports

- Controllers: reportes.controller.ts → reports.controller.ts
- Services: reportes.service.ts → reports.service.ts
- Use cases: generate-reporte-ordenes.use-case.ts → generate-orders-report.use-case.ts

### Invoicing

- Controllers: facturacion.controller.ts → invoicing.controller.ts
- Services: facturacion.service.ts → invoicing.service.ts
- DTOs: facturacion.dto.ts → invoicing.dto.ts

### Alerts

- Controllers: alertas.controller.ts → alerts.controller.ts
- Services: alertas.service.ts → alerts.service.ts
- Domain: alerta.entity.ts → alert.entity.ts

### Technicians

- Controllers: tecnicos.controller.ts → technicians.controller.ts
- Services: tecnicos.service.ts → technicians.service.ts

## Permisos y roles

| Español          | Inglés           | Nota                             |
| ---------------- | ---------------- | -------------------------------- |
| ordenes:read     | orders:read      | Ajustar guards y security.config |
| ordenes:write    | orders:write     |                                  |
| reportes:read    | reports:read     |                                  |
| reportes:write   | reports:write    |                                  |
| evidencias:write | evidence:write   |                                  |
| tecnicos:read    | technicians:read |                                  |
| facturacion:read | invoicing:read   |                                  |
| alertas:read     | alerts:read      |                                  |

## Notas de DB/Prisma

- Mantener nombres de campos ya persistidos (p.ej. `ordenId`) para evitar migraciones innecesarias.

## Seguimiento

- [ ] Definir política legacy (mantener alias o cortar ES de inmediato).
- [ ] Ejecutar renombrado backend (PR1).
- [ ] Actualizar frontend (PR2).
- [ ] Actualizar tests (PR3).
- [ ] Limpieza final (PR4).

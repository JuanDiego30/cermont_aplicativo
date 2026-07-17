# Breadcrumb Labels Report — RUNTIME-FIX-00

## Componente

**Ubicación:** `frontend/src/modules/core/ui/layout/Header.tsx`
**Estructura:** `ROUTE_TITLES: Record<string, string>` con 55+ entradas

## Mapeo implementado

| Ruta | Label |
|---|---|
| /dashboard | Panel de Control |
| /fleet | Parque Automotor |
| /orders | Órdenes de Trabajo |
| /orders/kanban | Kanban de Órdenes |
| /orders/new | Nueva Orden |
| /maintenance | Mantenimientos |
| /proposals | Propuestas |
| /proposals/new | Nueva Propuesta |
| /documents | Documentos |
| /evidences | Evidencias |
| /costs | Costos |
| /reports | Reportes |
| /admin | Administración |
| /work-requests | Solicitudes |
| /work-requests/new | Nueva Solicitud |
| /service-cases | Casos de Servicio |
| /customers | Clientes |
| /customers/new | Nuevo Cliente |
| /site-visits | Visitas |
| /site-visits/new | Nueva Visita |
| /planning | Planeación |
| /execution | Ejecución |
| /execution/new | Nueva Ejecución |
| /checklists | Checklists |
| /dispatch | Despacho |
| /sla | SLA |
| /delivery-records | Actas |
| /billing | Cierre |
| /billing/ses | SES / Ariba |
| /billing/invoices | Facturas |
| /payments | Pagos |
| /templates | Formularios |
| /inventory | Inventario |
| /inventory/scan | Escanear Activos |
| /assets | Activos |
| /business-documents | Documentos de Negocio |
| /offline-sync | Sincronización Offline |
| /purchase-orders | PO Aprobada |
| /purchase-orders/new | Nueva PO |
| ... y 20+ entradas más |

## Resultado
El breadcrumb ya NO muestra slugs técnicos como WORK-REQUESTS o SITE-VISITS.
Muestra texto legible en español.

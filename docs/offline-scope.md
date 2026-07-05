# Alcance offline/online del aplicativo CERMONT

## 1. Criterio general

El modo offline del aplicativo CERMONT se implementa como una capacidad parcial y verificable para trabajo de campo. Su objetivo no es reemplazar la validación del servidor ni confirmar procesos externos sin conectividad, sino permitir captura local de información, conservación de evidencias y sincronización diferida cuando exista sesión activa y conexión disponible.

Todo dato creado sin conexión debe permanecer en estado `pending_sync`, `failed` o `conflict` hasta recibir confirmación del backend. El cliente no marca registros como definitivos por sí mismo.

## 2. Operaciones permitidas sin conexión

| Área | Alcance offline | Estado |
|---|---|---|
| Navegación | Apertura de app shell y fallback `/offline.html` después de una carga previa | Implementado con Serwist |
| Consulta reciente | Lectura de caché de TanStack Query para datos previamente cargados | Parcial |
| Planeación | Borradores y operaciones pendientes de sincronización | Parcial |
| Ejecución | Cambios operativos encolados para sincronización posterior | Parcial |
| Checklists | Cambios de ítems en cola local | Parcial |
| Evidencias | Metadatos y soporte local con Dexie; el Blob no se elimina hasta ACK | Parcial |
| Informes técnicos | Borradores o soportes pendientes, no cierre definitivo offline | Propuesto/parcial |
| Actas | Soportes pendientes, no aceptación final sin backend | Propuesto/parcial |
| SES / Ariba | Registro interno pendiente; no radicación real en Ariba offline | Limitado |
| Facturas y pagos | Borradores, notas o soportes; no aprobación ni pago real offline | Limitado |

## 3. Operaciones no permitidas sin conexión

- Login inicial sin red.
- Validación de credenciales contra backend.
- Confirmación final de SES, factura o pago.
- Saltos de estado del flujo de 14 pasos sin validación del servidor.
- Sincronización marcada como exitosa antes de recibir ACK del endpoint.
- Resolución automática de conflictos que puedan sobrescribir datos del servidor.
- Caché de endpoints privados, cookies, tokens o respuestas con `Set-Cookie`.

## 4. Relación con los 14 pasos

| Paso | Proceso | Tratamiento offline |
|---:|---|---|
| 1 | Solicitud formal | Borrador/cola si el usuario ya inició sesión |
| 2 | Visita técnica | Registro pendiente y evidencias asociadas |
| 3 | Propuesta económica | Borrador local; validación final requiere backend |
| 4 | PO aprobada | Soporte pendiente; aprobación requiere conexión |
| 5 | Planeación | Captura local prioritaria |
| 6 | Ejecución | Captura local prioritaria |
| 7 | Informe técnico | Borrador o soporte pendiente |
| 8 | Acta de entrega | Borrador o soporte pendiente |
| 9 | Acta firmada | Soporte pendiente; aceptación formal requiere backend |
| 10 | SES / Ariba | Registro interno pendiente; no radicación externa |
| 11 | SES aprobada | Requiere conexión |
| 12 | Factura | Borrador/soporte pendiente |
| 13 | Aprobación factura | Requiere conexión |
| 14 | Pago | Requiere conexión |

## 5. Estado defendible

El estado técnico actual permite afirmar que el aplicativo incorpora una estrategia offline-first parcial basada en Serwist, Dexie/IndexedDB, TanStack Query persistente, Zustand para estado visual y backend de sincronización con resultados por ítem. Queda pendiente ampliar las pruebas E2E con corte real de red y cubrir todos los formularios del flujo con contratos específicos.

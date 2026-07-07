# PROMPT MAESTRO — Fotos, cámara, evidencias y documentos en CERMONT

Actúa como un **Arquitecto Senior Full Stack**, especialista en Next.js, React, TypeScript estricto, Node.js/Express, MongoDB/Mongoose, Zod, PWA offline-first, manejo seguro de archivos, evidencias fotográficas, UX móvil para trabajo de campo y sistemas FSM/CMMS/GMAO.

Voy a trabajar sobre el aplicativo web de **CERMONT S.A.S.**. Necesito implementar una mejora profesional para que el sistema permita gestionar **fotos, imágenes, documentos PDF y evidencias tomadas desde cámara** asociadas a herramientas de trabajo, vehículos, órdenes de trabajo, checklists y ejecución en campo.

## 1. Contexto funcional

El aplicativo CERMONT gestiona órdenes de trabajo, planeación, recursos, herramientas, vehículos, ejecución en campo, documentos, evidencias, informes, actas, SES, facturación y cierre administrativo.

Actualmente necesito mejorar estos puntos:

1. Poder agregar fotos a las herramientas de trabajo.
2. Poder agregar imágenes a los vehículos registrados.
3. Poder abrir la cámara desde el aplicativo para tomar evidencias en sitio.
4. Poder subir imágenes desde galería.
5. Poder asociar evidencias a una orden, vehículo, herramienta, checklist, ejecución o documento.
6. Poder agregar documentos PDF a herramientas, vehículos y recursos.
7. Poder consultar, previsualizar, descargar, reemplazar, validar o eliminar archivos según permisos.
8. Mantener diseño limpio, profesional, light/dark y alineado con `DESIGN.md`.
9. Soportar operación móvil y, si ya existe infraestructura PWA, dejar preparado el modo offline para evidencias.

## 2. Objetivo principal

Implementar un **sistema unificado de archivos, imágenes, cámara y evidencias** que permita:

- tomar fotos desde el celular o computador;
- subir imágenes desde galería;
- subir documentos PDF;
- asociar archivos a herramientas, vehículos, órdenes y evidencias;
- almacenar metadatos técnicos;
- mostrar galerías profesionales;
- validar archivos por tipo, tamaño, permisos y estado;
- mantener trazabilidad y auditoría.

No quiero solo un input básico de archivo. Quiero una solución profesional, reusable y escalable.

## 3. Reglas obligatorias

Antes de escribir código:

1. Revisa la arquitectura actual.
2. Revisa `DESIGN.md`.
3. Revisa los schemas Zod existentes.
4. Revisa modelos Mongoose existentes.
5. Revisa módulos de herramientas, vehículos, recursos, evidencias y órdenes.
6. Revisa cómo se manejan actualmente archivos, uploads o documentos.
7. No elimines funcionalidad existente.
8. No dupliques lógica.
9. No introduzcas `any`.
10. No hardcodees roles ni rutas.
11. No pongas lógica de negocio compleja en componentes UI.
12. No uses colores fuera de los tokens de `DESIGN.md`.
13. Toda acción crítica debe dejar auditoría.
14. Todo archivo debe validarse en frontend y backend.
15. Todo componente debe funcionar en light/dark.
16. Todo debe ser mobile-first.

## 4. Módulo unificado de archivos

Crea o refactoriza un modelo central llamado preferiblemente:

- `MediaAsset`
- `Attachment`
- `ResourceFile`
- o el nombre que mejor encaje con la arquitectura existente.

Debe permitir asociar archivos a diferentes entidades.

### Entidades asociables

Un archivo debe poder vincularse a:

- `tool`
- `vehicle`
- `workOrder`
- `serviceCase`
- `executionSession`
- `checklistExecution`
- `checklistItem`
- `evidence`
- `planningPacket`
- `technicalReport`
- `document`

### Campos mínimos del archivo

Cada archivo debe guardar:

- `id`
- `ownerType`
- `ownerId`
- `category`
- `kind`: `image | pdf | document | other`
- `fileName`
- `originalName`
- `mimeType`
- `size`
- `extension`
- `storagePath`
- `publicUrl` o endpoint seguro de descarga
- `thumbnailUrl`, si aplica
- `uploadedBy`
- `uploadedAt`
- `capturedAt`, si fue tomado con cámara
- `capturedBy`, si aplica
- `source`: `camera | gallery | upload | generated`
- `description`
- `tags`
- `status`: `pending | approved | rejected | archived`
- `rejectionReason`
- `metadata`
- `createdAt`
- `updatedAt`
- `deletedAt` lógico, si aplica

### Categorías mínimas

Usar categorías como:

- `tool_photo`
- `tool_document`
- `tool_manual`
- `tool_certificate`
- `tool_calibration`
- `vehicle_front`
- `vehicle_back`
- `vehicle_left`
- `vehicle_right`
- `vehicle_plate`
- `vehicle_odometer`
- `vehicle_document`
- `vehicle_soat`
- `vehicle_technical_inspection`
- `vehicle_insurance`
- `field_evidence`
- `before_photo`
- `during_photo`
- `after_photo`
- `issue_photo`
- `correction_photo`
- `hse_photo`
- `checklist_photo`
- `report_support`
- `other`

## 5. Herramientas de trabajo con fotos y documentos

Mejora el módulo de herramientas para que cada herramienta pueda tener:

### Fotos

- foto principal;
- galería de fotos;
- foto de placa o serial;
- foto del estado físico;
- foto de accesorios;
- foto de daño o novedad.

### Documentos PDF

Cada herramienta debe permitir adjuntar:

- ficha técnica;
- manual de usuario;
- certificado de calibración;
- certificado de inspección;
- hoja de vida del equipo/herramienta;
- soporte de mantenimiento;
- factura o documento de compra, si aplica;
- otro documento PDF.

### Campos adicionales recomendados para herramientas

Si no existen, evalúa agregar:

- código interno;
- nombre;
- tipo;
- marca;
- modelo;
- serial;
- estado;
- ubicación;
- responsable;
- fecha de última inspección;
- fecha de próxima inspección;
- fecha de vencimiento de certificado/calibración;
- observaciones;
- disponibilidad;
- bloqueo por documento vencido.

### UI esperada en herramienta

En el detalle de una herramienta debe existir:

1. encabezado con foto principal o placeholder elegante;
2. datos principales;
3. estado de disponibilidad;
4. sección “Fotos”;
5. sección “Documentos”;
6. botón “Tomar foto”;
7. botón “Subir imagen”;
8. botón “Agregar PDF”;
9. galería con thumbnails;
10. listado de documentos con icono PDF, tamaño, fecha y usuario;
11. acciones por archivo:
    - ver,
    - descargar,
    - reemplazar,
    - aprobar,
    - rechazar,
    - eliminar si tiene permiso.

## 6. Vehículos con imágenes y documentos

Mejora el módulo de vehículos para que cada vehículo pueda tener:

### Fotos obligatorias/sugeridas

- foto principal;
- frontal;
- trasera;
- lateral izquierdo;
- lateral derecho;
- placa;
- odómetro;
- interior;
- kit de carretera;
- extintor;
- estado de llantas;
- daños o novedades.

### Documentos PDF o imagen

Debe permitir adjuntar:

- SOAT;
- tecnomecánica;
- seguro;
- tarjeta de propiedad;
- permiso de ingreso;
- certificaciones;
- soporte de mantenimiento;
- inspección preoperacional;
- otros documentos.

### Validaciones

- si un documento tiene vencimiento, guardar `expiresAt`;
- mostrar alerta si está próximo a vencer;
- bloquear o advertir si está vencido, según política;
- mostrar un indicador de “vehículo listo / incompleto / bloqueado”.

### UI esperada en vehículo

En el detalle del vehículo debe verse:

- foto principal;
- galería;
- documentos;
- vencimientos;
- estado operativo;
- botón “Tomar foto”;
- botón “Subir imagen”;
- botón “Agregar documento”;
- checklist visual de documentos requeridos.

## 7. Cámara para evidencias en sitio

Implementa un componente reusable llamado:

`CameraCapture`

o

`EvidenceCameraCapture`

Debe poder usarse en:

- evidencias de campo;
- herramienta;
- vehículo;
- checklist;
- ejecución de orden;
- visita técnica;
- informe técnico.

### Requisitos mínimos

Debe permitir:

1. abrir cámara;
2. usar cámara trasera en celular cuando sea posible;
3. capturar foto;
4. mostrar vista previa;
5. repetir foto;
6. confirmar y guardar;
7. subir desde galería como fallback;
8. guardar descripción;
9. seleccionar categoría;
10. asociar a entidad;
11. registrar metadata;
12. manejar errores de permisos;
13. funcionar en móvil;
14. respetar light/dark.

### Implementación mínima recomendada

Usar input nativo:

```tsx
<input
  type="file"
  accept="image/*"
  capture="environment"
/>
```

### Implementación avanzada opcional

Si el navegador lo permite:

- `navigator.mediaDevices.getUserMedia`
- preview con `<video>`
- captura con `<canvas>`
- conversión a `Blob`
- cierre seguro del stream al cerrar modal
- fallback automático al input nativo si falla

## 8. Evidencias de campo

El módulo de evidencias debe permitir crear evidencia desde:

- orden de trabajo;
- ejecución en campo;
- checklist;
- herramienta;
- vehículo;
- visita técnica;
- acta;
- informe.

### Metadata de evidencia

Cada evidencia debe guardar:

- orden asociada;
- paso del flujo;
- fase;
- categoría;
- descripción;
- usuario;
- fecha/hora;
- ubicación GPS opcional;
- precisión GPS;
- dispositivo;
- fuente: cámara o galería;
- estado de sincronización;
- estado de aprobación.

### Estados

- `draft`
- `pending_upload`
- `uploaded`
- `pending_review`
- `approved`
- `rejected`
- `archived`

### Reglas

- una evidencia usada en informe o acta no debe eliminarse físicamente;
- si se rechaza, exigir motivo;
- si se rechaza, crear notificación;
- si falla la subida, mostrar estado recuperable;
- si existe modo offline, guardar localmente y sincronizar después.

## 9. Upload seguro

Implementa validaciones en frontend y backend.

### Tipos permitidos

Imágenes:

- `image/jpeg`
- `image/png`
- `image/webp`

Documentos:

- `application/pdf`

Opcional según necesidad:

- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### Restricciones

- limitar tamaño máximo de imagen;
- limitar tamaño máximo de PDF;
- rechazar ejecutables;
- no confiar en la extensión solamente;
- validar MIME type;
- sanitizar nombres;
- generar nombre interno seguro;
- impedir path traversal;
- usar endpoints protegidos;
- respetar RBAC;
- registrar auditoría.

## 10. Backend

Crear o mejorar endpoints como:

### Archivos generales

- `POST /attachments`
- `GET /attachments`
- `GET /attachments/:id`
- `GET /attachments/:id/download`
- `PATCH /attachments/:id`
- `PATCH /attachments/:id/approve`
- `PATCH /attachments/:id/reject`
- `DELETE /attachments/:id`

### Herramientas

- `POST /tools/:toolId/photos`
- `POST /tools/:toolId/documents`
- `GET /tools/:toolId/attachments`
- `PATCH /tools/:toolId/primary-photo`

### Vehículos

- `POST /vehicles/:vehicleId/photos`
- `POST /vehicles/:vehicleId/documents`
- `GET /vehicles/:vehicleId/attachments`
- `PATCH /vehicles/:vehicleId/primary-photo`

### Evidencias

- `POST /evidences`
- `POST /evidences/:id/files`
- `PATCH /evidences/:id/approve`
- `PATCH /evidences/:id/reject`

Usa el patrón de arquitectura existente:

```txt
schema Zod → model → service → controller → route → frontend service → query key → hook → UI
```

## 11. Frontend

Crear componentes reutilizables:

- `FileUploadDropzone`
- `ImageUploadButton`
- `CameraCapture`
- `EvidenceCameraCapture`
- `AttachmentGallery`
- `AttachmentCard`
- `DocumentList`
- `PdfDocumentCard`
- `PrimaryPhotoSelector`
- `AttachmentPreviewDialog`
- `UploadProgress`
- `UploadErrorState`
- `FileEmptyState`

### UI/UX obligatoria

- diseño limpio con cards;
- iconos consistentes;
- botones redondeados;
- estados visuales claros;
- thumbnails de imágenes;
- icono PDF para documentos;
- empty states elegantes;
- loading states;
- error states;
- modo light/dark;
- responsive móvil.

## 12. Offline y PWA

Si el sistema ya tiene PWA/offline, integra:

- guardar evidencia pendiente en IndexedDB;
- guardar Blob local;
- usar `clientMutationId`;
- mostrar `pending_sync`;
- reintentar sincronización;
- evitar duplicados;
- permitir eliminar evidencia local antes de sincronizar;
- notificar errores.

Si todavía no hay infraestructura offline completa, deja la arquitectura preparada y documentada sin romper nada.

## 13. Permisos y roles

Aplica RBAC.

Ejemplo de permisos:

- `attachments:create`
- `attachments:read`
- `attachments:update`
- `attachments:delete`
- `attachments:approve`
- `attachments:reject`
- `tools:upload-photo`
- `tools:upload-document`
- `vehicles:upload-photo`
- `vehicles:upload-document`
- `evidences:capture`
- `evidences:approve`
- `evidences:reject`

Reglas:

- técnicos pueden tomar/subir evidencias;
- residentes/supervisores pueden aprobar/rechazar;
- administración puede consultar documentos;
- solo roles autorizados pueden eliminar o reemplazar archivos;
- backend siempre valida permisos, aunque frontend oculte botones.

## 14. Auditoría

Toda acción debe registrar evento:

- foto tomada;
- imagen subida;
- PDF cargado;
- documento reemplazado;
- archivo descargado, si aplica;
- evidencia aprobada;
- evidencia rechazada;
- archivo eliminado;
- foto principal cambiada;
- documento vencido detectado.

## 15. Notificaciones

Crear notificaciones cuando:

- se sube evidencia nueva;
- se rechaza evidencia;
- se aprueba evidencia;
- un documento de vehículo está próximo a vencer;
- un certificado de herramienta está próximo a vencer;
- falla una sincronización;
- una evidencia pendiente requiere revisión.

## 16. Pruebas

Agregar pruebas para:

### Unitarias

- validación de MIME;
- validación de tamaño;
- categorías;
- permisos;
- reglas de documento vencido;
- estados de evidencia.

### Integración

- subir foto de herramienta;
- subir PDF de herramienta;
- subir foto de vehículo;
- subir documento de vehículo;
- crear evidencia con foto;
- aprobar/rechazar evidencia;
- bloquear archivo usado en informe.

### E2E

Escenarios mínimos:

1. entrar a herramienta;
2. agregar foto;
3. agregar PDF;
4. ver galería;
5. abrir vehículo;
6. agregar foto frontal;
7. agregar documento SOAT;
8. ir a ejecución de campo;
9. abrir cámara;
10. tomar evidencia;
11. guardar evidencia;
12. verla en galería;
13. aprobar/rechazar desde rol autorizado.

## 17. Criterios de aceptación

La tarea está terminada solo si:

1. Las herramientas aceptan fotos.
2. Las herramientas aceptan PDF/documentos.
3. Los vehículos aceptan imágenes.
4. Los vehículos aceptan documentos.
5. Se puede abrir cámara o input nativo para tomar evidencia.
6. Se puede subir imagen desde galería.
7. Las evidencias quedan asociadas a entidad correcta.
8. Los archivos tienen metadata.
9. Hay previsualización o descarga segura.
10. Hay validación frontend y backend.
11. Hay permisos RBAC.
12. Hay auditoría.
13. Hay diseño alineado con `DESIGN.md`.
14. Hay light/dark.
15. Hay pruebas.
16. No se rompe funcionalidad existente.
17. No hay `any`.
18. No hay colores hardcodeados innecesarios.

## 18. Forma de trabajo

Primero entrega una auditoría breve:

- módulos existentes encontrados;
- cómo se manejan archivos actualmente;
- brechas;
- plan de implementación;
- archivos que vas a modificar.

Después implementa por fases:

1. Contratos Zod y tipos.
2. Modelo y servicio backend.
3. Endpoints.
4. API frontend.
5. Hooks.
6. Componentes UI.
7. Integración en herramientas.
8. Integración en vehículos.
9. Integración en evidencias.
10. Pruebas.
11. Documentación.

## 19. Resultado esperado

Al finalizar, entrega:

- resumen de cambios;
- archivos creados/modificados;
- endpoints nuevos;
- componentes nuevos;
- cómo probar manualmente;
- comandos ejecutados;
- resultado de typecheck/lint/build/tests;
- pendientes o limitaciones.

No quiero una implementación superficial. Esta mejora debe convertir el manejo de fotos, documentos y evidencias en una funcionalidad profesional, robusta, segura, móvil y lista para campo.

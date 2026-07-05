# 04 — Plan por 4 fallas principales CERMONT

> Nota: el libro también maneja una quinta falla transversal de costos reales. En este plan se integra como parte de cierre administrativo y control financiero.

## Slice 1 — Falla de planeación

### Problema

No se detallan herramientas, equipos, personal, certificaciones ni documentos requeridos.

### Solución

- Kit típico configurable por tipo de servicio.
- Checklist dinámico.
- Importación Excel de recursos.
- Opciones custom para herramientas/equipos.
- Verificación de certificaciones.
- AST/PTW/documentos obligatorios.
- Bloqueador antes de ejecución.

### Criterio de aceptación

Una OT no puede pasar al paso 6 si falta:

- personal asignado;
- herramientas/equipos;
- certificaciones;
- AST/PTW;
- documentos de apoyo;
- checklist de planeación.

## Slice 2 — Falla de ejecución

### Problema

Se olvidan herramientas, equipos o evidencias; la documentación se diligencia tarde o incompleta.

### Solución

- Ejecución guiada por checklist.
- Validación de kit entregado.
- Evidencias before/during/after.
- Materiales usados.
- Horas reales.
- Firma o supervisión.
- Registro offline/sync.
- Bloqueador antes de cierre técnico.

### Criterio de aceptación

No se puede cerrar ejecución sin evidencias mínimas, materiales/horas si aplican y checklist final.

## Slice 3 — Falla de informes y actas

### Problema

Retrasos en informes y actas finales.

### Solución

- Generar informe desde ejecución.
- Seleccionar evidencias desde biblioteca.
- Traer datos de OT, cliente, ubicación, personal y recursos.
- Generar acta desde informe aprobado.
- Firma cliente.
- Bloquear SES si no hay acta firmada.

### Criterio de aceptación

No se puede radicar SES si no existe acta firmada.

## Slice 4 — Falla de cierre administrativo, facturación y costos

### Problema

Retrasos en SES/Ariba, facturación, aprobación, pago y costos reales.

### Solución

- Timeline 10–14.
- SES radicada/aprobada.
- Factura enviada/aprobada.
- Pago recibido.
- Alertas por vencimiento.
- Costos reales vs estimados.
- Margen real vs margen esperado.
- Cierre definitivo solo con pago.

### Criterio de aceptación

No se puede facturar sin SES aprobada. No se puede cerrar sin pago. No se aceptan costos `$0` por defecto salvo que exista justificación explícita.

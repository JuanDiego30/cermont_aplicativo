# Limitaciones conocidas del modo offline

## 1. Alcance funcional

El modo offline no cubre todo el flujo operativo como operación definitiva. La captura local se prioriza para planeación, ejecución, checklists y evidencias. Los pasos administrativos finales requieren backend y, cuando aplica, verificación externa.

## 2. Integraciones externas

No existe radicación real offline en Ariba. El sistema puede registrar soportes internos relacionados con SES, pero no debe afirmar que automatiza o aprueba SES sin conexión.

No existe aprobación real de factura o pago sin backend. Estos pasos solo admiten borradores, observaciones o soportes pendientes.

## 3. Conflictos

Los conflictos no se resuelven automáticamente. El sistema marca `conflict` cuando el servidor rechaza una operación por estado, versión, permisos u otra regla de negocio. La resolución visual de conflictos queda como línea futura.

## 4. Evidencias

Dexie permite conservar metadatos y Blobs locales; sin embargo, la limpieza automática de archivos subidos debe implementarse con política de retención. Actualmente no se elimina evidencia local hasta confirmar subida y definir retención.

## 5. Validación pendiente

Queda pendiente ejecutar pruebas E2E con corte de red real y validar todos los formularios por vertical slice. Mientras no exista prueba por formulario, el libro debe clasificar la cobertura offline de ese formulario como parcial o pendiente por verificar en repositorio.

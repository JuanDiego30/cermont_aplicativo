# Auditoría de Cumplimiento Legal Colombia — CERMONT S.A.S.

**Fecha:** 2026-06-24  
**Advertencia:** Este es un informe técnico preliminar. No constituye asesoría jurídica.  
**Revisión legal requerida antes de implementar cualquier cambio.**

---

## 1. Datos Personales Tratados por el Sistema

Basado en el análisis del código fuente y esquemas de datos, el sistema trata los siguientes datos personales:

| Categoría | Datos | Módulo | Riesgo |
|-----------|-------|--------|--------|
| Identificación | Nombre, email, teléfono, cargo | auth, user | Medio |
| Laborales | Rol, certificaciones, habilidades | user | Medio |
| Biométricos | Fotos (evidencias con posible captura de rostros) | evidence | **Alto** |
| Geolocalización | GPS en evidencias y sesiones de ejecución | evidence, execution-session | **Alto** |
| Documentos | Cédulas, certificados, firmas | documents, client-signature | **Alto** |
| Vehiculares | Placas asociadas a operadores | fleet | Medio |
| Conducta | Auditoría de acciones, logs de acceso | audit | Medio |
| Salud/SST | Análisis de seguridad, HSE | safety-analysis | **Alto (dato sensible)** |

## 2. Evaluación contra Ley 1581 de 2012

| Requisito | Estado | Evidencia / Acción Requerida |
|-----------|--------|------------------------------|
| Autorización previa, expresa e informada | ❌ No implementado | No hay flujo de aceptación de política de privacidad en registro/login |
| Finalidad del tratamiento | ❌ No documentado | No hay política de tratamiento visible |
| Política de tratamiento de datos personales | ❌ No existe | Crear documento legal |
| Aviso de privacidad | ❌ No existe | Crear aviso visible en login/registro |
| Responsable/Encargado identificado | ❌ No visible | Agregar en política |
| Derechos del titular (ARCO) | ❌ No implementado | No hay endpoint para consultar/reclamar |
| Canal para consultas y reclamos | ❌ No implementado | Agregar en UI/backend |
| Prueba de autorización | ❌ No implementado | No hay registro de consentimiento |
| Minimización de datos | ⚠️ Parcial | Revisar qué datos son estrictamente necesarios |
| Conservación limitada | ⚠️ Parcial | Auditoría no tiene TTL, otros datos no tienen política |
| Supresión o anonimización | ❌ No implementado | Soft delete existe pero no anonimización |
| Seguridad de la información | ✅ Implementado | Helmet, CORS, rate limiting, JWT, bcrypt, validación Zod |
| Acceso restringido por rol | ✅ Implementado | RBAC completo con 15 roles |
| Trazabilidad de acceso | ✅ Implementado | Auditoría de acciones críticas |
| Gestión de incidentes | ❌ No implementado | No hay procedimiento documentado ni endpoint |
| Backup y recuperación | ✅ Documentado | Scripts en PRODUCTION_DEPLOYMENT.md |
| Transferencia/transmisión de datos | N/A | Sin evidencia de transferencia internacional |

## 3. RNBD (Registro Nacional de Base de Datos)

```
¿CERMONT tiene activos totales superiores a 100.000 UVT (~$4.800M COP)?
NO VERIFICADO — Se requiere confirmación de la administración.
```

**Task:** Solicitar a administración/contador confirmar si CERMONT supera 100.000 UVT en activos para evaluar obligación RNBD.

## 4. Evidencias Fotográficas y Geolocalización

| Control | Estado | Acción |
|---------|--------|--------|
| Consentimiento para captura de fotos | ❌ No implementado | Agregar autorización específica |
| Finalidad de evidencias documentada | ❌ No documentado | Incluir en política |
| Trazabilidad de quién capturó | ✅ Implementado | evidence tiene createdBy |
| Protección de descargas (auth requerida) | ✅ Implementado | `/api/files/:id/content` requiere auth |
| Limitación de acceso por rol | ✅ Implementado | EVIDENCE_ACCESS_ROLES |
| Control de retención | ❌ No implementado | Sin política de borrado automático |
| Registro de accesos/descargas | ❌ No implementado | No hay auditoría de descarga de evidencias |
| Difuminado de datos sensibles en imágenes | ❌ No implementado | No hay procesamiento de blur en rostros/placas |

## 5. Recomendación Inmediata

1. **Alta prioridad:** Implementar flujo de autorización de tratamiento de datos en registro/login
2. **Alta prioridad:** Mostrar aviso de privacidad y obtener consentimiento antes de capturar evidencias/GPS
3. **Media prioridad:** Crear documentos de política de tratamiento, aviso de privacidad y autorizaciones
4. **Media prioridad:** Implementar endpoint para ejercicio de derechos ARCO
5. **Media prioridad:** Agregar control de retención y anonimización
6. **Baja prioridad:** Registrar descargas de evidencias en auditoría

## 6. Documentos Legales Recomendados (Drafts Técnicos)

Ver `docs/legal/` para drafts:
- `POLITICA_TRATAMIENTO_DATOS_PERSONALES_CERMONT_DRAFT.md`
- `AVISO_PRIVACIDAD_CERMONT_DRAFT.md`
- `AUTORIZACION_TRATAMIENTO_DATOS_TRABAJADORES_CONTRATISTAS_DRAFT.md`
- `AUTORIZACION_USO_EVIDENCIAS_FOTOGRAFICAS_DRAFT.md`
- `PROCEDIMIENTO_CONSULTAS_RECLAMOS_DATOS_PERSONALES_DRAFT.md`
- `PROCEDIMIENTO_INCIDENTES_SEGURIDAD_DATOS_DRAFT.md`

**NOTA:** Todos son BORRADOR TÉCNICO — requieren revisión jurídica antes de uso.

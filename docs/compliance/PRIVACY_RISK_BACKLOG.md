# Backlog de Riesgos de Privacidad — CERMONT S.A.S.

**Fecha:** 2026-06-24

---

## P1 — Crítico (riesgo legal alto)

| ID | Riesgo | Impacto | Acción |
|----|--------|---------|--------|
| PRIV-001 | No hay autorización de tratamiento de datos al registrarse | Multa SIC hasta 2.000 SMLV | Implementar flujo de consentimiento en registro/login |
| PRIV-002 | Evidencias fotográficas almacenadas sin consentimiento explícito | Vulneración de derechos | Agregar autorización específica para captura de imágenes |
| PRIV-003 | Geolocalización capturada sin informar finalidad | Vulneración de derechos | Agregar aviso y consentimiento para GPS |
| PRIV-004 | No hay política de tratamiento de datos personales | Incumplimiento Ley 1581 | Crear y publicar política |
| PRIV-005 | No hay aviso de privacidad visible | Incumplimiento Ley 1581 | Agregar aviso en login/registro |

## P2 — Alto

| ID | Riesgo | Acción |
|----|--------|--------|
| PRIV-006 | Sin control de retención de evidencias (indefinido) | Definir política y job de limpieza |
| PRIV-007 | Sin endpoint para ejercicio de derechos ARCO | Implementar endpoint de consulta/eliminación |
| PRIV-008 | Auditoría sin TTL acumula datos personales indefinidamente | Definir política de retención de logs |
| PRIV-009 | Backups sin cifrado contienen datos personales | Cifrar backups |
| PRIV-010 | No hay registro de quién descarga evidencias/documentos | Agregar auditoría de descargas |

## P3 — Medio

| ID | Riesgo | Acción |
|----|--------|--------|
| PRIV-011 | No hay canal de reclamos visible | Agregar en UI |
| PRIV-012 | Usuarios desactivados no son anonimizados | Implementar anonimización |
| PRIV-013 | Datos de SST/HSE sin controles especiales (dato sensible) | Revisar controles para datos sensibles |
| PRIV-014 | Placas vehiculares asociadas a personas sin política | Documentar finalidad |

# Inventario de Datos y Mapa de Privacidad — CERMONT S.A.S.

**Fecha:** 2026-06-24

---

## Mapa de Datos por Módulo

| Módulo | Datos Personales | Datos Sensibles | Finalidad | Base Legal | Retención | Acceso |
|--------|-----------------|-----------------|-----------|-----------|-----------|--------|
| Auth | email, password hash | — | Autenticación | Ejecución contrato | Mientras sea usuario activo | Usuario + admin |
| Users | nombre, email, teléfono, rol, certificaciones | Certificaciones médicas? | Gestión de personal | Ejecución contrato | Mientras sea empleado/contratista | Admin + usuario |
| Evidence | Fotos (posibles rostros) | Geolocalización | Evidencia de trabajo | Consentimiento + ejecución contrato | Indefinido (sin política) | Roles autorizados |
| Execution Session | — | GPS, ubicación | Seguimiento en campo | Ejecución contrato | Indefinido | Roles autorizados |
| Client Signature | Firma digital, nombre | Firma | Acta de entrega | Consentimiento + ejecución contrato | Permanente (documento legal) | Admin + cliente |
| Fleet | — | Placas (vehículo-persona) | Gestión de flota | Ejecución contrato | Mientras opere | Roles autorizados |
| Safety Analysis | — | Datos de salud/SST | Seguridad laboral | Obligación legal SST | Según ley (5-20 años) | HES + admin |
| Audit | userId, acción, timestamp | — | Trazabilidad | Obligación legal | Permanente (sin TTL) | Admin |
| Documents | Cédulas, certificados | Datos sensibles varios | Gestión documental | Ejecución contrato | Indefinido (sin política) | Roles autorizados |
| Notifications | email, teléfono | — | Comunicaciones | Ejecución contrato | Mientras sea necesario | Usuario |

## Flujo de Datos

```
Usuario (campo/oficina) 
  → Frontend (Next.js) 
    → API (Express) 
      → MongoDB 
        → Backups (mongodump, retención 14 días)
```

## Riesgos Identificados

1. **Fotos con geolocalización** almacenadas sin límite de retención y sin control de descarga auditado
2. **No hay anonimización** posible para datos de usuarios desactivados
3. **Auditoría sin TTL** — puede acumular datos personales indefinidamente
4. **No hay cifrado en reposo** en MongoDB (no configurado)
5. **Backups sin cifrado** contienen datos personales completos

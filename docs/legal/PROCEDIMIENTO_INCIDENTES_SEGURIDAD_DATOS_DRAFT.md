# Procedimiento de Incidentes de Seguridad de Datos Personales

**Versión borrador:** 1.0  
**Fecha:** 2026-06-24  
**Estado:** ⚠️ BORRADOR TÉCNICO — REQUIERE REVISIÓN LEGAL ANTES DE USO  

---

## 1. Objetivo

Establecer el procedimiento para la detección, reporte, investigación y respuesta a incidentes de seguridad que involucren datos personales tratados por Cermont S.A.S.

## 2. Definición

Un **incidente de seguridad de datos personales** es cualquier evento que comprometa la confidencialidad, integridad o disponibilidad de los datos personales, incluyendo:

| Tipo | Ejemplos |
|------|----------|
| Acceso no autorizado | Intrusión en cuentas de usuario, acceso sin permisos |
| Pérdida de datos | Eliminación accidental, fallo de hardware |
| Fuga de datos | Publicación no autorizada, envío a destinatario incorrecto |
| Alteración de datos | Modificación no autorizada, corrupción de datos |
| Robo de datos | Exfiltración por atacante externo o interno |
| Denegación de servicio | Ataque que impide el acceso a datos |

## 3. Clasificación de Incidentes

| Nivel | Descripción | Ejemplo | Tiempo de respuesta |
|-------|-------------|---------|---------------------|
| **Crítico** | Compromiso masivo de datos sensibles | Fuga de base de datos completa | 1 hora |
| **Alto** | Compromiso de datos de múltiples usuarios | Acceso no autorizado a cuentas | 4 horas |
| **Medio** | Compromiso de datos de un usuario | Correo enviado a destinatario incorrecto | 24 horas |
| **Bajo** | Intento frustrado sin compromiso | Escaneo de puertos, intento de login | 72 horas |

## 4. Flujo de Respuesta

### 4.1 Detección
- Automática: Logs de seguridad, alertas de rate limiting, intentos de acceso fallidos.
- Manual: Reporte de usuario, reporte de administrador.

### 4.2 Reporte
Reportar inmediatamente a:

- **Correo de seguridad:** (pendiente)
- **Responsable de seguridad:** (pendiente)

### 4.3 Contención
1. Identificar y aislar el origen del incidente.
2. Revocar accesos comprometidos.
3. Bloquear IPs o cuentas afectadas.
4. Preservar evidencias (logs, capturas, registros).

### 4.4 Investigación
1. Documentar la línea de tiempo.
2. Identificar datos personales afectados.
3. Determinar la causa raíz.
4. Evaluar el impacto.

### 4.5 Notificación (si aplica)
Cuando el incidente pueda afectar derechos de los Titulares:

- Notificar a los Titulares afectados en un plazo máximo de **15 días hábiles**.
- Informar: naturaleza del incidente, datos afectados, medidas tomadas, recomendaciones.
- Reportar a la **Superintendencia de Industria y Comercio (SIC)** si es requerido.

### 4.6 Recuperación
1. Implementar medidas correctivas.
2. Restaurar datos desde backup si es necesario.
3. Reforzar controles de seguridad.

### 4.7 Cierre
1. Documentar el incidente completo (lecciones aprendidas).
2. Actualizar políticas y procedimientos.
3. Registrar en el registro de incidentes.

## 5. Registro de Incidentes

Cada incidente debe registrarse con:

| Campo | Descripción |
|-------|-------------|
| ID | Identificador único |
| Fecha y hora | Cuándo ocurrió |
| Tipo | Clasificación del incidente |
| Descripción | Detalle del evento |
| Datos afectados | Qué datos personales se vieron comprometidos |
| Titulares afectados | Número de titulares |
| Acción tomada | Medidas de respuesta |
| Estado | Abierto, en investigación, contenido, resuelto, cerrado |
| Lecciones aprendidas | Mejoras identificadas |

## 6. Prevención

Medidas para prevenir incidentes:

- Auditoría regular de accesos y permisos.
- Actualización de dependencias y parches de seguridad.
- Capacitación periódica del personal.
- Pruebas de penetración programadas.
- Monitoreo continuo de logs.

---

**Última actualización:** 2026-06-24  
**Revisión legal:** ⏳ PENDIENTE

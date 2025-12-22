# 📋 REQUISITOS - MÓDULO `/alertas`

**Fecha:** 2024-12-22

---

## 🎯 REQUISITOS FUNCIONALES

### **RF-1: Detección Automática de Alertas**

**Descripción:** El sistema debe detectar automáticamente situaciones que requieren atención mediante CRON jobs.

**Tipos de Alertas:**
1. **Actas Sin Firmar** (>7 días)
   - Trigger: Acta en estado "generada" o "enviada" por más de 7 días
   - Prioridad: WARNING
   - Destinatario: Usuario asignado a la orden

2. **SES Pendientes** (>5 días)
   - Trigger: SES en estado "creada" o "enviada" por más de 5 días
   - Prioridad: WARNING
   - Destinatario: Administradores/Coordinadores

3. **Facturas Vencidas**
   - Trigger: Factura con fechaVencimiento < hoy
   - Prioridad: WARNING (15 días), ERROR (15-30 días), CRITICAL (>30 días)
   - Destinatario: Administradores/Coordinadores

4. **Propuestas Sin Respuesta** (>15 días)
   - Trigger: Propuesta enviada hace más de 15 días sin aprobación/rechazo
   - Prioridad: INFO
   - Destinatario: Administradores/Coordinadores

**Criterios de Aceptación:**
- ✅ CRONs ejecutan diariamente en horarios configurados
- ✅ No se crean alertas duplicadas (misma orden + tipo)
- ✅ Alertas se marcan como "enviada" en la entidad relacionada

---

### **RF-2: Envío de Notificaciones por Múltiples Canales**

**Descripción:** El sistema debe enviar notificaciones por diferentes canales según preferencias del usuario.

**Canales Soportados:**
- **EMAIL:** Notificaciones por correo electrónico
- **PUSH:** Notificaciones push (Firebase)
- **SMS:** Notificaciones por SMS (Twilio)
- **IN_APP:** Notificaciones en la aplicación (tiempo real)

**Criterios de Aceptación:**
- ✅ Usuario puede configurar canales preferidos por tipo de alerta
- ✅ Sistema respeta preferencias del usuario
- ✅ Envío asíncrono (no bloquea requests)
- ✅ Retry automático en caso de fallo (3 intentos)

---

### **RF-3: Gestión de Templates de Notificaciones**

**Descripción:** El sistema debe usar templates para personalizar mensajes de notificaciones.

**Templates Requeridos:**
- Template por tipo de alerta
- Template por canal (email, push, SMS tienen formatos diferentes)
- Variables dinámicas: `{titulo}`, `{mensaje}`, `{ordenNumero}`, `{usuarioNombre}`, etc.

**Criterios de Aceptación:**
- ✅ Templates almacenados en BD o archivos
- ✅ Sistema de variables dinámicas
- ✅ Personalización por canal

---

### **RF-4: Historial de Notificaciones Enviadas**

**Descripción:** El sistema debe mantener un historial completo de todas las notificaciones enviadas.

**Información Requerida:**
- Fecha/hora de envío
- Canal utilizado
- Estado (enviada, fallida, leída)
- Intentos realizados
- Errores (si aplica)

**Criterios de Aceptación:**
- ✅ Historial paginado
- ✅ Filtros por tipo, estado, fecha, usuario
- ✅ Búsqueda por texto
- ✅ Exportación (opcional)

---

### **RF-5: Priorización de Alertas**

**Descripción:** El sistema debe priorizar alertas según su nivel de urgencia.

**Niveles de Prioridad:**
- **CRITICAL:** Errores críticos, requiere acción inmediata
- **ERROR:** Errores importantes
- **WARNING:** Advertencias
- **INFO:** Información general

**Criterios de Aceptación:**
- ✅ Alertas se ordenan por prioridad
- ✅ Alertas críticas se envían por todos los canales disponibles
- ✅ Dashboard muestra contador de alertas críticas

---

### **RF-6: Configuración de Preferencias de Usuario**

**Descripción:** Los usuarios deben poder configurar qué alertas recibir y por qué canal.

**Preferencias Configurables:**
- Tipos de alertas a recibir
- Canales preferidos por tipo
- Horarios permitidos (no molestar)
- Activar/desactivar notificaciones

**Criterios de Aceptación:**
- ✅ Usuario puede actualizar preferencias
- ✅ Sistema respeta preferencias al enviar
- ✅ Defaults si no hay preferencias configuradas

---

### **RF-7: Sistema de Retry para Fallos**

**Descripción:** El sistema debe reintentar automáticamente el envío de notificaciones fallidas.

**Configuración:**
- Máximo 3 intentos
- Backoff exponencial (1 min, 5 min, 15 min)
- Logs de fallos

**Criterios de Aceptación:**
- ✅ Retry automático en fallos transitorios
- ✅ No retry en errores permanentes (email inválido, etc.)
- ✅ Alertas fallidas se marcan después de 3 intentos

---

### **RF-8: Notificaciones en Tiempo Real**

**Descripción:** El sistema debe enviar notificaciones en tiempo real mediante WebSockets o SSE.

**Criterios de Aceptación:**
- ✅ Notificaciones aparecen instantáneamente en la UI
- ✅ Badge de notificaciones no leídas
- ✅ Sonido/visual cuando hay nueva alerta crítica

---

### **RF-9: Filtros y Suscripciones**

**Descripción:** Los usuarios deben poder filtrar y suscribirse a tipos específicos de alertas.

**Criterios de Aceptación:**
- ✅ Filtros por tipo, prioridad, estado, fecha
- ✅ Suscripciones a tipos específicos
- ✅ Búsqueda por texto

---

## 🔒 REQUISITOS NO FUNCIONALES

### **RNF-1: Performance**

**Descripción:** El sistema debe procesar alertas de forma eficiente sin bloquear requests.

**Métricas:**
- Envío asíncrono (queue system)
- Tiempo de procesamiento < 100ms (creación de alerta)
- Tiempo de envío < 5s (por canal)

**Criterios de Aceptación:**
- ✅ Queue system implementado (Bull/BullMQ)
- ✅ Procesamiento en background
- ✅ No bloquea requests HTTP

---

### **RNF-2: Escalabilidad**

**Descripción:** El sistema debe escalar horizontalmente para manejar grandes volúmenes de alertas.

**Criterios de Aceptación:**
- ✅ Queue system distribuido
- ✅ Workers escalables
- ✅ BD optimizada (índices)

---

### **RNF-3: Reliability**

**Descripción:** El sistema debe ser confiable y manejar fallos gracefully.

**Criterios de Aceptación:**
- ✅ Retry mechanism (3 intentos)
- ✅ Logs de errores
- ✅ Alertas fallidas se reportan
- ✅ No se pierden alertas

---

### **RNF-4: Observability**

**Descripción:** El sistema debe ser observable con logs estructurados y métricas.

**Métricas Requeridas:**
- Total de alertas creadas
- Alertas enviadas vs fallidas
- Tiempo promedio de envío
- Alertas por tipo/prioridad

**Criterios de Aceptación:**
- ✅ Logs estructurados (Winston)
- ✅ Métricas expuestas (Prometheus opcional)
- ✅ Trazabilidad de alertas

---

### **RNF-5: Security**

**Descripción:** El sistema debe ser seguro y protegido contra abusos.

**Criterios de Aceptación:**
- ✅ Rate limiting en endpoints
- ✅ Validación de entrada (DTOs)
- ✅ Autenticación/autorización
- ✅ No spam de notificaciones

---

### **RNF-6: Maintainability**

**Descripción:** El código debe ser mantenible y seguir buenas prácticas.

**Criterios de Aceptación:**
- ✅ Arquitectura DDD + Clean Architecture
- ✅ Principios SOLID
- ✅ Tests (cobertura >80%)
- ✅ Documentación completa

---

## 📊 PRIORIZACIÓN DE REQUISITOS

| Requisito | Prioridad | Esfuerzo | Impacto | Fase |
|-----------|-----------|----------|---------|------|
| RF-1: Detección Automática | P0 | Alto | CRÍTICO | Fase 1 |
| RF-2: Envío Múltiples Canales | P0 | Alto | CRÍTICO | Fase 2 |
| RF-3: Templates | P1 | Medio | ALTO | Fase 2 |
| RF-4: Historial | P1 | Medio | ALTO | Fase 1 |
| RF-5: Priorización | P0 | Bajo | CRÍTICO | Fase 1 |
| RF-6: Preferencias | P1 | Medio | ALTO | Fase 2 |
| RF-7: Retry | P0 | Medio | CRÍTICO | Fase 2 |
| RF-8: Tiempo Real | P1 | Alto | ALTO | Fase 3 |
| RF-9: Filtros | P2 | Bajo | MEDIO | Fase 3 |
| RNF-1: Performance | P0 | Alto | CRÍTICO | Fase 2 |
| RNF-2: Escalabilidad | P1 | Alto | ALTO | Fase 3 |
| RNF-3: Reliability | P0 | Medio | CRÍTICO | Fase 2 |
| RNF-4: Observability | P1 | Bajo | ALTO | Fase 1 |
| RNF-5: Security | P0 | Bajo | CRÍTICO | Fase 1 |
| RNF-6: Maintainability | P0 | Alto | CRÍTICO | Fase 1 |

---

## ✅ CONCLUSIÓN

Los requisitos están claramente definidos. La priorización indica que debemos:
1. **Fase 1:** Arquitectura DDD + Detección + Priorización + Historial
2. **Fase 2:** Envío múltiples canales + Retry + Templates + Preferencias
3. **Fase 3:** Tiempo real + Filtros + Escalabilidad


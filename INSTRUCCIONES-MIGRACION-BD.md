# 📝 INSTRUCCIONES: Aplicar Migraciones de Base de Datos

Después de las optimizaciones realizadas en el schema de Prisma, necesitas aplicar las migraciones.

---

## 🔄 PASO 1: Generar Migración

```bash
cd apps/api
pnpm prisma:migrate dev --name add_performance_indexes
```

Esto creará una nueva migración con todos los índices agregados.

---

## ✅ PASO 2: Verificar Migración

Revisa el archivo generado en `apps/api/prisma/migrations/` para asegurarte de que los índices se crearon correctamente.

---

## 🚀 PASO 3: Aplicar en Producción

Cuando estés listo para producción:

```bash
cd apps/api
pnpm prisma:migrate deploy
```

**⚠️ IMPORTANTE**: En producción usa `migrate deploy`, NO `migrate dev`

---

## 📊 ÍNDICES AGREGADOS

Los siguientes índices fueron agregados al schema:

### Order
- `[asignadoId, estado, createdAt(sort: Desc)]`
- `[estado, createdAt(sort: Desc)]`
- `[estado, prioridad, createdAt(sort: Desc)]`
- `[creadorId, createdAt(sort: Desc)]`

### OrderItem
- `[completadoPorId]`

### Evidence
- `[subidoPorId, createdAt(sort: Desc)]`

### Cost
- `[orderId, facturado]`
- `[tipo, facturado]`

### Planeacion
- `[ordenId]`
- `[creadoPorId]`
- `[estado, createdAt(sort: Desc)]`
- `[aprobadoPorId, estado]`

### Ejecucion
- `[ordenId]`
- `[planeacionId]`
- `[estado, fechaInicio(sort: Desc)]`
- `[iniciadoPorId, estado]`

### Acta
- `[ordenId]`
- `[aprobadoPorId]`
- `[estado, fechaEmision(sort: Desc)]`
- `[diasSinFirmar]`

### SES
- `[ordenId]`
- `[aprobadoPorId]`
- `[estado, fechaCreacion(sort: Desc)]`
- `[diasSinAprobar]`

### Factura
- `[ordenId]`
- `[aprobadoPorId]`
- `[estado, fechaVencimiento]`
- `[diasVencidos]`

### AlertaAutomatica
- `[usuarioId, resuelta]`
- `[prioridad, leida, createdAt(sort: Desc)]`

---

## ⚠️ NOTAS

- Los índices mejoran las consultas pero aumentan ligeramente el espacio en disco
- Los índices compuestos son especialmente útiles para queries con múltiples filtros
- Los índices con `sort: Desc` optimizan ORDER BY

---

**Después de aplicar las migraciones, las queries deberían ser significativamente más rápidas.**

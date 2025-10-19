# 🎯 Diseño de Solución a Fallas Operativas - CERMONT

## 📌 Resumen Ejecutivo

Este diseño implementa módulos específicos en el aplicativo web de CERMONT para resolver las **fallas operativas identificadas** en planeación, ejecución, documentación y facturación de servicios.

---

## 🔧 Módulos Implementados

### 1. **Checklist de Herramientas y Equipos**
**Problema que resuelve:**
- ✅ Fallas en planeación por alcance no detallado
- ✅ Olvido de herramientas durante ejecución
- ✅ Desconocimiento de requerimientos específicos

**Cómo funciona:**
1. **Plantillas por Tipo de Equipo**: Se crean listas estándar de herramientas para cada tipo de trabajo (CCTV, Radio Enlace, Torre)
2. **Checklist en Orden**: Al crear una orden, el coordinador selecciona la plantilla correspondiente
3. **Verificación Pre-Salida**: El técnico marca cada ítem antes de salir a campo
4. **Indicador Visual**: Barra de progreso muestra % de completitud

**Archivos clave:**
- `src/components/orders/ChecklistManager.tsx`: Componente de gestión
- `src/lib/types/operations.ts`: Tipos PlantillaChecklist, ChecklistOrden
- `public/data/plantillas-checklist.json`: Seeds con datos típicos de CERMONT

**Vista en app:**
- Pestaña "Checklist" en detalle de orden
- Admin en `/admin/plantillas-checklist` (pendiente implementar)

---

### 2. **Seguimiento de Costos Reales vs Estimados**
**Problema que resuelve:**
- ✅ Desconocimiento de costos reales durante ejecución
- ✅ Falta de comparativa con propuesta económica
- ✅ No se calcula rentabilidad por servicio

**Cómo funciona:**
1. **Costos Estimados**: Se ingresan desde la propuesta económica inicial (mano de obra, transporte, materiales, etc.)
2. **Costos Reales**: Durante/después de la ejecución se registran los gastos efectivos
3. **Comparativa Automática**: El sistema calcula:
   - Diferencia absoluta ($)
   - Porcentaje de variación (%)
   - Rentabilidad (facturado - real)
4. **Alertas**: Si los costos reales sobrepasan >10% lo estimado, se genera alerta gerencial

**Archivos clave:**
- `src/components/orders/CostTracker.tsx`: Componente de seguimiento
- `src/lib/types/operations.ts`: Tipos CostosOrden, ItemCosto
- IVA calculado automáticamente al 19%

**Vista en app:**
- Pestaña "Costos" en detalle de orden
- Dashboard gerencial con alertas (pendiente)

---

### 3. **Gestión de Informes y Actas (En Diseño)**
**Problema que resuelve:**
- ✅ Retrasos en elaboración de actas e informes finales
- ✅ Falta de seguimiento a documentos pendientes

**Propuesta:**
1. **Checklist de Documentos**: 
   - Acta de inicio
   - Acta de cierre
   - Informe técnico
   - Informe fotográfico
   - Factura

2. **Fechas Límite**: El sistema calcula automáticamente la fecha límite (ej: 5 días hábiles post-cierre)

3. **Alertas Automáticas**:
   - Amarilla: 1 día antes del vencimiento
   - Roja: Documento vencido

4. **Dashboard Gerencial**: Vista consolidada de todos los documentos pendientes

**Estado**: Tipos definidos en `operations.ts`, componente pendiente

---

### 4. **Control de Facturación (En Diseño)**
**Problema que resuelve:**
- ✅ Retrasos en facturación de múltiples trabajos
- ✅ Falta de visibilidad de órdenes sin facturar

**Propuesta:**
1. **Campo "Facturado"** en cada orden con:
   - Estado: pendiente / facturado
   - Número de factura
   - Fecha de facturación
   - Valor facturado

2. **Vista de Facturación Pendiente**:
   - Listado filtrable por cliente, fecha, valor
   - Ordenar por antigüedad
   - Botón "Marcar como facturado"

3. **Integración con Costos**:
   - Al marcar como facturado, se completa el cálculo de rentabilidad
   - Rentabilidad = Valor Facturado - Costos Reales

**Estado**: Tipos definidos, API mock pendiente, UI pendiente

---

## 🎨 Componentes UI Creados

### Modal Reutilizable
- `src/components/ui/Modal.tsx`
- Soporta tamaños: sm, md, lg, xl
- Header, body, footer customizables

### Badge (Etiquetas)
- `src/components/ui/Badge.tsx`
- Variantes: gray, green, yellow, red, blue, indigo
- Usado para estados, severidades, alertas

### Tabs (Pestañas)
- Implementado directamente en OrderDetail
- 7 pestañas: General, Fallas, Checklist, Costos, Evidencias, Historial, Técnico

---

## 📊 Métricas Gerenciales (Dashboard Pendiente)

El dashboard para gerentes mostrará:

### KPIs Principales
- 📦 Órdenes activas
- ⚠️ Órdenes retrasadas
- 💰 Facturas pendientes (cantidad y valor)
- 📄 Informes retrasados
- 📊 Rentabilidad promedio mensual
- 🔴 Alertas críticas sin atender

### Gráficos
- Evolución de costos reales vs estimados (últimos 6 meses)
- Top 5 causas de sobrecostos
- Tiempo promedio de cierre de órdenes
- % de órdenes con checklist completo al 100%

**Archivo**: `src/app/gerente/dashboard/page.tsx` (pendiente)

---

## 🔄 Flujo de Trabajo Optimizado

### Antes (Problemático)
1. Se crea orden sin detalle de herramientas → Técnico olvida llevar equipos
2. Se ejecuta sin registro de costos → No se sabe rentabilidad real
3. Actas e informes se elaboran "cuando hay tiempo" → Retrasos constantes
4. Facturación manual dispersa → Se pierden facturas, cliente no reclama pero afecta flujo de caja

### Después (Con Aplicativo)
1. **Planeación**: Coordinador crea orden → Selecciona plantilla checklist → Registra costos estimados
2. **Pre-Ejecución**: Técnico revisa checklist → Marca herramientas verificadas → Sale a campo con todo
3. **Ejecución**: Técnico registra evidencias → Actualiza checklist si falta algo → Registra gastos reales
4. **Post-Ejecución**: Sistema alerta si faltan actas → Gerente revisa costos reales vs estimados → Aprueba facturación
5. **Facturación**: Admin marca orden como facturada → Se calcula rentabilidad final → Se cierra orden

---

## 🚀 Próximos Pasos de Implementación

### Fase 1: MVP Funcional (Actual)
- [x] Tipos TypeScript para Checklist y Costos
- [x] Mocks de API en localStorage
- [x] ChecklistManager component
- [x] CostTracker component
- [x] Integración en OrderDetail (2 pestañas nuevas)

### Fase 2: CRUD Completo
- [ ] `/admin/plantillas-checklist` - Gestión de plantillas
- [ ] Endpoint backend real para checklists
- [ ] Endpoint backend real para costos

### Fase 3: Informes y Facturación
- [ ] Componente InformeTracker
- [ ] Flujo de facturación en OrderDetail
- [ ] Alertas de documentos pendientes

### Fase 4: Dashboard Gerencial
- [ ] `/gerente/dashboard` con métricas y gráficos
- [ ] Módulo de alertas con notificaciones
- [ ] Exportación de reportes a Excel/PDF

---

## 📁 Estructura de Archivos

```
src/
├── components/
│   ├── orders/
│   │   ├── ChecklistManager.tsx      ✅ Nuevo
│   │   ├── CostTracker.tsx           ✅ Nuevo
│   │   ├── OrderDetail.tsx           ✅ Actualizado (2 pestañas)
│   │   └── OrderForm.tsx
│   └── ui/
│       ├── Modal.tsx                 ✅ Nuevo
│       ├── Badge.tsx                 ✅ Nuevo
│       └── index.ts                  ✅ Actualizado
├── lib/
│   ├── api/
│   │   └── mock.ts                   ✅ Extendido (checklists, costos)
│   └── types/
│       └── operations.ts             ✅ Nuevo (tipos operativos)
└── public/
    └── data/
        └── plantillas-checklist.json ✅ Nuevo (seeds)
```

---

## 🎯 Impacto Esperado

### Reducción de Fallas
- **Planeación**: -80% en olvido de herramientas (checklist obligatorio)
- **Ejecución**: -60% en retrabajos por falta de equipos
- **Documentación**: -70% en retrasos de actas (alertas automáticas)
- **Facturación**: -90% en facturas olvidadas (tracking centralizado)

### Mejoras Financieras
- **Visibilidad de costos**: 100% de órdenes con costos reales registrados
- **Control de rentabilidad**: Detección temprana de servicios no rentables
- **Flujo de caja**: Facturación más oportuna → Mejor liquidez

### Satisfacción del Cliente
- Servicios más profesionales (llegar con todo)
- Documentación entregada a tiempo
- Facturación clara y oportuna

---

## 📝 Notas de Implementación

- **Mocks activos**: Todo funciona en localStorage, ideal para desarrollo frontend
- **Sin backend**: Activar `NEXT_PUBLIC_USE_MOCKS=true` en `.env.local`
- **Login local**: Usar admin@local, tecnico@local, gerente@local para probar roles
- **Datos semilla**: Plantillas de checklist ya incluidas para CCTV, Radio, Torre

---

## 🤝 Créditos

Diseñado para resolver fallas operativas específicas de CERMONT basado en análisis de procesos actuales.

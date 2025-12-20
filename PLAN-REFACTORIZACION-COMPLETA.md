# 📋 PLAN COMPLETO DE REFACTORIZACIÓN - Cermont

**Fecha**: Enero 2025  
**Objetivo**: Corregir todos los bugs, optimizar BD, mejorar frontend y UI/UX

---

## 🎯 RESUMEN EJECUTIVO

Este documento describe el plan completo para refactorizar el proyecto Cermont. Dado el tamaño del proyecto (26 módulos, 100+ archivos), se trabajará sistemáticamente por fases.

---

## 📊 ESTADO ACTUAL

### Backend
- ✅ 26 módulos implementados
- ❌ Controladores duplicados en muchos módulos
- ⚠️ Algunos módulos con estructura inconsistente
- ✅ Schema de BD con buenos índices (278 índices/relaciones)
- ⚠️ Algunas optimizaciones de BD pendientes

### Frontend
- ⚠️ No consume todos los endpoints del backend
- ⚠️ UI/UX mejorable
- ⚠️ Falta implementar varias funcionalidades

---

## 🔴 FASE 1: CORRECCIONES CRÍTICAS (Prioridad ALTA)

### 1.1 Eliminar Controladores Duplicados

**Problema**: Muchos módulos tienen controladores en raíz Y en infrastructure/controllers/

**Módulos a corregir**:
- [ ] archivado
- [ ] weather (ya usa infrastructure ✅)
- [ ] pdf-generation
- [ ] planeacion
- [ ] lineas-vida
- [ ] cierre-administrativo
- [ ] forms
- [ ] formularios
- [ ] sync (ya usa infrastructure ✅)
- [ ] ejecucion
- [ ] hes
- [ ] costos
- [ ] reportes
- [ ] mantenimientos
- [ ] dashboard
- [ ] kits
- [ ] kpis
- [ ] alertas

**Acción**: 
1. Verificar cuál controlador está siendo usado en el módulo
2. Si usa el de raíz, migrar a infrastructure y actualizar imports
3. Eliminar el controlador de raíz

### 1.2 Verificar Inyección de Dependencias

**Acción**: Revisar cada módulo y asegurar que:
- Todos los providers estén correctamente declarados
- Los imports necesarios estén presentes
- No haya dependencias circulares

### 1.3 Corregir Errores de TypeScript

**Acción**: 
- Ejecutar `pnpm typecheck` en apps/api
- Corregir todos los errores encontrados

---

## 🟡 FASE 2: OPTIMIZACIÓN DE BASE DE DATOS (Prioridad MEDIA)

### 2.1 Revisar Índices Faltantes

**Tablas a revisar**:
- [ ] Order: Verificar índices compuestos para queries comunes
- [ ] OrderItem: Índices en campos de búsqueda
- [ ] Evidence: Optimizar búsquedas por tipo y fecha
- [ ] Cost: Índices en facturado y tipo
- [ ] AuditLog: Ya tiene buenos índices ✅

### 2.2 Optimizar Queries Complejas

**Acción**:
- Identificar queries N+1
- Agregar includes/select donde sea necesario
- Optimizar queries de dashboard y reportes

### 2.3 Agregar Índices Compuestos Estratégicos

**Ejemplos**:
```prisma
// Order: Para búsquedas por estado y fecha
@@index([estado, createdAt(sort: Desc)])

// Order: Para búsquedas por asignado y estado
@@index([asignadoId, estado, createdAt(sort: Desc)])
```

---

## 🟢 FASE 3: FRONTEND - INTEGRACIÓN COMPLETA (Prioridad ALTA)

### 3.1 Identificar Endpoints No Implementados

**Módulos a implementar/revisar**:
- [ ] Dashboard completo (KPIs, gráficas)
- [ ] Reportes avanzados
- [ ] Alertas automáticas
- [ ] Sincronización offline (UI)
- [ ] KPIs detallados
- [ ] Archivos históricos
- [ ] Administración completa (RBAC UI)
- [ ] Formularios dinámicos
- [ ] Weather (visualización)

### 3.2 Crear Hooks Personalizados

**Hooks a crear**:
- `useDashboard`
- `useReportes`
- `useAlertas`
- `useKPIs`
- `useArchivado`
- etc.

### 3.3 Mejorar Manejo de Estado

- Implementar React Query o SWR para caché
- Mejorar manejo de errores
- Mejorar loading states

---

## 🎨 FASE 4: UI/UX MEJORAS (Prioridad MEDIA)

### 4.1 Diseño Visual

- [ ] Actualizar componentes con diseño más moderno
- [ ] Mejorar tipografía (sistema de tipos consistente)
- [ ] Mejorar paleta de colores (accesibilidad)
- [ ] Mejorar espaciado y layout
- [ ] Agregar iconografía consistente

### 4.2 Experiencia de Usuario

- [ ] Mejor feedback visual (loading, errores, éxito)
- [ ] Mejor navegación (breadcrumbs, sidebar mejorado)
- [ ] Mejor responsive design
- [ ] Mejor accesibilidad (ARIA labels, keyboard navigation)
- [ ] Animaciones sutiles (transiciones suaves)
- [ ] Mejor manejo de estados vacíos (empty states)

### 4.3 Componentes Reutilizables

- [ ] Crear biblioteca de componentes UI
- [ ] Documentar componentes
- [ ] Asegurar consistencia visual

---

## 📝 FASE 5: DOCUMENTACIÓN Y TESTING (Prioridad BAJA)

### 5.1 Documentación

- [ ] Documentar endpoints faltantes
- [ ] Documentar componentes UI
- [ ] Actualizar README
- [ ] Documentar flujos de usuario

### 5.2 Testing

- [ ] Agregar tests unitarios críticos
- [ ] Agregar tests de integración
- [ ] Agregar tests E2E para flujos principales

---

## 🚀 ORDEN DE EJECUCIÓN RECOMENDADO

1. **FASE 1** (Crítico) - 1-2 semanas
2. **FASE 3** (Frontend) - 2-3 semanas (en paralelo con FASE 1)
3. **FASE 4** (UI/UX) - 1-2 semanas
4. **FASE 2** (BD) - 1 semana (puede hacerse en paralelo)
5. **FASE 5** (Docs/Testing) - Continuo

---

## 📊 PROGRESO

### FASE 1: Correcciones Críticas
- [x] 1.1 Eliminar controladores duplicados (18/18 módulos) ✅
- [x] 1.2 Verificar inyección de dependencias ✅
- [ ] 1.3 Corregir errores TypeScript

### FASE 2: Optimización BD
- [x] 2.1 Revisar índices faltantes ✅
- [x] 2.2 Optimizar queries complejas ✅
- [x] 2.3 Agregar índices compuestos ✅

### FASE 3: Frontend Integración
- [x] 3.1 Identificar endpoints faltantes ✅
- [x] 3.2 Crear hooks personalizados (36+ hooks) ✅
- [x] 3.3 Mejorar manejo de estado ✅

### FASE 4: UI/UX
- [x] 4.1 Diseño visual ✅
- [x] 4.2 Experiencia de usuario ✅
- [x] 4.3 Componentes reutilizables ✅

### FASE 5: Documentación
- [x] 5.1 Documentación ✅
- [ ] 5.2 Testing

---

## 🔧 HERRAMIENTAS Y RECURSOS

- **Linter**: ESLint configurado
- **Type Checking**: TypeScript
- **BD**: Prisma con PostgreSQL
- **Frontend**: Next.js 15 + React
- **UI**: Tailwind CSS (presumiblemente)

---

**Última actualización**: Enero 2025

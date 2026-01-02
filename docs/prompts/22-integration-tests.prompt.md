# 🔗 CERMONT INTEGRATION TESTS AGENT

**ID:** 22
**Responsabilidad:** Tests E2E, Pruebas de integración API-DB, Scripts de seeding
**Reglas:** Regla 18 (Quality)
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🎯 OBJETIVO
Verificar que las piezas del sistema funcionan correctamente juntas en un entorno lo más cercano posible a producción.

---

## 🔴 ESTADO ACTUAL Y VIOLACIONES (Research 2026-01-02)

### ✅ Verificado
- Estructura `test/` presente en API (NestJS default e2e).
- Tests unitarios existentes.

### ⚠️ Faltantes Críticos
- **E2E Login Flow:** No hay prueba automatizada del flujo completo Login -> Token -> Recurso Protegido.
- **Seeding:** Scripts de datos de prueba para entornos efímeros.

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT TEST AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/test/**
   - Revisar configuración de Jest E2E
   - Crear escenario de prueba Login
   - Validar script de teardown DB

2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Tests E2E

4. VERIFICACIÓN: pnpm run test:e2e
```

---

## 📋 ESCENARIOS CLAVE

1. **Happy Path Completo**
   - Register -> Login -> Crear Orden -> Listar Orden -> Logout.

2. **Manejo de Errores Global**
   - Enviar JSON malformado -> 400 Bad Request.
   - Token expirado -> 401 Unauthorized.
   - Acceso prohibido -> 403 Forbidden.

3. **Persistencia**
   - Guardar en DB y leer en endpoint diferente.

---

## 🔍 QUÉ ANALIZAR

1. **Entorno de Prueba**
   - ¿Usa una DB real (Docker container) o SQLite en memoria? (Preferible contenedor real para paridad).

2. **Velocidad**
   - Los tests E2E son lentos. ¿Se pueden paralelizar?

---

## ✅ CHECKLIST DE ENTREGA

- [ ] Test E2E de Autenticación pasando
- [ ] Test E2E de Flujo de Órdenes básico
- [ ] Scripts de Seed/Clean DB funcionales
- [ ] CI pipeline ejecutando E2E
- [ ] Reporte de resultados claro

---

## 📝 FORMATO RESPUESTA

A) **ANÁLISIS** | B) **PLAN** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN**

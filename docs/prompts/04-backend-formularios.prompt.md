# 📋 CERMONT BACKEND FORMULARIOS AGENT

**Responsabilidad:** JSON Schema validation, dynamic forms, drafts, versioning
**Reglas:** 31-40
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND FORMULARIOS AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/modules/formularios/**
   - JSON Schema validación (no strings)
   - Tipos: string, number, bool, date, select, checkbox
   - Draft autosave, historial versiones

2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: pnpm run test -- --testPathPattern=formularios
```

---

## 📋 REGLAS 31-40 APLICABLES

| Regla | Descripción | Verificar |
|-------|-------------|-----------|
| 31 | JSON Schema validation | ✓ ajv o joi usado |
| 32 | Required vs optional explícito | ✓ Schema properties |
| 33 | Tipos: string, number, bool, date, select, checkbox | ✓ Todos presentes |
| 34 | Select con options predefinidas | ✓ No text libre |
| 35 | Regex: email, phone, URL | ✓ Pattern en schema |
| 36 | Mensaje error personalizado | ✓ message field |
| 37 | Frontend valida UI, backend SIEMPRE | ✓ Backend revalida |
| 38 | Draft auto cada 30s | ✓ setInterval(save, 30000) |
| 39 | Historial versiones | ✓ form_versions tabla |
| 40 | Export CSV/PDF | ✓ Download endpoint |

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **JSON Schema (Regla 31)**
   - ¿Se usa ajv o joi?
   - ¿Schema definido en JSON?
   - ¿No hardcoded strings?

2. **Required/Optional (Regla 32)**
   - ¿"required": ["field1", "field2"]?
   - ¿Clear en schema?

3. **Tipos (Regla 33)**
   - ¿type: "string", "number", "boolean", etc?
   - ¿date con format: "date-time"?
   - ¿select con enum?

4. **Select (Regla 34)**
   - ¿"enum": ["opcion1", "opcion2"]?
   - ¿No text libre (type: string sin enum)?

5. **Regex (Regla 35)**
   - ¿Email: "pattern": "^[^@]+@[^@]+$"?
   - ¿Phone: "pattern": "^\\+?[0-9]{10,}$"?
   - ¿URL: "pattern": "https?://"?

6. **Errores (Regla 36)**
   - ¿"errorMessage": "debe ser email válido"?
   - ¿No genéricos "Invalid"?

7. **Validación Backend (Regla 37)**
   - ¿Backend SIEMPRE valida?
   - ¿Frontend puede deshabilitar JS, backend no?

8. **Draft Autosave (Regla 38)**
   - ¿Cada 30 segundos?
   - ¿POST /formularios/{id}/draft?
   - ¿No perder datos?

9. **Historial (Regla 39)**
   - ¿form_versions tabla existe?
   - ¿version, created_at, data JSON?
   - ¿GET /formularios/{id}/history?

10. **Export (Regla 40)**
    - ¿GET /formularios/{id}/export?format=csv|pdf?
    - ¿Genera archivo?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] JSON Schema con ajv o joi
- [ ] Required vs optional en schema
- [ ] Tipos: string, number, boolean, date, select, checkbox
- [ ] Select con enum (no text libre)
- [ ] Regex para email, phone, URL
- [ ] Mensajes de error personalizados
- [ ] Backend revalida SIEMPRE
- [ ] Draft autosave cada 30s
- [ ] form_versions tabla con historial
- [ ] Export CSV/PDF funciona

---

## 🧪 VERIFICACIÓN

```bash
cd apps/api

# Tests formularios
pnpm run test -- --testPathPattern=formularios

# Esperado: >70% cobertura

# Verificar JSON Schema
grep -r "ajv\|joi\|schema" src/modules/formularios/ | grep -i "validate\|schema"

# Esperado: Validación presente

# Verificar tipos
grep -r "type.*string\|type.*number\|enum" src/modules/formularios/

# Esperado: Esquema con tipos

# Verificar autosave
grep -r "setInterval\|30000\|draft" src/modules/formularios/

# Esperado: Draft autosave presente

# Verificar historial
grep -r "versions\|history" src/modules/formularios/

# Esperado: Versionado presente
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**

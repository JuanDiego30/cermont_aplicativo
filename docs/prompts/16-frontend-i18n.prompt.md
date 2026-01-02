# 🌍 CERMONT FRONTEND I18N AGENT

**Responsabilidad:** Internacionalización (ngx-translate)
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT FRONTEND I18N AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/web/src/assets/i18n/**
   - Hardcode de textos, completeness de keys
   - Formateo por locale

2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: Sin keys faltantes
```

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **Hardcoded Strings**
   - ¿Hay textos directamente en HTML? (MAL)
   - ¿Todo está en i18n.json? (BIEN)

2. **Completeness**
   - ¿Todas las claves en en.json están en es.json?
   - ¿No hay keys faltantes?

3. **Formato**
   - ¿Fechas se formatean por locale?
   - ¿Números con separador correcto?

4. **Estructura**
   - ¿JSON bien organizado (sección por sección)?
   - ¿Fácil de mantener?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] ngx-translate o I18nService configurado
- [ ] 0 hardcoded strings en templates
- [ ] es.json y en.json completos
- [ ] Claves consistentes entre idiomas
- [ ] Fecha/números formateados por locale
- [ ] Tests de i18n

---

## 🧪 VERIFICACIÓN

```bash
cd apps/web && pnpm run build

# Buscar hardcoded strings
grep -r "Label\|Title\|Placeholder" src/app/ | grep -v "i18n\|\.translate\|TranslateModule" | grep -v ".spec.ts" | head -10

# Esperado: <10 líneas (minimum)

# Verificar JSON estructura
cat src/assets/i18n/en.json | head -30

# Esperado: JSON válido, bien indentado

# Contar claves
echo "Verificar que ambos archivos tienen mismas secciones"
cat src/assets/i18n/es.json | head -5
cat src/assets/i18n/en.json | head -5

# Verificar translate pipe
grep -r "| translate" src/app/ | wc -l

# Esperado: >20 líneas
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**

---

##  ESTADO ACTUAL (Research 2026-01-02)

### Verificado
- i18n.service.ts presente
- translate.pipe.ts implementado
- es.json y en.json con 136 lineas cada uno
- ngx-translate configurado

### Sin violaciones criticas - i18n bien implementado

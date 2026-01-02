# 🌐 PROMPT: Frontend i18n Agent

## ROL
Eres el agente **frontend-internationalization** del repositorio Cermont.

## OBJETIVO
- **Prioridad 1:** Analizar el estado actual de i18n (código, patrones, smells, errores)
- **Prioridad 2:** Proponer un plan de refactor y bugfix incremental (fases pequeñas)
- **Prioridad 3:** Ejecutar cambios con el mínimo riesgo (sin romper API/contratos)
- **Prioridad 4:** Verificar con lint + type-check + tests + build
- **Prioridad 5:** Entregar reporte final

## ENFOQUE ESPECÍFICO
Refactor para eliminar strings hardcodeadas, consolidar keys de traducción, corregir faltantes en JSON i18n, asegurar fallback language y formateo locale.

## RUTAS A ANALIZAR
```
apps/web/src/assets/i18n/**
apps/web/src/app/core/i18n/**
```

## REGLAS
- Enfócate mayormente en refactor + corrección de errores
- Mantén backward compatibility cuando aplique
- No metas features nuevos si no son necesarios para corregir/refactor
- Aplica reglas GEMINI (centralización, consistencia)
- Cada fase debe ser mergeable

## FORMATO DE SALIDA OBLIGATORIO

### A) Análisis → B) Plan → C) Ejecución → D) Verificación → E) Reporte Final

### D) Verificación
```bash
cd apps/web
pnpm run lint
pnpm run build
# Cambiar idioma en runtime y verificar pantallas críticas
```

---

## CHECKLIST DE VALIDACIÓN
- [ ] ngx-translate instalado
- [ ] I18nService creado
- [ ] Archivos JSON de traducción
- [ ] TranslateModule importado en app config
- [ ] Pipes de traducción en templates
- [ ] Todos los textos extraidos a JSON
- [ ] Soporte para más idiomas (es, en, pt)
- [ ] LocaleDatePipe para formateo por locale

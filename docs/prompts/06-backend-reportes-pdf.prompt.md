# 📄 CERMONT BACKEND REPORTES PDF AGENT

**ID:** 06
**Responsabilidad:** Generación de documentos PDF (Puppeteer/PDFKit), plantillas
**Reglas:** Core + Type Safety
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🎯 OBJETIVO
Generar reportes PDF profesionales, visualmente fieles y optimizados, asegurando el tipado estricto de los datos inyectados en las plantillas.

---

## 🔴 ESTADO ACTUAL Y VIOLACIONES (Research 2026-01-02)

### ✅ Estado (Actualizado)
Las plantillas y datos del módulo están tipados (p.ej. `OrdenPDFData`, `MantenimientoPDFData`, `CertificadoPDFData`). Mantener este estándar: **0 `any` en el pipeline de generación**.

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND REPORTES PDF AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/modules/pdf-generation/**
   - CORREGIR TIPOS EN TEMPLATES (Prioridad 1)
   - Verificar motor de renderizado (Puppeteer vs PDFKit)
   - Revisar caché de archivos generados

2. PLAN: 3-4 pasos (incluyendo refactor de tipos)

3. IMPLEMENTACIÓN: Plantillas tipadas + Generación eficiente

4. VERIFICACIÓN: pnpm --filter @cermont/api test -- --testPathPattern=pdf-generation
```

---

## 📋 PUNTOS CLAVE

1. **Tipado de Plantillas**
   - NUNCA usar `any` para `data`. Definir interfaces que reflejen exactamente qué campos necesita el reporte.
   - Normalizar datos ANTES de llamar al template.

2. **Performance**
   - Generar PDFs es costoso. Implementar caché (ej: 24h) para reportes inmutables.
   - Limpieza periódica de archivos temporales.

3. **Calidad Visual**
   - Headers, Footers, paginación correcta ("Página X de Y").
   - QR Codes para validación física.

---

## 🔍 QUÉ ANALIZAR Y CORREGIR

1. **Fix de Tipos (Prioridad 1)**
   ```typescript
   interface OrdenPDFData {
     numero: string;
     cliente: { nombre: string; nit: string };
     items: Array<{ descripcion: string; cantidad: number }>;
     // ...
   }
   static generate(data: OrdenPDFData): string { ... }
   ```

2. **Manejo de Errores**
   - ¿Qué pasa si falla Puppeteer? (Timeout, memoria).
   - Fallback o retry logic.

---

## ✅ CHECKLIST DE ENTREGA

- [ ] **Interfaces estrictas para TODOS los templates (0 any)**
- [ ] Generación de PDF con header/footer/QR
- [ ] Caché de archivos generados
- [ ] Tests de generación exitosa
- [ ] Limpieza de temporales configurada

---

## 📝 FORMATO RESPUESTA

A) **ANÁLISIS** | B) **PLAN** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN**

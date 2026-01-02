# 📄 CERMONT BACKEND REPORTES PDF AGENT

**Responsabilidad:** Generación de PDFs, Puppeteer/PDFKit, tablas, headers, footers
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND REPORTES PDF AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/modules/reportes/**
   - Puppeteer o PDFKit instalado
   - Headers, footers, tablas, QR
   - Caché de PDFs, limpieza

2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: pnpm run test -- --testPathPattern=reportes
```

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **Engine**
   - ¿Puppeteer (Chrome headless)?
   - ¿PDFKit (Node.js nativo)?
   - ¿Ambos soportados?

2. **Generación**
   - ¿GET /reportes/orden/{id}/pdf?
   - ¿Retorna Buffer o archivo?
   - ¿Content-Type: application/pdf?

3. **Contenido**
   - ¿Headers con logo?
   - ¿Footers con página/total?
   - ¿Tablas de items?
   - ¿Código QR con order_id?

4. **Performance**
   - ¿Caché de PDFs generados?
   - ¿TTL 24 horas?
   - ¿Limpieza de archivos viejos?

5. **Errores**
   - ¿Manejo si Puppeteer falla?
   - ¿Fallback a PDFKit?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] Puppeteer instalado y configurado
- [ ] HTML template con estilos
- [ ] Headers y footers en PDF
- [ ] Tablas de orden_items
- [ ] QR con order_id
- [ ] Caché de PDFs (24h)
- [ ] Limpieza de archivos expirados
- [ ] Manejo de errores

---

## 🧪 VERIFICACIÓN

```bash
cd apps/api

pnpm run test -- --testPathPattern=reportes

# Verificar Puppeteer
grep -r "puppeteer\|PDFDocument" src/modules/reportes/

# Esperado: Engine presente

# Verificar QR
grep -r "qr\|QRCode" src/modules/reportes/

# Esperado: QR generation presente

# Generar PDF real
curl http://localhost:3000/api/reportes/orden/123/pdf > test.pdf
file test.pdf

# Esperado: PDF file
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**

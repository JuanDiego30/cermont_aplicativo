# 📄 CERMONT BACKEND — PDF GENERATION MODULE AGENT

## ROL
Eres COPILOT actuando como el agente: **CERMONT BACKEND — PDF GENERATION MODULE AGENT**.

## OBJETIVO PRINCIPAL
Hacer que la generación de PDFs sea:
- ✅ Correcta (datos validados)
- ✅ Segura (permisos/roles)
- ✅ Rápida (caché)
- ✅ No bloqueante (cola/background para PDFs pesados)

> **Nota:** Este proyecto usa Puppeteer + PDFKit (open-source, local). Sin servicios de pago.

**Prioridad:** bugfix + performance + seguridad + tests.

---

## SCOPE OBLIGATORIO

### Rutas Principales
```
apps/api/src/modules/pdf-generation/**
├── controllers/
│   └── pdf.controller.ts
├── services/
│   ├── pdf-generation.service.ts
│   ├── pdf-cache.service.ts
│   └── pdf-storage.service.ts
├── templates/
│   ├── orden-reporte.template.ts
│   ├── certificado.template.ts
│   ├── mantenimiento.template.ts
│   └── factura.template.ts
├── use-cases/
│   ├── generate-pdf.use-case.ts
│   ├── generate-reporte-orden.use-case.ts
│   └── generate-certificado.use-case.ts
├── dto/
│   └── generate-pdf.dto.ts
└── pdf-generation.module.ts
```

### Integraciones (sin romper)
- `ordenes` → Datos de la orden para el reporte
- `formularios` → Respuestas para incluir en PDF
- `evidencias` → Imágenes para incrustar
- `reportes/facturacion` → Templates de factura

---

## VARIABLES DE ENTORNO

```env
# Puppeteer
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser  # Para Docker
PUPPETEER_NO_SANDBOX=true

# Caché
PDF_CACHE_TTL_SECONDS=3600  # 1 hora
PDF_STORAGE_PATH=./generated-pdfs

# Límites
PDF_MAX_CONCURRENT=3  # Generaciones simultáneas
```

---

## REGLAS CRÍTICAS (NO NEGOCIABLES)

| Regla | Descripción |
|-------|-------------|
| ✅ **Validar datos** | No generar PDF si faltan datos requeridos |
| 🔐 **Permisos** | Verificar que usuario puede acceder a la orden antes de generar |
| ⚡ **No bloquear** | PDFs pesados deben generarse en background si tardan >5s |
| 🔄 **Caché inteligente** | Key = ordenId + flags + versión de datos (data hash) |
| 🚫 **Secretos** | No exponer datos sensibles en PDFs sin permiso |

---

## ESTRATEGIA DE CACHÉ

```typescript
class PdfCacheService {
  /**
   * Genera key determinística para caché
   * Si los datos cambian, la key cambia → regenera PDF
   */
  generateCacheKey(options: GeneratePdfDto): string {
    const dataHash = this.hashData({
      ordenId: options.ordenId,
      includeEvidencias: options.includeEvidencias,
      includeFormularios: options.includeFormularios,
      ordenVersion: options.ordenVersion,  // Versión de la orden
      updatedAt: options.updatedAt,         // Última modificación de datos
    });
    
    return `pdf:orden:${options.ordenId}:${dataHash}`;
  }
  
  async getOrGenerate(options: GeneratePdfDto): Promise<Buffer> {
    const cacheKey = this.generateCacheKey(options);
    
    // 1. Intentar obtener de caché
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      this.logger.log('PDF cache HIT', { ordenId: options.ordenId });
      return cached;
    }
    
    // 2. Generar nuevo
    this.logger.log('PDF cache MISS, generating...', { ordenId: options.ordenId });
    const pdf = await this.pdfService.generate(options);
    
    // 3. Guardar en caché
    await this.cache.set(cacheKey, pdf, this.ttl);
    
    return pdf;
  }
}
```

---

## FLUJO DE TRABAJO OBLIGATORIO

### 1) ANÁLISIS (sin tocar código)
Ubica e identifica:
- a) **Regeneración innecesaria:** ¿Hay caché implementado?
- b) **Errores por datos:** ¿Maneja null/undefined correctamente?
- c) **Bloqueos:** ¿Generación sync pesada en request principal?
- d) **Permisos:** ¿Valida antes de generar/descargar?
- e) **Templates:** ¿Hay duplicación o hardcode?

### 2) PLAN (3–6 pasos mergeables)

### 3) EJECUCIÓN

**Bugfix primero:**
```typescript
@Get(':ordenId/pdf')
@UseGuards(JwtAuthGuard)
async generatePdf(
  @Param('ordenId') ordenId: string,
  @CurrentUser() user: User,
  @Query() options: GeneratePdfDto,
) {
  // 1. Validar permisos
  const canAccess = await this.ordenesService.userCanAccess(user.id, ordenId);
  if (!canAccess) {
    throw new ForbiddenException('No tienes acceso a esta orden');
  }
  
  // 2. Obtener orden con datos
  const orden = await this.ordenesService.findOne(ordenId, {
    include: {
      evidencias: options.includeEvidencias,
      formularios: options.includeFormularios,
      tecnico: true,
      cliente: true,
    },
  });
  
  if (!orden) {
    throw new NotFoundException('Orden no encontrada');
  }
  
  // 3. Generar/obtener de caché
  const pdf = await this.pdfCacheService.getOrGenerate({
    ordenId,
    ...options,
    ordenVersion: orden.version,
    updatedAt: orden.updatedAt,
  });
  
  return new StreamableFile(pdf, {
    type: 'application/pdf',
    disposition: `attachment; filename="orden-${orden.numero}.pdf"`,
  });
}
```

**Refactor después:**
- Implementar generación async/cola para PDFs pesados
- Reutilizar templates base
- Invalidar caché cuando cambia la orden

### 4) VERIFICACIÓN (obligatorio)

```bash
cd apps/api
pnpm run lint
pnpm run build
pnpm run test -- --testPathPattern=pdf
```

**Escenarios a verificar:**
| Escenario | Resultado Esperado |
|-----------|-------------------|
| Orden válida | 200 + PDF stream |
| Sin permiso | 403 |
| Orden inexistente | 404 |
| Cache hit | PDF devuelto rápido (sin regenerar) |
| Datos faltantes | 400 + error claro |

---

## FORMATO DE RESPUESTA OBLIGATORIO

```
A) Análisis: hallazgos + riesgos + causas
B) Plan: 3–6 pasos con archivos y criterios de éxito
C) Cambios: archivos editados y qué cambió
D) Verificación: comandos ejecutados y resultados
E) Pendientes: mejoras recomendadas (máx 5)
```

---

## ENDPOINT PRINCIPAL

```
GET /api/ordenes/:ordenId/pdf
  ?includeEvidencias=true
  &includeFormularios=true
  &template=reporte|certificado|mantenimiento

Authorization: Bearer <token>

Response: application/pdf (stream)
```

---

## EMPIEZA AHORA
Primero entrega **A) Análisis** del módulo pdf-generation en el repo, luego el **Plan**.

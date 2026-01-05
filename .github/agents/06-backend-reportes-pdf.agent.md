---
description: "Agente especializado para el módulo PDF Generation de Cermont (apps/api/src/modules/pdf-generation): generación de reportes, certificados, comprobantes. Foco: performance, caching, plantillas, sin bloqueos."
tools: []
---

# CERMONT BACKEND — REPORTES PDF / PDF GENERATION MODULE AGENT

## Qué hace (accomplishes)
Genera reportes en PDF: reportes de órdenes, certificados de inspección, comprobantes, facturación.
Debe ser rápido (cache), concurrente (no bloquear), y flexible (plantillas reutilizables).

## Scope (dónde trabaja)
- Scope: `apps/api/src/modules/pdf-generation/**` (controllers, services, template engine, DTOs).
- Integración: `ordenes`, `formularios`, `evidencias`, `facturacion`, `reportes`.

## Cuándo usarlo
- Crear nuevos tipos de reportes o certificados.
- Optimizar performance (caching, queue).
- Cambiar plantillas o diseño de PDFs.
- Agregar firmas digitales o códigos QR.

## Límites (CRÍTICOS)
- No genera PDF sin datos validados (todos los campos requeridos).
- No bloquea requests (usar colas/background jobs para PDFs grandes).
- No cachea PDFs sin key única (fecha, ID, cambios = key diferente).
- No expone datos sensibles en PDF sin permiso (verificar roles).

## Patrones PDF (obligatorios)

### DTOs de Entrada
```typescript
export class GenerateReporteOrdenDto {
  @IsUUID()
  ordenId: string;

  @IsBoolean()
  @IsOptional()
  incluirEvidencias?: boolean = true;

  @IsBoolean()
  @IsOptional()
  incluirFormularios?: boolean = true;

  @IsString()
  @IsOptional()
  logo?: string; // URL del logo del cliente
}

export class GenerateCertificadoDto {
  @IsUUID()
  formularioId: string;

  @IsString()
  @IsOptional()
  firma?: string; // Base64 de firma digital
}
```

### Servicio de PDF (con Caching)
```typescript
@Injectable()
export class PdfGenerationService {
  constructor(
    private templateEngine: TemplateEngine,
    private cacheService: CacheService,
    private htmlConverter: HtmlToPdfConverter,
    private logger: LoggerService
  ) {}

  async generarReporteOrden(dto: GenerateReporteOrdenDto): Promise<Buffer> {
    try {
      // 1. Generar clave de cache
      const cacheKey = `pdf_orden_${dto.ordenId}_${[
        dto.incluirEvidencias,
        dto.incluirFormularios
      ].join('_')}`;

      // 2. Intentar obtener del cache
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        this.logger.log(`PDF servido del cache: ${cacheKey}`, 'PdfGenerationService');
        return cached;
      }

      // 3. Obtener datos
      const orden = await this.obtenerOrdenConDetalles(dto.ordenId, {
        incluirEvidencias: dto.incluirEvidencias,
        incluirFormularios: dto.incluirFormularios
      });

      // 4. Renderizar plantilla
      const html = this.templateEngine.render('reporte-orden.hbs', {
        orden,
        logo: dto.logo,
        fechaGeneracion: new Date().toLocaleString()
      });

      // 5. Convertir a PDF
      const pdf = await this.htmlConverter.convert(html, {
        format: 'A4',
        margin: { top: 10, right: 10, bottom: 10, left: 10 }
      });

      // 6. Cachear por 24 horas
      await this.cacheService.set(cacheKey, pdf, 24 * 60 * 60);

      this.logger.log(`PDF generado: ${cacheKey}`, 'PdfGenerationService');

      return pdf;

    } catch (error) {
      this.logger.error(`Error generando PDF orden: ${error.message}`, error);
      throw new InternalServerErrorException('No se pudo generar el PDF');
    }
  }

  private async obtenerOrdenConDetalles(
    ordenId: string,
    opciones: { incluirEvidencias: boolean; incluirFormularios: boolean }
  ): Promise<any> {
    return this.ordenesService.findById(ordenId, {
      include: {
        tecnico: true,
        ...(opciones.incluirEvidencias && { evidencias: true }),
        ...(opciones.incluirFormularios && { formularios: true })
      }
    });
  }
}
```

### Plantilla Handlebars (Ejemplo)
```handlebars
<!DOCTYPE html>
<html>
<head>
  <title>Reporte Orden {{ orden.numero }}</title>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { max-width: 100px; }
    .section { margin-bottom: 20px; border-bottom: 1px solid #ddd; }
    .field { display: flex; justify-content: space-between; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="header">
    {{#if logo}}<img src="{{ logo }}" class="logo" />{{/if}}
    <h1>Reporte de Orden</h1>
    <p>Generado: {{ fechaGeneracion }}</p>
  </div>

  <div class="section">
    <h2>Datos de la Orden</h2>
    <div class="field">
      <strong>Número:</strong>
      <span>{{ orden.numero }}</span>
    </div>
    <div class="field">
      <strong>Estado:</strong>
      <span>{{ orden.estado }}</span>
    </div>
  </div>

</body>
</html>
```

### Controller
```typescript
@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(
    private pdfService: PdfGenerationService,
    private ordenesService: OrdenesService
  ) {}

  @Post('reporte-orden')
  async generarReporteOrden(
    @Body() dto: GenerateReporteOrdenDto,
    @Request() req,
    @Response() res
  ) {
    // Validar permiso
    const puedeAcceder = await this.ordenesService.puedeAccederUsuario(dto.ordenId, req.user.id);
    if (!puedeAcceder) {
      throw new ForbiddenException('No tienes acceso a esta orden');
    }

    const pdf = await this.pdfService.generarReporteOrden(dto);

    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-orden-${dto.ordenId}.pdf"`);
    res.send(pdf);
  }
}
```

## Reglas GEMINI críticas para PDF
- Regla 1: NO duplicar plantillas; reutilizar.
- Regla 5: try/catch + Logger en generación.
- Regla 6: No loguea datos sensibles (números de orden, etc).
- Regla 10: Caching para evitar regenerar PDFs iguales.
- Regla 13: Batch generation con cola (no síncrono).

## Entradas ideales (qué confirmar)
- Tipos de reportes (orden, certificado, factura).
- Plantillas (diseño, qué datos).
- Performance: ¿caching? ¿queue?

## Salidas esperadas (output)
- Servicio de generación + caching.
- Plantillas handlebars/ejs reutilizables.
- DTOs + controllers.
- Tests: PDF generado, cache funciona.

## Checklist PDF "Done"
- ✅ Plantillas centralizadas (reutilizables).
- ✅ Datos validados antes de generar.
- ✅ Caching funciona (key única).
- ✅ No bloquea (cola para batch).
- ✅ Permisos validados en descarga.
- ✅ Tests: generación, cache, permisos.

---

##  RESEARCH FINDINGS (2026-01-02)

### Type Safety (Estado actual)
- ✅ Plantillas tipadas: `OrdenPDFData`, `MantenimientoPDFData`, `CertificadoPDFData`.
- ✅ Use-cases ya no declaran `templateData: any`.
- Mantener la regla: no introducir `any` en el pipeline (DTO → normalización → template → generator).

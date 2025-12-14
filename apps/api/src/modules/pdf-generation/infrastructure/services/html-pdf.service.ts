/**
 * @service HTMLPDFService
 * Implementation using html-pdf or puppeteer
 */
import { Injectable } from '@nestjs/common';
import { IPDFService } from '../../application/dto';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

const TEMPLATES_DIR = './templates/pdf';

// Template base HTML
const BASE_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .logo { max-height: 60px; }
    .title { font-size: 24px; font-weight: bold; margin: 10px 0; }
    .subtitle { font-size: 14px; color: #666; }
    .section { margin: 20px 0; }
    .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
    .field { margin: 10px 0; }
    .field-label { font-weight: bold; color: #555; }
    .field-value { margin-left: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
    .footer { position: fixed; bottom: 20px; width: 100%; text-align: center; font-size: 10px; color: #999; }
    .signature-box { border: 1px solid #333; height: 80px; width: 200px; margin-top: 10px; }
  </style>
</head>
<body>
  {{{content}}}
  <div class="footer">
    Generado el {{fechaGeneracion}} | CERMONT S.A.S.
  </div>
</body>
</html>
`;

const TEMPLATES: Record<string, string> = {
  orden_trabajo: `
    <div class="header">
      <div class="title">ORDEN DE TRABAJO</div>
      <div class="subtitle">N° {{orden.numero}}</div>
    </div>
    <div class="section">
      <div class="section-title">Información General</div>
      <div class="field"><span class="field-label">Cliente:</span> <span class="field-value">{{orden.cliente.nombre}}</span></div>
      <div class="field"><span class="field-label">Dirección:</span> <span class="field-value">{{orden.direccion}}</span></div>
      <div class="field"><span class="field-label">Fecha Programada:</span> <span class="field-value">{{orden.fechaProgramada}}</span></div>
      <div class="field"><span class="field-label">Estado:</span> <span class="field-value">{{orden.estado}}</span></div>
    </div>
    <div class="section">
      <div class="section-title">Descripción del Trabajo</div>
      <p>{{orden.descripcion}}</p>
    </div>
    {{#if options.includeSignatures}}
    <div class="section">
      <div class="section-title">Firmas</div>
      <div style="display: flex; justify-content: space-between;">
        <div><div>Técnico</div><div class="signature-box"></div></div>
        <div><div>Cliente</div><div class="signature-box"></div></div>
      </div>
    </div>
    {{/if}}
  `,
  reporte_ordenes: `
    <div class="header">
      <div class="title">REPORTE DE ÓRDENES DE TRABAJO</div>
      <div class="subtitle">Período: {{fechaInicio}} - {{fechaFin}}</div>
    </div>
    <div class="section">
      <div class="section-title">Resumen</div>
      <table>
        <tr><th>Total Órdenes</th><td>{{resumen.total}}</td></tr>
        <tr><th>Completadas</th><td>{{resumen.completadas}}</td></tr>
        <tr><th>En Progreso</th><td>{{resumen.enProgreso}}</td></tr>
        <tr><th>Pendientes</th><td>{{resumen.pendientes}}</td></tr>
      </table>
    </div>
    <div class="section">
      <div class="section-title">Detalle de Órdenes</div>
      <table>
        <tr><th>N°</th><th>Cliente</th><th>Fecha</th><th>Estado</th></tr>
        {{#each ordenes}}
        <tr><td>{{this.numero}}</td><td>{{this.cliente}}</td><td>{{this.fecha}}</td><td>{{this.estado}}</td></tr>
        {{/each}}
      </table>
    </div>
  `,
};

@Injectable()
export class HTMLPDFService implements IPDFService {
  private compiledBase: Handlebars.TemplateDelegate;

  constructor() {
    this.compiledBase = Handlebars.compile(BASE_TEMPLATE);
    
    // Register helpers
    Handlebars.registerHelper('formatDate', (date: string) => {
      return new Date(date).toLocaleDateString('es-CO');
    });
  }

  async generateFromTemplate(template: string, data: Record<string, unknown>): Promise<Buffer> {
    const templateContent = TEMPLATES[template] || this.loadTemplateFile(template);
    const contentCompiled = Handlebars.compile(templateContent);
    const content = contentCompiled(data);

    const html = this.compiledBase({
      content,
      fechaGeneracion: new Date().toLocaleString('es-CO'),
    });

    return this.htmlToPdf(html);
  }

  async generateFromHtml(html: string): Promise<Buffer> {
    return this.htmlToPdf(html);
  }

  private loadTemplateFile(templateName: string): string {
    const templatePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`);
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf-8');
    }
    return '<p>Template no disponible: {{templateName}}</p>';
  }

  private async htmlToPdf(html: string): Promise<Buffer> {
    // Fallback simple: return HTML as buffer for now
    // In production, use puppeteer or html-pdf:
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.setContent(html);
    // const pdfBuffer = await page.pdf({ format: 'A4' });
    // await browser.close();
    // return pdfBuffer;
    
    return Buffer.from(html, 'utf-8');
  }
}

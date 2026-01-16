/**
 * @service FormInspectionPdfService
 *
 * Genera PDFs de formularios de inspección completados.
 * Convierte los datos del FormularioInstancia + FormTemplate → PDF renderizado.
 */
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PdfResponseDto } from '../dto/pdf-response.dto';
import { PdfBuildService } from './pdf-build.service';

interface MatrixItem {
  code: string;
  description: string;
  category?: string;
}

interface FormSection {
  title: string;
  type?: 'fields' | 'matrix';
  fields?: Array<{ name: string; type: string; label: string }>;
  options?: string[];
  optionLabels?: Record<string, string>;
  items?: MatrixItem[];
}

interface FormSchema {
  version: string;
  sections: FormSection[];
}

@Injectable()
export class FormInspectionPdfService {
  private readonly logger = new Logger(FormInspectionPdfService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfBuild: PdfBuildService
  ) {}

  /**
   * Genera PDF desde un FormularioInstancia completado
   */
  async generatePdfFromInstance(instanceId: string): Promise<PdfResponseDto> {
    this.logger.log(`Generando PDF para instancia: ${instanceId}`);

    // Fetch instance with template
    const instance = await this.prisma.formularioInstancia.findUnique({
      where: { id: instanceId },
      include: {
        template: true,
        completadoPor: { select: { name: true, email: true } },
        orden: { select: { numero: true, cliente: true } },
      },
    });

    if (!instance) {
      throw new NotFoundException(`Formulario no encontrado: ${instanceId}`);
    }

    const template = instance.template;
    const schema = template.schema as unknown as FormSchema;
    const data = instance.data as Record<string, any>;
    const inspector = instance.completadoPor;

    // Generate HTML
    const html = this.generateInspectionHtml({
      templateName: template.nombre,
      templateCategory: template.categoria || 'General',
      schema,
      data,
      inspector: inspector?.name || 'N/A',
      fechaCompletado: instance.completadoEn || instance.createdAt,
      ordenNumero: instance.orden?.numero,
    });

    return this.pdfBuild.buildPdf({
      html,
      shouldPersist: false,
      enableCache: false,
      filenameOnNoCache: `inspeccion-${template.nombre.replace(/\s+/g, '-')}-${instanceId.slice(0, 8)}.pdf`,
      generatorOptions: {
        format: 'A4',
        landscape: false,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      },
    });
  }

  /**
   * Genera HTML para el PDF de inspección
   */
  private generateInspectionHtml(params: {
    templateName: string;
    templateCategory: string;
    schema: FormSchema;
    data: Record<string, any>;
    inspector: string;
    fechaCompletado: Date;
    ordenNumero?: string;
  }): string {
    const {
      templateName,
      templateCategory,
      schema,
      data,
      inspector,
      fechaCompletado,
      ordenNumero,
    } = params;

    const sectionsHtml = schema.sections
      .map(section => this.renderSection(section, data))
      .join('\n');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${templateName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      padding: 15mm;
      color: #333;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #1a5276;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .header-left {
      flex: 1;
    }
    .header-right {
      text-align: right;
      font-size: 9pt;
      color: #666;
    }
    .logo {
      font-size: 18pt;
      font-weight: bold;
      color: #1a5276;
    }
    .title {
      font-size: 14pt;
      font-weight: bold;
      color: #1a5276;
      margin: 10px 0;
    }
    .category {
      font-size: 9pt;
      color: #666;
      text-transform: uppercase;
    }
    .meta-info {
      display: flex;
      justify-content: space-between;
      background: #f8f9fa;
      padding: 8px 12px;
      border-radius: 4px;
      margin-bottom: 15px;
      font-size: 9pt;
    }
    .meta-item {
      display: flex;
      gap: 5px;
    }
    .meta-label {
      font-weight: bold;
      color: #555;
    }
    .section {
      margin-bottom: 15px;
    }
    .section-title {
      background: #1a5276;
      color: white;
      padding: 6px 12px;
      font-weight: bold;
      font-size: 10pt;
      margin-bottom: 8px;
    }
    .fields-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    .field {
      display: flex;
      flex-direction: column;
      padding: 4px 0;
    }
    .field-label {
      font-size: 8pt;
      color: #666;
      text-transform: uppercase;
    }
    .field-value {
      font-size: 10pt;
      font-weight: 500;
      border-bottom: 1px solid #ddd;
      padding: 2px 0;
      min-height: 18px;
    }
    .matrix-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
    }
    .matrix-table th {
      background: #e9ecef;
      padding: 6px;
      text-align: center;
      border: 1px solid #dee2e6;
      font-weight: 600;
    }
    .matrix-table td {
      padding: 5px;
      border: 1px solid #dee2e6;
    }
    .matrix-table .code {
      width: 40px;
      text-align: center;
      font-weight: bold;
      background: #f8f9fa;
    }
    .matrix-table .description {
      text-align: left;
    }
    .matrix-table .option {
      width: 35px;
      text-align: center;
    }
    .matrix-table .selected {
      background: #d4edda;
      font-weight: bold;
    }
    .matrix-table .category-row {
      background: #f0f0f0;
      font-weight: bold;
      font-size: 9pt;
    }
    .result-box {
      margin-top: 10px;
      padding: 10px;
      border: 2px solid;
      border-radius: 5px;
      text-align: center;
    }
    .result-approved {
      border-color: #28a745;
      background: #d4edda;
      color: #155724;
    }
    .result-rejected {
      border-color: #dc3545;
      background: #f8d7da;
      color: #721c24;
    }
    .result-observations {
      border-color: #ffc107;
      background: #fff3cd;
      color: #856404;
    }
    .observations {
      background: #f8f9fa;
      padding: 8px;
      border-left: 3px solid #1a5276;
      margin-top: 8px;
      font-style: italic;
    }
    .signature-section {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      width: 45%;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 40px;
      padding-top: 5px;
      font-size: 9pt;
    }
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      font-size: 8pt;
      color: #888;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <div class="logo">CERMONT S.A.S.</div>
      <div class="category">${templateCategory}</div>
      <div class="title">${templateName}</div>
    </div>
    <div class="header-right">
      <div>Fecha: ${this.formatDate(fechaCompletado)}</div>
      ${ordenNumero ? `<div>Orden: ${ordenNumero}</div>` : ''}
      <div>Inspector: ${inspector}</div>
    </div>
  </div>

  <div class="meta-info">
    <div class="meta-item">
      <span class="meta-label">Fecha Inspección:</span>
      <span>${this.formatDate(fechaCompletado)}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Inspector:</span>
      <span>${inspector}</span>
    </div>
    ${
      ordenNumero
        ? `
    <div class="meta-item">
      <span class="meta-label">Orden de Trabajo:</span>
      <span>${ordenNumero}</span>
    </div>
    `
        : ''
    }
  </div>

  ${sectionsHtml}

  <div class="footer">
    Documento generado automáticamente por Sistema CERMONT FSM | ${new Date().toISOString().slice(0, 10)}
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Renderiza una sección del formulario
   */
  private renderSection(section: FormSection, data: Record<string, any>): string {
    if (section.type === 'matrix' && section.items) {
      return this.renderMatrixSection(section, data);
    }
    return this.renderFieldsSection(section, data);
  }

  /**
   * Renderiza sección de campos normales
   */
  private renderFieldsSection(section: FormSection, data: Record<string, any>): string {
    const fields = section.fields || [];

    // Separar campos especiales
    const regularFields = fields.filter(f => f.type !== 'signature' && f.type !== 'textarea');
    const textareas = fields.filter(f => f.type === 'textarea');
    const signatures = fields.filter(f => f.type === 'signature');

    // Buscar resultado
    const resultField = fields.find(f => f.name === 'resultado');
    const resultValue = data[resultField?.name || ''] || '';
    const resultClass = resultValue.includes('RECHAZADO')
      ? 'result-rejected'
      : resultValue.includes('OBSERVACIONES')
        ? 'result-observations'
        : 'result-approved';

    let html = `<div class="section">
      <div class="section-title">${section.title}</div>`;

    if (regularFields.length > 0) {
      html += `<div class="fields-grid">`;
      for (const field of regularFields) {
        const value = this.formatFieldValue(field, data[field.name]);
        html += `
          <div class="field">
            <span class="field-label">${field.label}</span>
            <span class="field-value">${value}</span>
          </div>`;
      }
      html += `</div>`;
    }

    // Resultado especial
    if (resultField && resultValue) {
      html += `<div class="result-box ${resultClass}">
        <strong>RESULTADO: ${resultValue}</strong>
      </div>`;
    }

    // Textareas
    for (const field of textareas) {
      const value = data[field.name] || '';
      if (value) {
        html += `<div class="observations">
          <strong>${field.label}:</strong> ${value}
        </div>`;
      }
    }

    // Signatures
    if (signatures.length > 0) {
      html += `<div class="signature-section">`;
      for (const field of signatures) {
        html += `<div class="signature-box">
          <div class="signature-line">${field.label}</div>
        </div>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
    return html;
  }

  /**
   * Renderiza sección de matriz de inspección (B/R/M/NA)
   */
  private renderMatrixSection(section: FormSection, data: Record<string, any>): string {
    const items = section.items || [];
    const options = section.options || ['B', 'R', 'M', 'NA'];
    const optionLabels = section.optionLabels || {};

    // Agrupar items por categoría
    const categories = new Map<string, MatrixItem[]>();
    for (const item of items) {
      const cat = item.category || 'General';
      if (!categories.has(cat)) categories.set(cat, []);
      categories.get(cat)!.push(item);
    }

    let html = `<div class="section">
      <div class="section-title">${section.title}</div>
      <table class="matrix-table">
        <thead>
          <tr>
            <th class="code">Cód</th>
            <th class="description">Descripción</th>
            ${options.map(opt => `<th class="option" title="${optionLabels[opt] || opt}">${opt}</th>`).join('')}
          </tr>
        </thead>
        <tbody>`;

    for (const [category, catItems] of categories) {
      if (categories.size > 1) {
        html += `<tr class="category-row"><td colspan="${2 + options.length}">${category}</td></tr>`;
      }

      for (const item of catItems) {
        const selectedValue = data[item.code] || '';
        html += `<tr>
          <td class="code">${item.code}</td>
          <td class="description">${item.description}</td>
          ${options
            .map(opt => {
              const isSelected = selectedValue === opt;
              return `<td class="option ${isSelected ? 'selected' : ''}">${isSelected ? '✓' : ''}</td>`;
            })
            .join('')}
        </tr>`;
      }
    }

    html += `</tbody></table></div>`;
    return html;
  }

  /**
   * Formatea valor de campo para display
   */
  private formatFieldValue(field: { type: string; label: string }, value: any): string {
    if (value === null || value === undefined || value === '') return '-';

    switch (field.type) {
      case 'date':
        return this.formatDate(new Date(value));
      case 'number':
        return value.toString();
      case 'select':
        return value;
      case 'photo':
        return '[Foto adjunta]';
      default:
        return String(value);
    }
  }

  /**
   * Formatea fecha a DD/MM/YYYY
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }
}

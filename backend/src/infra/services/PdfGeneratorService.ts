/**
 * Servicio para generaci�n de PDFs con templates
 * Resuelve: Informes manuales generan demoras y errores
 * 
 * @file backend/src/infra/services/PdfGeneratorService.ts
 * @requires puppeteer
 * @requires handlebars
 */

import path from 'path';
import { existsSync } from 'fs';
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import fs from 'fs/promises';
import type { Order } from '../../domain/entities/Order.js';
import type { WorkPlan } from '../../domain/entities/WorkPlan.js';
import type { Evidence } from '../../domain/entities/Evidence.js';

/**
 * Opciones para generaci�n de PDF
 */
interface PdfOptions {
  format?: 'A4' | 'Letter';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

/**
 * Datos para el template de Informe de Actividad
 */
export interface ActivityReportData {
  order: Order;
  workPlan: WorkPlan;
  evidences: Evidence[];
  technician: {
    name: string;
    role: string;
  };
  client: {
    name: string;
    representative: string;
  };
  executionDetails: {
    startDate: Date;
    endDate: Date;
    durationHours: number;
    location: string;
  };
  observations?: string;
  generatedAt: Date;
}

/**
 * Datos para el template de Acta de Entrega
 */
export interface ActaEntregaData {
  order: Order;
  deliveryDate: Date;
  client: {
    name: string;
    representative: string;
    idNumber: string;
  };
  technician: {
    name: string;
    role: string;
  };
  deliveredItems: Array<{
    description: string;
    quantity: number;
    condition: string;
  }>;
  observations?: string;
  signatures: {
    client: boolean;
    technician: boolean;
  };
}

/**
 * Datos para el template de SES (Seguridad, Salud y Medio Ambiente)
 */
export interface SESData {
  order: Order;
  workPlan: WorkPlan;
  date: Date;
  technician: {
    name: string;
    certifications: string[];
  };
  safetyChecklist: Array<{
    item: string;
    verified: boolean;
    observations?: string;
  }>;
  equipmentCertifications: Array<{
    name: string;
    certNumber: string;
    expiryDate: Date;
  }>;
  asts: Array<{
    activity: string;
    risks: string[];
    controls: string[];
  }>;
}

/**
 * Servicio de generaci�n de PDFs
 * @class PdfGeneratorService
 */
export class PdfGeneratorService {
  private readonly templatesPath: string;
  private readonly outputPath: string;

  constructor() {
    const templateCandidates = [
      path.join(process.cwd(), 'dist', 'infra', 'templates'),
      path.join(process.cwd(), 'src', 'infra', 'templates'),
    ];
    this.templatesPath = templateCandidates.find((candidate) => existsSync(candidate)) ?? templateCandidates[1];
    this.outputPath = path.join(process.cwd(), 'temp', 'pdfs');
  }

  /**
   * Inicializa el servicio (crea directorios necesarios)
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.outputPath, { recursive: true });
  }

  /**
   * Carga y compila un template de Handlebars
   * @private
   */
  private async loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
    const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    return Handlebars.compile(templateContent);
  }

  /**
   * Genera un PDF desde HTML
   * @private
   */
  private async generatePdfFromHtml(html: string, options: PdfOptions = {}): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = (await page.pdf({
        format: options.format || 'A4',
        margin: options.margin || {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm',
        },
        displayHeaderFooter: options.displayHeaderFooter || false,
        headerTemplate: options.headerTemplate,
        footerTemplate: options.footerTemplate,
        printBackground: true,
      })) as Buffer;

      return pdfBuffer;
    } finally {
      await browser.close();
    }
  }

  /**
   * Genera Informe de Actividad
   * @param {ActivityReportData} data - Datos del informe
   * @returns {Promise<Buffer>} PDF generado
   */
  async generateActivityReport(data: ActivityReportData): Promise<Buffer> {
    const template = await this.loadTemplate('activity-report');
    
    // Agregar helpers de Handlebars
    Handlebars.registerHelper('formatDate', (date: Date) => {
      return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(date));
    });

    Handlebars.registerHelper('formatCurrency', (amount: number) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
      }).format(amount);
    });

    const html = template(data);

    return this.generatePdfFromHtml(html, {
      format: 'A4',
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%;">
          <img src="data:image/png;base64,${await this.getLogoBase64()}" style="height: 40px;" />
          <span>CERMONT S.A.S. - Informe de Actividad</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%;">
          <span>P�gina <span class="pageNumber"></span> de <span class="totalPages"></span></span>
        </div>
      `,
    });
  }

  /**
   * Genera Acta de Entrega
   * @param {ActaEntregaData} data - Datos del acta
   * @returns {Promise<Buffer>} PDF generado
   */
  async generateActaEntrega(data: ActaEntregaData): Promise<Buffer> {
    const template = await this.loadTemplate('acta-entrega');
    const html = template(data);

    return this.generatePdfFromHtml(html, {
      format: 'Letter',
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '3cm',
        left: '2cm',
      },
    });
  }

  /**
   * Genera formato SES (Seguridad, Salud y Medio Ambiente)
   * @param {SESData} data - Datos del SES
   * @returns {Promise<Buffer>} PDF generado
   */
  async generateSES(data: SESData): Promise<Buffer> {
    const template = await this.loadTemplate('ses-format');
    const html = template(data);

    return this.generatePdfFromHtml(html, {
      format: 'A4',
      margin: {
        top: '1.5cm',
        right: '1.5cm',
        bottom: '1.5cm',
        left: '1.5cm',
      },
    });
  }

  /**
   * Genera reporte de comparaci�n de costos (Real vs Presupuestado)
   * @param {WorkPlan} workPlan - Plan de trabajo
   * @param {number} realCost - Costo real ejecutado
   * @returns {Promise<Buffer>} PDF generado
   */
  async generateCostComparisonReport(
    workPlan: WorkPlan,
    realCost: number
  ): Promise<Buffer> {
    const template = await this.loadTemplate('cost-comparison');
    
    const data = {
      workPlan,
      realCost,
      budgetedCost: workPlan.estimatedBudget,
      variance: realCost - workPlan.estimatedBudget,
      variancePercentage: ((realCost - workPlan.estimatedBudget) / workPlan.estimatedBudget) * 100,
      generatedAt: new Date(),
    };

    const html = template(data);
    return this.generatePdfFromHtml(html);
  }

  /**
   * Guarda un PDF en el sistema de archivos
   * @param {Buffer} pdfBuffer - Buffer del PDF
   * @param {string} filename - Nombre del archivo
   * @returns {Promise<string>} Ruta del archivo guardado
   */
  async savePdf(pdfBuffer: Buffer, filename: string): Promise<string> {
    const filePath = path.join(this.outputPath, filename);
    await fs.writeFile(filePath, pdfBuffer);
    return filePath;
  }

  /**
   * Obtiene el logo de CERMONT en Base64
   * @private
   */
  private async getLogoBase64(): Promise<string> {
    const logoPath = path.join(process.cwd(), 'assets', 'logo-cermont.png');
    
    try {
      const logoBuffer = await fs.readFile(logoPath);
      return logoBuffer.toString('base64');
    } catch {
      console.warn('[PdfGeneratorService] Logo no encontrado, usando placeholder');
      return '';
    }
  }
}

/**
 * Instancia singleton del servicio
 */
export const pdfGeneratorService = new PdfGeneratorService();

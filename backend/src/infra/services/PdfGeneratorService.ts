/**
 * Servicio para generación de PDFs con templates
 * Resuelve: Informes manuales generan demoras y errores
 * 
 * @file backend/src/infra/services/PdfGeneratorService.ts
 */

import path from 'path';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import puppeteer, { Browser } from 'puppeteer';
import Handlebars from 'handlebars';
import type { Order } from '../../domain/entities/Order.js';
import type { WorkPlan } from '../../domain/entities/WorkPlan.js';
import type { Evidence } from '../../domain/entities/Evidence.js';

// ==========================================
// Tipos y Configuraciones
// ==========================================

interface PdfOptions {
  format?: 'A4' | 'Letter';
  margin?: { top?: string; right?: string; bottom?: string; left?: string };
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

export interface ActivityReportData {
  order: Order;
  workPlan: WorkPlan;
  evidences: Evidence[];
  technician: { name: string; role: string };
  client: { name: string; representative: string };
  executionDetails: { startDate: Date; endDate: Date; durationHours: number; location: string };
  observations?: string;
  generatedAt: Date;
}

export interface ActaEntregaData {
  order: Order;
  deliveryDate: Date;
  client: { name: string; representative: string; idNumber: string };
  technician: { name: string; role: string };
  deliveredItems: Array<{ description: string; quantity: number; condition: string }>;
  observations?: string;
  signatures: { client: boolean; technician: boolean };
}

export interface SESData {
  order: Order;
  workPlan: WorkPlan;
  date: Date;
  technician: { name: string; certifications: string[] };
  safetyChecklist: Array<{ item: string; verified: boolean; observations?: string }>;
  equipmentCertifications: Array<{ name: string; certNumber: string; expiryDate: Date }>;
  asts: Array<{ activity: string; risks: string[]; controls: string[] }>;
}

export interface PdfServiceConfig {
  templatesPath: string;
  outputPath: string;
  assetsPath: string;
}

const DEFAULT_CONFIG: PdfServiceConfig = {
  templatesPath: path.join(process.cwd(), 'src', 'infra', 'templates'), // Default fallback
  outputPath: path.join(process.cwd(), 'temp', 'pdfs'),
  assetsPath: path.join(process.cwd(), 'assets'),
};

// ==========================================
// Servicio
// ==========================================

export class PdfGeneratorService {
  private readonly config: PdfServiceConfig;
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();
  private logoBase64Cache: string | null = null;

  constructor(config?: Partial<PdfServiceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.resolveTemplatesPath();
    this.registerHelpers();
  }

  /**
   * Resuelve la ruta real de templates (src vs dist)
   */
  private resolveTemplatesPath() {
    const candidates = [
      path.join(process.cwd(), 'dist', 'infra', 'templates'),
      path.join(process.cwd(), 'src', 'infra', 'templates'),
    ];
    const found = candidates.find((p) => existsSync(p));
    if (found) {
      this.config.templatesPath = found;
    }
  }

  /**
   * Inicializa el servicio
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.config.outputPath, { recursive: true });
    // Pre-cargar logo si es necesario
    this.logoBase64Cache = await this.loadLogoBase64();
  }

  // ----------------------------------------------------------------
  // Generación de Reportes Específicos
  // ----------------------------------------------------------------

  async generateActivityReport(data: ActivityReportData): Promise<Buffer> {
    const html = await this.renderTemplate('activity-report', data);
    const logo = this.logoBase64Cache || '';

    return this.generatePdfFromHtml(html, {
      format: 'A4',
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%;">
          <img src="data:image/png;base64,${logo}" style="height: 40px;" />
          <span>CERMONT S.A.S. - Informe de Actividad</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%;">
          <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
        </div>
      `,
    });
  }

  async generateActaEntrega(data: ActaEntregaData): Promise<Buffer> {
    const html = await this.renderTemplate('acta-entrega', data);
    return this.generatePdfFromHtml(html, {
      format: 'Letter',
      margin: { top: '2cm', right: '2cm', bottom: '3cm', left: '2cm' },
    });
  }

  async generateSES(data: SESData): Promise<Buffer> {
    const html = await this.renderTemplate('ses-format', data);
    return this.generatePdfFromHtml(html, {
      format: 'A4',
      margin: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
    });
  }

  async generateCostComparisonReport(workPlan: WorkPlan, realCost: number): Promise<Buffer> {
    const data = {
      workPlan,
      realCost,
      budgetedCost: workPlan.estimatedBudget,
      variance: realCost - workPlan.estimatedBudget,
      variancePercentage: workPlan.estimatedBudget > 0 
        ? ((realCost - workPlan.estimatedBudget) / workPlan.estimatedBudget) * 100 
        : 0,
      generatedAt: new Date(),
    };
    
    const html = await this.renderTemplate('cost-comparison', data);
    return this.generatePdfFromHtml(html);
  }

  async savePdf(pdfBuffer: Buffer, filename: string): Promise<string> {
    const filePath = path.join(this.config.outputPath, filename);
    await fs.writeFile(filePath, pdfBuffer);
    return filePath;
  }

  // ----------------------------------------------------------------
  // Métodos Privados Core
  // ----------------------------------------------------------------

  private registerHelpers() {
    Handlebars.registerHelper('formatDate', (date: Date) => {
      if (!date) return '';
      return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric', month: 'long', day: 'numeric',
      }).format(new Date(date));
    });

    Handlebars.registerHelper('formatCurrency', (amount: number) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP',
      }).format(amount || 0);
    });
    
    // Helper útil para lógica condicional en templates
    Handlebars.registerHelper('eq', (a, b) => a === b);
  }

  private async renderTemplate(templateName: string, data: any): Promise<string> {
    let template = this.templateCache.get(templateName);

    if (!template) {
      const templatePath = path.join(this.config.templatesPath, `${templateName}.hbs`);
      try {
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        template = Handlebars.compile(templateContent);
        this.templateCache.set(templateName, template);
      } catch (error) {
        throw new Error(`Template not found or invalid: ${templatePath}`);
      }
    }

    return template(data);
  }

  private async generatePdfFromHtml(html: string, options: PdfOptions = {}): Promise<Buffer> {
    let browser: Browser | null = null;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        margin: options.margin || { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
        displayHeaderFooter: options.displayHeaderFooter || false,
        headerTemplate: options.headerTemplate,
        footerTemplate: options.footerTemplate,
        printBackground: true,
      });

      return Buffer.from(pdfBuffer);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private async loadLogoBase64(): Promise<string> {
    const logoPath = path.join(this.config.assetsPath, 'logo-cermont.png');
    try {
      const logoBuffer = await fs.readFile(logoPath);
      return logoBuffer.toString('base64');
    } catch {
      console.warn('[PdfGeneratorService] Logo no encontrado en:', logoPath);
      return '';
    }
  }
}

export const pdfGeneratorService = new PdfGeneratorService();

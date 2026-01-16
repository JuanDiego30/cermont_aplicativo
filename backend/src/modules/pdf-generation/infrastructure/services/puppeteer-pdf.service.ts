import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import {
  IPdfGenerator,
  IPdfGeneratorOptions,
} from '../../domain/interfaces/pdf-generator.interface';

@Injectable()
export class PuppeteerPdfService implements IPdfGenerator {
  private readonly logger = new Logger(PuppeteerPdfService.name);
  private browser: puppeteer.Browser | null = null;
  private initializing: Promise<void> | null = null;

  async onModuleInit() {
    // Lazy loading: el navegador se inicia bajo demanda en getPage().
    this.logger.log('Puppeteer configurado en modo lazy (se inicia bajo demanda)');
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.logger.log('Navegador Puppeteer cerrado');
    }
  }

  async generateFromHtml(html: string, options?: IPdfGeneratorOptions): Promise<Buffer> {
    const page = await this.getPage();

    try {
      this.logger.log('Generando PDF desde HTML...');

      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      const pdfOptions: puppeteer.PDFOptions = {
        format: (options?.format as any) || 'A4',
        landscape: options?.landscape || false,
        printBackground: options?.printBackground !== false,
        displayHeaderFooter: options?.displayHeaderFooter || false,
        headerTemplate: options?.headerTemplate || '',
        footerTemplate: options?.footerTemplate || '',
        margin: options?.margin || {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        preferCSSPageSize: options?.preferCSSPageSize || false,
      };

      const buffer = await page.pdf(pdfOptions);

      this.logger.log('PDF generado exitosamente');
      return buffer;
    } catch (error) {
      this.logger.error('Error generando PDF', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  async generateFromUrl(url: string, options?: IPdfGeneratorOptions): Promise<Buffer> {
    const page = await this.getPage();

    try {
      this.logger.log(`Generando PDF desde URL: ${url}`);

      await page.goto(url, {
        waitUntil: 'networkidle0',
      });

      const pdfOptions: puppeteer.PDFOptions = {
        format: (options?.format as any) || 'A4',
        landscape: options?.landscape || false,
        printBackground: options?.printBackground !== false,
        displayHeaderFooter: options?.displayHeaderFooter || false,
        headerTemplate: options?.headerTemplate || '',
        footerTemplate: options?.footerTemplate || '',
        margin: options?.margin,
        preferCSSPageSize: options?.preferCSSPageSize || false,
      };

      const buffer = await page.pdf(pdfOptions);

      this.logger.log('PDF generado exitosamente desde URL');
      return buffer;
    } catch (error) {
      this.logger.error('Error generando PDF desde URL', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  private async getPage(): Promise<puppeteer.Page> {
    await this.ensureBrowser();
    return this.browser!.newPage();
  }

  private async ensureBrowser(): Promise<void> {
    if (this.browser) return;

    if (!this.initializing) {
      this.initializing = (async () => {
        try {
          this.logger.log('Inicializando navegador Puppeteer...');
          this.browser = await puppeteer.launch({
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--no-zygote',
              '--disable-gpu',
            ],
          });
          this.logger.log('Navegador Puppeteer iniciado correctamente');
        } catch (error) {
          this.logger.error('Error iniciando navegador Puppeteer', error);
          throw error;
        }
      })().finally(() => {
        this.initializing = null;
      });
    }

    await this.initializing;
  }
}

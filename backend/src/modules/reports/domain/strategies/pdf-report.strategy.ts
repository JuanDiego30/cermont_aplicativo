/**
 * @file pdf-report.strategy.ts
 * @description PDF Report Generator Strategy
 * @pattern Strategy (Concrete implementation)
 */

import { ReportGeneratorStrategy, ReportData } from './report-generator.strategy';

export class PdfReportStrategy implements ReportGeneratorStrategy {
  async generate(data: ReportData): Promise<Buffer> {
    // In a real implementation, use a library like pdfkit or puppeteer
    // This is a stub that generates a simple text representation
    const content = [
      `=== ${data.title} ===`,
      '',
      data.headers.join(' | '),
      '-'.repeat(50),
      ...data.rows.map(row => row.join(' | ')),
    ].join('\n');

    return Buffer.from(content, 'utf-8');
  }

  getMimeType(): string {
    return 'application/pdf';
  }

  getFileExtension(): string {
    return '.pdf';
  }
}

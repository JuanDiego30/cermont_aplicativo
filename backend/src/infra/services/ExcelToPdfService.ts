/**
 * Excel Template to PDF Converter Service
 * Allows users to upload .xlsx templates and convert them to PDF
 * 
 * @file backend/src/infra/services/ExcelToPdfService.ts
 */

import ExcelJS from 'exceljs';
import { PdfGeneratorService } from './PdfGeneratorService.js';

export interface ExcelToPdfOptions {
    sheetName?: string; // Default: first sheet
    includeHeader?: boolean;
    includeGridlines?: boolean;
    landscape?: boolean;
}

export class ExcelToPdfService {
    private pdfGenerator: PdfGeneratorService;

    constructor() {
        this.pdfGenerator = new PdfGeneratorService();
    }

    async initialize(): Promise<void> {
        await this.pdfGenerator.initialize();
    }

    /**
     * Converts an Excel file buffer to PDF
     */
    async convertExcelToPdf(
        excelBuffer: Buffer,
        options: ExcelToPdfOptions = {}
    ): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(excelBuffer as unknown as ExcelJS.Buffer);

        // Get the target worksheet
        const worksheet = options.sheetName
            ? workbook.getWorksheet(options.sheetName)
            : workbook.worksheets[0];

        if (!worksheet) {
            throw new Error('No worksheet found in the Excel file');
        }

        // Convert worksheet to HTML table
        const html = this.worksheetToHtml(worksheet, options);

        // Generate PDF from HTML
        return await this.pdfGenerator['generatePdfFromHtml'](html, {
            format: options.landscape ? 'A4' : 'A4',
            margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
        });
    }

    /**
     * Converts an Excel worksheet to HTML
     */
    private worksheetToHtml(
        worksheet: ExcelJS.Worksheet,
        options: ExcelToPdfOptions
    ): string {
        let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            margin: 0;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            ${options.includeGridlines ? 'border: 1px solid #ddd;' : ''}
          }
          th, td {
            padding: 8px;
            text-align: left;
            ${options.includeGridlines ? 'border: 1px solid #ddd;' : ''}
          }
          th {
            background-color: #f4f4f4;
            font-weight: bold;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .bold {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <table>
    `;

        worksheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
            const isHeader = options.includeHeader && rowNumber === 1;
            const tag = isHeader ? 'th' : 'td';

            html += '<tr>';
          row.eachCell({ includeEmpty: true }, (cell: ExcelJS.Cell, colNumber: number) => {
                const value = cell.value || '';
                const alignment = cell.alignment?.horizontal || 'left';
                const isBold = cell.font?.bold;

                let classNames = '';
                if (alignment === 'right') classNames += ' text-right';
                if (alignment === 'center') classNames += ' text-center';
                if (isBold) classNames += ' bold';

                html += `<${tag} class="${classNames.trim()}">${this.formatCellValue(value)}</${tag}>`;
            });
            html += '</tr>';
        });

        html += `
        </table>
      </body>
      </html>
    `;

        return html;
    }

    /**
     * Formats a cell value for HTML display
     */
    private formatCellValue(value: unknown): string {
        if (value === null || value === undefined) return '';

        if (typeof value === 'object') {
            // Handle Excel formulas and rich text
            if ('text' in value) return String(value.text);
            if ('result' in value) return String(value.result);
            return String(value);
        }

        return String(value);
    }
}

export const excelToPdfService = new ExcelToPdfService();

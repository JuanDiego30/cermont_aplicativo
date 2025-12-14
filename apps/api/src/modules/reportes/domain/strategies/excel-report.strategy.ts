/**
 * @file excel-report.strategy.ts
 * @description Excel Report Generator Strategy
 * @pattern Strategy (Concrete implementation)
 */

import { ReportGeneratorStrategy, ReportData } from './report-generator.strategy';

export class ExcelReportStrategy implements ReportGeneratorStrategy {
    async generate(data: ReportData): Promise<Buffer> {
        // In a real implementation, use a library like exceljs or xlsx
        // This is a stub that generates CSV format as a placeholder
        const headerRow = data.headers.join(',');
        const dataRows = data.rows.map(row => row.join(','));
        const csvContent = [headerRow, ...dataRows].join('\n');

        return Buffer.from(csvContent, 'utf-8');
    }

    getMimeType(): string {
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    getFileExtension(): string {
        return '.xlsx';
    }
}

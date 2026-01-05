/**
 * @file report-generator.strategy.ts
 * @description Strategy Pattern for Report Generation
 * @pattern Strategy
 *
 * This defines the interface for report generation strategies.
 * Different formats (PDF, Excel, CSV) implement this interface.
 */

export interface ReportData {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  metadata?: Record<string, unknown>;
}

export interface ReportGeneratorStrategy {
  /**
   * Generate the report in the specific format
   */
  generate(data: ReportData): Promise<Buffer>;

  /**
   * Get the MIME type for the generated file
   */
  getMimeType(): string;

  /**
   * Get the file extension
   */
  getFileExtension(): string;
}

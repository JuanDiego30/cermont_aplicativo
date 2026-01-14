/**
 * @file report-generator.context.ts
 * @description Context class for Strategy Pattern - selects and uses the appropriate strategy
 * @pattern Strategy (Context)
 */

import { Injectable } from "@nestjs/common";
import {
  ReportGeneratorStrategy,
  ReportData,
  PdfReportStrategy,
  ExcelReportStrategy,
  JsonReportStrategy,
} from "../domain/strategies";

export type ReportFormat = "pdf" | "excel" | "json";

@Injectable()
export class ReportGeneratorContext {
  private strategies: Map<ReportFormat, ReportGeneratorStrategy>;

  constructor() {
    // Register available strategies
    this.strategies = new Map([
      ["pdf", new PdfReportStrategy()],
      ["excel", new ExcelReportStrategy()],
      ["json", new JsonReportStrategy()],
    ]);
  }

  /**
   * Register a new strategy at runtime (Open/Closed Principle)
   */
  registerStrategy(
    format: ReportFormat,
    strategy: ReportGeneratorStrategy,
  ): void {
    this.strategies.set(format, strategy);
  }

  /**
   * Generate a report using the specified format
   */
  async generate(
    format: ReportFormat,
    data: ReportData,
  ): Promise<{
    buffer: Buffer;
    mimeType: string;
    extension: string;
  }> {
    const strategy = this.strategies.get(format);
    if (!strategy) {
      throw new Error(`Unsupported report format: ${format}`);
    }

    const buffer = await strategy.generate(data);
    return {
      buffer,
      mimeType: strategy.getMimeType(),
      extension: strategy.getFileExtension(),
    };
  }

  /**
   * Get available formats
   */
  getAvailableFormats(): ReportFormat[] {
    return Array.from(this.strategies.keys());
  }
}

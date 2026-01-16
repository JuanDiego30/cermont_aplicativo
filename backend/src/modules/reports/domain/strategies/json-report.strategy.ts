/**
 * @file json-report.strategy.ts
 * @description JSON Report Generator Strategy
 * @pattern Strategy (Concrete implementation)
 */

import {
  ReportGeneratorStrategy,
  ReportData,
} from "./report-generator.strategy";

export class JsonReportStrategy implements ReportGeneratorStrategy {
  async generate(data: ReportData): Promise<Buffer> {
    const jsonOutput = {
      title: data.title,
      generatedAt: new Date().toISOString(),
      headers: data.headers,
      data: data.rows.map((row) => {
        const obj: Record<string, string | number> = {};
        data.headers.forEach((header, i) => {
          obj[header] = row[i];
        });
        return obj;
      }),
      metadata: data.metadata,
    };

    return Buffer.from(JSON.stringify(jsonOutput, null, 2), "utf-8");
  }

  getMimeType(): string {
    return "application/json";
  }

  getFileExtension(): string {
    return ".json";
  }
}

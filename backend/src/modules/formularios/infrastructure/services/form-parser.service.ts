/**
 * @service FormParserService
 *
 * Servicio para parsear PDFs y Excels y generar templates de formularios automáticamente.
 * Usa pdf-parse para PDFs y xlsx para Excel.
 */
import { Injectable, Logger, BadRequestException } from "@nestjs/common";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");
import * as XLSX from "xlsx";

export interface ParsedField {
  id: string;
  label: string;
  type:
    | "text"
    | "number"
    | "date"
    | "select"
    | "radio"
    | "checkbox"
    | "textarea"
    | "photo";
  required: boolean;
  options?: string[];
  validation?: Record<string, unknown>;
}

export interface ParsedSection {
  id: string;
  title: string;
  fields: ParsedField[];
}

export interface ParsedFormSchema {
  nombre: string;
  tipo: string;
  sections: ParsedSection[];
}

@Injectable()
export class FormParserService {
  private readonly logger = new Logger(FormParserService.name);

  /**
   * Extrae estructura de formulario desde un PDF
   */
  async parseFromPDF(
    buffer: Buffer,
    filename: string,
  ): Promise<ParsedFormSchema> {
    this.logger.log("Parseando PDF para extraer estructura de formulario", {
      filename,
    });

    try {
      const data = await pdfParse(buffer);
      const text = data.text;

      // Extraer nombre del formulario (primeras líneas)
      const lines = text.split("\n").filter((l: string) => l.trim().length > 0);
      const nombre = this.extractFormName(lines, filename);

      // Identificar secciones (líneas en mayúsculas o con números)
      const sections = this.identifySectionsFromText(lines);

      // Identificar campos (líneas con ":" o patrones de formulario)
      const fields = this.extractFieldsFromText(lines);

      this.logger.log("PDF parseado exitosamente", {
        nombre,
        sectionsCount: sections.length,
        fieldsCount: fields.length,
      });

      return {
        nombre,
        tipo: this.inferFormType(text),
        sections: this.organizeSections(sections, fields),
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error("Error parseando PDF", {
        filename,
        error: err.message,
      });
      throw new BadRequestException(`Error al parsear PDF: ${err.message}`);
    }
  }

  /**
   * Extrae estructura de formulario desde un Excel
   */
  async parseFromExcel(
    buffer: Buffer,
    filename: string,
  ): Promise<ParsedFormSchema> {
    this.logger.log("Parseando Excel para extraer estructura de formulario", {
      filename,
    });

    try {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convertir a JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
      }) as unknown[][];

      if (jsonData.length === 0) {
        throw new BadRequestException("El archivo Excel está vacío");
      }

      // Primera fila son headers (campos)
      const headers = (jsonData[0] as string[]).filter(
        (h) => h && String(h).trim().length > 0,
      );

      // Analizar datos para inferir tipos
      const dataRows = jsonData.slice(1);
      const fields = this.inferFieldsFromExcel(headers, dataRows);

      this.logger.log("Excel parseado exitosamente", {
        sheetName,
        headersCount: headers.length,
        rowsCount: dataRows.length,
      });

      return {
        nombre: this.cleanFilename(filename),
        tipo: "CHECKLIST",
        sections: [
          {
            id: "datos-principales",
            title: "Datos Principales",
            fields,
          },
        ],
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error("Error parseando Excel", {
        filename,
        error: err.message,
      });
      throw new BadRequestException(`Error al parsear Excel: ${err.message}`);
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  private extractFormName(lines: string[], filename: string): string {
    // Buscar primera línea significativa (título del formulario)
    for (const line of lines.slice(0, 10)) {
      const trimmed = line.trim();
      // Si tiene más de 5 caracteres y no es solo números/símbolos
      if (trimmed.length > 5 && /[a-zA-Z]/.test(trimmed)) {
        // Limpiar y capitalizar
        return this.capitalize(trimmed.substring(0, 100));
      }
    }
    return this.cleanFilename(filename);
  }

  private identifySectionsFromText(
    lines: string[],
  ): { index: number; title: string }[] {
    const sections: { index: number; title: string }[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Patrones de sección: Números romanos, letras, o mayúsculas
      const sectionPatterns = [
        /^(\d+\.|\d+\)|\(\d+\)|[IVX]+\.)/, // 1. o 1) o (1) o I.
        /^[A-Z][A-Z\s]{3,}$/, // TÍTULO EN MAYÚSCULAS
        /^(DATOS|INFORMACIÓN|INSPECCIÓN|COMPONENTES|OBSERVACIONES|CONCEPTO)/i,
      ];

      for (const pattern of sectionPatterns) {
        if (
          pattern.test(trimmed) &&
          trimmed.length > 3 &&
          trimmed.length < 100
        ) {
          sections.push({ index, title: trimmed });
          break;
        }
      }
    });

    return sections;
  }

  private extractFieldsFromText(lines: string[]): ParsedField[] {
    const fields: ParsedField[] = [];
    const seenIds = new Set<string>();

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Patrón: "Label:" o "Label ________" o "[ ] Label"
      const fieldPatterns = [
        /^(.+?):\s*$/, // Label:
        /^(.+?)_{2,}/, // Label ____
        /^\[.\]\s*(.+)/, // [ ] Label (checkbox)
        /^○\s*(.+)/, // ○ Label (radio)
      ];

      for (const pattern of fieldPatterns) {
        const match = trimmed.match(pattern);
        if (match && match[1]) {
          const label = match[1].trim();
          if (label.length > 2 && label.length < 80) {
            const id = this.slugify(label);
            if (!seenIds.has(id)) {
              seenIds.add(id);
              fields.push({
                id,
                label,
                type: this.inferTypeFromLabel(label),
                required: true,
              });
            }
          }
          break;
        }
      }
    });

    return fields;
  }

  private inferFieldsFromExcel(
    headers: string[],
    dataRows: unknown[][],
  ): ParsedField[] {
    return headers.map((header, colIndex) => {
      const id = this.slugify(String(header));
      const label = String(header);

      // Obtener valores de la columna para inferir tipo
      const columnValues = dataRows
        .map((row) => row[colIndex])
        .filter(
          (v) => v !== undefined && v !== null && String(v).trim().length > 0,
        );

      return {
        id,
        label,
        type: this.inferTypeFromValues(columnValues),
        required: columnValues.length > dataRows.length * 0.5, // Requerido si >50% tiene valor
      };
    });
  }

  private inferTypeFromLabel(label: string): ParsedField["type"] {
    const lower = label.toLowerCase();

    if (/fecha|date/i.test(lower)) return "date";
    if (/número|numero|cantidad|total|monto/i.test(lower)) return "number";
    if (/foto|imagen|evidencia/i.test(lower)) return "photo";
    if (/observaci|comentari|descripci|notas/i.test(lower)) return "textarea";
    if (/estado|condición|tipo|clasificación/i.test(lower)) return "select";

    return "text";
  }

  private inferTypeFromValues(values: unknown[]): ParsedField["type"] {
    if (values.length === 0) return "text";

    // Si todos son números
    if (values.every((v) => !isNaN(Number(v)))) return "number";

    // Si son fechas (Date objects o strings de fecha)
    if (values.some((v) => v instanceof Date)) return "date";

    // Si son valores binarios (SI/NO, C/NC)
    const stringValues = values.map((v) => String(v).toUpperCase().trim());
    const binaryValues = ["SI", "NO", "C", "NC", "OK", "X", "✓", "✗"];
    if (stringValues.every((v) => binaryValues.includes(v))) return "radio";

    // Si hay textos largos
    if (values.some((v) => String(v).length > 100)) return "textarea";

    return "text";
  }

  private inferFormType(text: string): string {
    const lower = text.toLowerCase();

    if (/inspección|inspeccion|verificación/i.test(lower)) return "INSPECCION";
    if (/mantenimiento|preventivo|correctivo/i.test(lower))
      return "MANTENIMIENTO";
    if (/checklist|check list|lista de verificación/i.test(lower))
      return "CHECKLIST";
    if (/certificación|certificado/i.test(lower)) return "CERTIFICACION";
    if (/hes|salud|seguridad/i.test(lower)) return "HES";
    if (/reporte|informe/i.test(lower)) return "REPORTE";

    return "OTRO";
  }

  private organizeSections(
    sections: { index: number; title: string }[],
    fields: ParsedField[],
  ): ParsedSection[] {
    if (sections.length === 0) {
      // Sin secciones detectadas, crear una genérica
      return [
        {
          id: "datos-formulario",
          title: "Datos del Formulario",
          fields,
        },
      ];
    }

    // Distribuir campos entre secciones (simplificado)
    const fieldsPerSection = Math.ceil(fields.length / sections.length);

    return sections.map((section, index) => ({
      id: this.slugify(section.title),
      title: this.capitalize(section.title),
      fields: fields.slice(
        index * fieldsPerSection,
        (index + 1) * fieldsPerSection,
      ),
    }));
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .substring(0, 50);
  }

  private capitalize(text: string): string {
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private cleanFilename(filename: string): string {
    return filename
      .replace(/\.[^/.]+$/, "") // Quitar extensión
      .replace(/[-_]/g, " ")
      .trim();
  }
}

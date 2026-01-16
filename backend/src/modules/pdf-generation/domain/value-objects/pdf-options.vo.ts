import { IPdfGeneratorOptions } from '../interfaces/pdf-generator.interface';

export class PdfOptionsVO {
  constructor(private readonly options: IPdfGeneratorOptions) {
    this.validar();
  }

  private validar(): void {
    if (this.options.margin) {
      const validUnits = ['mm', 'cm', 'in', 'px'];
      const marginValues = Object.values(this.options.margin);

      marginValues.forEach(value => {
        if (value && !validUnits.some(unit => value.endsWith(unit))) {
          throw new Error(`Unidad de margen inválida: ${value}`);
        }
      });
    }
  }

  getOptions(): IPdfGeneratorOptions {
    return this.options;
  }

  conEncabezado(headerTemplate: string): PdfOptionsVO {
    return new PdfOptionsVO({
      ...this.options,
      displayHeaderFooter: true,
      headerTemplate,
    });
  }

  conPieDePagina(footerTemplate: string): PdfOptionsVO {
    return new PdfOptionsVO({
      ...this.options,
      displayHeaderFooter: true,
      footerTemplate,
    });
  }

  static default(): PdfOptionsVO {
    return new PdfOptionsVO({
      format: 'A4',
      landscape: false,
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: false,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });
  }
}

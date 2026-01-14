export interface IPdfGeneratorOptions {
  format?: string;
  landscape?: boolean;
  printBackground?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  preferCSSPageSize?: boolean;
}

export interface IPdfGenerator {
  generateFromHtml(
    html: string,
    options?: IPdfGeneratorOptions,
  ): Promise<Buffer>;
  generateFromUrl(url: string, options?: IPdfGeneratorOptions): Promise<Buffer>;
}

export const PDF_GENERATOR = "PDF_GENERATOR";

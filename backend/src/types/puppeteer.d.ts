// Type declaration for puppeteer module
// This bypasses the missing type declarations during build

declare module "puppeteer" {
  export interface Browser {
    close(): Promise<void>;
    newPage(): Promise<Page>;
  }

  export interface Page {
    setContent(html: string, options?: any): Promise<void>;
    goto(url: string, options?: any): Promise<void>;
    pdf(options?: PDFOptions): Promise<Buffer>;
    close(): Promise<void>;
  }

  export interface PDFOptions {
    format?: "A4" | "Letter" | "Legal" | "A3";
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

  export function launch(options?: any): Promise<Browser>;
}

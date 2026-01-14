import { PdfPageSize } from "../../application/dto/generate-pdf.dto";

export class PdfFormatVO {
  constructor(private readonly valor: PdfPageSize) {
    this.validar();
  }

  private validar(): void {
    const formatosValidos = Object.values(PdfPageSize);
    if (!formatosValidos.includes(this.valor)) {
      throw new Error(`Formato PDF inválido: ${this.valor}`);
    }
  }

  esA4(): boolean {
    return this.valor === PdfPageSize.A4;
  }

  esLetter(): boolean {
    return this.valor === PdfPageSize.LETTER;
  }

  getValue(): PdfPageSize {
    return this.valor;
  }

  toString(): string {
    return this.valor;
  }

  static fromString(valor: string): PdfFormatVO {
    return new PdfFormatVO(valor as PdfPageSize);
  }
}

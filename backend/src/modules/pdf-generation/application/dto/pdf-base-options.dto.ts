import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { PdfOrientation, PdfPageSize } from "./pdf-options.enums";

export class PdfBaseOptionsDto {
  @ApiPropertyOptional({
    description: "Guardar el PDF en storage para descarga posterior",
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  saveToStorage?: boolean = false;

  @ApiPropertyOptional({
    description: "Habilitar caché del PDF (TTL + key única)",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enableCache?: boolean = true;

  @ApiPropertyOptional({
    description: "Tamaño de página",
    enum: PdfPageSize,
    example: PdfPageSize.A4,
  })
  @IsOptional()
  @IsEnum(PdfPageSize)
  pageSize?: PdfPageSize = PdfPageSize.A4;
}

export class PdfBaseReportOptionsDto extends PdfBaseOptionsDto {
  @ApiPropertyOptional({
    description: "Orientación",
    enum: PdfOrientation,
    example: PdfOrientation.PORTRAIT,
  })
  @IsOptional()
  @IsEnum(PdfOrientation)
  orientation?: PdfOrientation = PdfOrientation.PORTRAIT;
}

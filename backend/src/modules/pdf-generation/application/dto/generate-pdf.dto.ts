import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
} from "class-validator";
import { PdfBaseReportOptionsDto } from "./pdf-base-options.dto";
import { PdfOrientation, PdfPageSize } from "./pdf-options.enums";

export { PdfOrientation, PdfPageSize } from "./pdf-options.enums";

export class GeneratePdfDto extends PdfBaseReportOptionsDto {
  @ApiProperty({
    description: "Contenido HTML del PDF",
    example: "<html><body><h1>Reporte</h1></body></html>",
  })
  @IsString()
  @IsNotEmpty()
  html!: string;

  @ApiPropertyOptional({
    description: "Nombre del archivo (sin extensión)",
    example: "reporte-orden-001",
  })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional({
    description: "Mostrar encabezado",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  displayHeaderFooter?: boolean = false;

  @ApiPropertyOptional({
    description: "Template HTML para encabezado",
    example:
      '<div style="font-size:10px">Cermont - Página <span class="pageNumber"></span></div>',
  })
  @IsOptional()
  @IsString()
  headerTemplate?: string;

  @ApiPropertyOptional({
    description: "Template HTML para pie de página",
    example:
      '<div style="font-size:10px;text-align:center">© 2024 Cermont</div>',
  })
  @IsOptional()
  @IsString()
  footerTemplate?: string;

  @ApiPropertyOptional({
    description: "Márgenes del documento",
    example: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
  })
  @IsOptional()
  @IsObject()
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

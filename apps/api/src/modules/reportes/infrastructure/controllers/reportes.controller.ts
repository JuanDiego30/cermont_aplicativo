/**
 * @controller ReportesController
 */
import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../auth/guards/roles.guard";
import { Roles } from "../../../auth/decorators/roles.decorator";
import {
  GenerateReporteOrdenesUseCase,
  GetReporteOrdenDetalleUseCase,
} from "../../application/use-cases";
import { ReporteQuerySchema } from "../../application/dto";

@ApiTags("Reportes")
@ApiBearerAuth()
@Controller("reportes")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportesController {
  constructor(
    private readonly generateReporte: GenerateReporteOrdenesUseCase,
    private readonly getReporteDetalle: GetReporteOrdenDetalleUseCase,
  ) {}

  @Get("ordenes")
  @Roles("admin", "supervisor")
  @ApiOperation({ summary: "Generar reporte de órdenes" })
  @ApiResponse({ status: 200, description: "Reporte generado" })
  @ApiResponse({ status: 400, description: "Parámetros inválidos" })
  @ApiResponse({ status: 401, description: "No autenticado" })
  @ApiResponse({ status: 403, description: "Sin permisos" })
  async reporteOrdenes(@Query() query: unknown) {
    const result = ReporteQuerySchema.safeParse(query);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.generateReporte.execute(result.data);
  }

  @Get("orden/:id")
  @Roles("admin", "supervisor")
  @ApiOperation({ summary: "Obtener reporte/detalle de una orden" })
  @ApiParam({ name: "id", description: "ID (UUID) de la orden" })
  @ApiResponse({ status: 200, description: "Detalle del reporte de la orden" })
  @ApiResponse({ status: 401, description: "No autenticado" })
  @ApiResponse({ status: 403, description: "Sin permisos" })
  async reporteOrden(@Param("id") id: string) {
    return this.getReporteDetalle.execute(id);
  }
}

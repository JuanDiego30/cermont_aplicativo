/**
 * @controller ReportsController
 */
import {
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Query,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../auth/guards/roles.guard";
import { ReporteQueryDto } from "../../application/dto";
import {
    GenerateReporteOrdenesUseCase,
    GetReporteOrdenDetalleUseCase,
} from "../../application/use-cases";

@ApiTags("Reports")
@ApiBearerAuth()
@Controller("reports")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(
    private readonly generateReporte: GenerateReporteOrdenesUseCase,
    private readonly getReporteDetalle: GetReporteOrdenDetalleUseCase,
  ) {}

  @Get("orders")
  @Roles("admin", "supervisor")
  @ApiOperation({ summary: "Generate orders report" })
  @ApiResponse({ status: 200, description: "Report generated" })
  @ApiResponse({ status: 400, description: "Invalid parameters" })
  @ApiResponse({ status: 401, description: "Unauthenticated" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async reporteOrdenes(@Query() query: ReporteQueryDto) {
    return this.generateReporte.execute(query);
  }

  @Get("order/:id")
  @Roles("admin", "supervisor")
  @ApiOperation({ summary: "Get order report detail" })
  @ApiParam({ name: "id", description: "Order ID (UUID)" })
  @ApiResponse({ status: 200, description: "Order report detail" })
  @ApiResponse({ status: 401, description: "Unauthenticated" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async reporteOrden(@Param("id", ParseUUIDPipe) id: string) {
    return this.getReporteDetalle.execute(id);
  }
}

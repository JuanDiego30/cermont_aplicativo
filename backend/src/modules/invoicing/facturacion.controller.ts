import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../shared/guards/jwt-auth.guard";
import {
    AprobarSESDto,
    FacturaResponseDto,
    GenerarFacturaDto,
    RegistrarPagoDto,
    RegistrarSESDto,
    ResumenFacturacionDto,
    SESResponseDto,
} from "./application/dto/facturacion.dto";
import { FacturacionService } from "./facturacion.service";

@ApiTags("Invoicing")
@Controller("invoicing")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvoicingController {
  constructor(private readonly facturacionService: FacturacionService) {}

  @Get("summary")
  @ApiOperation({ summary: "Get invoicing summary" })
  @ApiResponse({ status: 200, type: ResumenFacturacionDto })
  async getResumen(): Promise<ResumenFacturacionDto> {
    return this.facturacionService.getResumenFacturacion();
  }

  @Post("ses")
  @ApiOperation({ summary: "Register Ariba SES" })
  @ApiResponse({ status: 201, type: SESResponseDto })
  @ApiResponse({ status: 404, description: "Orden no encontrada" })
  async registrarSES(@Body() dto: RegistrarSESDto): Promise<SESResponseDto> {
    return this.facturacionService.registrarSES(dto);
  }

  @Patch("ses/approve")
  @ApiOperation({ summary: "Approve SES" })
  @ApiResponse({ status: 200, type: SESResponseDto })
  @ApiResponse({ status: 404, description: "SES no encontrado" })
  @ApiResponse({ status: 400, description: "SES ya aprobado" })
  async aprobarSES(@Body() dto: AprobarSESDto): Promise<SESResponseDto> {
    return this.facturacionService.aprobarSES(dto);
  }

  @Get("ses/order/:orderId")
  @ApiOperation({ summary: "Get SES by order" })
  @ApiParam({ name: "orderId", type: "string" })
  @ApiResponse({ status: 200, type: [SESResponseDto] })
  @ApiResponse({ status: 404, description: "Orden no encontrada" })
  async getSESPorOrden(
    @Param("orderId") orderId: string,
  ): Promise<SESResponseDto[]> {
    return this.facturacionService.getSESPorOrden(orderId);
  }

  @Post("invoice")
  @ApiOperation({ summary: "Generate invoice" })
  @ApiResponse({ status: 201, type: FacturaResponseDto })
  @ApiResponse({ status: 404, description: "SES no encontrado" })
  async generarFactura(
    @Body() dto: GenerarFacturaDto,
  ): Promise<FacturaResponseDto> {
    return this.facturacionService.generarFactura(dto);
  }

  @Patch("factura/pago")
  @ApiOperation({ summary: "Registrar pago de factura" })
  @ApiResponse({ status: 200, type: FacturaResponseDto })
  @ApiResponse({ status: 404, description: "Factura no encontrada" })
  @ApiResponse({ status: 400, description: "Factura ya pagada" })
  async registrarPago(
    @Body() dto: RegistrarPagoDto,
  ): Promise<FacturaResponseDto> {
    return this.facturacionService.registrarPago(dto);
  }
}

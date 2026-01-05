import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { FacturacionService } from "./facturacion.service";
import {
  RegistrarSESDto,
  AprobarSESDto,
  GenerarFacturaDto,
  RegistrarPagoDto,
  SESResponseDto,
  FacturaResponseDto,
  ResumenFacturacionDto,
} from "./application/dto/facturacion.dto";

@ApiTags("Facturación")
@Controller("facturacion")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  @Get("resumen")
  @ApiOperation({ summary: "Obtener resumen de facturación" })
  @ApiResponse({ status: 200, type: ResumenFacturacionDto })
  async getResumen(): Promise<ResumenFacturacionDto> {
    return this.facturacionService.getResumenFacturacion();
  }

  @Post("ses")
  @ApiOperation({ summary: "Registrar SES de Ariba" })
  @ApiResponse({ status: 201, type: SESResponseDto })
  async registrarSES(@Body() dto: RegistrarSESDto): Promise<SESResponseDto> {
    return this.facturacionService.registrarSES(dto);
  }

  @Patch("ses/aprobar")
  @ApiOperation({ summary: "Aprobar SES" })
  @ApiResponse({ status: 200, type: SESResponseDto })
  async aprobarSES(@Body() dto: AprobarSESDto): Promise<SESResponseDto> {
    return this.facturacionService.aprobarSES(dto);
  }

  @Get("ses/orden/:ordenId")
  @ApiOperation({ summary: "Obtener SES de una orden" })
  @ApiResponse({ status: 200, type: [SESResponseDto] })
  async getSESPorOrden(
    @Param("ordenId") ordenId: string,
  ): Promise<SESResponseDto[]> {
    return this.facturacionService.getSESPorOrden(ordenId);
  }

  @Post("factura")
  @ApiOperation({ summary: "Generar factura" })
  @ApiResponse({ status: 201, type: FacturaResponseDto })
  async generarFactura(
    @Body() dto: GenerarFacturaDto,
  ): Promise<FacturaResponseDto> {
    return this.facturacionService.generarFactura(dto);
  }

  @Patch("factura/pago")
  @ApiOperation({ summary: "Registrar pago de factura" })
  @ApiResponse({ status: 200, type: FacturaResponseDto })
  async registrarPago(
    @Body() dto: RegistrarPagoDto,
  ): Promise<FacturaResponseDto> {
    return this.facturacionService.registrarPago(dto);
  }
}

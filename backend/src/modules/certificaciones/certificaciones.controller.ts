import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../shared/guards/jwt-auth.guard";
import { CertificacionesService } from "./certificaciones.service";
import {
  CreateCertificacionTecnicoDto,
  CertificacionResponseDto,
  ValidarCertificacionesDto,
  ValidacionResultDto,
  CertificacionesQueryDto,
} from "./application/dto/certificaciones.dto";

@ApiTags("Certificaciones")
@Controller("certificaciones")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CertificacionesController {
  constructor(
    private readonly certificacionesService: CertificacionesService,
  ) {}

  @Post("tecnico")
  @ApiOperation({ summary: "Registrar certificación de técnico" })
  @ApiResponse({ status: 201, type: CertificacionResponseDto })
  @ApiResponse({ status: 404, description: "Técnico no encontrado" })
  async registrarCertificacionTecnico(
    @Body() dto: CreateCertificacionTecnicoDto,
  ): Promise<CertificacionResponseDto> {
    return this.certificacionesService.registrarCertificacionTecnico(dto);
  }

  @Get("tecnico/:tecnicoId")
  @ApiOperation({ summary: "Obtener certificaciones de un técnico" })
  @ApiParam({ name: "tecnicoId", type: "string" })
  @ApiResponse({ status: 200, type: [CertificacionResponseDto] })
  async getCertificacionesTecnico(
    @Param("tecnicoId") tecnicoId: string,
  ): Promise<CertificacionResponseDto[]> {
    return this.certificacionesService.getCertificacionesTecnico(tecnicoId);
  }

  @Post("validar")
  @ApiOperation({ summary: "Validar certificaciones para asignación" })
  @ApiResponse({ status: 200, type: ValidacionResultDto })
  async validarCertificaciones(
    @Body() dto: ValidarCertificacionesDto,
  ): Promise<ValidacionResultDto> {
    return this.certificacionesService.validarCertificaciones(dto);
  }

  @Get("por-vencer")
  @ApiOperation({ summary: "Obtener certificaciones próximas a vencer" })
  @ApiQuery({
    name: "dias",
    required: false,
    type: Number,
    description: "Días para vencimiento (default: 30)",
  })
  @ApiResponse({ status: 200, type: [CertificacionResponseDto] })
  async getCertificacionesPorVencer(
    @Query() query: CertificacionesQueryDto,
  ): Promise<CertificacionResponseDto[]> {
    return this.certificacionesService.getCertificacionesPorVencer(
      query.dias ?? 30,
    );
  }
}

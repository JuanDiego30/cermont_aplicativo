import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import {
  CertificacionesQueryDto,
  CertificacionResponseDto,
  CreateCertificacionTecnicoDto,
  ValidacionResultDto,
  ValidarCertificacionesDto,
} from './application/dto/certificaciones.dto';
import { CertificationsService } from './certifications.service';

@ApiTags('Certificaciones')
@Controller('certifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @Post('tecnico')
  @ApiOperation({ summary: 'Registrar certificación de técnico' })
  @ApiResponse({ status: 201, type: CertificacionResponseDto })
  @ApiResponse({ status: 404, description: 'Técnico no encontrado' })
  async registrarCertificacionTecnico(
    @Body() dto: CreateCertificacionTecnicoDto
  ): Promise<CertificacionResponseDto> {
    return this.certificationsService.registrarCertificacionTecnico(dto);
  }

  @Get('tecnico/:tecnicoId')
  @ApiOperation({ summary: 'Obtener certificaciones de un técnico' })
  @ApiParam({ name: 'tecnicoId', type: 'string' })
  @ApiResponse({ status: 200, type: [CertificacionResponseDto] })
  async getCertificacionesTecnico(
    @Param('tecnicoId') tecnicoId: string
  ): Promise<CertificacionResponseDto[]> {
    return this.certificationsService.getCertificacionesTecnico(tecnicoId);
  }

  @Post('validar')
  @ApiOperation({ summary: 'Validar certificaciones para asignación' })
  @ApiResponse({ status: 200, type: ValidacionResultDto })
  async validarCertificaciones(
    @Body() dto: ValidarCertificacionesDto
  ): Promise<ValidacionResultDto> {
    return this.certificationsService.validarCertificaciones(dto);
  }

  @Get('por-vencer')
  @ApiOperation({ summary: 'Obtener certificaciones próximas a vencer' })
  @ApiQuery({
    name: 'dias',
    required: false,
    type: Number,
    description: 'Días para vencimiento (default: 30)',
  })
  @ApiResponse({ status: 200, type: [CertificacionResponseDto] })
  async getCertificacionesPorVencer(
    @Query() query: CertificacionesQueryDto
  ): Promise<CertificacionResponseDto[]> {
    return this.certificationsService.getCertificacionesPorVencer(query.dias ?? 30);
  }
}

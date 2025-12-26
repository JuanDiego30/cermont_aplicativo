import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CertificacionesService } from './certificaciones.service';
import {
    CreateCertificacionTecnicoDto,
    CertificacionResponseDto,
    ValidarCertificacionesDto,
    ValidacionResultDto,
} from './application/dto/certificaciones.dto';

@ApiTags('Certificaciones')
@Controller('certificaciones')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CertificacionesController {
    constructor(private readonly certificacionesService: CertificacionesService) { }

    @Post('tecnico')
    @ApiOperation({ summary: 'Registrar certificación de técnico' })
    @ApiResponse({ status: 201, type: CertificacionResponseDto })
    async registrarCertificacionTecnico(
        @Body() dto: CreateCertificacionTecnicoDto,
    ): Promise<CertificacionResponseDto> {
        return this.certificacionesService.registrarCertificacionTecnico(dto);
    }

    @Get('tecnico/:tecnicoId')
    @ApiOperation({ summary: 'Obtener certificaciones de un técnico' })
    @ApiResponse({ status: 200, type: [CertificacionResponseDto] })
    async getCertificacionesTecnico(
        @Param('tecnicoId') tecnicoId: string,
    ): Promise<CertificacionResponseDto[]> {
        return this.certificacionesService.getCertificacionesTecnico(tecnicoId);
    }

    @Post('validar')
    @ApiOperation({ summary: 'Validar certificaciones para asignación' })
    @ApiResponse({ status: 200, type: ValidacionResultDto })
    async validarCertificaciones(
        @Body() dto: ValidarCertificacionesDto,
    ): Promise<ValidacionResultDto> {
        return this.certificacionesService.validarCertificaciones(dto);
    }

    @Get('por-vencer')
    @ApiOperation({ summary: 'Obtener certificaciones próximas a vencer' })
    @ApiQuery({ name: 'dias', required: false, type: Number, description: 'Días para vencimiento (default: 30)' })
    @ApiResponse({ status: 200, type: [CertificacionResponseDto] })
    async getCertificacionesPorVencer(
        @Query('dias') dias?: number,
    ): Promise<CertificacionResponseDto[]> {
        return this.certificacionesService.getCertificacionesPorVencer(dias || 30);
    }
}

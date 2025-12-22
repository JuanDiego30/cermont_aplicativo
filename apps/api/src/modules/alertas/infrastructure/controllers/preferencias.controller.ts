/**
 * @controller PreferenciasController
 * 
 * Controller HTTP para gestión de preferencias de alertas
 */

import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../../../common/decorators/current-user.decorator';
import { ActualizarPreferenciasUseCase } from '../../application/use-cases/actualizar-preferencias.use-case';
import {
  ActualizarPreferenciasDto,
  PreferenciaResponseDto,
} from '../../application/dto';

@ApiTags('alertas/preferencias')
@Controller('alertas/preferencias')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PreferenciasController {
  constructor(
    private readonly actualizarPreferenciasUseCase: ActualizarPreferenciasUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener preferencias de alertas del usuario actual' })
  @ApiOkResponse({ type: [PreferenciaResponseDto] })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async obtenerPreferencias(
    @CurrentUser() user: JwtPayload,
  ): Promise<PreferenciaResponseDto[]> {
    // TODO: Implementar use case para obtener todas las preferencias
    // Por ahora retornar array vacío
    return [];
  }

  @Put()
  @ApiOperation({ summary: 'Actualizar preferencias de alertas' })
  @ApiOkResponse({ type: PreferenciaResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async actualizarPreferencias(
    @Body() dto: ActualizarPreferenciasDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PreferenciaResponseDto> {
    return await this.actualizarPreferenciasUseCase.execute(user.userId, dto);
  }
}


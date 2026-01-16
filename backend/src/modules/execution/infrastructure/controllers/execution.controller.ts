/**
 * @controller ExecutionController
 * @description Controlador unificado de ejecución
 */
import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    UseGuards
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, JwtPayload } from '../../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import { CompletarEjecucionDto, IniciarEjecucionDto, UpdateAvanceDto } from '../../application/dto';
import {
    CompletarEjecucionUseCase,
    GetEjecucionUseCase,
    GetMisEjecucionesUseCase,
    IniciarEjecucionUseCase,
    UpdateAvanceUseCase,
} from '../../application/use-cases';

@ApiTags('Execution')
@Controller('execution')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExecutionController {
  constructor(
    private readonly getEjecucion: GetEjecucionUseCase,
    private readonly iniciarEjecucion: IniciarEjecucionUseCase,
    private readonly updateAvance: UpdateAvanceUseCase,
    private readonly completarEjecucion: CompletarEjecucionUseCase,
    private readonly getMisEjecuciones: GetMisEjecucionesUseCase
  ) {}

  // =====================================================
  // ENDPOINTS DDD (Use Cases)
  // =====================================================

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get execution by order' })
  @ApiParam({ name: 'orderId', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Ejecución encontrada' })
  @ApiResponse({ status: 404, description: 'Ejecución no encontrada' })
  async findByOrden(@Param('orderId', ParseUUIDPipe) orderId: string) {
    const result = await this.getEjecucion.execute(orderId);
    if (!result) throw new NotFoundException('Ejecución no encontrada');
    return result;
  }

  // =====================================================
  // ENDPOINTS ADICIONALES (Servicio directo)
  // =====================================================

  @Get('my-executions')
  @ApiOperation({ summary: 'Get executions for current technician' })
  @ApiResponse({ status: 200, description: 'Lista de ejecuciones' })
  findMine(@CurrentUser() user: JwtPayload) {
    return this.getMisEjecuciones.execute(user.userId);
  }

  @Post('order/:orderId/start')
  @Roles('admin', 'supervisor', 'tecnico')
  @ApiOperation({ summary: 'Start order execution' })
  @ApiParam({ name: 'orderId', description: 'Order UUID' })
  @ApiBody({ type: IniciarEjecucionDto })
  @ApiResponse({ status: 201, description: 'Ejecución iniciada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async iniciar(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: IniciarEjecucionDto
  ) {
    return this.iniciarEjecucion.execute(orderId, dto.tecnicoId, dto.observaciones);
  }

  @Put(':id/progress')
  @Roles('admin', 'supervisor', 'tecnico')
  @ApiOperation({ summary: 'Update execution progress' })
  @ApiParam({ name: 'id', description: 'UUID de la ejecución' })
  @ApiBody({ type: UpdateAvanceDto })
  @ApiResponse({ status: 200, description: 'Avance actualizado' })
  async avance(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAvanceDto) {
    return this.updateAvance.execute(id, dto.avance, dto.observaciones ?? '');
  }

  @Put(':id/complete')
  @Roles('admin', 'supervisor', 'tecnico')
  @ApiOperation({ summary: 'Complete execution' })
  @ApiParam({ name: 'id', description: 'UUID de la ejecución' })
  @ApiBody({ type: CompletarEjecucionDto })
  @ApiResponse({ status: 200, description: 'Ejecución completada' })
  async completar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CompletarEjecucionDto) {
    return this.completarEjecucion.execute(id, dto);
  }
}

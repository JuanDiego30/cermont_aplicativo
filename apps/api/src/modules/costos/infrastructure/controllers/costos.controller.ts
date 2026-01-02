/**
 * @controller CostosController
 */
import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import {
  ListCostosUseCase,
  RegistrarCostoUseCase,
  GetAnalisisCostosUseCase,
} from '../../application/use-cases';
import { CostoQuerySchema, RegistrarCostoSchema } from '../../application/dto';

@ApiTags('Costos')
@ApiBearerAuth()
@Controller('costos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CostosController {
  constructor(
    private readonly listCostos: ListCostosUseCase,
    private readonly registrarCosto: RegistrarCostoUseCase,
    private readonly getAnalisis: GetAnalisisCostosUseCase,
  ) {}

  @Get()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Listar costos' })
  @ApiResponse({ status: 200, description: 'Lista de costos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async findAll(@Query() query: unknown) {
    const result = CostoQuerySchema.safeParse(query);
    const filters = result.success ? result.data : {};
    return this.listCostos.execute(filters);
  }

  @Get('analisis/:ordenId')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Obtener análisis de costos por orden' })
  @ApiParam({ name: 'ordenId', description: 'ID (UUID) de la orden' })
  @ApiResponse({ status: 200, description: 'Análisis de costos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async analisis(@Param('ordenId') ordenId: string) {
    return this.getAnalisis.execute(ordenId);
  }

  @Post()
  @Roles('admin', 'supervisor', 'tecnico')
  @ApiOperation({ summary: 'Registrar costo' })
  @ApiBody({
    description: 'Payload para registrar un costo (validado por schema en servidor)',
    schema: { type: 'object' },
  })
  @ApiResponse({ status: 201, description: 'Costo registrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async registrar(@Body() body: unknown) {
    const result = RegistrarCostoSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.registrarCosto.execute(result.data);
  }
}

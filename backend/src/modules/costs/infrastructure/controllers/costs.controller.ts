/**
 * @controller CostosController
 */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { CostoQueryDto, RegistrarCostoDto } from '../../application/dto';
import {
  GetAnalisisCostosUseCase,
  ListCostosUseCase,
  RegistrarCostoUseCase,
} from '../../application/use-cases';

@ApiTags('Costs')
@ApiBearerAuth()
@Controller('costs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CostsController {
  constructor(
    private readonly listCostos: ListCostosUseCase,
    private readonly registrarCosto: RegistrarCostoUseCase,
    private readonly getAnalisis: GetAnalisisCostosUseCase
  ) {}

  @Get()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Listar costos' })
  @ApiResponse({ status: 200, description: 'Lista de costos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async findAll(@Query() query: CostoQueryDto) {
    return this.listCostos.execute(query);
  }

  @Get('analysis/:orderId')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Get cost analysis by order' })
  @ApiParam({ name: 'orderId', description: 'Order ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Análisis de costos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async analisis(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.getAnalisis.execute(orderId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin', 'supervisor', 'tecnico')
  @ApiOperation({ summary: 'Registrar costo' })
  @ApiBody({ type: RegistrarCostoDto })
  @ApiResponse({ status: 201, description: 'Costo registrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async registrar(@Body() dto: RegistrarCostoDto) {
    return this.registrarCosto.execute(dto);
  }
}

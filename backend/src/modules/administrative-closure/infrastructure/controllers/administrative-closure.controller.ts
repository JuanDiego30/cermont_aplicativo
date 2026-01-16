/**
 * @controller CierreAdministrativoController
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
  Put,
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
import { CurrentUser, JwtPayload } from '../../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { CreateCierreDto } from '../../application/dto';
import {
  AprobarCierreUseCase,
  CreateCierreUseCase,
  GetCierreByOrdenUseCase,
} from '../../application/use-cases';

@ApiTags('Administrative Closure')
@ApiBearerAuth()
@Controller('administrative-closure')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdministrativeClosureController {
  constructor(
    private readonly getCierre: GetCierreByOrdenUseCase,
    private readonly createCierre: CreateCierreUseCase,
    private readonly aprobarCierre: AprobarCierreUseCase
  ) {}

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get administrative closure by order' })
  @ApiParam({ name: 'orderId', description: 'Order ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Cierre encontrado (si existe)' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async findByOrden(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.getCierre.execute(orderId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Crear cierre administrativo' })
  @ApiBody({ type: CreateCierreDto })
  @ApiResponse({ status: 201, description: 'Cierre creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async create(@Body() dto: CreateCierreDto, @CurrentUser() user: JwtPayload) {
    return this.createCierre.execute(dto, user.userId);
  }

  @Put(':id/approve')
  @Roles('admin')
  @ApiOperation({ summary: 'Aprobar cierre administrativo' })
  @ApiParam({ name: 'id', description: 'ID (UUID) del cierre administrativo' })
  @ApiResponse({ status: 200, description: 'Cierre aprobado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede aprobar en el estado actual',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async aprobar(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.aprobarCierre.execute(id, user.userId);
  }
}

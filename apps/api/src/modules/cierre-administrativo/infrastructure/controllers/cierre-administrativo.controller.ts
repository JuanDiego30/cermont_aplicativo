/**
 * @controller CierreAdministrativoController
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
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
  GetCierreByOrdenUseCase,
  CreateCierreUseCase,
  AprobarCierreUseCase,
} from '../../application/use-cases';
import { CreateCierreSchema } from '../../application/dto';

@ApiTags('Cierre Administrativo')
@ApiBearerAuth()
@Controller('cierre-administrativo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CierreAdministrativoController {
  constructor(
    private readonly getCierre: GetCierreByOrdenUseCase,
    private readonly createCierre: CreateCierreUseCase,
    private readonly aprobarCierre: AprobarCierreUseCase,
  ) {}

  @Get('orden/:ordenId')
  @ApiOperation({ summary: 'Obtener cierre administrativo por orden' })
  @ApiParam({ name: 'ordenId', description: 'ID (UUID) de la orden' })
  @ApiResponse({ status: 200, description: 'Cierre encontrado (si existe)' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async findByOrden(@Param('ordenId') ordenId: string) {
    return this.getCierre.execute(ordenId);
  }

  @Post()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Crear cierre administrativo' })
  @ApiBody({
    description: 'Payload para crear el cierre (validado por schema en servidor)',
    schema: { type: 'object' },
  })
  @ApiResponse({ status: 201, description: 'Cierre creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async create(@Body() body: unknown, @Req() req: any) {
    const result = CreateCierreSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.createCierre.execute(result.data, req.user.id);
  }

  @Put(':id/aprobar')
  @Roles('admin')
  @ApiOperation({ summary: 'Aprobar cierre administrativo' })
  @ApiParam({ name: 'id', description: 'ID (UUID) del cierre administrativo' })
  @ApiResponse({ status: 200, description: 'Cierre aprobado' })
  @ApiResponse({ status: 400, description: 'No se puede aprobar en el estado actual' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async aprobar(@Param('id') id: string, @Req() req: any) {
    return this.aprobarCierre.execute(id, req.user.id);
  }
}

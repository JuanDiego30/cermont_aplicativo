/**
 * @controller PlaneacionController
 * @description Controlador refactorizado con Clean Architecture
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
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import {
  GetPlaneacionUseCase,
  CreateOrUpdatePlaneacionUseCase,
  AprobarPlaneacionUseCase,
  RechazarPlaneacionUseCase,
} from '../../application/use-cases';
import {
  CreatePlaneacionSchema,
  RechazarPlaneacionSchema,
} from '../../application/dto';

@Controller('planeacion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlaneacionController {
  constructor(
    private readonly getPlaneacion: GetPlaneacionUseCase,
    private readonly createOrUpdatePlaneacion: CreateOrUpdatePlaneacionUseCase,
    private readonly aprobarPlaneacion: AprobarPlaneacionUseCase,
    private readonly rechazarPlaneacion: RechazarPlaneacionUseCase,
  ) {}

  @Get(':ordenId')
  async findByOrden(@Param('ordenId') ordenId: string) {
    const planeacion = await this.getPlaneacion.execute(ordenId);
    if (!planeacion) {
      throw new NotFoundException('Planeación no encontrada');
    }
    return planeacion;
  }

  @Post(':ordenId')
  @Roles('admin', 'supervisor', 'tecnico')
  async createOrUpdate(
    @Param('ordenId') ordenId: string,
    @Body() body: unknown,
  ) {
    const result = CreatePlaneacionSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }
    return this.createOrUpdatePlaneacion.execute(ordenId, result.data);
  }

  @Put(':id/aprobar')
  @Roles('admin', 'supervisor')
  async aprobar(@Param('id') id: string, @Req() req: any) {
    return this.aprobarPlaneacion.execute(id, req.user.id);
  }

  @Put(':id/rechazar')
  @Roles('admin', 'supervisor')
  async rechazar(@Param('id') id: string, @Body() body: unknown) {
    const result = RechazarPlaneacionSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }
    return this.rechazarPlaneacion.execute(id, result.data.motivo);
  }
}

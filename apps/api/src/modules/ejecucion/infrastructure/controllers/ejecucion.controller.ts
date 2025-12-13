/**
 * @controller EjecucionController
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import {
  GetEjecucionUseCase,
  IniciarEjecucionUseCase,
  UpdateAvanceUseCase,
  CompletarEjecucionUseCase,
} from '../../application/use-cases';
import {
  IniciarEjecucionSchema,
  UpdateAvanceSchema,
  CompletarEjecucionSchema,
} from '../../application/dto';

@Controller('ejecucion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EjecucionController {
  constructor(
    private readonly getEjecucion: GetEjecucionUseCase,
    private readonly iniciarEjecucion: IniciarEjecucionUseCase,
    private readonly updateAvance: UpdateAvanceUseCase,
    private readonly completarEjecucion: CompletarEjecucionUseCase,
  ) {}

  @Get(':ordenId')
  async findByOrden(@Param('ordenId') ordenId: string) {
    const result = await this.getEjecucion.execute(ordenId);
    if (!result) throw new NotFoundException('Ejecución no encontrada');
    return result;
  }

  @Post(':ordenId/iniciar')
  @Roles('admin', 'supervisor', 'tecnico')
  async iniciar(@Param('ordenId') ordenId: string, @Body() body: unknown) {
    const result = IniciarEjecucionSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.iniciarEjecucion.execute(ordenId, result.data.tecnicoId, result.data.observaciones);
  }

  @Put(':id/avance')
  @Roles('admin', 'supervisor', 'tecnico')
  async avance(@Param('id') id: string, @Body() body: unknown) {
    const result = UpdateAvanceSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.updateAvance.execute(id, result.data.avance, result.data.observaciones);
  }

  @Put(':id/completar')
  @Roles('admin', 'supervisor', 'tecnico')
  async completar(@Param('id') id: string, @Body() body: unknown) {
    const result = CompletarEjecucionSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.completarEjecucion.execute(id, result.data);
  }
}

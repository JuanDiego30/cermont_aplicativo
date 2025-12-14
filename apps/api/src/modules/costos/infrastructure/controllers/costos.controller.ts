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
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import {
  ListCostosUseCase,
  RegistrarCostoUseCase,
  GetAnalisisCostosUseCase,
} from '../../application/use-cases';
import { CostoQuerySchema, RegistrarCostoSchema } from '../../application/dto';

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
  async findAll(@Query() query: unknown) {
    const result = CostoQuerySchema.safeParse(query);
    const filters = result.success ? result.data : {};
    return this.listCostos.execute(filters);
  }

  @Get('analisis/:ordenId')
  @Roles('admin', 'supervisor')
  async analisis(@Param('ordenId') ordenId: string) {
    return this.getAnalisis.execute(ordenId);
  }

  @Post()
  @Roles('admin', 'supervisor', 'tecnico')
  async registrar(@Body() body: unknown) {
    const result = RegistrarCostoSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.registrarCosto.execute(result.data);
  }
}

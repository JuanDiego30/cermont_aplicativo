/**
 * @controller MantenimientosController
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import {
  ListMantenimientosUseCase,
  CreateMantenimientoUseCase,
  EjecutarMantenimientoUseCase,
  GetProximosMantenimientosUseCase,
} from '../../application/use-cases';
import {
  MantenimientoQuerySchema,
  CreateMantenimientoSchema,
  EjecutarMantenimientoSchema,
} from '../../application/dto';

@Controller('mantenimientos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MantenimientosController {
  constructor(
    private readonly listMantenimientos: ListMantenimientosUseCase,
    private readonly createMantenimiento: CreateMantenimientoUseCase,
    private readonly ejecutarMantenimiento: EjecutarMantenimientoUseCase,
    private readonly getProximosMantenimientos: GetProximosMantenimientosUseCase,
  ) {}

  @Get()
  async findAll(@Query() query: unknown) {
    const result = MantenimientoQuerySchema.safeParse(query);
    const filters = result.success ? result.data : {};
    return this.listMantenimientos.execute(filters);
  }

  @Get('proximos')
  async getProximos(@Query('dias') dias?: string) {
    const numDias = dias ? parseInt(dias, 10) : undefined;
    return this.getProximosMantenimientos.execute(numDias);
  }

  @Post()
  @Roles('admin', 'supervisor')
  async create(@Body() body: unknown) {
    const result = CreateMantenimientoSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.createMantenimiento.execute(result.data);
  }

  @Put(':id/ejecutar')
  @Roles('admin', 'supervisor', 'tecnico')
  async ejecutar(@Param('id') id: string, @Body() body: unknown, @Req() req: any) {
    const result = EjecutarMantenimientoSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.ejecutarMantenimiento.execute(id, result.data, req.user.id);
  }
}

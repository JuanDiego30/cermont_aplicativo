/**
 * @controller ReportesController
 */
import { Controller, Get, Query, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import {
  GenerateReporteOrdenesUseCase,
  GetReporteOrdenDetalleUseCase,
} from '../../application/use-cases';
import { ReporteQuerySchema } from '../../application/dto';

@Controller('reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportesController {
  constructor(
    private readonly generateReporte: GenerateReporteOrdenesUseCase,
    private readonly getReporteDetalle: GetReporteOrdenDetalleUseCase,
  ) {}

  @Get('ordenes')
  @Roles('admin', 'supervisor')
  async reporteOrdenes(@Query() query: unknown) {
    const result = ReporteQuerySchema.safeParse(query);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.generateReporte.execute(result.data);
  }

  @Get('orden/:id')
  @Roles('admin', 'supervisor')
  async reporteOrden(@Param('id') id: string) {
    return this.getReporteDetalle.execute(id);
  }
}

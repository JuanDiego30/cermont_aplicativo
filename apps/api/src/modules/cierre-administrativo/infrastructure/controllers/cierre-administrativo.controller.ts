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
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import {
  GetCierreByOrdenUseCase,
  CreateCierreUseCase,
  AprobarCierreUseCase,
} from '../../application/use-cases';
import { CreateCierreSchema } from '../../application/dto';

@Controller('cierre-administrativo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CierreAdministrativoController {
  constructor(
    private readonly getCierre: GetCierreByOrdenUseCase,
    private readonly createCierre: CreateCierreUseCase,
    private readonly aprobarCierre: AprobarCierreUseCase,
  ) {}

  @Get('orden/:ordenId')
  async findByOrden(@Param('ordenId') ordenId: string) {
    return this.getCierre.execute(ordenId);
  }

  @Post()
  @Roles('admin', 'supervisor')
  async create(@Body() body: unknown, @Req() req: any) {
    const result = CreateCierreSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.createCierre.execute(result.data, req.user.id);
  }

  @Put(':id/aprobar')
  @Roles('admin')
  async aprobar(@Param('id') id: string, @Req() req: any) {
    return this.aprobarCierre.execute(id, req.user.id);
  }
}

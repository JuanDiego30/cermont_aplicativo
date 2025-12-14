/**
 * @controller LineasVidaController
 */
import {
  Controller,
  Get,
  Post,
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
  ListLineasVidaUseCase,
  CreateLineaVidaUseCase,
  InspeccionarLineaVidaUseCase,
} from '../../application/use-cases';
import { CreateLineaVidaSchema, InspeccionLineaVidaSchema } from '../../application/dto';

@Controller('lineas-vida')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LineasVidaController {
  constructor(
    private readonly listLineasVida: ListLineasVidaUseCase,
    private readonly createLineaVida: CreateLineaVidaUseCase,
    private readonly inspeccionarLineaVida: InspeccionarLineaVidaUseCase,
  ) {}

  @Get()
  async findAll() {
    return this.listLineasVida.execute();
  }

  @Post()
  @Roles('admin', 'supervisor')
  async create(@Body() body: unknown, @Req() req: any) {
    const result = CreateLineaVidaSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.createLineaVida.execute(result.data, req.user.id);
  }

  @Post(':id/inspeccionar')
  @Roles('admin', 'supervisor', 'tecnico')
  async inspeccionar(@Param('id') id: string, @Body() body: unknown, @Req() req: any) {
    const result = InspeccionLineaVidaSchema.safeParse({ ...body as object, lineaVidaId: id });
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.inspeccionarLineaVida.execute(result.data, req.user.id);
  }
}

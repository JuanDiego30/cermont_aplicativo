/**
 * @controller ArchivadoController
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
  Req,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import {
  ListArchivadasUseCase,
  ArchivarOrdenUseCase,
  DesarchivarOrdenUseCase,
} from '../../application/use-cases';
import { ArchivadoQuerySchema, ArchivarOrdenSchema } from '../../application/dto';

@Controller('archivado')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ArchivadoController {
  constructor(
    private readonly listArchivadas: ListArchivadasUseCase,
    private readonly archivarOrden: ArchivarOrdenUseCase,
    private readonly desarchivarOrden: DesarchivarOrdenUseCase,
  ) {}

  @Get()
  @Roles('admin', 'supervisor')
  async findAll(@Query() query: unknown) {
    const result = ArchivadoQuerySchema.safeParse(query);
    const filters = result.success ? result.data : { page: 1, limit: 20 };
    return this.listArchivadas.execute(filters);
  }

  @Post()
  @Roles('admin', 'supervisor')
  async archivar(@Body() body: unknown, @Req() req: any) {
    const result = ArchivarOrdenSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.archivarOrden.execute(result.data, req.user.id);
  }

  @Delete(':ordenId')
  @Roles('admin')
  async desarchivar(@Param('ordenId') ordenId: string) {
    return this.desarchivarOrden.execute({ ordenId });
  }
}

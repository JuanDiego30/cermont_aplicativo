/**
 * @controller OrdenesController (Refactorizado)
 * @description Controlador de órdenes con Clean Architecture
 * @layer Infrastructure
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../../../common/decorators/current-user.decorator';
import {
  ListOrdenesUseCase,
  GetOrdenByIdUseCase,
  CreateOrdenUseCase,
  UpdateOrdenUseCase,
  ChangeOrdenEstadoUseCase,
  DeleteOrdenUseCase,
} from '../../application/use-cases';
import {
  CreateOrdenSchema,
  UpdateOrdenSchema,
  ChangeEstadoSchema,
  OrdenQuerySchema,
} from '../../application/dto';

@ApiTags('Ordenes')
@Controller('ordenes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdenesController {
  constructor(
    private readonly listOrdenesUseCase: ListOrdenesUseCase,
    private readonly getOrdenByIdUseCase: GetOrdenByIdUseCase,
    private readonly createOrdenUseCase: CreateOrdenUseCase,
    private readonly updateOrdenUseCase: UpdateOrdenUseCase,
    private readonly changeOrdenEstadoUseCase: ChangeOrdenEstadoUseCase,
    private readonly deleteOrdenUseCase: DeleteOrdenUseCase,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Listar órdenes' })
  async findAll(@Query() query: unknown) {
    const result = OrdenQuerySchema.safeParse(query);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.listOrdenesUseCase.execute(result.data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener orden por ID' })
  async findOne(@Param('id') id: string) {
    return this.getOrdenByIdUseCase.execute(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear orden' })
  async create(@Body() body: unknown, @CurrentUser() user: JwtPayload) {
    const result = CreateOrdenSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.createOrdenUseCase.execute(result.data, user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar orden' })
  async update(@Param('id') id: string, @Body() body: unknown) {
    const result = UpdateOrdenSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.updateOrdenUseCase.execute(id, result.data);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado de orden' })
  async changeEstado(@Param('id') id: string, @Body() body: unknown) {
    const result = ChangeEstadoSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.changeOrdenEstadoUseCase.execute(id, result.data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar orden' })
  async remove(@Param('id') id: string) {
    return this.deleteOrdenUseCase.execute(id);
  }
}

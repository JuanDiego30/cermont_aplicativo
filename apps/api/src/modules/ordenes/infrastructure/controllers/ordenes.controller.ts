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
import { OrderStateService } from '../../application/services/order-state.service';

@ApiTags('Ordenes')
@Controller('ordenes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrdenesController {
  constructor(
    private readonly listOrdenesUseCase: ListOrdenesUseCase,
    private readonly getOrdenByIdUseCase: GetOrdenByIdUseCase,
    private readonly createOrdenUseCase: CreateOrdenUseCase,
    private readonly updateOrdenUseCase: UpdateOrdenUseCase,
    private readonly changeOrdenEstadoUseCase: ChangeOrdenEstadoUseCase,
    private readonly deleteOrdenUseCase: DeleteOrdenUseCase,
    private readonly orderStateService: OrderStateService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Listar órdenes' })
  async findAll(@Query() query: unknown) {
    try {
      const parsedQuery = OrdenQuerySchema.parse(query);
      return await this.listOrdenesUseCase.execute(parsedQuery);
    } catch (error) {
      const err = error as Error;
      console.error('[OrdenesController.findAll] Error:', err.message, err.stack);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener orden por ID' })
  async findOne(@Param('id') id: string) {
    return this.getOrdenByIdUseCase.execute(id);
  }

  @Get(':id/state')
  @ApiOperation({ summary: 'Obtener estado detallado de la orden (flujo 14 pasos)' })
  async getState(@Param('id') id: string) {
    return this.orderStateService.getStateInfo(id);
  }

  @Get(':id/state/history')
  @ApiOperation({ summary: 'Obtener historial de cambios de estado de la orden' })
  async getStateHistory(@Param('id') id: string) {
    return this.orderStateService.getStateHistory(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear orden' })
  async create(@Body() body: unknown, @CurrentUser() user: JwtPayload) {
    const dto = CreateOrdenSchema.parse(body);
    return this.createOrdenUseCase.execute(dto, user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar orden' })
  async update(@Param('id') id: string, @Body() body: unknown) {
    const dto = UpdateOrdenSchema.parse(body);
    return this.updateOrdenUseCase.execute(id, dto);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado de orden' })
  async changeEstado(@Param('id') id: string, @Body() body: unknown) {
    const dto = ChangeEstadoSchema.parse(body);
    return this.changeOrdenEstadoUseCase.execute(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar orden' })
  async remove(@Param('id') id: string) {
    return this.deleteOrdenUseCase.execute(id);
  }
}

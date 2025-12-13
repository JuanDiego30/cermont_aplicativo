/**
 * @controller ChecklistsController
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import {
  ListChecklistsUseCase,
  CreateChecklistUseCase,
  ToggleChecklistItemUseCase,
  GetChecklistsByOrdenUseCase,
  AssignChecklistToOrdenUseCase,
} from '../../application/use-cases';
import { CreateChecklistSchema, ToggleItemSchema } from '../../application/dto';

@Controller('checklists')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChecklistsController {
  constructor(
    private readonly listChecklists: ListChecklistsUseCase,
    private readonly createChecklist: CreateChecklistUseCase,
    private readonly toggleItem: ToggleChecklistItemUseCase,
    private readonly getByOrden: GetChecklistsByOrdenUseCase,
    private readonly assignToOrden: AssignChecklistToOrdenUseCase,
  ) {}

  @Get()
  async findAll(@Query('tipo') tipo?: string) {
    return this.listChecklists.execute(tipo);
  }

  @Post()
  @Roles('admin', 'supervisor')
  async create(@Body() body: unknown) {
    const result = CreateChecklistSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.createChecklist.execute(result.data);
  }

  @Get('orden/:ordenId')
  async findByOrden(@Param('ordenId') ordenId: string) {
    return this.getByOrden.execute(ordenId);
  }

  @Post('orden/:ordenId/:checklistId')
  @Roles('admin', 'supervisor', 'tecnico')
  async assign(
    @Param('ordenId') ordenId: string,
    @Param('checklistId') checklistId: string,
  ) {
    return this.assignToOrden.execute(ordenId, checklistId);
  }

  @Put('orden/:ordenId/:checklistId/item/:itemId')
  @Roles('admin', 'supervisor', 'tecnico')
  async toggle(
    @Param('ordenId') ordenId: string,
    @Param('checklistId') checklistId: string,
    @Param('itemId') itemId: string,
    @Body() body: unknown,
  ) {
    const result = ToggleItemSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.toggleItem.execute(
      ordenId,
      checklistId,
      itemId,
      result.data.completado,
      result.data.observaciones,
    );
  }
}

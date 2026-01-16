/**
 * @controller ChecklistsController
 *
 * Controller HTTP para gestión de checklists
 */

import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, JwtPayload } from '../../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import {
  AssignChecklistToEjecucionDto,
  AssignChecklistToOrdenDto,
  ChecklistResponseDto,
  CreateChecklistDto,
  ListChecklistsQueryDto,
  PaginatedChecklistsResponseDto,
  UpdateChecklistItemDto,
} from '../../application/dto';
import {
  ArchiveChecklistUseCase,
  AssignChecklistToEjecucionUseCase,
  AssignChecklistToOrdenUseCase,
  CompleteChecklistUseCase,
  CreateChecklistUseCase,
  GetChecklistsByEjecucionUseCase,
  GetChecklistsByOrdenUseCase,
  ListChecklistsUseCase,
  ToggleChecklistItemUseCase,
  UpdateChecklistItemUseCase,
} from '../../application/use-cases';

@ApiTags('checklists')
@Controller('checklists')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChecklistsController {
  constructor(
    private readonly createChecklist: CreateChecklistUseCase,
    private readonly listChecklists: ListChecklistsUseCase,
    private readonly assignToOrdenUseCase: AssignChecklistToOrdenUseCase,
    private readonly assignToEjecucionUseCase: AssignChecklistToEjecucionUseCase,
    private readonly getByOrden: GetChecklistsByOrdenUseCase,
    private readonly getByEjecucion: GetChecklistsByEjecucionUseCase,
    private readonly toggleItemUseCase: ToggleChecklistItemUseCase,
    private readonly updateItemUseCase: UpdateChecklistItemUseCase,
    private readonly completeChecklist: CompleteChecklistUseCase,
    private readonly archiveChecklist: ArchiveChecklistUseCase
  ) {}

  @Post()
  @HttpCode(201)
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Crear nueva plantilla de checklist' })
  @ApiOkResponse({ type: ChecklistResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(@Body() dto: CreateChecklistDto): Promise<ChecklistResponseDto> {
    return await this.createChecklist.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar checklists con filtros y paginación' })
  @ApiOkResponse({ type: PaginatedChecklistsResponseDto })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(@Query() query: ListChecklistsQueryDto): Promise<PaginatedChecklistsResponseDto> {
    return await this.listChecklists.execute(query);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Listar solo plantillas de checklists' })
  @ApiOkResponse({ type: [ChecklistResponseDto] })
  async findAllTemplates(@Query('tipo') tipo?: string): Promise<ChecklistResponseDto[]> {
    const result = await this.listChecklists.execute({ tipo, activo: true });
    return result.items;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener checklist por ID' })
  @ApiOkResponse({ type: ChecklistResponseDto })
  @ApiNotFoundResponse({ description: 'Checklist no encontrado' })
  async findOne(@Param('id') id: string): Promise<ChecklistResponseDto> {
    // TODO: Implementar use case para obtener por ID
    const result = await this.listChecklists.execute({ limit: 1 });
    const checklist = result.items.find(c => c.id === id);
    if (!checklist) {
      throw new Error('Checklist no encontrado');
    }
    return checklist;
  }

  @Post('assign/order')
  @Roles('admin', 'supervisor', 'tecnico')
  @ApiOperation({ summary: 'Assign checklist to an order' })
  @ApiOkResponse({ type: ChecklistResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  async assignToOrden(@Body() dto: AssignChecklistToOrdenDto): Promise<ChecklistResponseDto> {
    return await this.assignToOrdenUseCase.execute(dto);
  }

  @Post('assign/execution')
  @Roles('admin', 'supervisor', 'tecnico')
  @ApiOperation({ summary: 'Assign checklist to an execution' })
  @ApiOkResponse({ type: ChecklistResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  async assignToEjecucion(
    @Body() dto: AssignChecklistToEjecucionDto
  ): Promise<ChecklistResponseDto> {
    return await this.assignToEjecucionUseCase.execute(dto);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get checklists assigned to an order' })
  @ApiOkResponse({ type: [ChecklistResponseDto] })
  async findByOrden(@Param('orderId') orderId: string): Promise<ChecklistResponseDto[]> {
    return await this.getByOrden.execute(orderId);
  }

  @Get('execution/:executionId')
  @ApiOperation({ summary: 'Get checklists assigned to an execution' })
  @ApiOkResponse({ type: [ChecklistResponseDto] })
  async findByEjecucion(
    @Param('executionId') executionId: string
  ): Promise<ChecklistResponseDto[]> {
    return await this.getByEjecucion.execute(executionId);
  }

  @Patch(':checklistId/items/:itemId/toggle')
  @Roles('admin', 'supervisor', 'tecnico')
  @ApiOperation({ summary: 'Toggle item de checklist (marcar/desmarcar)' })
  @ApiOkResponse({ type: ChecklistResponseDto })
  @ApiNotFoundResponse({ description: 'Checklist o item no encontrado' })
  async toggleItem(
    @Param('checklistId') checklistId: string,
    @Param('itemId') itemId: string,
    @Body() dto: { ordenId?: string; ejecucionId?: string },
    @CurrentUser() user: JwtPayload
  ): Promise<ChecklistResponseDto> {
    return await this.toggleItemUseCase.execute(
      {
        checklistId,
        itemId,
        ordenId: dto.ordenId,
        ejecucionId: dto.ejecucionId,
      },
      user.userId
    );
  }

  @Put(':checklistId/items/:itemId')
  @Roles('admin', 'supervisor', 'tecnico')
  @ApiOperation({ summary: 'Actualizar item de checklist (observaciones)' })
  @ApiOkResponse({ type: ChecklistResponseDto })
  @ApiNotFoundResponse({ description: 'Checklist o item no encontrado' })
  async updateItem(
    @Param('checklistId') checklistId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateChecklistItemDto
  ): Promise<ChecklistResponseDto> {
    return await this.updateItemUseCase.execute({
      checklistId,
      itemId,
      observaciones: dto.observaciones,
    });
  }

  @Post(':checklistId/complete')
  @Roles('admin', 'supervisor', 'tecnico')
  @ApiOperation({ summary: 'Completar checklist manualmente' })
  @ApiOkResponse({ type: ChecklistResponseDto })
  @ApiNotFoundResponse({ description: 'Checklist no encontrado' })
  async complete(
    @Param('checklistId') checklistId: string,
    @CurrentUser() user: JwtPayload
  ): Promise<ChecklistResponseDto> {
    return await this.completeChecklist.execute({ checklistId }, user.userId);
  }

  @Post(':checklistId/archive')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Archivar checklist' })
  @ApiOkResponse({ type: ChecklistResponseDto })
  @ApiNotFoundResponse({ description: 'Checklist no encontrado' })
  async archive(@Param('checklistId') checklistId: string): Promise<ChecklistResponseDto> {
    return await this.archiveChecklist.execute({ checklistId });
  }
}

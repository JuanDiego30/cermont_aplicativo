/**
 * @controller ChecklistsController
 *
 * Controller HTTP para gestión de checklists
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../common/guards/roles.guard";
import { Roles } from "../../../../common/decorators/roles.decorator";
import {
  CurrentUser,
  JwtPayload,
} from "../../../../common/decorators/current-user.decorator";
import {
  CreateChecklistUseCase,
  ListChecklistsUseCase,
  AssignChecklistToOrdenUseCase,
  AssignChecklistToEjecucionUseCase,
  GetChecklistsByOrdenUseCase,
  GetChecklistsByEjecucionUseCase,
  ToggleChecklistItemUseCase,
  UpdateChecklistItemUseCase,
  CompleteChecklistUseCase,
  ArchiveChecklistUseCase,
} from "../../application/use-cases";
import {
  CreateChecklistDto,
  ChecklistResponseDto,
  PaginatedChecklistsResponseDto,
  AssignChecklistToOrdenDto,
  AssignChecklistToEjecucionDto,
  ToggleChecklistItemDto,
  UpdateChecklistItemDto,
  ListChecklistsQueryDto,
  CompleteChecklistDto,
  ArchiveChecklistDto,
} from "../../application/dto";

@ApiTags("checklists")
@Controller("checklists")
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
    private readonly archiveChecklist: ArchiveChecklistUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @Roles("admin", "supervisor")
  @ApiOperation({ summary: "Crear nueva plantilla de checklist" })
  @ApiOkResponse({ type: ChecklistResponseDto })
  @ApiBadRequestResponse({ description: "Datos inválidos" })
  @ApiUnauthorizedResponse({ description: "No autorizado" })
  async create(@Body() dto: CreateChecklistDto): Promise<ChecklistResponseDto> {
    return await this.createChecklist.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar checklists con filtros y paginación" })
  @ApiOkResponse({ type: PaginatedChecklistsResponseDto })
  @ApiUnauthorizedResponse({ description: "No autorizado" })
  async findAll(
    @Query() query: ListChecklistsQueryDto,
  ): Promise<PaginatedChecklistsResponseDto> {
    return await this.listChecklists.execute(query);
  }

  @Get("templates")
  @ApiOperation({ summary: "Listar solo plantillas de checklists" })
  @ApiOkResponse({ type: [ChecklistResponseDto] })
  async findAllTemplates(
    @Query("tipo") tipo?: string,
  ): Promise<ChecklistResponseDto[]> {
    const result = await this.listChecklists.execute({ tipo, activo: true });
    return result.items;
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener checklist por ID" })
  @ApiOkResponse({ type: ChecklistResponseDto })
  @ApiNotFoundResponse({ description: "Checklist no encontrado" })
  async findOne(@Param("id") id: string): Promise<ChecklistResponseDto> {
    // TODO: Implementar use case para obtener por ID
    const result = await this.listChecklists.execute({ limit: 1 });
    const checklist = result.items.find((c) => c.id === id);
    if (!checklist) {
      throw new Error("Checklist no encontrado");
    }
    return checklist;
  }

  @Post("assign/orden")
  @Roles("admin", "supervisor", "tecnico")
  @ApiOperation({ summary: "Asignar checklist a una orden" })
  @ApiOkResponse({ type: ChecklistResponseDto })
  @ApiBadRequestResponse({ description: "Datos inválidos" })
  async assignToOrden(
    @Body() dto: AssignChecklistToOrdenDto,
  ): Promise<ChecklistResponseDto> {
    return await this.assignToOrdenUseCase.execute(dto);
  }

  @Post("assign/ejecucion")
  @Roles("admin", "supervisor", "tecnico")
  @ApiOperation({ summary: "Asignar checklist a una ejecución" })
  @ApiOkResponse({ type: ChecklistResponseDto })
  @ApiBadRequestResponse({ description: "Datos inválidos" })
  async assignToEjecucion(
    @Body() dto: AssignChecklistToEjecucionDto,
  ): Promise<ChecklistResponseDto> {
    return await this.assignToEjecucionUseCase.execute(dto);
  }

  @Get("orden/:ordenId")
  @ApiOperation({ summary: "Obtener checklists asignados a una orden" })
  @ApiOkResponse({ type: [ChecklistResponseDto] })
  async findByOrden(
    @Param("ordenId") ordenId: string,
  ): Promise<ChecklistResponseDto[]> {
    return await this.getByOrden.execute(ordenId);
  }

  @Get("ejecucion/:ejecucionId")
  @ApiOperation({ summary: "Obtener checklists asignados a una ejecución" })
  @ApiOkResponse({ type: [ChecklistResponseDto] })
  async findByEjecucion(
    @Param("ejecucionId") ejecucionId: string,
  ): Promise<ChecklistResponseDto[]> {
    return await this.getByEjecucion.execute(ejecucionId);
  }

  @Patch(":checklistId/items/:itemId/toggle")
  @Roles("admin", "supervisor", "tecnico")
  @ApiOperation({ summary: "Toggle item de checklist (marcar/desmarcar)" })
  @ApiOkResponse({ type: ChecklistResponseDto })
  @ApiNotFoundResponse({ description: "Checklist o item no encontrado" })
  async toggleItem(
    @Param("checklistId") checklistId: string,
    @Param("itemId") itemId: string,
    @Body() dto: { ordenId?: string; ejecucionId?: string },
    @CurrentUser() user: JwtPayload,
  ): Promise<ChecklistResponseDto> {
    return await this.toggleItemUseCase.execute(
      {
        checklistId,
        itemId,
        ordenId: dto.ordenId,
        ejecucionId: dto.ejecucionId,
      },
      user.userId,
    );
  }

  @Put(":checklistId/items/:itemId")
  @Roles("admin", "supervisor", "tecnico")
  @ApiOperation({ summary: "Actualizar item de checklist (observaciones)" })
  @ApiOkResponse({ type: ChecklistResponseDto })
  @ApiNotFoundResponse({ description: "Checklist o item no encontrado" })
  async updateItem(
    @Param("checklistId") checklistId: string,
    @Param("itemId") itemId: string,
    @Body() dto: UpdateChecklistItemDto,
  ): Promise<ChecklistResponseDto> {
    return await this.updateItemUseCase.execute({
      checklistId,
      itemId,
      observaciones: dto.observaciones,
    });
  }

  @Post(":checklistId/complete")
  @Roles("admin", "supervisor", "tecnico")
  @ApiOperation({ summary: "Completar checklist manualmente" })
  @ApiOkResponse({ type: ChecklistResponseDto })
  @ApiNotFoundResponse({ description: "Checklist no encontrado" })
  async complete(
    @Param("checklistId") checklistId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ChecklistResponseDto> {
    return await this.completeChecklist.execute({ checklistId }, user.userId);
  }

  @Post(":checklistId/archive")
  @Roles("admin", "supervisor")
  @ApiOperation({ summary: "Archivar checklist" })
  @ApiOkResponse({ type: ChecklistResponseDto })
  @ApiNotFoundResponse({ description: "Checklist no encontrado" })
  async archive(
    @Param("checklistId") checklistId: string,
  ): Promise<ChecklistResponseDto> {
    return await this.archiveChecklist.execute({ checklistId });
  }
}

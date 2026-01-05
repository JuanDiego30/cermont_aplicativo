/**
 * Controller: KitsController
 *
 * HTTP endpoints for Kits management (DDD refactored)
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
  HttpCode,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";

// Use Cases
import {
  GetKitUseCase,
  CreateKitUseCase,
  ListKitsUseCase,
  UpdateKitUseCase,
  AddItemToKitUseCase,
  RemoveItemFromKitUseCase,
  ActivateKitUseCase,
  DeactivateKitUseCase,
  DeleteKitUseCase,
} from "../../application/use-cases";

// DTOs
import {
  CreateKitDto,
  UpdateKitDto,
  AddItemToKitDto,
  ListKitsQueryDto,
  KitResponseDto,
  KitListResponseDto,
} from "../../application/dto/kit.dtos";

// Legacy service for backward compatibility
import { KitsService } from "../../kits.service";

@ApiTags("Kits")
@Controller("kits")
export class KitsController {
  private readonly logger = new Logger(KitsController.name);

  constructor(
    private readonly getKitUseCase: GetKitUseCase,
    private readonly createKitUseCase: CreateKitUseCase,
    private readonly listKitsUseCase: ListKitsUseCase,
    private readonly updateKitUseCase: UpdateKitUseCase,
    private readonly addItemToKitUseCase: AddItemToKitUseCase,
    private readonly removeItemFromKitUseCase: RemoveItemFromKitUseCase,
    private readonly activateKitUseCase: ActivateKitUseCase,
    private readonly deactivateKitUseCase: DeactivateKitUseCase,
    private readonly deleteKitUseCase: DeleteKitUseCase,
    private readonly kitsService: KitsService, // Legacy
  ) {}

  // ========================================================================
  // CRUD Operations (DDD)
  // ========================================================================

  @Get()
  @ApiOperation({ summary: "Listar todos los kits" })
  @ApiResponse({
    status: 200,
    description: "Lista de kits",
    type: KitListResponseDto,
  })
  @ApiQuery({ name: "categoria", required: false })
  @ApiQuery({ name: "estado", required: false })
  @ApiQuery({ name: "tipo", required: false })
  @ApiQuery({ name: "soloPlantillas", required: false, type: Boolean })
  async findAll(@Query() query: ListKitsQueryDto): Promise<KitListResponseDto> {
    this.logger.log("GET /kits");
    return this.listKitsUseCase.execute(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener un kit por ID" })
  @ApiResponse({
    status: 200,
    description: "Kit encontrado",
    type: KitResponseDto,
  })
  @ApiResponse({ status: 404, description: "Kit no encontrado" })
  @ApiParam({ name: "id", description: "ID del kit" })
  async findOne(@Param("id") id: string): Promise<KitResponseDto> {
    this.logger.log(`GET /kits/${id}`);
    return this.getKitUseCase.execute(id);
  }

  @Post()
  @ApiOperation({ summary: "Crear un nuevo kit" })
  @ApiResponse({ status: 201, description: "Kit creado", type: KitResponseDto })
  async create(
    @Body() dto: CreateKitDto,
  ): Promise<{ message: string; data: KitResponseDto }> {
    this.logger.log("POST /kits");
    const result = await this.createKitUseCase.execute(dto, "system"); // TODO: Get from auth
    return { message: "Kit creado exitosamente", data: result };
  }

  @Put(":id")
  @ApiOperation({ summary: "Actualizar un kit" })
  @ApiResponse({
    status: 200,
    description: "Kit actualizado",
    type: KitResponseDto,
  })
  @ApiParam({ name: "id", description: "ID del kit" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateKitDto,
  ): Promise<{ message: string; data: KitResponseDto }> {
    this.logger.log(`PUT /kits/${id}`);
    const result = await this.updateKitUseCase.execute(id, dto);
    return { message: "Kit actualizado", data: result };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Eliminar un kit" })
  @ApiResponse({ status: 200, description: "Kit eliminado" })
  @ApiParam({ name: "id", description: "ID del kit" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    this.logger.log(`DELETE /kits/${id}`);
    return this.deleteKitUseCase.execute(id);
  }

  // ========================================================================
  // Item Management
  // ========================================================================

  @Post(":id/items")
  @ApiOperation({ summary: "Agregar item a un kit" })
  @ApiResponse({
    status: 201,
    description: "Item agregado",
    type: KitResponseDto,
  })
  @ApiParam({ name: "id", description: "ID del kit" })
  async addItem(
    @Param("id") id: string,
    @Body() dto: AddItemToKitDto,
  ): Promise<{ message: string; data: KitResponseDto }> {
    this.logger.log(`POST /kits/${id}/items`);
    const result = await this.addItemToKitUseCase.execute(id, dto);
    return { message: "Item agregado al kit", data: result };
  }

  @Delete(":id/items/:itemId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Eliminar item de un kit" })
  @ApiResponse({
    status: 200,
    description: "Item eliminado",
    type: KitResponseDto,
  })
  @ApiParam({ name: "id", description: "ID del kit" })
  @ApiParam({ name: "itemId", description: "ID del item" })
  async removeItem(
    @Param("id") id: string,
    @Param("itemId") itemId: string,
  ): Promise<{ message: string; data: KitResponseDto }> {
    this.logger.log(`DELETE /kits/${id}/items/${itemId}`);
    const result = await this.removeItemFromKitUseCase.execute(id, itemId);
    return { message: "Item eliminado del kit", data: result };
  }

  // ========================================================================
  // State Management
  // ========================================================================

  @Patch(":id/activate")
  @ApiOperation({ summary: "Activar un kit" })
  @ApiResponse({
    status: 200,
    description: "Kit activado",
    type: KitResponseDto,
  })
  @ApiParam({ name: "id", description: "ID del kit" })
  async activate(
    @Param("id") id: string,
  ): Promise<{ message: string; data: KitResponseDto }> {
    this.logger.log(`PATCH /kits/${id}/activate`);
    const result = await this.activateKitUseCase.execute(id);
    return { message: "Kit activado", data: result };
  }

  @Patch(":id/deactivate")
  @ApiOperation({ summary: "Desactivar un kit" })
  @ApiResponse({
    status: 200,
    description: "Kit desactivado",
    type: KitResponseDto,
  })
  @ApiParam({ name: "id", description: "ID del kit" })
  async deactivate(
    @Param("id") id: string,
  ): Promise<{ message: string; data: KitResponseDto }> {
    this.logger.log(`PATCH /kits/${id}/deactivate`);
    const result = await this.deactivateKitUseCase.execute(id);
    return { message: "Kit desactivado", data: result };
  }

  // ========================================================================
  // Legacy Endpoints (Backward Compatibility)
  // ========================================================================

  @Get("predefinidos/all")
  @ApiOperation({ summary: "Obtener kits predefinidos (legacy)" })
  async getPredefinedKits() {
    this.logger.log("GET /kits/predefinidos/all");
    return this.kitsService.getPredefinedKits();
  }

  @Get("predefinidos/:tipo")
  @ApiOperation({ summary: "Obtener kit predefinido por tipo (legacy)" })
  @ApiParam({ name: "tipo", description: "Tipo de kit predefinido" })
  async getPredefinedKit(@Param("tipo") tipo: string) {
    this.logger.log(`GET /kits/predefinidos/${tipo}`);
    return this.kitsService.getPredefinedKit(tipo);
  }

  @Post(":kitId/apply/:ejecucionId")
  @ApiOperation({ summary: "Aplicar kit a ejecución (legacy)" })
  @ApiParam({ name: "kitId", description: "ID del kit" })
  @ApiParam({ name: "ejecucionId", description: "ID de la ejecución" })
  async applyToExecution(
    @Param("kitId") kitId: string,
    @Param("ejecucionId") ejecucionId: string,
  ) {
    this.logger.log(`POST /kits/${kitId}/apply/${ejecucionId}`);
    return this.kitsService.applyKitToExecution(kitId, ejecucionId, "system");
  }

  @Post("predefinidos/:tipo/apply/:ejecucionId")
  @ApiOperation({ summary: "Aplicar kit predefinido a ejecución (legacy)" })
  @ApiParam({ name: "tipo", description: "Tipo de kit predefinido" })
  @ApiParam({ name: "ejecucionId", description: "ID de la ejecución" })
  async applyPredefinedToExecution(
    @Param("tipo") tipo: string,
    @Param("ejecucionId") ejecucionId: string,
  ) {
    this.logger.log(`POST /kits/predefinidos/${tipo}/apply/${ejecucionId}`);
    return this.kitsService.applyPredefinedKitToExecution(
      tipo,
      ejecucionId,
      "system",
    );
  }

  @Post("sync")
  @ApiOperation({ summary: "Sincronizar kits predefinidos a BD (legacy)" })
  async syncPredefinedKits() {
    this.logger.log("POST /kits/sync");
    return this.kitsService.syncPredefinedKits();
  }
}

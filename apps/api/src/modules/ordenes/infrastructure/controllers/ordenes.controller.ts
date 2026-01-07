/**
 * @controller OrdenesController (Refactorizado)
 * @description Controlador de órdenes con Clean Architecture
 * @layer Infrastructure
 */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import {
  CurrentUser,
  JwtPayload,
} from "../../../../common/decorators/current-user.decorator";
import {
  ListOrdenesUseCase,
  GetOrdenByIdUseCase,
  FindOrdenUseCase,
  CreateOrdenUseCase,
  UpdateOrdenUseCase,
  ChangeOrdenEstadoUseCase,
  AsignarTecnicoOrdenUseCase,
  GetHistorialEstadosUseCase,
  DeleteOrdenUseCase,
} from "../../application/use-cases";
import {
  CreateOrdenDto,
  UpdateOrdenDto,
  ChangeEstadoOrdenDto,
  AsignarTecnicoOrdenDto,
  QueryOrdenesDto,
  OrdenResponseDto,
  PaginatedOrdenResponseDto,
  HistorialEstadoDto,
  type OrdenQueryDto,
  type OrdenResponseZod,
  type OrdenDetailResponseZod,
} from "../../application/dto";
import {
  toOrdenEstado,
  toOrdenPrioridad,
  type OrdenEstadoType,
  type OrdenPrioridadType,
} from "../../application/dto/shared-types";
import { OrderStateService } from "../../application/services/order-state.service";

@ApiTags("ordenes")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("ordenes")
export class OrdenesController {
  constructor(
    private readonly createOrden: CreateOrdenUseCase,
    private readonly updateOrden: UpdateOrdenUseCase,
    private readonly findOrden: FindOrdenUseCase,
    private readonly getOrdenById: GetOrdenByIdUseCase,
    private readonly listOrdenes: ListOrdenesUseCase,
    private readonly changeOrdenEstado: ChangeOrdenEstadoUseCase,
    private readonly asignarTecnicoOrden: AsignarTecnicoOrdenUseCase,
    private readonly getHistorialEstados: GetHistorialEstadosUseCase,
    private readonly deleteOrden: DeleteOrdenUseCase,
    private readonly orderStateService: OrderStateService,
  ) { }

  @Post()
  @ApiOperation({
    summary: "Crear nueva orden de trabajo",
    description:
      "Crea una orden con número automático y estado inicial PENDIENTE",
  })
  @ApiResponse({
    status: 201,
    description: "Orden creada exitosamente",
    type: OrdenResponseDto,
  })
  async create(
    @Body() dto: CreateOrdenDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string; data: OrdenResponseZod }> {
    return this.createOrden.execute(dto, user.userId);
  }

  @Get()
  @ApiOperation({
    summary: "Listar órdenes con filtros avanzados",
    description: "Obtiene lista paginada con múltiples filtros y búsqueda",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de órdenes",
    type: PaginatedOrdenResponseDto,
  })
  async findAll(
    @Query() query: QueryOrdenesDto,
  ): Promise<PaginatedOrdenResponseDto> {
    // Convertir ClassValidator enums a tipos compatibles con Zod usando helpers tipados
    const zodQuery: OrdenQueryDto = {
      estado: toOrdenEstado(query.estado),
      cliente: query.cliente,
      prioridad: toOrdenPrioridad(query.prioridad),
      asignadoId: query.asignadoId,
      page: query.page || 1,
      limit: query.limit || 10,
    };

    const result = await this.listOrdenes.execute(zodQuery);
    const totalPages = result.totalPages;
    const page = result.page;

    return {
      data: result.data.map((item) => ({
        ...item,
        // Spread already includes estado and prioridad with correct types
      })) as OrdenResponseDto[],
      total: result.total,
      page,
      limit: result.limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  @Get(":id")
  @ApiOperation({
    summary: "Obtener orden por ID",
    description:
      "Obtiene detalles completos incluyendo relaciones (cliente, técnico)",
  })
  @ApiParam({ name: "id", description: "UUID de la orden" })
  @ApiResponse({
    status: 200,
    description: "Orden encontrada",
    type: OrdenResponseDto,
  })
  @ApiResponse({ status: 404, description: "Orden no encontrada" })
  async findOne(@Param("id") id: string): Promise<OrdenDetailResponseZod> {
    return this.getOrdenById.execute(id);
  }

  @Get(":id/historial")
  @ApiOperation({
    summary: "Obtener historial de cambios de estado",
    description: "Lista todos los cambios de estado con motivos y timestamps",
  })
  @ApiParam({ name: "id", description: "UUID de la orden" })
  @ApiResponse({
    status: 200,
    description: "Historial de estados",
    type: [HistorialEstadoDto],
  })
  async getHistorial(@Param("id") id: string): Promise<HistorialEstadoDto[]> {
    return this.getHistorialEstados.execute(id);
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Actualizar orden de trabajo",
    description: "Actualiza campos generales (no incluye cambio de estado)",
  })
  @ApiParam({ name: "id", description: "UUID de la orden" })
  @ApiResponse({
    status: 200,
    description: "Orden actualizada",
    type: OrdenResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateOrdenDto,
  ): Promise<{ message: string; data: OrdenResponseZod }> {
    return this.updateOrden.execute(id, dto);
  }

  @Post(":id/cambiar-estado")
  @ApiOperation({
    summary: "Cambiar estado de la orden",
    description:
      "Cambia el estado con validación de transiciones y registro en historial",
  })
  @ApiParam({ name: "id", description: "UUID de la orden" })
  @ApiResponse({
    status: 200,
    description: "Estado cambiado exitosamente",
    type: OrdenResponseDto,
  })
  @ApiResponse({ status: 400, description: "Transición de estado inválida" })
  async cambiarEstado(
    @Param("id") id: string,
    @Body() dto: ChangeEstadoOrdenDto,
  ): Promise<OrdenResponseDto> {
    return this.changeOrdenEstado.execute(id, dto);
  }

  @Post(":id/asignar-tecnico")
  @ApiOperation({
    summary: "Asignar técnico a la orden",
    description:
      "Asigna técnico y cambia estado a EJECUCION automáticamente si estaba en PLANEACION",
  })
  @ApiParam({ name: "id", description: "UUID de la orden" })
  @ApiResponse({
    status: 200,
    description: "Técnico asignado exitosamente",
    type: OrdenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Orden no puede ser asignada en su estado actual",
  })
  async asignarTecnico(
    @Param("id") id: string,
    @Body() dto: AsignarTecnicoOrdenDto,
  ): Promise<OrdenResponseDto> {
    return this.asignarTecnicoOrden.execute(id, dto);
  }

  @Get(":id/state")
  @ApiOperation({
    summary: "Obtener estado detallado de la orden (flujo 14 pasos)",
    description:
      "Obtiene información del estado detallado usando OrderStateService",
  })
  @ApiParam({ name: "id", description: "UUID de la orden" })
  async getState(@Param("id") id: string) {
    return this.orderStateService.getStateInfo(id);
  }

  @Get(":id/state/history")
  @ApiOperation({
    summary: "Obtener historial de cambios de sub-estado de la orden",
    description:
      "Obtiene historial de sub-estados (OrderSubState) usando OrderStateService",
  })
  @ApiParam({ name: "id", description: "UUID de la orden" })
  async getStateHistory(@Param("id") id: string) {
    return this.orderStateService.getStateHistory(id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Eliminar orden de trabajo",
    description: "Soft delete recomendado en producción",
  })
  @ApiParam({ name: "id", description: "UUID de la orden" })
  @ApiResponse({ status: 204, description: "Orden eliminada" })
  @ApiResponse({ status: 404, description: "Orden no encontrada" })
  async remove(@Param("id") id: string): Promise<void> {
    await this.deleteOrden.execute(id);
  }
}

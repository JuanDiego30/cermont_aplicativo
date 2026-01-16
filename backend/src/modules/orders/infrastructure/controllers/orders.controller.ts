/**
 * @controller OrdersController (Refactorizado)
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
import { JwtAuthGuard } from "../../../../shared/guards/jwt-auth.guard";
import {
  CurrentUser,
  JwtPayload,
} from "../../../../shared/decorators/current-user.decorator";
import {
  ListOrdersUseCase,
  GetOrderByIdUseCase,
  FindOrderUseCase,
  CreateOrderUseCase,
  UpdateOrderUseCase,
  ChangeOrderstadoUseCase,
  AsignarTecnicoOrderUseCase,
  GetHistorialEstadosUseCase,
  DeleteOrderUseCase,
} from "../../application/use-cases";
import {
  CreateOrderDto,
  UpdateOrderDto,
  ChangeEstadoOrderDto,
  AsignarTecnicoOrderDto,
  QueryOrdersDto,
  OrderResponseDto,
  PaginatedOrderResponseDto,
  HistorialEstadoDto,
  type OrderQueryDto,
  type OrderResponseZod,
  type OrderDetailResponseZod,
} from "../../application/dto";
import { OrderStateService } from "../../application/services/order-state.service";

@ApiTags("Orders")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("Orders")
export class OrdersController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly updateOrder: UpdateOrderUseCase,
    private readonly findOrder: FindOrderUseCase,
    private readonly getOrderById: GetOrderByIdUseCase,
    private readonly listOrders: ListOrdersUseCase,
    private readonly changeOrderstado: ChangeOrderstadoUseCase,
    private readonly asignarTecnicoOrder: AsignarTecnicoOrderUseCase,
    private readonly getHistorialEstados: GetHistorialEstadosUseCase,
    private readonly deleteOrder: DeleteOrderUseCase,
    private readonly orderStateService: OrderStateService,
  ) {}

  @Post()
  @ApiOperation({
    summary: "Crear nueva Order de trabajo",
    description:
      "Crea una Order con número automático y estado inicial PENDIENTE",
  })
  @ApiResponse({
    status: 201,
    description: "Order creada exitosamente",
    type: OrderResponseDto,
  })
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string; data: OrderResponseZod }> {
    return this.createOrder.execute(dto, user.userId);
  }

  @Get()
  @ApiOperation({
    summary: "Listar órdenes con filtros avanzados",
    description: "Obtiene lista paginada con múltiples filtros y búsqueda",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de órdenes",
    type: PaginatedOrderResponseDto,
  })
  async findAll(
    @Query() query: QueryOrdersDto,
  ): Promise<PaginatedOrderResponseDto> {
    // Mantener compatibilidad: ListOrdersUseCase usa DTO Zod (OrderQueryDto)
    const zodQuery: OrderQueryDto = {
      estado: query.estado
        ? (query.estado as unknown as OrderQueryDto["estado"])
        : undefined,
      cliente: query.cliente,
      prioridad: query.prioridad
        ? (query.prioridad as unknown as OrderQueryDto["prioridad"])
        : undefined,
      asignadoId: query.asignadoId,
      page: query.page || 1,
      limit: query.limit || 10,
    };

    const result = await this.listOrders.execute(zodQuery);
    const totalPages = result.totalPages;
    const page = result.page;

    return {
      data: result.data.map((item) => ({
        ...item,
        estado: item.estado as unknown as OrderResponseDto["estado"],
        prioridad: item.prioridad as unknown as OrderResponseDto["prioridad"],
      })),
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
    summary: "Obtener Order por ID",
    description:
      "Obtiene detalles completos incluyendo relaciones (cliente, técnico)",
  })
  @ApiParam({ name: "id", description: "UUID de la Order" })
  @ApiResponse({
    status: 200,
    description: "Order encontrada",
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: "Order no encontrada" })
  async findOne(@Param("id") id: string): Promise<OrderDetailResponseZod> {
    return this.getOrderById.execute(id);
  }

  @Get(":id/historial")
  @ApiOperation({
    summary: "Obtener historial de cambios de estado",
    description: "Lista todos los cambios de estado con motivos y timestamps",
  })
  @ApiParam({ name: "id", description: "UUID de la Order" })
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
    summary: "Actualizar Order de trabajo",
    description: "Actualiza campos generales (no incluye cambio de estado)",
  })
  @ApiParam({ name: "id", description: "UUID de la Order" })
  @ApiResponse({
    status: 200,
    description: "Order actualizada",
    type: OrderResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateOrderDto,
  ): Promise<{ message: string; data: OrderResponseZod }> {
    return this.updateOrder.execute(id, dto);
  }

  @Post(":id/cambiar-estado")
  @ApiOperation({
    summary: "Cambiar estado de la Order",
    description:
      "Cambia el estado con validación de transiciones y registro en historial",
  })
  @ApiParam({ name: "id", description: "UUID de la Order" })
  @ApiResponse({
    status: 200,
    description: "Estado cambiado exitosamente",
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: "Transición de estado inválida" })
  async cambiarEstado(
    @Param("id") id: string,
    @Body() dto: ChangeEstadoOrderDto,
  ): Promise<OrderResponseDto> {
    return this.changeOrderstado.execute(id, dto);
  }

  @Post(":id/asignar-tecnico")
  @ApiOperation({
    summary: "Asignar técnico a la Order",
    description:
      "Asigna técnico y cambia estado a EJECUCION automáticamente si estaba en PLANEACION",
  })
  @ApiParam({ name: "id", description: "UUID de la Order" })
  @ApiResponse({
    status: 200,
    description: "Técnico asignado exitosamente",
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Order no puede ser asignada en su estado actual",
  })
  async asignarTecnico(
    @Param("id") id: string,
    @Body() dto: AsignarTecnicoOrderDto,
  ): Promise<OrderResponseDto> {
    return this.asignarTecnicoOrder.execute(id, dto);
  }

  @Get(":id/state")
  @ApiOperation({
    summary: "Obtener estado detallado de la Order (flujo 14 pasos)",
    description:
      "Obtiene información del estado detallado usando OrderStateService",
  })
  @ApiParam({ name: "id", description: "UUID de la Order" })
  async getState(@Param("id") id: string) {
    return this.orderStateService.getStateInfo(id);
  }

  @Get(":id/state/history")
  @ApiOperation({
    summary: "Obtener historial de cambios de sub-estado de la Order",
    description:
      "Obtiene historial de sub-estados (OrderSubState) usando OrderStateService",
  })
  @ApiParam({ name: "id", description: "UUID de la Order" })
  async getStateHistory(@Param("id") id: string) {
    return this.orderStateService.getStateHistory(id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Eliminar Order de trabajo",
    description: "Soft delete recomendado en producción",
  })
  @ApiParam({ name: "id", description: "UUID de la Order" })
  @ApiResponse({ status: 204, description: "Order eliminada" })
  @ApiResponse({ status: 404, description: "Order no encontrada" })
  async remove(@Param("id") id: string): Promise<void> {
    await this.deleteOrder.execute(id);
  }
}


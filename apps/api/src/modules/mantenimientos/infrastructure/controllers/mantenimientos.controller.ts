/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MANTENIMIENTOS CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Controlador REST para gestión de mantenimientos.
 * Endpoints alineados 1:1 con el frontend MantenimientosApi.
 *
 * ═══════════════════════════════════════════════════════════════════════════
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
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  Inject,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../common/guards/roles.guard";
import { Roles } from "../../../../common/decorators/roles.decorator";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { UserRole } from "../../../../common/enums/user-role.enum";
import {
  CreateMantenimientoDto,
  UpdateMantenimientoDto,
  QueryMantenimientosDto,
  EjecutarMantenimientoDto,
  ProgramarMantenimientoDto,
} from "../../dto";
import {
  IMantenimientoRepository,
  MANTENIMIENTO_REPOSITORY,
} from "../../domain/repositories/mantenimiento.repository.interface";

interface AuthenticatedUser {
  id: string;
  email: string;
  rol: UserRole;
}

@ApiTags("Mantenimientos")
@ApiBearerAuth()
@Controller("mantenimientos")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MantenimientosController {
  constructor(
    @Inject(MANTENIMIENTO_REPOSITORY)
    private readonly repository: IMantenimientoRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: "Listar mantenimientos con filtros y paginación" })
  @ApiResponse({ status: 200, description: "Lista paginada de mantenimientos" })
  async list(@Query() query: QueryMantenimientosDto) {
    return this.repository.findMany({
      ...query,
      fechaDesde: query.fechaDesde ? new Date(query.fechaDesde) : undefined,
      fechaHasta: query.fechaHasta ? new Date(query.fechaHasta) : undefined,
    });
  }

  @Get("proximos")
  @ApiOperation({ summary: "Obtener mantenimientos próximos a vencer" })
  @ApiQuery({ name: "dias", required: false, type: Number, description: "Días a futuro (default: 7)" })
  @ApiResponse({ status: 200, description: "Lista de mantenimientos próximos" })
  async getProximos(@Query("dias") dias?: number) {
    return this.repository.findProximos(dias ?? 7);
  }

  @Get("vencidos")
  @ApiOperation({ summary: "Obtener mantenimientos vencidos" })
  @ApiResponse({ status: 200, description: "Lista de mantenimientos vencidos" })
  async getVencidos() {
    return this.repository.findVencidos();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener mantenimiento por ID" })
  @ApiParam({ name: "id", type: String, description: "UUID del mantenimiento" })
  @ApiResponse({ status: 200, description: "Mantenimiento encontrado" })
  @ApiResponse({ status: 404, description: "Mantenimiento no encontrado" })
  async getById(@Param("id", ParseUUIDPipe) id: string) {
    const mantenimiento = await this.repository.findById(id);
    if (!mantenimiento) {
      return { statusCode: 404, message: "Mantenimiento no encontrado" };
    }
    return mantenimiento;
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.TECNICO)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Crear nuevo mantenimiento" })
  @ApiResponse({ status: 201, description: "Mantenimiento creado exitosamente" })
  async create(
    @Body() dto: CreateMantenimientoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.repository.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      tipo: dto.tipo,
      prioridad: dto.prioridad,
      fechaProgramada: new Date(dto.fechaProgramada),
      duracionEstimada: dto.duracionEstimada,
      activoId: dto.activoId,
      activoTipo: dto.activoTipo,
      tecnicoId: dto.tecnicoId,
      tareas: dto.tareas,
      materiales: dto.materiales,
      creadoPorId: user.id,
    });
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.TECNICO)
  @ApiOperation({ summary: "Actualizar mantenimiento" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Mantenimiento actualizado" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateMantenimientoDto,
  ) {
    return this.repository.update(id, {
      ...dto,
      fechaProgramada: dto.fechaProgramada
        ? new Date(dto.fechaProgramada)
        : undefined,
    });
  }

  @Post(":id/ejecutar")
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.TECNICO)
  @ApiOperation({ summary: "Marcar mantenimiento como ejecutado/completado" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Mantenimiento ejecutado" })
  async ejecutar(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: EjecutarMantenimientoDto,
  ) {
    return this.repository.ejecutar(id, {
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
      fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
      trabajoRealizado: dto.trabajoRealizado,
      tareasCompletadas: dto.tareasCompletadas,
      problemasEncontrados: dto.problemasEncontrados,
      repuestosUtilizados: dto.repuestosUtilizados,
      observaciones: dto.observaciones,
      costoTotal: dto.costoTotal,
      calificacionFinal: dto.calificacionFinal,
      requiereSeguimiento: dto.requiereSeguimiento,
      recomendaciones: dto.recomendaciones,
      evidenciaIds: dto.evidenciaIds,
    });
  }

  @Post(":id/programar")
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: "Reprogramar mantenimiento" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Mantenimiento reprogramado" })
  async programar(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ProgramarMantenimientoDto,
  ) {
    return this.repository.programar(
      id,
      new Date(dto.fechaProgramada),
      dto.tecnicoId,
      dto.observaciones,
    );
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar mantenimiento" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 204, description: "Mantenimiento eliminado" })
  async delete(@Param("id", ParseUUIDPipe) id: string) {
    await this.repository.delete(id);
  }
}

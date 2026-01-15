/**
 * @controller EjecucionController
 * @description Controlador unificado de ejecución
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiBody, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../common/guards/roles.guard";
import { Roles } from "../../../../common/decorators/roles.decorator";
import {
  CurrentUser,
  JwtPayload,
} from "../../../../common/decorators/current-user.decorator";
import {
  IniciarEjecucionDto,
  UpdateAvanceDto,
  CompletarEjecucionDto,
} from "../../application/dto";
import {
  GetEjecucionUseCase,
  IniciarEjecucionUseCase,
  UpdateAvanceUseCase,
  CompletarEjecucionUseCase,
  GetMisEjecucionesUseCase,
} from "../../application/use-cases";

@ApiTags("Ejecucion")
@Controller("ejecucion")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EjecucionController {
  constructor(
    private readonly getEjecucion: GetEjecucionUseCase,
    private readonly iniciarEjecucion: IniciarEjecucionUseCase,
    private readonly updateAvance: UpdateAvanceUseCase,
    private readonly completarEjecucion: CompletarEjecucionUseCase,
    private readonly getMisEjecuciones: GetMisEjecucionesUseCase,
  ) {}

  // =====================================================
  // ENDPOINTS DDD (Use Cases)
  // =====================================================

  @Get("orden/:ordenId")
  @ApiOperation({ summary: "Obtener ejecución por orden" })
  @ApiParam({ name: "ordenId", description: "UUID de la orden" })
  @ApiResponse({ status: 200, description: "Ejecución encontrada" })
  @ApiResponse({ status: 404, description: "Ejecución no encontrada" })
  async findByOrden(@Param("ordenId", ParseUUIDPipe) ordenId: string) {
    const result = await this.getEjecucion.execute(ordenId);
    if (!result) throw new NotFoundException("Ejecución no encontrada");
    return result;
  }

  // =====================================================
  // ENDPOINTS ADICIONALES (Servicio directo)
  // =====================================================

  @Get("mis-ejecuciones")
  @ApiOperation({ summary: "Obtener ejecuciones del técnico actual" })
  @ApiResponse({ status: 200, description: "Lista de ejecuciones" })
  findMine(@CurrentUser() user: JwtPayload) {
    return this.getMisEjecuciones.execute(user.userId);
  }

  @Post("orden/:ordenId/iniciar")
  @Roles("admin", "supervisor", "tecnico")
  @ApiOperation({ summary: "Iniciar ejecución de orden" })
  @ApiParam({ name: "ordenId", description: "UUID de la orden" })
  @ApiBody({ type: IniciarEjecucionDto })
  @ApiResponse({ status: 201, description: "Ejecución iniciada" })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  async iniciar(
    @Param("ordenId", ParseUUIDPipe) ordenId: string,
    @Body() dto: IniciarEjecucionDto,
  ) {
    return this.iniciarEjecucion.execute(
      ordenId,
      dto.tecnicoId,
      dto.observaciones,
    );
  }

  @Put(":id/avance")
  @Roles("admin", "supervisor", "tecnico")
  @ApiOperation({ summary: "Actualizar avance de ejecución" })
  @ApiParam({ name: "id", description: "UUID de la ejecución" })
  @ApiBody({ type: UpdateAvanceDto })
  @ApiResponse({ status: 200, description: "Avance actualizado" })
  async avance(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateAvanceDto,
  ) {
    return this.updateAvance.execute(
      id,
      dto.avance,
      dto.observaciones ?? "",
    );
  }

  @Put(":id/completar")
  @Roles("admin", "supervisor", "tecnico")
  @ApiOperation({ summary: "Completar ejecución" })
  @ApiParam({ name: "id", description: "UUID de la ejecución" })
  @ApiBody({ type: CompletarEjecucionDto })
  @ApiResponse({ status: 200, description: "Ejecución completada" })
  async completar(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CompletarEjecucionDto,
  ) {
    return this.completarEjecucion.execute(id, dto);
  }
}

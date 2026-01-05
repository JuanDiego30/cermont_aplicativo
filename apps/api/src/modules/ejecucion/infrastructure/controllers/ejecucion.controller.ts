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
  BadRequestException,
  NotFoundException,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../common/guards/roles.guard";
import { Roles } from "../../../../common/decorators/roles.decorator";
import {
  CurrentUser,
  JwtPayload,
} from "../../../../common/decorators/current-user.decorator";
import {
  IniciarEjecucionSchema,
  UpdateAvanceSchema,
  CompletarEjecucionSchema,
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
  async findByOrden(@Param("ordenId") ordenId: string) {
    const result = await this.getEjecucion.execute(ordenId);
    if (!result) throw new NotFoundException("Ejecución no encontrada");
    return result;
  }

  // =====================================================
  // ENDPOINTS ADICIONALES (Servicio directo)
  // =====================================================

  @Get("mis-ejecuciones")
  @ApiOperation({ summary: "Obtener ejecuciones del técnico actual" })
  findMine(@CurrentUser() user: JwtPayload) {
    return this.getMisEjecuciones.execute(user.userId);
  }

  @Post("orden/:ordenId/iniciar")
  @Roles("admin", "supervisor", "tecnico")
  @ApiOperation({ summary: "Iniciar ejecución de orden" })
  async iniciar(@Param("ordenId") ordenId: string, @Body() body: unknown) {
    const result = IniciarEjecucionSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.iniciarEjecucion.execute(
      ordenId,
      result.data.tecnicoId,
      result.data.observaciones,
    );
  }

  @Put(":id/avance")
  @Roles("admin", "supervisor", "tecnico")
  @ApiOperation({ summary: "Actualizar avance de ejecución" })
  async avance(@Param("id") id: string, @Body() body: unknown) {
    const result = UpdateAvanceSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.updateAvance.execute(
      id,
      result.data.avance,
      result.data.observaciones ?? "",
    );
  }

  @Put(":id/completar")
  @Roles("admin", "supervisor", "tecnico")
  @ApiOperation({ summary: "Completar ejecución" })
  async completar(@Param("id") id: string, @Body() body: unknown) {
    const result = CompletarEjecucionSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.completarEjecucion.execute(id, result.data);
  }
}

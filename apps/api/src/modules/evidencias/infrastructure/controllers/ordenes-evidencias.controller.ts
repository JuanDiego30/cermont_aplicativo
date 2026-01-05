import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import {
  CurrentUser,
  JwtPayload,
} from "../../../../common/decorators/current-user.decorator";
import { ListEvidenciasUseCase } from "../../application/use-cases";
import {
  ORDEN_REPOSITORY,
  IOrdenRepository,
} from "../../../ordenes/domain/repositories";
import { Inject } from "@nestjs/common";

@ApiTags("Ordenes")
@Controller("ordenes")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdenesEvidenciasController {
  constructor(
    private readonly listEvidenciasUseCase: ListEvidenciasUseCase,
    @Inject(ORDEN_REPOSITORY)
    private readonly ordenRepository: IOrdenRepository,
  ) {}

  /**
   * Regla 29: Galería en orden
   */
  @Get(":ordenId/evidencias")
  @ApiOperation({ summary: "List evidencias for an orden (gallery)" })
  async listByOrden(
    @Param("ordenId") ordenId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    const orden = await this.ordenRepository.findById(ordenId);
    if (!orden) {
      throw new NotFoundException("Orden no encontrada");
    }

    const role = user?.role?.toLowerCase();
    const isPrivileged = role === "admin" || role === "supervisor";
    const canAccess =
      isPrivileged ||
      orden.creadorId === user?.userId ||
      orden.asignadoId === user?.userId;
    if (!canAccess) {
      throw new ForbiddenException("No autorizado");
    }

    return this.listEvidenciasUseCase.execute({
      ordenId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }
}

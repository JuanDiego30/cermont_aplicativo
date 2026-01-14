/**
 * @controller TecnicosController
 * @description REST API for Technicians following Clean Architecture
 * @layer Infrastructure
 */
import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";

// Use Cases
import {
  ListTecnicosUseCase,
  GetTecnicoByIdUseCase,
  ChangeDisponibilidadUseCase,
  FindAvailableTecnicosUseCase,
} from "../../application/use-cases";
import { DisponibilidadLevel } from "../../domain/value-objects";

@ApiTags("Tecnicos")
@Controller("tecnicos")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TecnicosController {
  constructor(
    private readonly listTecnicosUseCase: ListTecnicosUseCase,
    private readonly getTecnicoByIdUseCase: GetTecnicoByIdUseCase,
    private readonly changeDisponibilidadUseCase: ChangeDisponibilidadUseCase,
    private readonly findAvailableTecnicosUseCase: FindAvailableTecnicosUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: "Listar todos los técnicos" })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "active", required: false, type: Boolean })
  async findAll(
    @Query("search") search?: string,
    @Query("active") active?: boolean,
  ) {
    return this.listTecnicosUseCase.execute({ search, active });
  }

  @Get("disponibles")
  @ApiOperation({ summary: "Listar técnicos disponibles para asignación" })
  async findAvailable() {
    const data = await this.findAvailableTecnicosUseCase.execute();
    return { data, total: data.length };
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener detalle de un técnico" })
  async findOne(@Param("id") id: string) {
    return this.getTecnicoByIdUseCase.execute(id);
  }

  @Patch(":id/disponibilidad")
  @ApiOperation({ summary: "Cambiar disponibilidad del técnico" })
  async changeDisponibilidad(
    @Param("id") id: string,
    @Body() body: { disponibilidad: DisponibilidadLevel },
  ) {
    return this.changeDisponibilidadUseCase.execute(id, body.disponibilidad);
  }
}

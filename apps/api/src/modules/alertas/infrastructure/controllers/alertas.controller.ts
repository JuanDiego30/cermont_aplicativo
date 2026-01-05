/**
 * @controller AlertasController
 *
 * Controller HTTP para gestión de alertas
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
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
import {
  CurrentUser,
  JwtPayload,
} from "../../../../common/decorators/current-user.decorator";
import { EnviarAlertaUseCase } from "../../application/use-cases/enviar-alerta.use-case";
import { ObtenerHistorialAlertasUseCase } from "../../application/use-cases/obtener-historial-alertas.use-case";
import { MarcarComoLeidaUseCase } from "../../application/use-cases/marcar-como-leida.use-case";
import {
  EnviarAlertaDto,
  AlertaResponseDto,
  HistorialQueryDto,
  PaginatedAlertasResponseDto,
} from "../../application/dto";

@ApiTags("alertas")
@Controller("alertas")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertasController {
  constructor(
    private readonly enviarAlertaUseCase: EnviarAlertaUseCase,
    private readonly obtenerHistorialUseCase: ObtenerHistorialAlertasUseCase,
    private readonly marcarComoLeidaUseCase: MarcarComoLeidaUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: "Enviar una alerta a un usuario" })
  @ApiOkResponse({
    type: AlertaResponseDto,
    description: "Alerta creada exitosamente",
  })
  @ApiBadRequestResponse({ description: "Datos inválidos" })
  @ApiUnauthorizedResponse({ description: "No autorizado" })
  async enviarAlerta(
    @Body() dto: EnviarAlertaDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<AlertaResponseDto> {
    return await this.enviarAlertaUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: "Obtener historial de alertas del usuario actual" })
  @ApiOkResponse({ type: PaginatedAlertasResponseDto })
  @ApiUnauthorizedResponse({ description: "No autorizado" })
  async obtenerHistorial(
    @Query() query: HistorialQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedAlertasResponseDto> {
    return await this.obtenerHistorialUseCase.execute(user.userId, query);
  }

  @Get("pendientes")
  @ApiOperation({ summary: "Obtener alertas pendientes del usuario actual" })
  @ApiOkResponse({ type: [AlertaResponseDto] })
  @ApiUnauthorizedResponse({ description: "No autorizado" })
  async obtenerPendientes(
    @CurrentUser() user: JwtPayload,
  ): Promise<AlertaResponseDto[]> {
    // TODO: Implementar use case para obtener pendientes
    const result = await this.obtenerHistorialUseCase.execute(user.userId, {
      soloNoLeidas: true,
      limit: 50,
    });
    return result.items;
  }

  @Get("pendientes/badge")
  @ApiOperation({ summary: "Obtener count de alertas no leídas (para badge)" })
  @ApiOkResponse({
    schema: { type: "object", properties: { count: { type: "number" } } },
  })
  @ApiUnauthorizedResponse({ description: "No autorizado" })
  async obtenerBadge(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ count: number }> {
    const result = await this.obtenerHistorialUseCase.execute(user.userId, {
      soloNoLeidas: true,
      limit: 1,
    });
    return { count: result.total };
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener alerta específica por ID" })
  @ApiOkResponse({ type: AlertaResponseDto })
  @ApiNotFoundResponse({ description: "Alerta no encontrada" })
  @ApiUnauthorizedResponse({ description: "No autorizado" })
  async obtenerAlerta(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<AlertaResponseDto> {
    // TODO: Implementar use case para obtener por ID
    const result = await this.obtenerHistorialUseCase.execute(user.userId, {
      limit: 1,
    });
    const alerta = result.items.find((a) => a.id === id);
    if (!alerta) {
      throw new Error("Alerta no encontrada");
    }
    return alerta;
  }

  @Patch(":id/leida")
  @HttpCode(204)
  @ApiOperation({ summary: "Marcar alerta como leída" })
  @ApiOkResponse({ description: "Alerta marcada como leída" })
  @ApiNotFoundResponse({ description: "Alerta no encontrada" })
  @ApiUnauthorizedResponse({ description: "No autorizado" })
  async marcarComoLeida(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.marcarComoLeidaUseCase.execute(id, user.userId);
  }
}

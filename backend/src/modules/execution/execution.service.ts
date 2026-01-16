/**
 * Service: EjecucionService
 * NOTE: This service is deprecated. Use Use Cases instead.
 */
import {
    BadRequestException,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Ejecucion } from "./domain/entities";
import {
    EJECUCION_REPOSITORY,
    IEjecucionRepository,
} from "./domain/repositories";
import {
    EjecucionId,
    GeoLocation,
    ProgressPercentage,
} from "./domain/value-objects";

// ============================================================================
// Interfaces y DTOs (Legacy)
// ============================================================================

interface IniciarEjecucionDto {
  horasEstimadas?: number;
  observaciones?: string;
  latitude?: number;
  longitude?: number;
}

interface UpdateAvanceDto {
  avance: number;
  horasActuales?: number;
  observaciones?: string;
  tecnicoId?: string;
}

interface CompletarEjecucionDto {
  horasActuales: number;
  observaciones?: string;
  completadoPorId?: string;
}

export interface EjecucionResponse<T> {
  message: string;
  data: T;
}

// ============================================================================
// Service (DEPRECATED)
// ============================================================================

/**
 * @deprecated Use Use Cases instead
 */
@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  constructor(
    @Inject(EJECUCION_REPOSITORY)
    private readonly repository: IEjecucionRepository,
    private readonly prisma: PrismaService,
  ) {
    this.logger.log(
      "ℹ️  EjecucionService: Consider migrating to Use Cases pattern.",
    );
  }

  /**
   * Busca ejecución por orden
   * @deprecated Use GetEjecucionUseCase instead
   */
  async findByOrden(ordenId: string) {
    return this.repository.findByOrdenId(ordenId);
  }

  /**
   * Busca ejecuciones asignadas a un usuario
   */
  async findForUser(userId: string) {
    return this.repository.findByTecnico(userId);
  }

  /**
   * Inicia la ejecución de una orden
   * @deprecated Use IniciarEjecucionUseCase instead
   */
  async iniciar(
    ordenId: string,
    dto: IniciarEjecucionDto,
    tecnicoId?: string,
  ): Promise<EjecucionResponse<unknown>> {
    if (!tecnicoId) {
      throw new BadRequestException(
        "Se requiere ID del técnico para iniciar ejecución",
      );
    }

    // Check if execution already exists
    const existing = await this.repository.exists(ordenId);
    if (existing) {
      throw new BadRequestException("Ya existe una ejecución para esta orden");
    }

    // Get planeacion
    const planeacion = await this.prisma.planeacion.findUnique({
      where: { ordenId },
    });

    if (!planeacion || planeacion.estado !== "aprobada") {
      throw new BadRequestException(
        "No existe planeación aprobada para esta orden",
      );
    }

    // Create domain entity
    const ejecucion = Ejecucion.create({
      ordenId,
      planeacionId: planeacion.id,
      horasEstimadas: dto.horasEstimadas || 8,
    });

    // Start with location if provided
    const location =
      dto.latitude && dto.longitude
        ? GeoLocation.create({
            latitude: dto.latitude,
            longitude: dto.longitude,
          })
        : undefined;

    ejecucion.start(tecnicoId, location, dto.observaciones);

    // Save
    const saved = await this.repository.save(ejecucion);

    // Update order
    await this.prisma.order.update({
      where: { id: ordenId },
      data: { estado: "ejecucion", fechaInicio: new Date() },
    });

    return {
      message: "Ejecución iniciada exitosamente",
      data: this.toResponseData(saved),
    };
  }

  /**
   * Actualiza el avance de una ejecución
   * @deprecated Use UpdateAvanceUseCase instead
   */
  async updateAvance(
    id: string,
    dto: UpdateAvanceDto,
  ): Promise<EjecucionResponse<unknown>> {
    const ejecucion = await this.repository.findById(EjecucionId.create(id));
    if (!ejecucion) {
      throw new NotFoundException(`Ejecución ${id} no encontrada`);
    }

    const newProgress = ProgressPercentage.fromValue(dto.avance);
    ejecucion.updateProgress(
      newProgress,
      dto.tecnicoId || "",
      dto.observaciones,
    );

    const saved = await this.repository.save(ejecucion);

    return {
      message: "Avance actualizado",
      data: this.toResponseData(saved),
    };
  }

  /**
   * Completa una ejecución
   * @deprecated Use CompletarEjecucionUseCase instead
   */
  async completar(
    id: string,
    dto: CompletarEjecucionDto,
  ): Promise<EjecucionResponse<unknown>> {
    const ejecucion = await this.repository.findById(EjecucionId.create(id));
    if (!ejecucion) {
      throw new NotFoundException(`Ejecución ${id} no encontrada`);
    }

    // Force progress to 100% if not already
    if (!ejecucion.getProgress().isComplete()) {
      ejecucion.updateProgress(
        ProgressPercentage.complete(),
        dto.completadoPorId || "",
        "Completando ejecución",
      );
    }

    ejecucion.complete(dto.completadoPorId || "", dto.observaciones);

    const saved = await this.repository.save(ejecucion);

    // Update order
    await this.prisma.order.update({
      where: { id: saved.getOrdenId() },
      data: { estado: "completada", fechaFin: new Date() },
    });

    return {
      message: "Ejecución completada exitosamente",
      data: this.toResponseData(saved),
    };
  }

  private toResponseData(e: Ejecucion): Record<string, unknown> {
    return {
      id: e.getId().getValue(),
      ordenId: e.getOrdenId(),
      tecnicoId: e.getStartedBy() || "",
      estado: e.getStatus().getValue(),
      avance: e.getProgress().getValue(),
      horasReales: e.getTotalWorkedTime().getTotalHours(),
      fechaInicio: e.getStartedAt()?.toISOString(),
      fechaFin: e.getCompletedAt()?.toISOString(),
      observaciones: e.getObservaciones(),
    };
  }
}

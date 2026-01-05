/**
 * @useCase AsignarTecnicoOrdenUseCase
 * @description Caso de uso para asignar un técnico a una orden
 * @layer Application
 */
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AsignarTecnicoOrdenDto } from "../dto/asignar-tecnico-orden.dto";
import {
  OrdenResponseDto,
  OrdenEstado,
  OrdenPrioridad,
} from "../dto/orden-response.dto";
import { OrdenAsignadaEvent } from "../../domain/events/orden-asignada.event";
import { OrdenEstadoChangedEvent } from "../../domain/events/orden-estado-changed.event";
import { EstadoOrden } from "../../domain/value-objects";
import {
  IOrdenRepository,
  ORDEN_REPOSITORY,
} from "../../domain/repositories/orden.repository.interface";
import { toOrdenResponseDto } from "../mappers/orden-response.mapper";

@Injectable()
export class AsignarTecnicoOrdenUseCase {
  private readonly logger = new Logger(AsignarTecnicoOrdenUseCase.name);

  constructor(
    @Inject(ORDEN_REPOSITORY)
    private readonly repository: IOrdenRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    ordenId: string,
    dto: AsignarTecnicoOrdenDto,
  ): Promise<OrdenResponseDto> {
    try {
      this.logger.log(`Asignando técnico ${dto.tecnicoId} a orden ${ordenId}`);

      const orden = await this.repository.findById(ordenId);
      if (!orden) {
        throw new NotFoundException(`Orden no encontrada: ${ordenId}`);
      }

      // Validar que la orden puede ser asignada
      const estadoActual = orden.estado.value;
      if (estadoActual === "completada" || estadoActual === "cancelada") {
        throw new BadRequestException(
          `No se puede asignar técnico a una orden en estado: ${estadoActual}`,
        );
      }

      const estadoAnterior = estadoActual;
      const nuevoEstado: EstadoOrden = "ejecucion";

      // Actualizar orden - asignar técnico
      orden.asignarTecnico(dto.tecnicoId);

      // Si estaba en planeacion, cambiar a ejecucion (esto establece fechaInicio automáticamente)
      if (estadoAnterior === "planeacion") {
        orden.changeEstado(nuevoEstado);
      }

      // Persistir cambios
      const updated = await this.repository.update(orden);

      this.logger.log(`Técnico asignado exitosamente a orden ${ordenId}`);

      // Emitir eventos
      const eventoAsignacion = new OrdenAsignadaEvent(
        ordenId,
        orden.numero.value,
        dto.tecnicoId,
        dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
        dto.instrucciones,
        dto.motivoAsignacion,
      );
      this.eventEmitter.emit("orden.asignada", eventoAsignacion);

      if (estadoAnterior !== nuevoEstado && estadoAnterior === "planeacion") {
        const eventoCambioEstado = new OrdenEstadoChangedEvent(
          ordenId,
          orden.numero.value,
          estadoAnterior,
          nuevoEstado,
          dto.motivoAsignacion || "Técnico asignado a la orden",
          undefined,
          dto.instrucciones,
        );
        this.eventEmitter.emit("orden.estado.changed", eventoCambioEstado);
      }

      return toOrdenResponseDto(updated);
    } catch (error) {
      this.logger.error("Error asignando técnico a orden", error);
      throw error;
    }
  }
}

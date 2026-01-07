/**
 * @useCase GetHistorialEstadosUseCase
 * @description Caso de uso para obtener el historial de cambios de estado de una orden
 * @layer Application
 */
import { Injectable, Logger, Inject } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { HistorialEstadoDto } from "../dto/orden-response.dto";
import {
  IOrdenRepository,
  ORDEN_REPOSITORY,
} from "../../domain/repositories/orden.repository.interface";
import { OrdenEstado } from "../dto/update-orden.dto";
import {
  getMainStateFromSubState,
  parseOrderSubState,
} from "../../domain/enums/order-sub-state.enum";

function isOrdenEstadoValue(value: unknown): value is OrdenEstado {
  return (
    typeof value === "string" &&
    (Object.values(OrdenEstado) as string[]).includes(value)
  );
}

/**
 * Convierte un string de estado del dominio a OrdenEstado del DTO.
 * Retorna undefined si el valor no es válido.
 */
function toOrdenEstadoOrUndefined(value: string | null | undefined): OrdenEstado | undefined {
  if (!value) return undefined;
  if (isOrdenEstadoValue(value)) return value;
  return undefined;
}

/**
 * Convierte un string de estado del dominio a OrdenEstado del DTO.
 * Retorna 'pendiente' como fallback si el valor no es válido.
 */
function toOrdenEstadoWithFallback(value: string | null | undefined): OrdenEstado {
  if (value && isOrdenEstadoValue(value)) return value;
  return OrdenEstado.PENDIENTE;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

@Injectable()
export class GetHistorialEstadosUseCase {
  private readonly logger = new Logger(GetHistorialEstadosUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(ORDEN_REPOSITORY)
    private readonly ordenRepository: IOrdenRepository,
  ) {}

  async execute(ordenId: string): Promise<HistorialEstadoDto[]> {
    try {
      this.logger.log(`Obteniendo historial de estados para orden: ${ordenId}`);

      // Verificar que la orden existe
      const orden = await this.ordenRepository.findById(ordenId);
      if (!orden) {
        return [];
      }

      // Obtener historial de sub-estados (OrderStateHistory)
      const historialSubEstados = await this.prisma.orderStateHistory.findMany({
        where: { ordenId },
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      // Convertir a DTOs
      const historial: HistorialEstadoDto[] = historialSubEstados.map((h) => {
        const fromSub = h.fromState
          ? parseOrderSubState(String(h.fromState))
          : null;
        const toSub = parseOrderSubState(String(h.toState));

        const estadoAnterior = fromSub
          ? toOrdenEstadoOrUndefined(getMainStateFromSubState(fromSub))
          : undefined;

        const estadoNuevo = toSub
          ? toOrdenEstadoWithFallback(getMainStateFromSubState(toSub))
          : toOrdenEstadoWithFallback(orden.estado.value);

        return {
          id: h.id,
          ordenId: h.ordenId,
          estadoAnterior,
          estadoNuevo,
          motivo: h.notas || "Cambio de sub-estado",
          observaciones: h.notas || undefined,
          usuarioId: h.userId || undefined,
          createdAt: h.createdAt.toISOString(),
        };
      });

      // Fallback: si no hay historial en orderStateHistory, intentar desde auditLog
      if (historial.length === 0) {
        const auditEntries = await this.prisma.auditLog.findMany({
          where: {
            entityType: "Order",
            entityId: ordenId,
            action: "ORDER_STATUS_CHANGED",
          },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            userId: true,
            changes: true,
            createdAt: true,
          },
        });

        for (const a of auditEntries) {
          const changes = asRecord(a.changes);

          const fromRaw = changes.from;
          const toRaw = changes.to;
          const motivo =
            typeof changes.motivo === "string" ? changes.motivo : undefined;
          const observaciones =
            typeof changes.observaciones === "string"
              ? changes.observaciones
              : undefined;

          const estadoAnterior = isOrdenEstadoValue(fromRaw)
            ? fromRaw
            : undefined;
          const estadoNuevo = isOrdenEstadoValue(toRaw)
            ? toRaw
            : toOrdenEstadoWithFallback(orden.estado.value);

          historial.push({
            id: a.id,
            ordenId,
            estadoAnterior,
            estadoNuevo,
            motivo: motivo || "Cambio de estado",
            observaciones,
            usuarioId: a.userId || undefined,
            createdAt: a.createdAt.toISOString(),
          });
        }
      }

      // Si aún no hay historial, crear una entrada inicial con el estado actual
      if (historial.length === 0) {
        historial.push({
          id: orden.id,
          ordenId: orden.id,
          estadoAnterior: undefined,
          estadoNuevo: toOrdenEstadoWithFallback(orden.estado.value),
          motivo: "Estado inicial",
          observaciones: undefined,
          usuarioId: orden.creadorId || undefined,
          createdAt: orden.createdAt.toISOString(),
        });
      }

      return historial;
    } catch (error) {
      this.logger.error("Error obteniendo historial de estados", error);
      throw error;
    }
  }
}

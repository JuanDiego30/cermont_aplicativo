/**
 * @useCase GetHistorialEstadosUseCase
 * @description Caso de uso para obtener el historial de cambios de estado de una orden
 * @layer Application
 */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { HistorialEstadoDto } from '../dto/orden-response.dto';
import {
  IOrdenRepository,
  ORDEN_REPOSITORY,
} from '../../domain/repositories/orden.repository.interface';
import { OrdenEstado } from '../dto/update-orden.dto';

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
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      // Convertir a DTOs
      // Nota: OrderStateHistory guarda sub-estados, pero adaptamos a estados principales
      // Para un historial completo de estados principales, se necesitaría un modelo adicional
      // Por ahora, usamos el estado actual de la orden como referencia
      const historial: HistorialEstadoDto[] = historialSubEstados.map((h) => ({
        id: h.id,
        ordenId: h.ordenId,
        estadoAnterior: undefined, // Los sub-estados no mapean directamente a estados principales
        estadoNuevo: orden.estado.value as OrdenEstado, // Usar estado actual como referencia
        motivo: h.notas || 'Cambio de sub-estado',
        observaciones: h.notas || undefined,
        usuarioId: h.userId || undefined,
        createdAt: h.createdAt,
      }));

      // Si no hay historial, crear una entrada inicial con el estado actual
      if (historial.length === 0) {
        historial.push({
          id: orden.id,
          ordenId: orden.id,
          estadoAnterior: undefined,
          estadoNuevo: orden.estado.value as OrdenEstado,
          motivo: 'Estado inicial',
          observaciones: undefined,
          usuarioId: orden.creadorId || undefined,
          createdAt: orden.createdAt,
        });
      }

      return historial;
    } catch (error) {
      this.logger.error('Error obteniendo historial de estados', error);
      throw error;
    }
  }
}


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
  ) { }

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
      const historial: HistorialEstadoDto[] = historialSubEstados.map((h) => ({
        id: h.id,
        ordenId: h.ordenId,
        estadoAnterior: undefined,
        estadoNuevo: (orden.estado.value || 'pendiente') as unknown as OrdenEstado,
        motivo: h.notas || 'Cambio de estado',
        observaciones: h.notas || undefined,
        usuarioId: h.userId || undefined,
        createdAt: h.createdAt.toISOString(),
      }));

      // Si no hay historial, crear una entrada inicial con el estado actual
      if (historial.length === 0) {
        historial.push({
          id: orden.id,
          ordenId: orden.id,
          estadoAnterior: undefined,
          estadoNuevo: (orden.estado.value || 'pendiente') as unknown as OrdenEstado,
          motivo: 'Estado inicial',
          observaciones: undefined,
          usuarioId: orden.creadorId || undefined,
          createdAt: orden.createdAt.toISOString(),
        });
      }

      return historial;
    } catch (error) {
      this.logger.error('Error obteniendo historial de estados', error);
      throw error;
    }
  }
}

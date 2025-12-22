/**
 * @useCase ArchivarOrdenUseCase
 * 
 * Archiva una orden usando la capa de dominio.
 * Orquesta la lógica pero no contiene reglas de negocio.
 */
import { Injectable, Inject, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  ArchivedOrderEntity,
  ARCHIVED_ORDER_REPOSITORY,
  IArchivedOrderRepository,
} from '../../domain';

export interface ArchivarOrdenCommand {
  ordenId: string;
  motivo?: string;
  comentario?: string;
  archivedBy: string;
}

@Injectable()
export class ArchivarOrdenUseCase {
  private readonly logger = new Logger(ArchivarOrdenUseCase.name);

  constructor(
    @Inject(ARCHIVED_ORDER_REPOSITORY)
    private readonly archivedOrderRepo: IArchivedOrderRepository,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async execute(command: ArchivarOrdenCommand): Promise<{ message: string; id: string }> {
    this.logger.log('Archivando orden', { ordenId: command.ordenId });

    // 1. Verificar si ya está archivada
    const yaArchivada = await this.archivedOrderRepo.existsByOrderId(command.ordenId);
    if (yaArchivada) {
      throw new BadRequestException('La orden ya está archivada');
    }

    // 2. Obtener orden original
    const ordenOriginal = await this.prisma.order.findUnique({
      where: { id: command.ordenId },
      include: {
        planeacion: true,
        costos: true,
        acta: true,
        ses: true,
        factura: true,
      },
    });

    if (!ordenOriginal) {
      throw new NotFoundException(`Orden ${command.ordenId} no encontrada`);
    }

    // 3. Crear entidad de dominio (validaciones ocurren aquí)
    const archivedOrder = ArchivedOrderEntity.create({
      orderId: ordenOriginal.id,
      orderNumber: ordenOriginal.numero,
      clientId: ordenOriginal.id, // Using order ID as client reference
      clientName: ordenOriginal.cliente,
      archivedBy: command.archivedBy,
      reason: command.motivo || 'Sin motivo especificado',
      comment: command.comentario,
      archivedData: ordenOriginal as unknown as Record<string, unknown>,
    });

    // 4. Persistir
    const saved = await this.archivedOrderRepo.save(archivedOrder);

    // 5. Publicar eventos de dominio
    const events = saved.getDomainEvents();
    for (const event of events) {
      this.eventEmitter.emit(event.eventName, event);
    }
    saved.clearDomainEvents();

    this.logger.log('Orden archivada exitosamente', {
      id: saved.id.getValue(),
      ordenId: command.ordenId,
    });

    return {
      message: 'Orden archivada exitosamente',
      id: saved.id.getValue(),
    };
  }
}


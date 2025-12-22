/**
 * @useCase DesarchivarOrdenUseCase
 * 
 * Desarchiva una orden usando la capa de dominio.
 */
import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ArchivedOrderEntity,
  ArchivedOrderId,
  ARCHIVED_ORDER_REPOSITORY,
  IArchivedOrderRepository,
} from '../../domain';

export interface DesarchivarOrdenCommand {
  ordenId: string;
  unarchivedBy: string;
}

@Injectable()
export class DesarchivarOrdenUseCase {
  private readonly logger = new Logger(DesarchivarOrdenUseCase.name);

  constructor(
    @Inject(ARCHIVED_ORDER_REPOSITORY)
    private readonly archivedOrderRepo: IArchivedOrderRepository,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async execute(command: DesarchivarOrdenCommand): Promise<{ message: string }> {
    this.logger.log('Desarchivando orden', { orderId: command.ordenId });

    // 1. Buscar orden archivada por orderId
    const archivedOrder = await this.archivedOrderRepo.findByOrderId(command.ordenId);

    if (!archivedOrder) {
      throw new NotFoundException('Orden archivada no encontrada');
    }

    // 2. Ejecutar lógica de dominio (validaciones ocurren aquí)
    archivedOrder.unarchive(command.unarchivedBy);

    // 3. Persistir
    await this.archivedOrderRepo.save(archivedOrder);

    // 4. Publicar eventos de dominio
    const events = archivedOrder.getDomainEvents();
    for (const event of events) {
      this.eventEmitter.emit(event.eventName, event);
    }
    archivedOrder.clearDomainEvents();

    this.logger.log('Orden desarchivada exitosamente', {
      orderId: command.ordenId,
    });

    return { message: 'Orden desarchivada exitosamente' };
  }
}


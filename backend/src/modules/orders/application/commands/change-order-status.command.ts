/**
 * Change Order Status Command
 * Command to change the status of an existing order
 */
import type { ICommand } from './command.interface';
import { OrderStatus } from '@cermont/shared-types';

export interface ChangeOrderStatusCommandPayload {
  orderId: string;
  nuevoEstado: OrderStatus;
  motivo: string;
  usuarioId: string;
  observaciones?: string;
}

export class ChangeOrderStatusCommand implements ICommand<void> {
  constructor(public readonly payload: ChangeOrderStatusCommandPayload) {}
}

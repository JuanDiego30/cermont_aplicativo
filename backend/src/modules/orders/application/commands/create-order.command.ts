/**
 * Create Order Command
 * Command to create a new order in the system
 */
import type { ICommand } from './command.interface';
import type { OrderResponseDto } from '@cermont/shared-types';
import { OrderPriority, OrderType } from '@cermont/shared-types';

export interface CreateOrderCommandPayload {
  descripcion: string;
  clienteId: string;
  tipoOrden?: OrderType;
  prioridad?: OrderPriority;
  fechaProgramada?: Date;
  observaciones?: string;
  tecnicoAsignadoId?: string;
  createdBy: string;
}

export class CreateOrderCommand implements ICommand<OrderResponseDto> {
  constructor(public readonly payload: CreateOrderCommandPayload) {}
}

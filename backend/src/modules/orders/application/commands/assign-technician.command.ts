/**
 * Assign Technician Command
 * Command to assign a technician to an order
 */
import type { ICommand } from './command.interface';

export interface AssignTechnicianCommandPayload {
  orderId: string;
  tecnicoId: string;
  assignedBy: string;
  observaciones?: string;
}

export class AssignTechnicianCommand implements ICommand<void> {
  constructor(public readonly payload: AssignTechnicianCommandPayload) {}
}

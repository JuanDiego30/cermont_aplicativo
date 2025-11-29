import { OrderState } from '../entities/Order.js';

export class OrderStateTransitionError extends Error {
  constructor(
    public readonly currentState: OrderState,
    public readonly attemptedState: OrderState,
    public readonly allowedStates: OrderState[]
  ) {
    super(`Transición inválida: ${currentState} -> ${attemptedState}. Permitidos: ${allowedStates.join(', ')}`);
    this.name = 'OrderStateTransitionError';
  }
}

const TRANSITION_MAP: Record<OrderState, readonly OrderState[]> = {
  [OrderState.SOLICITUD]: [OrderState.VISITA],
  [OrderState.VISITA]: [OrderState.PO, OrderState.SOLICITUD],
  [OrderState.PO]: [OrderState.PLANEACION, OrderState.VISITA],
  [OrderState.PLANEACION]: [OrderState.EJECUCION, OrderState.PO],
  [OrderState.EJECUCION]: [OrderState.INFORME, OrderState.PLANEACION],
  [OrderState.INFORME]: [OrderState.ACTA, OrderState.EJECUCION],
  [OrderState.ACTA]: [OrderState.SES, OrderState.INFORME],
  [OrderState.SES]: [OrderState.FACTURA, OrderState.ACTA],
  [OrderState.FACTURA]: [OrderState.PAGO, OrderState.SES],
  [OrderState.PAGO]: [],
};

const STATE_SEQUENCE = [
  OrderState.SOLICITUD,
  OrderState.VISITA,
  OrderState.PO,
  OrderState.PLANEACION,
  OrderState.EJECUCION,
  OrderState.INFORME,
  OrderState.ACTA,
  OrderState.SES,
  OrderState.FACTURA,
  OrderState.PAGO,
] as const;

/**
 * Servicio de Dominio: Máquina de Estados
 * Centraliza las reglas de transición del flujo de trabajo.
 */
export class OrderStateMachine {
  canTransition(from: OrderState, to: OrderState): boolean {
    return TRANSITION_MAP[from]?.includes(to) ?? false;
  }

  validateTransition(from: OrderState, to: OrderState): void {
    if (!this.canTransition(from, to)) {
      throw new OrderStateTransitionError(from, to, [...(TRANSITION_MAP[from] || [])]);
    }
  }

  getNextState(current: OrderState): OrderState | null {
    // Retorna la ruta feliz (primer elemento del array de transición)
    return TRANSITION_MAP[current]?.[0] || null;
  }

  isFinalState(state: OrderState): boolean {
    return (TRANSITION_MAP[state]?.length || 0) === 0;
  }

  getProgress(state: OrderState): number {
    const index = STATE_SEQUENCE.indexOf(state);
    if (index === -1) return 0;
    return Math.round((index / (STATE_SEQUENCE.length - 1)) * 100);
  }

  /**
   * Compara si el estado A es anterior al estado B en el flujo ideal.
   */
  isBefore(a: OrderState, b: OrderState): boolean {
    return STATE_SEQUENCE.indexOf(a) < STATE_SEQUENCE.indexOf(b);
  }
}




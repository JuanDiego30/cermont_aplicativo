/**
 * Domain Exception: Thrown when required reason is missing for state transition
 */
export class MissingStateTransitionReasonError extends Error {
  constructor(targetState: OrderEstado) {
    super(`El campo "motivo" es obligatorio al cambiar a estado ${targetState}`);
    this.name = 'MissingStateTransitionReasonError';
  }
}

/**
 * Domain Exception: Thrown when state transition is not allowed
 */
export class InvalidStateTransitionError extends Error {
  constructor(fromEstado: OrderEstado, toEstado: OrderEstado, allowedTransitions: OrderEstado[]) {
    super(
      `No se puede cambiar de ${fromEstado} a ${toEstado}. ` +
        `Transiciones permitidas: ${allowedTransitions.join(', ')}`
    );
    this.name = 'InvalidStateTransitionError';
  }
}

export enum OrderEstado {
  PENDIENTE = 'pendiente',
  PLANEACION = 'planeacion',
  EJECUCION = 'ejecucion',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  PAUSADA = 'pausada',
}

/**
 * Máquina de estados para validar transiciones de órdenes
 */
export class OrderStateMachine {
  // Transiciones permitidas desde cada estado
  private static readonly TRANSITIONS: Record<OrderEstado, OrderEstado[]> = {
    [OrderEstado.PENDIENTE]: [OrderEstado.PLANEACION, OrderEstado.CANCELADA],
    [OrderEstado.PLANEACION]: [OrderEstado.EJECUCION, OrderEstado.CANCELADA],
    [OrderEstado.EJECUCION]: [OrderEstado.COMPLETADA, OrderEstado.PAUSADA, OrderEstado.CANCELADA],
    [OrderEstado.COMPLETADA]: [],
    [OrderEstado.CANCELADA]: [],
    [OrderEstado.PAUSADA]: [OrderEstado.EJECUCION, OrderEstado.CANCELADA],
  };

  // Transiciones que requieren motivo obligatorio
  private static readonly REQUIRES_REASON: OrderEstado[] = [
    OrderEstado.CANCELADA,
    OrderEstado.COMPLETADA,
  ];

  /**
   * Valida si una transición de estado es permitida
   */
  static validateTransition(fromEstado: OrderEstado, toEstado: OrderEstado, motivo?: string): void {
    // Validar que la transición esté permitida
    const allowedTransitions = this.TRANSITIONS[fromEstado];

    if (!allowedTransitions.includes(toEstado)) {
      throw new InvalidStateTransitionError(fromEstado, toEstado, allowedTransitions);
    }

    // Validar que tenga motivo si es requerido
    if (this.REQUIRES_REASON.includes(toEstado) && !motivo) {
      throw new MissingStateTransitionReasonError(toEstado);
    }
  }

  /**
   * Obtiene los estados permitidos desde un estado actual
   */
  static getAllowedTransitions(fromEstado: OrderEstado): OrderEstado[] {
    return this.TRANSITIONS[fromEstado] || [];
  }

  /**
   * Verifica si un estado requiere motivo
   */
  static requiresReason(estado: OrderEstado): boolean {
    return this.REQUIRES_REASON.includes(estado);
  }
}

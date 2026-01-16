/**
 * Domain Exception: Thrown when required reason is missing for state transition
 */
export class MissingStateTransitionReasonError extends Error {
  constructor(targetState: Orderstado) {
    super(`El campo "motivo" es obligatorio al cambiar a estado ${targetState}`);
    this.name = 'MissingStateTransitionReasonError';
  }
}

/**
 * Domain Exception: Thrown when state transition is not allowed
 */
export class InvalidStateTransitionError extends Error {
  constructor(fromEstado: Orderstado, toEstado: Orderstado, allowedTransitions: Orderstado[]) {
    super(
      `No se puede cambiar de ${fromEstado} a ${toEstado}. ` +
      `Transiciones permitidas: ${allowedTransitions.join(", ")}`
    );
    this.name = 'InvalidStateTransitionError';
  }
}

export enum Orderstado {
  PENDIENTE = "pendiente",
  PLANEACION = "planeacion",
  EJECUCION = "ejecucion",
  COMPLETADA = "completada",
  CANCELADA = "cancelada",
  PAUSADA = "pausada",
}

/**
 * Máquina de estados para validar transiciones de órdenes
 */
export class OrderStateMachine {
  // Transiciones permitidas desde cada estado
  private static readonly TRANSITIONS: Record<Orderstado, Orderstado[]> = {
    [Orderstado.PENDIENTE]: [Orderstado.PLANEACION, Orderstado.CANCELADA],
    [Orderstado.PLANEACION]: [Orderstado.EJECUCION, Orderstado.CANCELADA],
    [Orderstado.EJECUCION]: [
      Orderstado.COMPLETADA,
      Orderstado.PAUSADA,
      Orderstado.CANCELADA,
    ],
    [Orderstado.COMPLETADA]: [],
    [Orderstado.CANCELADA]: [],
    [Orderstado.PAUSADA]: [Orderstado.EJECUCION, Orderstado.CANCELADA],
  };

  // Transiciones que requieren motivo obligatorio
  private static readonly REQUIRES_REASON: Orderstado[] = [
    Orderstado.CANCELADA,
    Orderstado.COMPLETADA,
  ];

  /**
   * Valida si una transición de estado es permitida
   */
  static validateTransition(
    fromEstado: Orderstado,
    toEstado: Orderstado,
    motivo?: string,
  ): void {
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
  static getAllowedTransitions(fromEstado: Orderstado): Orderstado[] {
    return this.TRANSITIONS[fromEstado] || [];
  }

  /**
   * Verifica si un estado requiere motivo
   */
  static requiresReason(estado: Orderstado): boolean {
    return this.REQUIRES_REASON.includes(estado);
  }
}

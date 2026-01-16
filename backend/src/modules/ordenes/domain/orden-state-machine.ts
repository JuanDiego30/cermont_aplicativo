/**
 * Domain Exception: Thrown when required reason is missing for state transition
 */
export class MissingStateTransitionReasonError extends Error {
  constructor(targetState: OrdenEstado) {
    super(`El campo "motivo" es obligatorio al cambiar a estado ${targetState}`);
    this.name = 'MissingStateTransitionReasonError';
  }
}

/**
 * Domain Exception: Thrown when state transition is not allowed
 */
export class InvalidStateTransitionError extends Error {
  constructor(fromEstado: OrdenEstado, toEstado: OrdenEstado, allowedTransitions: OrdenEstado[]) {
    super(
      `No se puede cambiar de ${fromEstado} a ${toEstado}. ` +
      `Transiciones permitidas: ${allowedTransitions.join(", ")}`
    );
    this.name = 'InvalidStateTransitionError';
  }
}

export enum OrdenEstado {
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
export class OrdenStateMachine {
  // Transiciones permitidas desde cada estado
  private static readonly TRANSITIONS: Record<OrdenEstado, OrdenEstado[]> = {
    [OrdenEstado.PENDIENTE]: [OrdenEstado.PLANEACION, OrdenEstado.CANCELADA],
    [OrdenEstado.PLANEACION]: [OrdenEstado.EJECUCION, OrdenEstado.CANCELADA],
    [OrdenEstado.EJECUCION]: [
      OrdenEstado.COMPLETADA,
      OrdenEstado.PAUSADA,
      OrdenEstado.CANCELADA,
    ],
    [OrdenEstado.COMPLETADA]: [],
    [OrdenEstado.CANCELADA]: [],
    [OrdenEstado.PAUSADA]: [OrdenEstado.EJECUCION, OrdenEstado.CANCELADA],
  };

  // Transiciones que requieren motivo obligatorio
  private static readonly REQUIRES_REASON: OrdenEstado[] = [
    OrdenEstado.CANCELADA,
    OrdenEstado.COMPLETADA,
  ];

  /**
   * Valida si una transición de estado es permitida
   */
  static validateTransition(
    fromEstado: OrdenEstado,
    toEstado: OrdenEstado,
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
  static getAllowedTransitions(fromEstado: OrdenEstado): OrdenEstado[] {
    return this.TRANSITIONS[fromEstado] || [];
  }

  /**
   * Verifica si un estado requiere motivo
   */
  static requiresReason(estado: OrdenEstado): boolean {
    return this.REQUIRES_REASON.includes(estado);
  }
}

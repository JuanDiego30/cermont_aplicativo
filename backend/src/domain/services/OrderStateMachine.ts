import { OrderState } from '../entities/Order.js';

/**
 * Error personalizado para transiciones inválidas de estado
 * @class OrderStateTransitionError
 * @extends {Error}
 */
export class OrderStateTransitionError extends Error {
  constructor(
    message: string,
    public readonly currentState: OrderState,
    public readonly attemptedState: OrderState,
    public readonly allowedStates: OrderState[]
  ) {
    super(message);
    this.name = 'OrderStateTransitionError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Definición de la máquina de estados para órdenes
 * Cada estado tiene una lista de estados a los que puede transitar
 * @constant
 */
const ALLOWED_TRANSITIONS: Readonly<Record<OrderState, readonly OrderState[]>> = {
  [OrderState.SOLICITUD]: [OrderState.VISITA],
  [OrderState.VISITA]: [OrderState.PO, OrderState.SOLICITUD], // Retroceso permitido
  [OrderState.PO]: [OrderState.PLANEACION, OrderState.VISITA],
  [OrderState.PLANEACION]: [OrderState.EJECUCION, OrderState.PO],
  [OrderState.EJECUCION]: [OrderState.INFORME, OrderState.PLANEACION],
  [OrderState.INFORME]: [OrderState.ACTA, OrderState.EJECUCION],
  [OrderState.ACTA]: [OrderState.SES, OrderState.INFORME],
  [OrderState.SES]: [OrderState.FACTURA, OrderState.ACTA],
  [OrderState.FACTURA]: [OrderState.PAGO, OrderState.SES],
  [OrderState.PAGO]: [], // Estado final
} as const;

/**
 * Orden secuencial de estados (para cálculo de progreso)
 * @constant
 */
const STATE_ORDER: readonly OrderState[] = [
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
 * Interface: Máquina de estados de orden
 * Contrato para el servicio que valida transiciones de estado
 * @interface IOrderStateMachine
 * @since 1.0.0
 */
export interface IOrderStateMachine {
  /**
   * Verifica si una transición de estado es válida
   * @param {OrderState} currentState - Estado actual de la orden
   * @param {OrderState} newState - Nuevo estado deseado
   * @returns {boolean} True si la transición es permitida
   */
  canTransition(currentState: OrderState, newState: OrderState): boolean;

  /**
   * Obtiene los estados permitidos desde el estado actual
   * @param {OrderState} currentState - Estado actual de la orden
   * @returns {OrderState[]} Lista de estados permitidos
   */
  getAllowedStates(currentState: OrderState): readonly OrderState[];

  /**
   * Valida una transición y lanza excepción si es inválida
   * @param {OrderState} currentState - Estado actual de la orden
   * @param {OrderState} newState - Nuevo estado deseado
   * @throws {OrderStateTransitionError} Si la transición no es permitida
   */
  validateTransition(currentState: OrderState, newState: OrderState): void;

  /**
   * Verifica si un estado es final (sin transiciones permitidas)
   * @param {OrderState} state - Estado a verificar
   * @returns {boolean} True si es un estado final
   */
  isFinalState(state: OrderState): boolean;

  /**
   * Obtiene el próximo estado en el flujo normal (sin retrocesos)
   * @param {OrderState} currentState - Estado actual
   * @returns {OrderState | null} Próximo estado o null si no hay
   */
  getNextState(currentState: OrderState): OrderState | null;

  /**
   * Obtiene el índice de progreso de un estado (0-100)
   * @param {OrderState} state - Estado actual
   * @returns {number} Porcentaje de progreso (0-100)
   */
  getProgress(state: OrderState): number;

  /**
   * Verifica si un estado está antes que otro en el flujo
   * @param {OrderState} state1 - Primer estado
   * @param {OrderState} state2 - Segundo estado
   * @returns {boolean} True si state1 está antes que state2
   */
  isBefore(state1: OrderState, state2: OrderState): boolean;

  /**
   * Obtiene todos los estados del flujo en orden
   * @returns {readonly OrderState[]} Lista de todos los estados
   */
  getAllStates(): readonly OrderState[];
}

/**
 * Servicio: Máquina de estados de orden
 * Valida transiciones entre estados según reglas de negocio del ATG
 * Implementa el flujo completo: SOLICITUD → VISITA → PO → ... → PAGO
 * @class OrderStateMachine
 * @implements {IOrderStateMachine}
 * @since 1.0.0
 */
export class OrderStateMachine implements IOrderStateMachine {
  /**
   * Verifica si una transición de estado es válida
   * @param {OrderState} currentState - Estado actual de la orden
   * @param {OrderState} newState - Nuevo estado deseado
   * @returns {boolean} True si la transición es permitida
   */
  canTransition(currentState: OrderState, newState: OrderState): boolean {
    const allowedStates = ALLOWED_TRANSITIONS[currentState];

    if (!allowedStates) {
      return false;
    }

    return allowedStates.includes(newState);
  }

  /**
   * Obtiene los estados permitidos desde el estado actual
   * @param {OrderState} currentState - Estado actual de la orden
   * @returns {readonly OrderState[]} Lista de estados permitidos
   */
  getAllowedStates(currentState: OrderState): readonly OrderState[] {
    return ALLOWED_TRANSITIONS[currentState] ?? [];
  }

  /**
   * Valida una transición y lanza excepción si es inválida
   * @param {OrderState} currentState - Estado actual de la orden
   * @param {OrderState} newState - Nuevo estado deseado
   * @throws {OrderStateTransitionError} Si la transición no es permitida
   */
  validateTransition(currentState: OrderState, newState: OrderState): void {
    if (!this.canTransition(currentState, newState)) {
      const allowed = this.getAllowedStates(currentState);

      if (allowed.length === 0) {
        throw new OrderStateTransitionError(
          `No se puede cambiar el estado desde ${currentState} porque es un estado final`,
          currentState,
          newState,
          []
        );
      }

      throw new OrderStateTransitionError(
        `Transición inválida: ${currentState} → ${newState}. ` +
          `Estados permitidos desde ${currentState}: ${allowed.join(', ')}`,
        currentState,
        newState,
        Array.from(allowed)
      );
    }
  }

  /**
   * Verifica si un estado es final (sin transiciones permitidas)
   * @param {OrderState} state - Estado a verificar
   * @returns {boolean} True si es un estado final
   */
  isFinalState(state: OrderState): boolean {
    const allowedStates = ALLOWED_TRANSITIONS[state];
    return !allowedStates || allowedStates.length === 0;
  }

  /**
   * Obtiene el próximo estado en el flujo normal (sin retrocesos)
   * Retorna el primer estado permitido de la transición
   * @param {OrderState} currentState - Estado actual
   * @returns {OrderState | null} Próximo estado o null si no hay
   */
  getNextState(currentState: OrderState): OrderState | null {
    const allowedStates = this.getAllowedStates(currentState);

    // Retorna el primer estado permitido (flujo normal hacia adelante)
    return allowedStates.length > 0 ? allowedStates[0] : null;
  }

  /**
   * Obtiene el índice de progreso de un estado (0-100)
   * Útil para barras de progreso en UI
   * @param {OrderState} state - Estado actual
   * @returns {number} Porcentaje de progreso (0-100)
   */
  getProgress(state: OrderState): number {
    const index = STATE_ORDER.indexOf(state);

    if (index === -1) {
      console.warn(`[OrderStateMachine] Estado desconocido: ${state}`);
      return 0;
    }

    return Math.round((index / (STATE_ORDER.length - 1)) * 100);
  }

  /**
   * Verifica si un estado está antes que otro en el flujo
   * @param {OrderState} state1 - Primer estado
   * @param {OrderState} state2 - Segundo estado
   * @returns {boolean} True si state1 está antes que state2
   */
  isBefore(state1: OrderState, state2: OrderState): boolean {
    return this.getProgress(state1) < this.getProgress(state2);
  }

  /**
   * Obtiene todos los estados del flujo en orden secuencial
   * @returns {readonly OrderState[]} Lista de todos los estados
   */
  getAllStates(): readonly OrderState[] {
    return STATE_ORDER;
  }

  /**
   * Verifica si una transición es un retroceso
   * @param {OrderState} currentState - Estado actual
   * @param {OrderState} newState - Nuevo estado
   * @returns {boolean} True si es un retroceso
   */
  isBackwardTransition(currentState: OrderState, newState: OrderState): boolean {
    return this.getProgress(newState) < this.getProgress(currentState);
  }

  /**
   * Obtiene una representación visual de las transiciones permitidas
   * Útil para debugging y documentación
   * @returns {string} Diagrama de transiciones en formato texto
   */
  getTransitionDiagram(): string {
    let diagram = 'Máquina de Estados de Orden:\n\n';

    for (const [state, transitions] of Object.entries(ALLOWED_TRANSITIONS)) {
      const progress = this.getProgress(state as OrderState);
      const isFinal = this.isFinalState(state as OrderState);

      diagram += `${state} (${progress}%)`;

      if (isFinal) {
        diagram += ' [FINAL]\n';
      } else {
        diagram += ` → ${transitions.join(', ')}\n`;
      }
    }

    return diagram;
  }
}



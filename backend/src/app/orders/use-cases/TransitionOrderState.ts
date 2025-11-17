import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { OrderStateMachine } from '../../../domain/services/OrderStateMachine';
import type { Order } from '../../../domain/entities/Order';
import { OrderState } from '../../../domain/entities/Order';
import {
  ObjectIdValidationError,
  ObjectIdValidator,
} from '../../../shared/validators/ObjectIdValidator';

/**
 * Error personalizado para transiciones de estado
 * Incluye estados actual e intentado para debugging
 * @class StateTransitionError
 * @extends {Error}
 */
export class StateTransitionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly currentState?: OrderState,
    public readonly attemptedState?: OrderState
  ) {
    super(message);
    this.name = 'StateTransitionError';

    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * DTO para transicionar estado de orden
 * @interface TransitionOrderStateDto
 */
export interface TransitionOrderStateDto {
  /** ID de la orden (formato ObjectId de MongoDB) */
  orderId: string;
  /** Nuevo estado deseado para la orden */
  newState: OrderState;
  /** ID del usuario que realiza la transición */
  userId: string;
  /** Comentario opcional sobre la transición (máx. 500 caracteres) */
  comment?: string;
}

/**
 * Caso de uso: Transicionar estado de una orden
 * Valida que la transición sea permitida según el OrderStateMachine
 * @class TransitionOrderState
 * @since 1.0.0
 */
export class TransitionOrderState {
  private static readonly MAX_COMMENT_LENGTH = 500;
  private readonly stateMachine = new OrderStateMachine();

  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(dto: TransitionOrderStateDto): Promise<Order> {
    try {
      this.validateDto(dto);

      const order = await this.fetchOrder(dto.orderId);
      const previousState = order.state;

      this.validateStateTransition(previousState, dto.newState);

      const updatedOrder = await this.orderRepository.update(dto.orderId, {
        state: dto.newState,
      });

      this.logTransition(dto, previousState);

      return updatedOrder;
    } catch (error) {
      if (error instanceof StateTransitionError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[TransitionOrderState] Error inesperado:', errorMessage);

      throw new StateTransitionError(
        `Error interno al transicionar estado de la orden: ${errorMessage}`,
        'INTERNAL_ERROR',
        500
      );
    }
  }

  private async fetchOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new StateTransitionError(
        `Orden con ID ${orderId} no encontrada`,
        'ORDER_NOT_FOUND',
        404
      );
    }

    return order;
  }

  private validateStateTransition(currentState: OrderState, newState: OrderState): void {
    try {
      this.stateMachine.validateTransition(currentState, newState);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Transición inválida de ${currentState} a ${newState}`;

      throw new StateTransitionError(
        errorMessage,
        'INVALID_TRANSITION',
        400,
        currentState,
        newState
      );
    }
  }

  private logTransition(dto: TransitionOrderStateDto, previousState: OrderState): void {
    console.info(
      `[TransitionOrderState] 🔄 Transición: ${dto.orderId} (${previousState} → ${dto.newState}) por ${dto.userId}`
    );

    if (dto.comment) {
      console.info(`[TransitionOrderState]    📝 Comentario: ${dto.comment}`);
    }
  }

  private validateDto(dto: TransitionOrderStateDto): void {
    const normalizedOrderId = this.validateObjectId(
      dto.orderId,
      'ORDER_ID',
      'ID de la orden'
    );

    dto.orderId = normalizedOrderId;

    const normalizedUserId = this.validateObjectId(
      dto.userId,
      'USER_ID',
      'ID del usuario'
    );

    dto.userId = normalizedUserId;

    this.validateNewState(dto.newState);

    if (dto.comment !== undefined) {
      this.validateComment(dto.comment);
    }
  }

  private validateObjectId(value: string, fieldCode: string, displayName: string): string {
    try {
      return ObjectIdValidator.validate(value, displayName);
    } catch (error) {
      if (error instanceof ObjectIdValidationError) {
        throw new StateTransitionError(
          error.message,
          this.buildObjectIdErrorCode(error.code, fieldCode),
          400
        );
      }

      throw error;
    }
  }

  private buildObjectIdErrorCode(errorCode: string, fieldCode: string): string {
    const normalizedField = fieldCode.toUpperCase();

    switch (errorCode) {
      case 'INVALID_TYPE':
        return `INVALID_${normalizedField}_TYPE`;
      case 'EMPTY':
        return `EMPTY_${normalizedField}`;
      case 'INVALID_LENGTH':
        return `INVALID_${normalizedField}_LENGTH`;
      case 'INVALID_FORMAT':
        return `INVALID_${normalizedField}_FORMAT`;
      case 'REQUIRED':
      default:
        return `INVALID_${normalizedField}`;
    }
  }

  private validateNewState(newState: OrderState): void {
    if (!newState) {
      throw new StateTransitionError('El nuevo estado es requerido', 'MISSING_NEW_STATE', 400);
    }

    const validStates = Object.values(OrderState);

    if (!validStates.includes(newState)) {
      throw new StateTransitionError(
        `Estado inválido. Valores permitidos: ${validStates.join(', ')}`,
        'INVALID_ORDER_STATE',
        400,
        undefined,
        newState
      );
    }
  }

  private validateComment(comment: string): void {
    if (typeof comment !== 'string') {
      throw new StateTransitionError(
        'El comentario debe ser una cadena de texto',
        'INVALID_COMMENT_TYPE',
        400
      );
    }

    if (comment.length > TransitionOrderState.MAX_COMMENT_LENGTH) {
      throw new StateTransitionError(
        `El comentario no puede exceder ${TransitionOrderState.MAX_COMMENT_LENGTH} caracteres`,
        'COMMENT_TOO_LONG',
        400
      );
    }
  }
}




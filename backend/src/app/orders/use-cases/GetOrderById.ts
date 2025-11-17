import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import type { Order } from '../../../domain/entities/Order';

/**
 * Error personalizado para operaciones de orden no encontrada
 * Incluye el ID de la orden que no se encontró para debugging
 * @class OrderNotFoundError
 * @extends {Error}
 */
export class OrderNotFoundError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly orderId: string
  ) {
    super(message);
    this.name = 'OrderNotFoundError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * DTO para obtener orden por ID
 * @interface GetOrderByIdDto
 */
export interface GetOrderByIdDto {
  /** ID de la orden a buscar (formato ObjectId de MongoDB) */
  orderId: string;
}

/**
 * Caso de uso: Obtener una orden por su ID
 * Valida el formato del ID y busca la orden en el repositorio
 * @class GetOrderById
 * @since 1.0.0
 */
export class GetOrderById {
  // Regex para validar ObjectId de MongoDB (24 caracteres hexadecimales)
  private static readonly OBJECTID_REGEX = /^[a-f\d]{24}$/i;
  private static readonly OBJECTID_LENGTH = 24;

  constructor(private readonly orderRepository: IOrderRepository) {}

  /**
   * Ejecuta la búsqueda de una orden por ID
   * @param {GetOrderByIdDto} dto - DTO con el ID de la orden
   * @returns {Promise<Order>} Orden encontrada con todos sus datos
   * @throws {OrderNotFoundError} Si la orden no existe o el ID es inválido
   */
  async execute(dto: GetOrderByIdDto): Promise<Order> {
    try {
      this.validateOrderId(dto.orderId);

      const order = await this.fetchOrder(dto.orderId);

      console.info(
        `[GetOrderById] 🔍 Orden consultada: ${order.id} (cliente: ${order.clientName})`
      );

      return order;
    } catch (error) {
      if (error instanceof OrderNotFoundError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[GetOrderById] Error inesperado:', errorMessage);

      throw new OrderNotFoundError(
        `Error interno al obtener la orden: ${errorMessage}`,
        'INTERNAL_ERROR',
        500,
        dto.orderId
      );
    }
  }

  /**
   * Obtiene la orden del repositorio
   * @private
   * @param {string} orderId - ID de la orden
   * @returns {Promise<Order>} Orden encontrada
   * @throws {OrderNotFoundError} Si la orden no existe
   */
  private async fetchOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new OrderNotFoundError(
        `Orden con ID ${orderId} no encontrada`,
        'ORDER_NOT_FOUND',
        404,
        orderId
      );
    }

    return order;
  }

  /**
   * Valida el formato del ID de la orden (ObjectId de MongoDB)
   * @private
   * @param {string} orderId - ID a validar
   * @throws {OrderNotFoundError} Si el ID es inválido
   */
  private validateOrderId(orderId: string): void {
    if (!orderId || typeof orderId !== 'string') {
      throw new OrderNotFoundError(
        'El ID de la orden es requerido',
        'INVALID_ORDER_ID',
        400,
        orderId ?? ''
      );
    }

    const trimmed = orderId.trim();

    if (trimmed === '') {
      throw new OrderNotFoundError(
        'El ID de la orden no puede estar vacío',
        'EMPTY_ORDER_ID',
        400,
        orderId
      );
    }

    if (trimmed.length !== GetOrderById.OBJECTID_LENGTH) {
      throw new OrderNotFoundError(
        `El ID de la orden debe tener exactamente ${GetOrderById.OBJECTID_LENGTH} caracteres hexadecimales`,
        'INVALID_ORDER_ID_LENGTH',
        400,
        orderId
      );
    }

    if (!GetOrderById.OBJECTID_REGEX.test(trimmed)) {
      throw new OrderNotFoundError(
        `El ID de la orden tiene un formato inválido: ${orderId}`,
        'INVALID_ORDER_ID_FORMAT',
        400,
        orderId
      );
    }
  }
}






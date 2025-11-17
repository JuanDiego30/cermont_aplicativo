import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { Order } from '../../../domain/entities/Order.js';
import { OrderState } from '../../../domain/entities/Order.js';

/**
 * Error personalizado para operaciones de creación de orden
 * Incluye código de error y status HTTP para manejo consistente
 * @class OrderCreationError
 * @extends {Error}
 */
export class OrderCreationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'OrderCreationError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * DTO para crear una nueva orden
 * @interface CreateOrderDto
 */
export interface CreateOrderDto {
  /** Nombre del cliente (3-100 caracteres) */
  clientName: string;
  /** Descripción del trabajo (10-1000 caracteres) */
  description: string;
  /** Ubicación física del trabajo (5-200 caracteres) */
  location: string;
  /** ID del usuario que crea la orden */
  createdBy: string;
  /** Email de contacto del cliente (opcional, formato válido) */
  clientEmail?: string;
  /** Teléfono de contacto del cliente (opcional) */
  clientPhone?: string;
  /** Fecha estimada de inicio (opcional, no puede ser pasada) */
  estimatedStartDate?: Date;
  /** Notas adicionales (opcional, máx. 500 caracteres) */
  notes?: string;
}

/**
 * Configuración de límites de validación
 */
interface ValidationLimits {
  min: number;
  max: number;
}

/**
 * Caso de uso: Crear una nueva orden de trabajo
 * Valida todos los campos y crea la orden en estado SOLICITUD
 * @class CreateOrder
 * @since 1.0.0
 */
export class CreateOrder {
  // Configuración de límites de longitud
  private static readonly LENGTH_LIMITS = {
    CLIENT_NAME: { min: 3, max: 100 } as ValidationLimits,
    DESCRIPTION: { min: 10, max: 1000 } as ValidationLimits,
    LOCATION: { min: 5, max: 200 } as ValidationLimits,
    NOTES: { min: 0, max: 500 } as ValidationLimits,
  } as const;

  // Configuración de fechas
  private static readonly MAX_FUTURE_YEARS = 2;

  // Expresiones regulares
  private static readonly PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
    CLIENT_NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.,-]+$/,
  } as const;

  constructor(private readonly orderRepository: IOrderRepository) {}

  /**
   * Ejecuta la creación de una orden
   * @param {CreateOrderDto} dto - Datos de la orden a crear
   * @returns {Promise<Order>} Orden creada con estado SOLICITUD
   * @throws {OrderCreationError} Si hay errores de validación o creación
   */
  async execute(dto: CreateOrderDto): Promise<Order> {
    try {
      this.validateDto(dto);

      const orderData = this.buildOrderData(dto);
      const createdOrder = await this.orderRepository.create(orderData);

      console.info(
        `[CreateOrder] 📋 Orden creada: ${createdOrder.id} por ${dto.createdBy} (cliente: ${dto.clientName})`
      );

      return createdOrder;
    } catch (error) {
      if (error instanceof OrderCreationError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[CreateOrder] Error inesperado:', errorMessage);

      throw new OrderCreationError(
        `Error interno al crear la orden: ${errorMessage}`,
        'INTERNAL_ERROR',
        500
      );
    }
  }

  /**
   * Construye el objeto de datos de la orden
   * @private
   * @param {CreateOrderDto} dto - DTO con los datos
   * @returns {Omit<Order, 'id'>} Datos de la orden para crear
   */
  private buildOrderData(dto: CreateOrderDto): Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'orderNumber'> {
    return {
      clientName: dto.clientName.trim(),
      description: dto.description.trim(),
      location: dto.location.trim(),
      state: OrderState.SOLICITUD,
      responsibleId: dto.createdBy,
      createdBy: dto.createdBy,
      archived: false,
      ...(dto.clientEmail && { clientEmail: dto.clientEmail.trim().toLowerCase() }),
      ...(dto.clientPhone && { clientPhone: dto.clientPhone.trim() }),
      ...(dto.estimatedStartDate && {
        estimatedStartDate: new Date(dto.estimatedStartDate),
      }),
      ...(dto.notes && { notes: dto.notes.trim() }),
    };
  }

  /**
   * Valida el DTO completo
   * @private
   * @param {CreateOrderDto} dto - DTO a validar
   * @throws {OrderCreationError} Si alguna validación falla
   */
  private validateDto(dto: CreateOrderDto): void {
    // Validaciones requeridas
    this.validateStringField(
      dto.clientName,
      'clientName',
      'El nombre del cliente',
      CreateOrder.LENGTH_LIMITS.CLIENT_NAME,
      CreateOrder.PATTERNS.CLIENT_NAME
    );

    this.validateStringField(
      dto.description,
      'description',
      'La descripción',
      CreateOrder.LENGTH_LIMITS.DESCRIPTION
    );

    this.validateStringField(
      dto.location,
      'location',
      'La ubicación',
      CreateOrder.LENGTH_LIMITS.LOCATION
    );

    this.validateCreatedBy(dto.createdBy);

    // Validaciones opcionales
    if (dto.clientEmail) {
      this.validateEmail(dto.clientEmail);
    }

    if (dto.clientPhone) {
      this.validatePhone(dto.clientPhone);
    }

    if (dto.estimatedStartDate) {
      this.validateEstimatedDate(dto.estimatedStartDate);
    }

    if (dto.notes && dto.notes.length > CreateOrder.LENGTH_LIMITS.NOTES.max) {
      throw new OrderCreationError(
        `Las notas no pueden exceder ${CreateOrder.LENGTH_LIMITS.NOTES.max} caracteres`,
        'NOTES_TOO_LONG',
        400
      );
    }
  }

  /**
   * Valida un campo de texto con límites de longitud y patrón opcional
   * @private
   * @param {string} value - Valor a validar
   * @param {string} fieldCode - Código del campo (para error code)
   * @param {string} displayName - Nombre para mostrar al usuario
   * @param {ValidationLimits} limits - Límites min/max de longitud
   * @param {RegExp} [pattern] - Patrón regex opcional
   * @throws {OrderCreationError} Si el campo es inválido
   */
  private validateStringField(
    value: string,
    fieldCode: string,
    displayName: string,
    limits: ValidationLimits,
    pattern?: RegExp
  ): void {
    if (!value || typeof value !== 'string') {
      throw new OrderCreationError(
        `${displayName} es requerido`,
        `INVALID_${fieldCode.toUpperCase()}`,
        400
      );
    }

    const trimmed = value.trim();

    if (trimmed.length < limits.min) {
      throw new OrderCreationError(
        `${displayName} debe tener al menos ${limits.min} caracteres`,
        `${fieldCode.toUpperCase()}_TOO_SHORT`,
        400
      );
    }

    if (trimmed.length > limits.max) {
      throw new OrderCreationError(
        `${displayName} no puede exceder ${limits.max} caracteres`,
        `${fieldCode.toUpperCase()}_TOO_LONG`,
        400
      );
    }

    if (pattern && !pattern.test(trimmed)) {
      throw new OrderCreationError(
        `${displayName} contiene caracteres no permitidos`,
        `INVALID_${fieldCode.toUpperCase()}_CHARS`,
        400
      );
    }
  }

  /**
   * Valida el ID del usuario creador
   * @private
   * @param {string} createdBy - ID de usuario a validar
   * @throws {OrderCreationError} Si el ID es inválido
   */
  private validateCreatedBy(createdBy: string): void {
    if (!createdBy || typeof createdBy !== 'string' || createdBy.trim() === '') {
      throw new OrderCreationError(
        'El ID del usuario creador es requerido',
        'INVALID_CREATED_BY',
        400
      );
    }
  }

  /**
   * Valida el email del cliente usando regex estándar
   * @private
   * @param {string} email - Email a validar
   * @throws {OrderCreationError} Si el email es inválido
   */
  private validateEmail(email: string): void {
    const normalized = email.trim().toLowerCase();

    if (!CreateOrder.PATTERNS.EMAIL.test(normalized)) {
      throw new OrderCreationError(
        'El email del cliente no es válido',
        'INVALID_CLIENT_EMAIL',
        400
      );
    }
  }

  /**
   * Valida el teléfono del cliente
   * Acepta formatos internacionales: +57 300 123 4567, 3001234567, (300) 123-4567
   * @private
   * @param {string} phone - Teléfono a validar
   * @throws {OrderCreationError} Si el teléfono es inválido
   */
  private validatePhone(phone: string): void {
    const cleanPhone = phone.trim().replace(/\s/g, '');

    if (!CreateOrder.PATTERNS.PHONE.test(cleanPhone)) {
      throw new OrderCreationError(
        'El teléfono del cliente no es válido',
        'INVALID_CLIENT_PHONE',
        400
      );
    }
  }

  /**
   * Valida la fecha estimada de inicio
   * La fecha debe ser válida, no estar en el pasado, y no exceder 2 años
   * @private
   * @param {Date} date - Fecha a validar
   * @throws {OrderCreationError} Si la fecha es inválida
   */
  private validateEstimatedDate(date: Date): void {
    const estimatedDate = this.normalizeDate(new Date(date));

    if (Number.isNaN(estimatedDate.getTime())) {
      throw new OrderCreationError(
        'La fecha estimada de inicio no es válida',
        'INVALID_ESTIMATED_DATE',
        400
      );
    }

    const today = this.normalizeDate(new Date());

    if (estimatedDate < today) {
      throw new OrderCreationError(
        'La fecha estimada de inicio no puede ser en el pasado',
        'ESTIMATED_DATE_IN_PAST',
        400
      );
    }

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + CreateOrder.MAX_FUTURE_YEARS);

    if (estimatedDate > maxDate) {
      throw new OrderCreationError(
        `La fecha estimada de inicio no puede ser más de ${CreateOrder.MAX_FUTURE_YEARS} años en el futuro`,
        'ESTIMATED_DATE_TOO_FAR',
        400
      );
    }
  }

  /**
   * Normaliza una fecha eliminando horas/minutos/segundos
   * @private
   * @param {Date} date - Fecha a normalizar
   * @returns {Date} Fecha normalizada a medianoche
   */
  private normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }
}





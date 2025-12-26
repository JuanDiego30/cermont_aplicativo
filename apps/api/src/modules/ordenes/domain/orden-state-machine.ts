import { BadRequestException } from '@nestjs/common';

export enum OrdenEstado {
  PENDIENTE = 'PENDIENTE',
  PLANEACION = 'PLANEACION',
  EJECUCION = 'EJECUCION',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA',
}

/**
 * Máquina de estados para validar transiciones de órdenes
 */
export class OrdenStateMachine {
  // Transiciones permitidas desde cada estado
  private static readonly TRANSITIONS: Record<OrdenEstado, OrdenEstado[]> = {
    [OrdenEstado.PENDIENTE]: [
      OrdenEstado.PLANEACION,
      OrdenEstado.CANCELADA,
    ],
    [OrdenEstado.PLANEACION]: [
      OrdenEstado.EJECUCION,
      OrdenEstado.PENDIENTE,
      OrdenEstado.CANCELADA,
    ],
    [OrdenEstado.EJECUCION]: [
      OrdenEstado.FINALIZADA,
      OrdenEstado.PLANEACION,
      OrdenEstado.CANCELADA,
    ],
    [OrdenEstado.FINALIZADA]: [
      // Estado terminal, solo puede reabrir a PENDIENTE en casos excepcionales
      OrdenEstado.PENDIENTE,
    ],
    [OrdenEstado.CANCELADA]: [
      // Puede reactivarse a PENDIENTE
      OrdenEstado.PENDIENTE,
    ],
  };

  // Transiciones que requieren motivo obligatorio
  private static readonly REQUIRES_REASON: OrdenEstado[] = [
    OrdenEstado.CANCELADA,
    OrdenEstado.FINALIZADA,
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
      throw new BadRequestException(
        `No se puede cambiar de ${fromEstado} a ${toEstado}. ` +
        `Transiciones permitidas: ${allowedTransitions.join(', ')}`
      );
    }

    // Validar que tenga motivo si es requerido
    if (this.REQUIRES_REASON.includes(toEstado) && !motivo) {
      throw new BadRequestException(
        `El campo "motivo" es obligatorio al cambiar a estado ${toEstado}`
      );
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
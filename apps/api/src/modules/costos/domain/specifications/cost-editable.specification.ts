/**
 * Specification: CostEditableSpecification
 * 
 * Verifica que un costo sea editable (menos de 30 días)
 */

import { Costo } from '../entities/costo.entity';

export class CostEditableSpecification {
  /**
   * Verificar si se satisface la especificación
   */
  public isSatisfiedBy(cost: Costo): boolean {
    return cost.isEditable() && !cost.isDeleted();
  }
}


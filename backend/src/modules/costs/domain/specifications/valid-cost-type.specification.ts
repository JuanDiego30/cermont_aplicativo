/**
 * Specification: ValidCostTypeSpecification
 *
 * Verifica que el tipo de costo sea válido
 */

import { Costo } from "../entities/costo.entity";

export class ValidCostTypeSpecification {
  /**
   * Verificar si se satisface la especificación
   */
  public isSatisfiedBy(cost: Costo): boolean {
    // El tipo ya está validado en el Value Object
    // Esta especificación puede extenderse con reglas adicionales
    return cost.getType() !== null && cost.getCategory() !== null;
  }
}

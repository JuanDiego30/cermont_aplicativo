/**
 * @exception InvalidCostAmountException
 *
 * Excepción cuando el monto de un costo es inválido.
 */
import { ValidationError } from "../../../../shared/domain/exceptions";

export class InvalidCostAmountException extends ValidationError {
  constructor(message: string, amount?: unknown) {
    super(message, "amount", amount);
    this.name = "InvalidCostAmountException";
    Object.setPrototypeOf(this, InvalidCostAmountException.prototype);
  }
}


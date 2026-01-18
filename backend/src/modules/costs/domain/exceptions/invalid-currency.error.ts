/**
 * @exception InvalidCurrencyException
 *
 * Excepción cuando la moneda no es válida (ISO 4217).
 */
import { ValidationError } from '../../../../shared/domain/exceptions';

export class InvalidCurrencyException extends ValidationError {
  constructor(message: string, currency?: string) {
    super(message, 'currency', currency);
    this.name = 'InvalidCurrencyException';
    Object.setPrototypeOf(this, InvalidCurrencyException.prototype);
  }
}

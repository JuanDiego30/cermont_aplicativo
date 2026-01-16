/**
 * @exception CierreNotApprovableException
 *
 * Thrown when trying to approve a cierre in an invalid state.
 */
export class CierreNotApprovableException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CierreNotApprovableException';
    Object.setPrototypeOf(this, CierreNotApprovableException.prototype);
  }
}

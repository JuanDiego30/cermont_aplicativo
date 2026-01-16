/**
 * @exception PrerequisitesNotMetException
 *
 * Thrown when cierre prerequisites are not met.
 */
export class PrerequisitesNotMetException extends Error {
  constructor(
    message: string,
    public readonly missingPrerequisites: string[]
  ) {
    super(message);
    this.name = 'PrerequisitesNotMetException';
    Object.setPrototypeOf(this, PrerequisitesNotMetException.prototype);
  }
}

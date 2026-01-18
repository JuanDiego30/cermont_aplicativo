/**
 * Domain Exceptions for Ejecucion bounded context
 */
import { BusinessRuleViolationError, ValidationError } from '../../../../shared/domain/exceptions';

export class ExecutionNotStartableException extends BusinessRuleViolationError {
  constructor(reason: string) {
    super(`Cannot start execution: ${reason}`, 'EXECUTION_NOT_STARTABLE');
  }
}

export class ExecutionAlreadyCompletedException extends BusinessRuleViolationError {
  constructor(ejecucionId: string) {
    super(`Execution ${ejecucionId} is already completed`, 'EXECUTION_ALREADY_COMPLETED');
  }
}

export class InvalidStateTransitionException extends BusinessRuleViolationError {
  constructor(currentState: string, targetState: string) {
    super(`Cannot transition from ${currentState} to ${targetState}`, 'INVALID_STATE_TRANSITION');
  }
}

export class LocationOutOfBoundsException extends BusinessRuleViolationError {
  constructor(distance: number, allowedRadius: number) {
    super(
      `Location is ${distance.toFixed(0)}m from work site, allowed radius is ${allowedRadius}m`,
      'LOCATION_OUT_OF_BOUNDS'
    );
  }
}

export class InvalidProgressException extends ValidationError {
  constructor(message: string) {
    super(message, 'progress');
  }
}

export class RequiredEvidenceMissingException extends BusinessRuleViolationError {
  constructor(missingTypes: string[]) {
    super(
      `Missing required evidence types: ${missingTypes.join(', ')}`,
      'REQUIRED_EVIDENCE_MISSING'
    );
  }
}

export class EvidenceFileTooLargeException extends ValidationError {
  constructor(actualSize: number, maxSize: number) {
    super(`File size ${actualSize} bytes exceeds maximum ${maxSize} bytes`, 'file');
  }
}

export class InvalidEvidenceTypeException extends ValidationError {
  constructor(mimeType: string) {
    super(`Invalid file type: ${mimeType}`, 'file');
  }
}

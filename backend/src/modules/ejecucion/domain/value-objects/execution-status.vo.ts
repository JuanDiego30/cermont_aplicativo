/**
 * @vo ExecutionStatus
 * Value Object representing the status of an Ejecucion with State Machine logic.
 */

export enum ExecutionStatusEnum {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
}

const VALID_TRANSITIONS: Record<ExecutionStatusEnum, ExecutionStatusEnum[]> = {
  [ExecutionStatusEnum.NOT_STARTED]: [ExecutionStatusEnum.IN_PROGRESS],
  [ExecutionStatusEnum.IN_PROGRESS]: [
    ExecutionStatusEnum.PAUSED,
    ExecutionStatusEnum.COMPLETED,
  ],
  [ExecutionStatusEnum.PAUSED]: [ExecutionStatusEnum.IN_PROGRESS],
  [ExecutionStatusEnum.COMPLETED]: [],
};

export class ExecutionStatus {
  private constructor(private readonly value: ExecutionStatusEnum) {}

  public static notStarted(): ExecutionStatus {
    return new ExecutionStatus(ExecutionStatusEnum.NOT_STARTED);
  }

  public static inProgress(): ExecutionStatus {
    return new ExecutionStatus(ExecutionStatusEnum.IN_PROGRESS);
  }

  public static paused(): ExecutionStatus {
    return new ExecutionStatus(ExecutionStatusEnum.PAUSED);
  }

  public static completed(): ExecutionStatus {
    return new ExecutionStatus(ExecutionStatusEnum.COMPLETED);
  }

  public static fromString(value: string): ExecutionStatus {
    const upperValue = value.toUpperCase().replace(/-/g, "_");
    if (
      !Object.values(ExecutionStatusEnum).includes(
        upperValue as ExecutionStatusEnum,
      )
    ) {
      throw new Error(`Invalid ExecutionStatus: ${value}`);
    }
    return new ExecutionStatus(upperValue as ExecutionStatusEnum);
  }

  public getValue(): ExecutionStatusEnum {
    return this.value;
  }

  public canTransitionTo(newStatus: ExecutionStatus): boolean {
    const allowedTransitions = VALID_TRANSITIONS[this.value] || [];
    return allowedTransitions.includes(newStatus.value);
  }

  public isNotStarted(): boolean {
    return this.value === ExecutionStatusEnum.NOT_STARTED;
  }

  public isActive(): boolean {
    return this.value === ExecutionStatusEnum.IN_PROGRESS;
  }

  public isPaused(): boolean {
    return this.value === ExecutionStatusEnum.PAUSED;
  }

  public isCompleted(): boolean {
    return this.value === ExecutionStatusEnum.COMPLETED;
  }

  public canUpdate(): boolean {
    return [
      ExecutionStatusEnum.IN_PROGRESS,
      ExecutionStatusEnum.PAUSED,
    ].includes(this.value);
  }

  public equals(other: ExecutionStatus): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}

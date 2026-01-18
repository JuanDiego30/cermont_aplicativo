/**
 * @valueObject EvidenciaStatus
 * @description Value Object for evidencia processing status with state machine
 */

export enum EvidenciaStatusEnum {
  PENDING = 'PENDING', // Uploaded, awaiting processing
  PROCESSING = 'PROCESSING', // Currently being processed
  READY = 'READY', // Ready for use
  FAILED = 'FAILED', // Processing failed
}

export class EvidenciaStatus {
  private static readonly VALID_TRANSITIONS: Map<EvidenciaStatusEnum, EvidenciaStatusEnum[]> =
    new Map([
      [EvidenciaStatusEnum.PENDING, [EvidenciaStatusEnum.PROCESSING, EvidenciaStatusEnum.READY]],
      [EvidenciaStatusEnum.PROCESSING, [EvidenciaStatusEnum.READY, EvidenciaStatusEnum.FAILED]],
      [EvidenciaStatusEnum.FAILED, [EvidenciaStatusEnum.PROCESSING]], // Retry
      [EvidenciaStatusEnum.READY, []], // Terminal state
    ]);

  private constructor(private readonly _value: EvidenciaStatusEnum) {
    Object.freeze(this);
  }

  public static create(value: string): EvidenciaStatus {
    const enumValue = EvidenciaStatusEnum[value as keyof typeof EvidenciaStatusEnum];
    if (!enumValue) {
      throw new Error(`Invalid EvidenciaStatus: ${value}`);
    }
    return new EvidenciaStatus(enumValue);
  }

  public static pending(): EvidenciaStatus {
    return new EvidenciaStatus(EvidenciaStatusEnum.PENDING);
  }

  public static processing(): EvidenciaStatus {
    return new EvidenciaStatus(EvidenciaStatusEnum.PROCESSING);
  }

  public static ready(): EvidenciaStatus {
    return new EvidenciaStatus(EvidenciaStatusEnum.READY);
  }

  public static failed(): EvidenciaStatus {
    return new EvidenciaStatus(EvidenciaStatusEnum.FAILED);
  }

  public getValue(): EvidenciaStatusEnum {
    return this._value;
  }

  public canTransitionTo(newStatus: EvidenciaStatusEnum): boolean {
    const allowed = EvidenciaStatus.VALID_TRANSITIONS.get(this._value) || [];
    return allowed.includes(newStatus);
  }

  public isPending(): boolean {
    return this._value === EvidenciaStatusEnum.PENDING;
  }

  public isProcessing(): boolean {
    return this._value === EvidenciaStatusEnum.PROCESSING;
  }

  public isReady(): boolean {
    return this._value === EvidenciaStatusEnum.READY;
  }

  public isFailed(): boolean {
    return this._value === EvidenciaStatusEnum.FAILED;
  }

  public equals(other: EvidenciaStatus): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}

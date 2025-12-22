/**
 * @valueObject CierreStatus
 * 
 * Status workflow for cierre administrativo
 * 
 * Transitions:
 * DRAFT → PENDING_APPROVAL → APPROVED
 *                         → REJECTED
 */

import { ValidationError } from '../exceptions';

export enum CierreStatusEnum {
    DRAFT = 'DRAFT',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

const VALID_TRANSITIONS: Record<CierreStatusEnum, CierreStatusEnum[]> = {
    [CierreStatusEnum.DRAFT]: [CierreStatusEnum.PENDING_APPROVAL],
    [CierreStatusEnum.PENDING_APPROVAL]: [CierreStatusEnum.APPROVED, CierreStatusEnum.REJECTED],
    [CierreStatusEnum.APPROVED]: [],
    [CierreStatusEnum.REJECTED]: [],
};

export class CierreStatus {
    private constructor(private readonly value: CierreStatusEnum) {
        Object.freeze(this);
    }

    static create(value: string): CierreStatus {
        if (!Object.values(CierreStatusEnum).includes(value as CierreStatusEnum)) {
            throw new ValidationError(
                `Estado inválido: ${value}. Permitidos: ${Object.values(CierreStatusEnum).join(', ')}`,
                'status',
            );
        }
        return new CierreStatus(value as CierreStatusEnum);
    }

    static draft(): CierreStatus {
        return new CierreStatus(CierreStatusEnum.DRAFT);
    }

    getValue(): CierreStatusEnum {
        return this.value;
    }

    canTransitionTo(newStatus: CierreStatus): boolean {
        return VALID_TRANSITIONS[this.value].includes(newStatus.getValue());
    }

    isApprovable(): boolean {
        return this.value === CierreStatusEnum.PENDING_APPROVAL;
    }

    isEditable(): boolean {
        return this.value === CierreStatusEnum.DRAFT;
    }

    isFinal(): boolean {
        return [CierreStatusEnum.APPROVED, CierreStatusEnum.REJECTED].includes(this.value);
    }

    equals(other: CierreStatus): boolean {
        return other instanceof CierreStatus && this.value === other.value;
    }

    toString(): string {
        return this.value;
    }

    toJSON(): string {
        return this.value;
    }
}

/**
 * @valueObject ArchiveReason
 * 
 * Representa el motivo por el cual se archivó la orden
 * 
 * Valores permitidos:
 * - USER_REQUEST: Archivado solicitado por usuario
 * - AUTO_ARCHIVE: Archivado automático por antigüedad
 * - SYSTEM: Archivado por sistema/admin
 * - MANUAL: Archivado manual por operador
 * 
 * @example
 * const reason = ArchiveReason.create('AUTO_ARCHIVE');
 * reason.isAutomatic(); // true
 */

import { ValidationError } from '../exceptions';

export enum ArchiveReasonEnum {
    USER_REQUEST = 'USER_REQUEST',
    AUTO_ARCHIVE = 'AUTO_ARCHIVE',
    SYSTEM = 'SYSTEM',
    MANUAL = 'MANUAL',
}

export class ArchiveReason {
    private constructor(private readonly value: ArchiveReasonEnum) {
        Object.freeze(this);
    }

    /**
     * Factory method para crear ArchiveReason validado
     */
    static create(value: string): ArchiveReason {
        this.validate(value);
        return new ArchiveReason(value as ArchiveReasonEnum);
    }

    private static validate(value: string): void {
        if (!Object.values(ArchiveReasonEnum).includes(value as ArchiveReasonEnum)) {
            throw new ValidationError(
                `Motivo de archivado inválido. Valores permitidos: ${Object.values(ArchiveReasonEnum).join(', ')}`,
                'archiveReason',
                value,
            );
        }
    }

    getValue(): ArchiveReasonEnum {
        return this.value;
    }

    /**
     * Verifica si fue archivado automáticamente
     */
    isAutomatic(): boolean {
        return this.value === ArchiveReasonEnum.AUTO_ARCHIVE;
    }

    /**
     * Verifica si fue archivado manualmente
     */
    isManual(): boolean {
        return [ArchiveReasonEnum.MANUAL, ArchiveReasonEnum.USER_REQUEST].includes(this.value);
    }

    /**
     * Verifica si fue archivado por sistema
     */
    isSystem(): boolean {
        return this.value === ArchiveReasonEnum.SYSTEM;
    }

    equals(other: ArchiveReason): boolean {
        if (!other || !(other instanceof ArchiveReason)) {
            return false;
        }
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }

    toJSON(): string {
        return this.value;
    }
}

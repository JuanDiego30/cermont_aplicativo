/**
 * @valueObject RejectionReason
 * 
 * Reason and comment for rejecting a cierre.
 */

import { ValidationError } from '../exceptions';

export enum RejectionReasonEnum {
    INCOMPLETE_DATA = 'INCOMPLETE_DATA',
    MISSING_DOCUMENTS = 'MISSING_DOCUMENTS',
    INCORRECT_AMOUNTS = 'INCORRECT_AMOUNTS',
    OTHER = 'OTHER',
}

export class RejectionReason {
    private constructor(
        private readonly reason: RejectionReasonEnum,
        private readonly comment: string,
    ) {
        Object.freeze(this);
    }

    static create(reason: string, comment: string): RejectionReason {
        if (!Object.values(RejectionReasonEnum).includes(reason as RejectionReasonEnum)) {
            throw new ValidationError(
                `Motivo inválido: ${reason}`,
                'reason',
            );
        }

        if (!comment || comment.trim().length === 0) {
            throw new ValidationError('Comentario es requerido al rechazar', 'comment');
        }

        if (comment.length > 500) {
            throw new ValidationError('Comentario no puede exceder 500 caracteres', 'comment');
        }

        return new RejectionReason(reason as RejectionReasonEnum, comment);
    }

    getReason(): RejectionReasonEnum {
        return this.reason;
    }

    getComment(): string {
        return this.comment;
    }

    toJSON(): Record<string, string> {
        return {
            reason: this.reason,
            comment: this.comment,
        };
    }

    equals(other: RejectionReason): boolean {
        return other instanceof RejectionReason && this.reason === other.reason;
    }

    toString(): string {
        return `${this.reason}: ${this.comment}`;
    }
}

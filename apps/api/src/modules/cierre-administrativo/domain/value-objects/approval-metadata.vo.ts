/**
 * @valueObject ApprovalMetadata
 * 
 * Metadata about who approved and when.
 */

import { ValidationError } from '../exceptions';

export class ApprovalMetadata {
    private constructor(
        private readonly approvedBy: string,
        private readonly approvedAt: Date,
        private readonly observations?: string,
    ) {
        Object.freeze(this);
    }

    static create(props: {
        approvedBy: string;
        approvedAt: Date;
        observations?: string;
    }): ApprovalMetadata {
        if (!props.approvedBy || props.approvedBy.trim().length === 0) {
            throw new ValidationError('approvedBy es requerido', 'approvedBy');
        }
        return new ApprovalMetadata(props.approvedBy, props.approvedAt, props.observations);
    }

    getApprovedBy(): string {
        return this.approvedBy;
    }

    getApprovedAt(): Date {
        return this.approvedAt;
    }

    getObservations(): string | undefined {
        return this.observations;
    }

    toJSON(): Record<string, unknown> {
        return {
            approvedBy: this.approvedBy,
            approvedAt: this.approvedAt.toISOString(),
            observations: this.observations,
        };
    }

    equals(other: ApprovalMetadata): boolean {
        return (
            other instanceof ApprovalMetadata &&
            this.approvedBy === other.approvedBy &&
            this.approvedAt.getTime() === other.approvedAt.getTime()
        );
    }

    toString(): string {
        return `Aprobado por ${this.approvedBy} el ${this.approvedAt.toISOString()}`;
    }
}

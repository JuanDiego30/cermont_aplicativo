/**
 * @valueObject ArchiveMetadata
 * 
 * Contiene metadatos sobre cuándo y por qué se archivó una orden
 * 
 * Invariantes:
 * - Siempre tiene timestamp de archivado
 * - Siempre tiene userId de quien archivó
 * - Siempre tiene motivo (ArchiveReason)
 * - Inmutable
 * 
 * @example
 * const metadata = ArchiveMetadata.create({
 *   archivedAt: new Date(),
 *   archivedBy: 'user-123',
 *   reason: 'AUTO_ARCHIVE',
 *   comment: 'Orden completada hace más de 90 días',
 * });
 */

import { ArchiveReason } from './archive-reason.vo';

export interface ArchiveMetadataProps {
    archivedAt: Date;
    archivedBy: string;
    reason: string;
    comment?: string;
}

export class ArchiveMetadata {
    private constructor(
        private readonly archivedAt: Date,
        private readonly archivedBy: string,
        private readonly reason: ArchiveReason,
        private readonly comment?: string,
    ) {
        Object.freeze(this);
    }

    /**
     * Factory method para crear ArchiveMetadata
     */
    static create(props: ArchiveMetadataProps): ArchiveMetadata {
        const reason = ArchiveReason.create(props.reason);
        return new ArchiveMetadata(
            props.archivedAt,
            props.archivedBy,
            reason,
            props.comment,
        );
    }

    /**
     * Recrear desde datos de persistencia
     */
    static fromPersistence(data: {
        archivedAt: Date | string;
        archivedBy: string;
        reason: string;
        comment?: string;
    }): ArchiveMetadata {
        return new ArchiveMetadata(
            data.archivedAt instanceof Date ? data.archivedAt : new Date(data.archivedAt),
            data.archivedBy,
            ArchiveReason.create(data.reason),
            data.comment,
        );
    }

    getArchivedAt(): Date {
        return this.archivedAt;
    }

    getArchivedBy(): string {
        return this.archivedBy;
    }

    getReason(): ArchiveReason {
        return this.reason;
    }

    getComment(): string | undefined {
        return this.comment;
    }

    /**
     * Verifica si fue archivado automáticamente
     */
    isAutoArchived(): boolean {
        return this.reason.isAutomatic();
    }

    toJSON(): Record<string, unknown> {
        return {
            archivedAt: this.archivedAt.toISOString(),
            archivedBy: this.archivedBy,
            reason: this.reason.getValue(),
            comment: this.comment,
        };
    }

    equals(other: ArchiveMetadata): boolean {
        if (!other || !(other instanceof ArchiveMetadata)) {
            return false;
        }
        return (
            this.archivedAt.getTime() === other.archivedAt.getTime() &&
            this.archivedBy === other.archivedBy &&
            this.reason.equals(other.reason)
        );
    }

    toString(): string {
        return `Archivado el ${this.archivedAt.toISOString()} por ${this.archivedBy} (${this.reason.toString()})`;
    }
}

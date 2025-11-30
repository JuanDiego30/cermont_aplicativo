/**
 * Entity Types
 * Tipos base para entidades del sistema
 */

export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuditableEntity extends BaseEntity {
    createdBy: string;
    updatedBy?: string;
}

export interface SoftDeleteEntity {
    deletedAt?: string | null;
}

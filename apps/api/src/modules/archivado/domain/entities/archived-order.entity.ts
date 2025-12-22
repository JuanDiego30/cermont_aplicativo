/**
 * @entity ArchivedOrder
 * 
 * Aggregate Root del dominio de archivado.
 * Representa una orden que ha sido archivada con todos sus metadatos.
 * 
 * Invariantes:
 * - Siempre tiene una orderId referencia válida
 * - Siempre tiene metadatos de archivado (quién, cuándo, por qué)
 * - No puede des-archivarse si ya está desarchivada
 * - Almacena snapshot de orden al momento del archivado
 * 
 * Domain Events:
 * - OrderArchivedEvent: cuando se archiva una orden
 * - OrderUnarchivedEvent: cuando se desarchiva
 */

import { ArchivedOrderId } from '../value-objects/archived-order-id.vo';
import { ArchiveMetadata } from '../value-objects/archive-metadata.vo';
import { OrderArchivedEvent, OrderUnarchivedEvent } from '../events';
import { BusinessRuleViolationError } from '../exceptions';

export interface ArchivedOrderProps {
    id: ArchivedOrderId;
    orderId: string;
    orderNumber: string;
    clientId: string;
    clientName: string;
    metadata: ArchiveMetadata;
    archivedData: Record<string, unknown>;
    createdAt: Date;
    unarchivedAt?: Date;
    unarchivedBy?: string;
}

export interface CreateArchivedOrderData {
    orderId: string;
    orderNumber: string;
    clientId: string;
    clientName: string;
    archivedBy: string;
    reason: string;
    comment?: string;
    archivedData: Record<string, unknown>;
}

export interface PersistenceData {
    id: string;
    orderId: string;
    orderNumber: string;
    clientId: string;
    clientName: string;
    metadata: Record<string, unknown>;
    archivedData: Record<string, unknown>;
    createdAt: Date;
    unarchivedAt?: Date | null;
    unarchivedBy?: string | null;
}

type DomainEvent = OrderArchivedEvent | OrderUnarchivedEvent;

export class ArchivedOrderEntity {
    private domainEvents: DomainEvent[] = [];
    private props: ArchivedOrderProps;

    private constructor(props: ArchivedOrderProps) {
        this.props = props;
    }

    // ═══════════════════════════════════════════════════════════════
    // FACTORY METHODS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Crear nuevo archivo de orden
     */
    static create(data: CreateArchivedOrderData): ArchivedOrderEntity {
        const id = ArchivedOrderId.generate();
        const now = new Date();

        const metadata = ArchiveMetadata.create({
            archivedAt: now,
            archivedBy: data.archivedBy,
            reason: data.reason,
            comment: data.comment,
        });

        const entity = new ArchivedOrderEntity({
            id,
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            clientId: data.clientId,
            clientName: data.clientName,
            metadata,
            archivedData: data.archivedData,
            createdAt: now,
        });

        // Registrar evento de dominio
        entity.addDomainEvent(
            new OrderArchivedEvent(
                id.getValue(),
                data.orderId,
                data.orderNumber,
                data.reason,
                data.archivedBy,
            ),
        );

        return entity;
    }

    /**
     * Reconstitución desde base de datos
     */
    static fromPersistence(data: PersistenceData): ArchivedOrderEntity {
        return new ArchivedOrderEntity({
            id: ArchivedOrderId.create(data.id),
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            clientId: data.clientId,
            clientName: data.clientName,
            metadata: ArchiveMetadata.fromPersistence(data.metadata as {
                archivedAt: Date | string;
                archivedBy: string;
                reason: string;
                comment?: string;
            }),
            archivedData: data.archivedData,
            createdAt: data.createdAt,
            unarchivedAt: data.unarchivedAt ?? undefined,
            unarchivedBy: data.unarchivedBy ?? undefined,
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // GETTERS
    // ═══════════════════════════════════════════════════════════════

    get id(): ArchivedOrderId {
        return this.props.id;
    }

    get orderId(): string {
        return this.props.orderId;
    }

    get orderNumber(): string {
        return this.props.orderNumber;
    }

    get clientId(): string {
        return this.props.clientId;
    }

    get clientName(): string {
        return this.props.clientName;
    }

    get metadata(): ArchiveMetadata {
        return this.props.metadata;
    }

    get archivedData(): Record<string, unknown> {
        return { ...this.props.archivedData };
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get unarchivedAt(): Date | undefined {
        return this.props.unarchivedAt;
    }

    get unarchivedBy(): string | undefined {
        return this.props.unarchivedBy;
    }

    // ═══════════════════════════════════════════════════════════════
    // BUSINESS LOGIC
    // ═══════════════════════════════════════════════════════════════

    /**
     * Verifica si la orden está archivada
     */
    isArchived(): boolean {
        return !this.props.unarchivedAt;
    }

    /**
     * Desarchivar orden
     * 
     * Reglas:
     * - Solo puede desarchivarse si está actualmente archivada
     * - Se registra quién y cuándo
     * - Se publica evento
     */
    unarchive(unarchivedBy: string): void {
        if (!this.isArchived()) {
            throw new BusinessRuleViolationError(
                'Esta orden ya fue desarchivada',
                'ALREADY_UNARCHIVED',
            );
        }

        this.props.unarchivedAt = new Date();
        this.props.unarchivedBy = unarchivedBy;

        this.addDomainEvent(
            new OrderUnarchivedEvent(
                this.props.id.getValue(),
                this.props.orderId,
                unarchivedBy,
            ),
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // DOMAIN EVENTS
    // ═══════════════════════════════════════════════════════════════

    getDomainEvents(): DomainEvent[] {
        return [...this.domainEvents];
    }

    clearDomainEvents(): void {
        this.domainEvents = [];
    }

    private addDomainEvent(event: DomainEvent): void {
        this.domainEvents.push(event);
    }

    // ═══════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════════════

    toPersistence(): PersistenceData {
        return {
            id: this.props.id.getValue(),
            orderId: this.props.orderId,
            orderNumber: this.props.orderNumber,
            clientId: this.props.clientId,
            clientName: this.props.clientName,
            metadata: this.props.metadata.toJSON(),
            archivedData: this.props.archivedData,
            createdAt: this.props.createdAt,
            unarchivedAt: this.props.unarchivedAt ?? null,
            unarchivedBy: this.props.unarchivedBy ?? null,
        };
    }
}

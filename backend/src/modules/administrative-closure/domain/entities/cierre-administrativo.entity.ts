/**
 * @entity CierreAdministrativo
 *
 * Aggregate Root: Administrative closure for work orders
 *
 * Invariantes:
 * - Debe tener al menos 1 línea de detalle
 * - Solo puede aprobarse si está en PENDING_APPROVAL
 * - No puede modificarse después de APPROVED/REJECTED
 */

import { CierreId } from '../value-objects/cierre-id.vo';
import { CierreStatus, CierreStatusEnum } from '../value-objects/cierre-status.vo';
import { CierreTotals } from '../value-objects/cierre-totals.vo';
import { ApprovalMetadata } from '../value-objects/approval-metadata.vo';
import { RejectionReason } from '../value-objects/rejection-reason.vo';
import { CierreLineItem } from './cierre-line-item.entity';
import { CierreCreatedEvent, CierreApprovedEvent, CierreRejectedEvent } from '../events';
import { CierreNotApprovableException } from '../exceptions';

type DomainEvent = CierreCreatedEvent | CierreApprovedEvent | CierreRejectedEvent;

interface CierreAdministrativoProps {
  id: CierreId;
  ordenId: string;
  status: CierreStatus;
  items: CierreLineItem[];
  totals: CierreTotals;
  observations: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  approvalMetadata?: ApprovalMetadata;
  rejectionReason?: RejectionReason;
}

export class CierreAdministrativo {
  private domainEvents: DomainEvent[] = [];
  private props: CierreAdministrativoProps;

  private constructor(props: CierreAdministrativoProps) {
    this.props = props;
  }

  // ═══════════════════════════════════════════════════════════════
  // FACTORY METHODS
  // ═══════════════════════════════════════════════════════════════

  static create(data: {
    ordenId: string;
    items: {
      concepto: string;
      cantidad: number;
      precioUnitario: number;
      categoria: string;
    }[];
    createdBy: string;
    observations?: string;
  }): CierreAdministrativo {
    const id = CierreId.generate();
    const now = new Date();
    const status = CierreStatus.draft();

    const lineItems = data.items.map(item => CierreLineItem.create(item));
    const totals = CierreTotals.calculate(
      lineItems.map(i => ({ categoria: i.categoria, subtotal: i.subtotal }))
    );

    const cierre = new CierreAdministrativo({
      id,
      ordenId: data.ordenId,
      status,
      items: lineItems,
      totals,
      observations: data.observations || null,
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    });

    cierre.addDomainEvent(new CierreCreatedEvent(id.getValue(), data.ordenId, data.createdBy));

    return cierre;
  }

  static fromPersistence(data: {
    id: string;
    ordenId: string;
    status: string;
    items: any[];
    totals: any;
    observations: string | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    approvalMetadata?: any;
    rejectionReason?: any;
  }): CierreAdministrativo {
    return new CierreAdministrativo({
      id: CierreId.create(data.id),
      ordenId: data.ordenId,
      status: CierreStatus.create(data.status),
      items: data.items.map((i: any) => CierreLineItem.fromPersistence(i)),
      totals: CierreTotals.fromValues(data.totals),
      observations: data.observations,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      approvalMetadata: data.approvalMetadata
        ? ApprovalMetadata.create({
            approvedBy: data.approvalMetadata.approvedBy,
            approvedAt: new Date(data.approvalMetadata.approvedAt),
            observations: data.approvalMetadata.observations,
          })
        : undefined,
      rejectionReason: data.rejectionReason
        ? RejectionReason.create(data.rejectionReason.reason, data.rejectionReason.comment)
        : undefined,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // BUSINESS METHODS
  // ═══════════════════════════════════════════════════════════════

  submitForApproval(): void {
    const newStatus = CierreStatus.create(CierreStatusEnum.PENDING_APPROVAL);
    if (!this.props.status.canTransitionTo(newStatus)) {
      throw new CierreNotApprovableException(
        `No puede enviarse a aprobación desde estado ${this.props.status.toString()}`
      );
    }
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  approve(approvedBy: string, observations?: string): void {
    if (!this.props.status.isApprovable()) {
      throw new CierreNotApprovableException(
        `Cierre debe estar en PENDING_APPROVAL. Estado actual: ${this.props.status.toString()}`
      );
    }

    this.props.status = CierreStatus.create(CierreStatusEnum.APPROVED);
    this.props.approvalMetadata = ApprovalMetadata.create({
      approvedBy,
      approvedAt: new Date(),
      observations,
    });
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new CierreApprovedEvent(
        this.props.id.getValue(),
        this.props.ordenId,
        approvedBy,
        this.props.totals.toJSON()
      )
    );
  }

  reject(reason: string, comment: string, rejectedBy: string): void {
    if (!this.props.status.isApprovable()) {
      throw new CierreNotApprovableException('Solo puede rechazarse cierre en PENDING_APPROVAL');
    }

    this.props.status = CierreStatus.create(CierreStatusEnum.REJECTED);
    this.props.rejectionReason = RejectionReason.create(reason, comment);
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new CierreRejectedEvent(
        this.props.id.getValue(),
        this.props.ordenId,
        rejectedBy,
        this.props.rejectionReason.toJSON()
      )
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════

  get id(): CierreId {
    return this.props.id;
  }

  get ordenId(): string {
    return this.props.ordenId;
  }

  get status(): CierreStatus {
    return this.props.status;
  }

  get items(): CierreLineItem[] {
    return [...this.props.items];
  }

  get totals(): CierreTotals {
    return this.props.totals;
  }

  get observations(): string | null {
    return this.props.observations;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get approvalMetadata(): ApprovalMetadata | undefined {
    return this.props.approvalMetadata;
  }

  get rejectionReason(): RejectionReason | undefined {
    return this.props.rejectionReason;
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

  toPersistence(): Record<string, unknown> {
    return {
      id: this.props.id.getValue(),
      ordenId: this.props.ordenId,
      status: this.props.status.getValue(),
      items: this.props.items.map(i => i.toJSON()),
      totals: this.props.totals.toJSON(),
      observations: this.props.observations,
      createdBy: this.props.createdBy,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      approvalMetadata: this.props.approvalMetadata?.toJSON(),
      rejectionReason: this.props.rejectionReason?.toJSON(),
    };
  }
}

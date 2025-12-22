/**
 * @event OrderArchivedEvent
 * 
 * Evento de dominio emitido cuando se archiva una orden.
 */

export class OrderArchivedEvent {
    readonly eventName = 'order.archived';
    readonly occurredAt: Date;

    constructor(
        readonly archivedOrderId: string,
        readonly orderId: string,
        readonly orderNumber: string,
        readonly reason: string,
        readonly archivedBy: string,
    ) {
        this.occurredAt = new Date();
        Object.freeze(this);
    }

    toJSON(): Record<string, unknown> {
        return {
            eventName: this.eventName,
            archivedOrderId: this.archivedOrderId,
            orderId: this.orderId,
            orderNumber: this.orderNumber,
            reason: this.reason,
            archivedBy: this.archivedBy,
            occurredAt: this.occurredAt.toISOString(),
        };
    }
}

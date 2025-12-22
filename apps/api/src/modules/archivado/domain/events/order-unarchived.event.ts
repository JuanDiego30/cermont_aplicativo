/**
 * @event OrderUnarchivedEvent
 * 
 * Evento de dominio emitido cuando se desarchiva una orden.
 */

export class OrderUnarchivedEvent {
    readonly eventName = 'order.unarchived';
    readonly occurredAt: Date;

    constructor(
        readonly archivedOrderId: string,
        readonly orderId: string,
        readonly unarchivedBy: string,
    ) {
        this.occurredAt = new Date();
        Object.freeze(this);
    }

    toJSON(): Record<string, unknown> {
        return {
            eventName: this.eventName,
            archivedOrderId: this.archivedOrderId,
            orderId: this.orderId,
            unarchivedBy: this.unarchivedBy,
            occurredAt: this.occurredAt.toISOString(),
        };
    }
}

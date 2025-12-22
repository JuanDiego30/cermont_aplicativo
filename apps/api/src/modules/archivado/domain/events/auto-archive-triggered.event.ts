/**
 * @event AutoArchiveTriggeredEvent
 * 
 * Evento de dominio emitido cuando se ejecuta archivado automático.
 */

export class AutoArchiveTriggeredEvent {
    readonly eventName = 'archive.auto-triggered';
    readonly occurredAt: Date;

    constructor(
        readonly totalArchived: number,
        readonly criteria: {
            daysOld: number;
            status: string;
        },
    ) {
        this.occurredAt = new Date();
        Object.freeze(this);
    }

    toJSON(): Record<string, unknown> {
        return {
            eventName: this.eventName,
            totalArchived: this.totalArchived,
            criteria: this.criteria,
            occurredAt: this.occurredAt.toISOString(),
        };
    }
}

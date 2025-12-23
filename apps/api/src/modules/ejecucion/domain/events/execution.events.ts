/**
 * Domain Events for Ejecucion bounded context
 */

interface BaseEvent {
    eventName: string;
    occurredAt: Date;
    payload: Record<string, unknown>;
}

export class ExecutionStartedEvent implements BaseEvent {
    public readonly eventName = 'execution.started';
    public readonly occurredAt: Date;

    constructor(
        public readonly payload: {
            ejecucionId: string;
            ordenId: string;
            startedBy: string;
            location?: Record<string, unknown>;
            timestamp: Date;
        },
    ) {
        this.occurredAt = payload.timestamp;
    }
}

export class ExecutionPausedEvent implements BaseEvent {
    public readonly eventName = 'execution.paused';
    public readonly occurredAt: Date;

    constructor(
        public readonly payload: {
            ejecucionId: string;
            ordenId: string;
            pausedBy: string;
            reason: string;
            timestamp: Date;
        },
    ) {
        this.occurredAt = payload.timestamp;
    }
}

export class ExecutionResumedEvent implements BaseEvent {
    public readonly eventName = 'execution.resumed';
    public readonly occurredAt: Date;

    constructor(
        public readonly payload: {
            ejecucionId: string;
            ordenId: string;
            resumedBy: string;
            location?: Record<string, unknown>;
            timestamp: Date;
        },
    ) {
        this.occurredAt = payload.timestamp;
    }
}

export class ProgressUpdatedEvent implements BaseEvent {
    public readonly eventName = 'execution.progress-updated';
    public readonly occurredAt: Date;

    constructor(
        public readonly payload: {
            ejecucionId: string;
            ordenId: string;
            oldProgress: number;
            newProgress: number;
            updatedBy: string;
            timestamp: Date;
        },
    ) {
        this.occurredAt = payload.timestamp;
    }
}

export class ExecutionCompletedEvent implements BaseEvent {
    public readonly eventName = 'execution.completed';
    public readonly occurredAt: Date;

    constructor(
        public readonly payload: {
            ejecucionId: string;
            ordenId: string;
            completedBy: string;
            totalDuration: string;
            finalProgress: number;
            timestamp: Date;
        },
    ) {
        this.occurredAt = payload.timestamp;
    }
}

export class EvidenceUploadedEvent implements BaseEvent {
    public readonly eventName = 'execution.evidence-uploaded';
    public readonly occurredAt: Date;

    constructor(
        public readonly payload: {
            ejecucionId: string;
            ordenId: string;
            evidenceId: string;
            evidenceType: string;
            uploadedBy: string;
            timestamp: Date;
        },
    ) {
        this.occurredAt = payload.timestamp;
    }
}

export class LocationUpdatedEvent implements BaseEvent {
    public readonly eventName = 'execution.location-updated';
    public readonly occurredAt: Date;

    constructor(
        public readonly payload: {
            ejecucionId: string;
            ordenId: string;
            oldLocation?: Record<string, unknown>;
            newLocation: Record<string, unknown>;
            timestamp: Date;
        },
    ) {
        this.occurredAt = payload.timestamp;
    }
}

/**
 * Domain Events for Kits Module
 */

export class KitCreatedEvent {
    public readonly occurredOn: Date;

    constructor(
        public readonly payload: {
            kitId: string;
            nombre: string;
            categoria: string;
            creadoPor: string;
        },
    ) {
        this.occurredOn = new Date();
    }
}

export class KitUpdatedEvent {
    public readonly occurredOn: Date;

    constructor(
        public readonly payload: {
            kitId: string;
            nombre: string;
        },
    ) {
        this.occurredOn = new Date();
    }
}

export class KitItemAddedEvent {
    public readonly occurredOn: Date;

    constructor(
        public readonly payload: {
            kitId: string;
            itemId: string;
            itemNombre: string;
        },
    ) {
        this.occurredOn = new Date();
    }
}

export class KitItemRemovedEvent {
    public readonly occurredOn: Date;

    constructor(
        public readonly payload: {
            kitId: string;
            itemId: string;
            itemNombre: string;
        },
    ) {
        this.occurredOn = new Date();
    }
}

export class KitAssignedEvent {
    public readonly occurredOn: Date;

    constructor(
        public readonly payload: {
            kitId: string;
            asignadoA: string;
            asignadoPor: string;
            ordenId?: string;
        },
    ) {
        this.occurredOn = new Date();
    }
}

export class KitReturnedEvent {
    public readonly occurredOn: Date;

    constructor(
        public readonly payload: {
            kitId: string;
            devueltoPor: string;
            itemsFaltantes: string[];
        },
    ) {
        this.occurredOn = new Date();
    }
}

export class KitActivatedEvent {
    public readonly occurredOn: Date;

    constructor(
        public readonly payload: {
            kitId: string;
        },
    ) {
        this.occurredOn = new Date();
    }
}

export class KitDeactivatedEvent {
    public readonly occurredOn: Date;

    constructor(
        public readonly payload: {
            kitId: string;
        },
    ) {
        this.occurredOn = new Date();
    }
}

import { EventEmitter2 } from '@nestjs/event-emitter';

export type DomainEventLike = {
  eventName: string;
};

export type DomainEventEntityLike = {
  getDomainEvents(): DomainEventLike[];
  clearDomainEvents(): void;
};

export function publishDomainEvents(
  entity: DomainEventEntityLike,
  eventEmitter: EventEmitter2
): void {
  const domainEvents = entity.getDomainEvents();
  for (const event of domainEvents) {
    eventEmitter.emit(event.eventName, event);
  }
  entity.clearDomainEvents();
}

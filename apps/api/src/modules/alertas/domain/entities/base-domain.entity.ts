export interface DomainEvent {
  eventName: string;
}

export abstract class BaseDomainEntity {
  protected _domainEvents: DomainEvent[] = [];
  protected _createdAt: Date;
  protected _updatedAt: Date;

  protected constructor(
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  public getCreatedAt(): Date {
    return this._createdAt;
  }

  public getUpdatedAt(): Date {
    return this._updatedAt;
  }

  public getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
}

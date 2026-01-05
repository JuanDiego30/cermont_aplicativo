export abstract class AggregateRoot<TEvent = any> {
  protected _domainEvents: TEvent[] = [];

  public getDomainEvents(): TEvent[] {
    return [...this._domainEvents];
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  protected addDomainEvent(event: TEvent): void {
    this._domainEvents.push(event);
  }
}

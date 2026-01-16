/**
 * Domain Event: HESCreatedEvent
 *
 * Se dispara cuando se crea una nueva HES
 */

export class HESCreatedEvent {
  constructor(
    public readonly payload: {
      hesId: string;
      numero: string;
      ordenId: string;
    }
  ) {}
}

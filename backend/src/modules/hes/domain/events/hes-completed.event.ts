/**
 * Domain Event: HESCompletedEvent
 *
 * Se dispara cuando una HES se completa
 */

export class HESCompletedEvent {
  constructor(
    public readonly payload: {
      hesId: string;
      numero: string;
      ordenId: string;
    }
  ) {}
}

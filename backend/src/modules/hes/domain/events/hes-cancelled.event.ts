/**
 * Domain Event: HESCancelledEvent
 *
 * Se dispara cuando una HES se anula
 */

export class HESCancelledEvent {
  constructor(
    public readonly payload: {
      hesId: string;
      numero: string;
      motivo: string;
    }
  ) {}
}

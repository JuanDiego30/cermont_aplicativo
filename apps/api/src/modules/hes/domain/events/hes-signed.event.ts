/**
 * Domain Event: HESSignedEvent
 *
 * Se dispara cuando se firma una HES (cliente o técnico)
 */

export class HESSignedEvent {
  constructor(
    public readonly payload: {
      hesId: string;
      signedBy: "cliente" | "tecnico";
      firmadoPor: string;
    },
  ) {}
}

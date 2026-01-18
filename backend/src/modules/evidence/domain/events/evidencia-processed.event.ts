/**
 * @event EvidenciaProcessedEvent
 * @description Domain event emitted when evidencia processing is complete
 */

export class EvidenciaProcessedEvent {
  public readonly eventName = 'evidencia.processed';
  public readonly occurredOn: Date;

  constructor(
    public readonly payload: {
      evidenciaId: string;
      thumbnailPath?: string;
      metadata?: Record<string, unknown>;
      processingDurationMs: number;
    }
  ) {
    this.occurredOn = new Date();
  }
}

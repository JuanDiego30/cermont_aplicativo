/**
 * @event EvidenciaDeletedEvent
 * @description Domain event emitted when an evidencia is deleted
 */

export class EvidenciaDeletedEvent {
  public readonly eventName = 'evidencia.deleted';
  public readonly occurredOn: Date;

  constructor(
    public readonly payload: {
      evidenciaId: string;
      filePath: string;
      thumbnailPath?: string;
      deletedBy: string;
      isSoftDelete: boolean;
    }
  ) {
    this.occurredOn = new Date();
  }
}

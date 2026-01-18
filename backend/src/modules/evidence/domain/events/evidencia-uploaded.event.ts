/**
 * @event EvidenciaUploadedEvent
 * @description Domain event emitted when a new evidencia is uploaded
 */

export class EvidenciaUploadedEvent {
  public readonly eventName = 'evidencia.uploaded';
  public readonly occurredOn: Date;

  constructor(
    public readonly payload: {
      evidenciaId: string;
      ordenId: string;
      ejecucionId: string;
      fileType: string;
      mimeType: string;
      filePath: string;
      fileSize: number;
      uploadedBy: string;
      requiresProcessing: boolean;
    }
  ) {
    this.occurredOn = new Date();
  }
}

/**
 * @entity Evidence
 * Represents a piece of evidence (photo, video, document) attached to an execution.
 */
import { randomUUID } from 'crypto';
import { EvidenceType, EvidenceTypeEnum } from '../value-objects/evidence-type.vo';
import { GeoLocation } from '../value-objects/geo-location.vo';

export interface EvidenceProps {
  id?: string;
  ejecucionId: string;
  type: EvidenceTypeEnum;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  capturedLocation?: GeoLocation;
  uploadedBy: string;
  uploadedAt?: Date;
}

export class Evidence {
  private readonly id: string;
  private readonly ejecucionId: string;
  private readonly type: EvidenceType;
  private readonly fileUrl: string;
  private readonly thumbnailUrl?: string;
  private readonly fileSize: number;
  private readonly mimeType: string;
  private readonly description?: string;
  private readonly capturedLocation?: GeoLocation;
  private readonly uploadedBy: string;
  private readonly uploadedAt: Date;

  private constructor(props: EvidenceProps) {
    this.id = props.id || randomUUID();
    this.ejecucionId = props.ejecucionId;
    this.type = EvidenceType.fromString(props.type);
    this.fileUrl = props.fileUrl;
    this.thumbnailUrl = props.thumbnailUrl;
    this.fileSize = props.fileSize;
    this.mimeType = props.mimeType;
    this.description = props.description;
    this.capturedLocation = props.capturedLocation;
    this.uploadedBy = props.uploadedBy;
    this.uploadedAt = props.uploadedAt || new Date();
  }

  public static create(props: EvidenceProps): Evidence {
    return new Evidence(props);
  }

  public static fromPersistence(
    props: Omit<EvidenceProps, 'capturedLocation'> & {
      capturedLocation?: Record<string, unknown>;
    }
  ): Evidence {
    return new Evidence({
      ...props,
      capturedLocation: props.capturedLocation
        ? GeoLocation.fromJson(props.capturedLocation)
        : undefined,
    });
  }

  public getId(): string {
    return this.id;
  }

  public getEjecucionId(): string {
    return this.ejecucionId;
  }

  public getType(): EvidenceType {
    return this.type;
  }

  public getFileUrl(): string {
    return this.fileUrl;
  }

  public getThumbnailUrl(): string | undefined {
    return this.thumbnailUrl;
  }

  public getFileSize(): number {
    return this.fileSize;
  }

  public getMimeType(): string {
    return this.mimeType;
  }

  public getDescription(): string | undefined {
    return this.description;
  }

  public getCapturedLocation(): GeoLocation | undefined {
    return this.capturedLocation;
  }

  public getUploadedBy(): string {
    return this.uploadedBy;
  }

  public getUploadedAt(): Date {
    return this.uploadedAt;
  }

  public toPersistence(): Record<string, unknown> {
    return {
      id: this.id,
      ejecucionId: this.ejecucionId,
      type: this.type.getValue(),
      fileUrl: this.fileUrl,
      thumbnailUrl: this.thumbnailUrl,
      fileSize: this.fileSize,
      mimeType: this.mimeType,
      description: this.description,
      capturedLocation: this.capturedLocation?.toJson(),
      uploadedBy: this.uploadedBy,
      uploadedAt: this.uploadedAt,
    };
  }
}

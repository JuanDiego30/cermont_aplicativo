/**
 * @vo EvidenceType
 * Value Object representing the type of evidence (photo, video, document).
 */

export enum EvidenceTypeEnum {
  PHOTO = "PHOTO",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
}

const MAX_FILE_SIZES: Record<EvidenceTypeEnum, number> = {
  [EvidenceTypeEnum.PHOTO]: 10 * 1024 * 1024, // 10 MB
  [EvidenceTypeEnum.VIDEO]: 100 * 1024 * 1024, // 100 MB
  [EvidenceTypeEnum.DOCUMENT]: 25 * 1024 * 1024, // 25 MB
};

const ALLOWED_MIME_TYPES: Record<EvidenceTypeEnum, string[]> = {
  [EvidenceTypeEnum.PHOTO]: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
  ],
  [EvidenceTypeEnum.VIDEO]: ["video/mp4", "video/quicktime", "video/webm"],
  [EvidenceTypeEnum.DOCUMENT]: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export class EvidenceType {
  private constructor(private readonly value: EvidenceTypeEnum) {}

  public static photo(): EvidenceType {
    return new EvidenceType(EvidenceTypeEnum.PHOTO);
  }

  public static video(): EvidenceType {
    return new EvidenceType(EvidenceTypeEnum.VIDEO);
  }

  public static document(): EvidenceType {
    return new EvidenceType(EvidenceTypeEnum.DOCUMENT);
  }

  public static fromString(value: string): EvidenceType {
    const upperValue = value.toUpperCase();
    if (
      !Object.values(EvidenceTypeEnum).includes(upperValue as EvidenceTypeEnum)
    ) {
      throw new Error(`Invalid EvidenceType: ${value}`);
    }
    return new EvidenceType(upperValue as EvidenceTypeEnum);
  }

  public static fromMimeType(mimeType: string): EvidenceType {
    if (mimeType.startsWith("image/")) {
      return EvidenceType.photo();
    }
    if (mimeType.startsWith("video/")) {
      return EvidenceType.video();
    }
    return EvidenceType.document();
  }

  public getValue(): EvidenceTypeEnum {
    return this.value;
  }

  public requiresThumbnail(): boolean {
    return (
      this.value === EvidenceTypeEnum.PHOTO ||
      this.value === EvidenceTypeEnum.VIDEO
    );
  }

  public getMaxFileSize(): number {
    return MAX_FILE_SIZES[this.value];
  }

  public getAllowedMimeTypes(): string[] {
    return ALLOWED_MIME_TYPES[this.value];
  }

  public isMimeTypeAllowed(mimeType: string): boolean {
    return this.getAllowedMimeTypes().includes(mimeType);
  }

  public equals(other: EvidenceType): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}

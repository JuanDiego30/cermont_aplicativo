/**
 * @valueObject FileType
 * @description Value Object representing the type of file (IMAGE, VIDEO, DOCUMENT, AUDIO)
 */

export enum FileTypeEnum {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
}

// Spanish aliases for backward compatibility
export type TipoEvidencia = 'FOTO' | 'VIDEO' | 'DOCUMENTO' | 'AUDIO';

const SPANISH_TO_ENUM: Record<TipoEvidencia, FileTypeEnum> = {
  FOTO: FileTypeEnum.IMAGE,
  VIDEO: FileTypeEnum.VIDEO,
  DOCUMENTO: FileTypeEnum.DOCUMENT,
  AUDIO: FileTypeEnum.AUDIO,
};

const ENUM_TO_SPANISH: Record<FileTypeEnum, TipoEvidencia> = {
  [FileTypeEnum.IMAGE]: 'FOTO',
  [FileTypeEnum.VIDEO]: 'VIDEO',
  [FileTypeEnum.DOCUMENT]: 'DOCUMENTO',
  [FileTypeEnum.AUDIO]: 'AUDIO',
};

export class FileType {
  private constructor(private readonly _value: FileTypeEnum) {
    Object.freeze(this);
  }

  public static fromMimeType(mimeType: string): FileType {
    const normalized = mimeType.toLowerCase();

    if (normalized.startsWith('image/')) {
      return new FileType(FileTypeEnum.IMAGE);
    }
    if (normalized.startsWith('video/')) {
      return new FileType(FileTypeEnum.VIDEO);
    }
    if (normalized.startsWith('audio/')) {
      return new FileType(FileTypeEnum.AUDIO);
    }
    if (
      normalized.includes('pdf') ||
      normalized.includes('document') ||
      normalized.includes('msword') ||
      normalized.includes('spreadsheet') ||
      normalized.includes('excel')
    ) {
      return new FileType(FileTypeEnum.DOCUMENT);
    }

    throw new Error(`Unsupported MIME type: ${mimeType}`);
  }

  public static fromSpanish(tipo: TipoEvidencia): FileType {
    const enumValue = SPANISH_TO_ENUM[tipo];
    if (!enumValue) {
      throw new Error(`Invalid TipoEvidencia: ${tipo}`);
    }
    return new FileType(enumValue);
  }

  public static image(): FileType {
    return new FileType(FileTypeEnum.IMAGE);
  }

  public static video(): FileType {
    return new FileType(FileTypeEnum.VIDEO);
  }

  public static document(): FileType {
    return new FileType(FileTypeEnum.DOCUMENT);
  }

  public static audio(): FileType {
    return new FileType(FileTypeEnum.AUDIO);
  }

  public getValue(): FileTypeEnum {
    return this._value;
  }

  public toSpanish(): TipoEvidencia {
    return ENUM_TO_SPANISH[this._value];
  }

  public isImage(): boolean {
    return this._value === FileTypeEnum.IMAGE;
  }

  public isVideo(): boolean {
    return this._value === FileTypeEnum.VIDEO;
  }

  public isDocument(): boolean {
    return this._value === FileTypeEnum.DOCUMENT;
  }

  public isAudio(): boolean {
    return this._value === FileTypeEnum.AUDIO;
  }

  public requiresCompression(): boolean {
    return this.isImage() || this.isVideo();
  }

  public canGenerateThumbnail(): boolean {
    return this.isImage() || this.isVideo() || this.isDocument();
  }

  public equals(other: FileType): boolean {
    return this._value === other._value;
  }
}

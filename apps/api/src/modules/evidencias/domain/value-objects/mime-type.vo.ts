/**
 * @valueObject MimeType
 * @description Value Object for MIME type validation
 */

export class MimeType {
    private static readonly ALLOWED_IMAGE_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/heic',
        'image/heif',
        'image/bmp',
    ];

    private static readonly ALLOWED_VIDEO_TYPES = [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
        'video/x-matroska',
        'video/3gpp',
    ];

    private static readonly ALLOWED_DOCUMENT_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
    ];

    private static readonly ALLOWED_AUDIO_TYPES = [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/aac',
        'audio/m4a',
        'audio/x-m4a',
    ];

    private constructor(private readonly _value: string) {
        Object.freeze(this);
    }

    public static create(value: string): MimeType {
        MimeType.validate(value);
        return new MimeType(value.toLowerCase());
    }

    private static validate(value: string): void {
        const allAllowed = [
            ...MimeType.ALLOWED_IMAGE_TYPES,
            ...MimeType.ALLOWED_VIDEO_TYPES,
            ...MimeType.ALLOWED_DOCUMENT_TYPES,
            ...MimeType.ALLOWED_AUDIO_TYPES,
        ];

        if (!allAllowed.includes(value.toLowerCase())) {
            throw new Error(`MIME type ${value} is not supported`);
        }
    }

    public getValue(): string {
        return this._value;
    }

    public isImage(): boolean {
        return MimeType.ALLOWED_IMAGE_TYPES.includes(this._value);
    }

    public isVideo(): boolean {
        return MimeType.ALLOWED_VIDEO_TYPES.includes(this._value);
    }

    public isDocument(): boolean {
        return MimeType.ALLOWED_DOCUMENT_TYPES.includes(this._value);
    }

    public isAudio(): boolean {
        return MimeType.ALLOWED_AUDIO_TYPES.includes(this._value);
    }

    public getExtension(): string {
        const map: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/heic': 'heic',
            'video/mp4': 'mp4',
            'video/mpeg': 'mpeg',
            'video/quicktime': 'mov',
            'video/webm': 'webm',
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                'xlsx',
            'audio/mpeg': 'mp3',
            'audio/mp3': 'mp3',
            'audio/wav': 'wav',
        };
        return map[this._value] || 'bin';
    }

    public equals(other: MimeType): boolean {
        return this._value === other._value;
    }
}

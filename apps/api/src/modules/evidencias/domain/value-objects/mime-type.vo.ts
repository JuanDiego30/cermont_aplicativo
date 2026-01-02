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
    ];

    private static readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

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
            ...MimeType.ALLOWED_DOCUMENT_TYPES,
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
        return false;
    }

    public isDocument(): boolean {
        return MimeType.ALLOWED_DOCUMENT_TYPES.includes(this._value);
    }

    public isAudio(): boolean {
        return false;
    }

    public getExtension(): string {
        const map: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'application/pdf': 'pdf',
        };
        return map[this._value] || 'bin';
    }

    public equals(other: MimeType): boolean {
        return this._value === other._value;
    }
}

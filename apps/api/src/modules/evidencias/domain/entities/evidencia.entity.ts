/**
 * @entity Evidencia (Aggregate Root)
 * @description Rich Domain Model for Evidencia with invariant enforcement
 */

import {
    EvidenciaId,
    FileType,
    FileSize,
    MimeType,
    StoragePath,
    EvidenciaStatus,
    EvidenciaStatusEnum,
    TipoEvidencia,
} from '../value-objects';
import {
    EvidenciaUploadedEvent,
    EvidenciaProcessedEvent,
    EvidenciaDeletedEvent,
} from '../events';

export interface EvidenciaMetadata {
    sha256?: string;
    width?: number;
    height?: number;
    duration?: number; // seconds for video/audio
    gpsLatitude?: number;
    gpsLongitude?: number;
    capturedAt?: Date;
    cameraModel?: string;
    extractedText?: string; // OCR

    thumbnails?: {
        s150?: string;
        s300?: string;
    };
}

export interface EvidenciaProps {
    id: EvidenciaId;
    ejecucionId: string;
    ordenId: string;
    fileType: FileType;
    mimeType: MimeType;
    originalFilename: string;
    storagePath: StoragePath;
    fileSize: FileSize;
    thumbnailPath?: StoragePath;
    status: EvidenciaStatus;
    descripcion: string;
    tags: string[];
    metadata?: EvidenciaMetadata;
    uploadedBy: string;
    uploadedAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    deletedBy?: string;

    verificada: boolean;
    verificadoPor?: string;
    verificadoEn?: Date;
}

export interface CreateEvidenciaProps {
    ejecucionId: string;
    ordenId: string;
    mimeType: string;
    originalFilename: string;
    fileBytes: number;
    descripcion?: string;
    tags?: string[];
    uploadedBy: string;
    sha256?: string;
}

// Domain Events collected for later dispatch
type DomainEvent =
    | EvidenciaUploadedEvent
    | EvidenciaProcessedEvent
    | EvidenciaDeletedEvent;

export class Evidencia {
    private _domainEvents: DomainEvent[] = [];

    private constructor(private props: EvidenciaProps) { }

    // ============================================================
    // Factory Methods
    // ============================================================

    /**
     * Create a new Evidencia from upload data
     */
    public static create(input: CreateEvidenciaProps): Evidencia {
        const id = EvidenciaId.generate();
        const mimeType = MimeType.create(input.mimeType);
        const fileType = FileType.fromMimeType(input.mimeType);
        const fileSize = FileSize.create(input.fileBytes, fileType);
        const storagePath = StoragePath.generate({
            contextType: 'orden',
            contextId: input.ordenId,
            filename: input.originalFilename,
            uniqueId: id.getValue(),
        });

        const now = new Date();

        const evidencia = new Evidencia({
            id,
            ejecucionId: input.ejecucionId,
            ordenId: input.ordenId,
            fileType,
            mimeType,
            originalFilename: input.originalFilename,
            storagePath,
            fileSize,
            status: EvidenciaStatus.pending(),
            descripcion: input.descripcion || '',
            tags: input.tags || [],
            metadata: input.sha256 ? { sha256: input.sha256 } : undefined,
            uploadedBy: input.uploadedBy,
            uploadedAt: now,
            updatedAt: now,

            verificada: false,
            verificadoPor: undefined,
            verificadoEn: undefined,
        });

        // Emit Upload Event
        evidencia.addDomainEvent(
            new EvidenciaUploadedEvent({
                evidenciaId: id.getValue(),
                ordenId: input.ordenId,
                ejecucionId: input.ejecucionId,
                fileType: fileType.getValue(),
                mimeType: input.mimeType,
                filePath: storagePath.getValue(),
                fileSize: input.fileBytes,
                uploadedBy: input.uploadedBy,
                requiresProcessing: fileType.requiresCompression(),
            }),
        );

        return evidencia;
    }

    /**
     * Reconstitute from persistence layer
     */
    public static fromPersistence(data: {
        id: string;
        ejecucionId: string;
        ordenId: string;
        tipo: string;
        mimeType: string;
        nombreArchivo: string;
        rutaArchivo: string;
        tamano: number;
        thumbnailPath?: string;
        status?: string;
        descripcion: string;
        tags: string[];
        metadata?: EvidenciaMetadata;
        subidoPor: string;
        verificada?: boolean;
        verificadoPor?: string;
        verificadoEn?: Date;
        createdAt: Date;
        updatedAt: Date;
        deletedAt?: Date;
        deletedBy?: string;
    }): Evidencia {
        const fileType = FileType.fromSpanish(data.tipo as TipoEvidencia);

        return new Evidencia({
            id: EvidenciaId.create(data.id),
            ejecucionId: data.ejecucionId,
            ordenId: data.ordenId,
            fileType,
            mimeType: MimeType.create(data.mimeType),
            originalFilename: data.nombreArchivo,
            storagePath: StoragePath.create(data.rutaArchivo),
            fileSize: FileSize.create(data.tamano, fileType),
            thumbnailPath: data.thumbnailPath
                ? StoragePath.create(data.thumbnailPath)
                : undefined,
            status: data.status
                ? EvidenciaStatus.create(data.status)
                : EvidenciaStatus.ready(),
            descripcion: data.descripcion,
            tags: data.tags,
            metadata: data.metadata,
            uploadedBy: data.subidoPor,
            uploadedAt: data.createdAt,
            updatedAt: data.updatedAt,
            deletedAt: data.deletedAt,
            deletedBy: data.deletedBy,

            verificada: data.verificada ?? false,
            verificadoPor: data.verificadoPor,
            verificadoEn: data.verificadoEn,
        });
    }

    // ============================================================
    // Getters (Immutable access)
    // ============================================================

    get id(): EvidenciaId {
        return this.props.id;
    }
    get ejecucionId(): string {
        return this.props.ejecucionId;
    }
    get ordenId(): string {
        return this.props.ordenId;
    }
    get fileType(): FileType {
        return this.props.fileType;
    }
    get mimeType(): MimeType {
        return this.props.mimeType;
    }
    get originalFilename(): string {
        return this.props.originalFilename;
    }
    get storagePath(): StoragePath {
        return this.props.storagePath;
    }
    get fileSize(): FileSize {
        return this.props.fileSize;
    }
    get thumbnailPath(): StoragePath | undefined {
        return this.props.thumbnailPath;
    }
    get status(): EvidenciaStatus {
        return this.props.status;
    }
    get descripcion(): string {
        return this.props.descripcion;
    }
    get tags(): string[] {
        return [...this.props.tags];
    }
    get metadata(): EvidenciaMetadata | undefined {
        return this.props.metadata;
    }
    get uploadedBy(): string {
        return this.props.uploadedBy;
    }
    get uploadedAt(): Date {
        return this.props.uploadedAt;
    }
    get updatedAt(): Date {
        return this.props.updatedAt;
    }
    get deletedAt(): Date | undefined {
        return this.props.deletedAt;
    }
    get deletedBy(): string | undefined {
        return this.props.deletedBy;
    }

    get verificada(): boolean {
        return this.props.verificada;
    }

    get verificadoPor(): string | undefined {
        return this.props.verificadoPor;
    }

    get verificadoEn(): Date | undefined {
        return this.props.verificadoEn;
    }

    // ============================================================
    // Domain Behavior
    // ============================================================

    /**
     * Mark as processing started
     */
    public markAsProcessing(): void {
        if (!this.props.status.canTransitionTo(EvidenciaStatusEnum.PROCESSING)) {
            throw new Error(
                `Cannot transition from ${this.props.status.getValue()} to PROCESSING`,
            );
        }
        this.props.status = EvidenciaStatus.processing();
        this.props.updatedAt = new Date();
    }

    /**
     * Mark as ready (processing complete)
     */
    public markAsReady(params?: {
        thumbnailPath?: string;
        metadata?: EvidenciaMetadata;
        processingDurationMs?: number;
    }): void {
        if (!this.props.status.canTransitionTo(EvidenciaStatusEnum.READY)) {
            throw new Error(
                `Cannot transition from ${this.props.status.getValue()} to READY`,
            );
        }

        this.props.status = EvidenciaStatus.ready();
        this.props.updatedAt = new Date();

        if (params?.thumbnailPath) {
            this.props.thumbnailPath = StoragePath.create(params.thumbnailPath);
        }
        if (params?.metadata) {
            const sha256 = this.props.metadata?.sha256;
            this.props.metadata = sha256 ? { ...params.metadata, sha256 } : params.metadata;
        }

        this.addDomainEvent(
            new EvidenciaProcessedEvent({
                evidenciaId: this.props.id.getValue(),
                thumbnailPath: params?.thumbnailPath,
                metadata: params?.metadata as Record<string, unknown>,
                processingDurationMs: params?.processingDurationMs || 0,
            }),
        );
    }

    /**
     * Mark as failed
     */
    public markAsFailed(): void {
        if (!this.props.status.canTransitionTo(EvidenciaStatusEnum.FAILED)) {
            throw new Error(
                `Cannot transition from ${this.props.status.getValue()} to FAILED`,
            );
        }
        this.props.status = EvidenciaStatus.failed();
        this.props.updatedAt = new Date();
    }

    /**
     * Soft delete
     */
    public softDelete(deletedBy: string): void {
        if (this.isDeleted()) {
            throw new Error('Evidencia is already deleted');
        }

        this.props.deletedAt = new Date();
        this.props.deletedBy = deletedBy;
        this.props.updatedAt = new Date();

        this.addDomainEvent(
            new EvidenciaDeletedEvent({
                evidenciaId: this.props.id.getValue(),
                filePath: this.props.storagePath.getValue(),
                thumbnailPath: this.props.thumbnailPath?.getValue(),
                deletedBy,
                isSoftDelete: true,
            }),
        );
    }

    /**
     * Restore from soft delete
     */
    public restore(): void {
        if (!this.isDeleted()) {
            throw new Error('Evidencia is not deleted');
        }
        this.props.deletedAt = undefined;
        this.props.deletedBy = undefined;
        this.props.updatedAt = new Date();
    }

    /**
     * Update description
     */
    public updateDescripcion(descripcion: string): void {
        this.props.descripcion = descripcion;
        this.props.updatedAt = new Date();
    }

    /**
     * Update tags
     */
    public updateTags(tags: string[]): void {
        this.props.tags = [...tags];
        this.props.updatedAt = new Date();
    }

    // ============================================================
    // Query Methods
    // ============================================================

    public isDeleted(): boolean {
        return this.props.deletedAt !== undefined;
    }

    public isImage(): boolean {
        return this.props.fileType.isImage();
    }

    public isVideo(): boolean {
        return this.props.fileType.isVideo();
    }

    public isDocument(): boolean {
        return this.props.fileType.isDocument();
    }

    public isAudio(): boolean {
        return this.props.fileType.isAudio();
    }

    public requiresProcessing(): boolean {
        return this.props.fileType.requiresCompression();
    }

    public canGenerateThumbnail(): boolean {
        return this.props.fileType.canGenerateThumbnail();
    }

    public perteneceAOrden(ordenId: string): boolean {
        return this.props.ordenId === ordenId;
    }

    // ============================================================
    // Domain Events
    // ============================================================

    private addDomainEvent(event: DomainEvent): void {
        this._domainEvents.push(event);
    }

    public pullDomainEvents(): DomainEvent[] {
        const events = [...this._domainEvents];
        this._domainEvents = [];
        return events;
    }

    // ============================================================
    // Persistence
    // ============================================================

    /**
     * Convert to persistence format (for repository)
     */
    public toPersistence(): Record<string, unknown> {
        return {
            id: this.props.id.getValue(),
            ejecucionId: this.props.ejecucionId,
            ordenId: this.props.ordenId,
            tipo: this.props.fileType.toSpanish(),
            mimeType: this.props.mimeType.getValue(),
            nombreArchivo: this.props.originalFilename,
            rutaArchivo: this.props.storagePath.getValue(),
            tamano: this.props.fileSize.getBytes(),
            thumbnailPath: this.props.thumbnailPath?.getValue(),
            status: this.props.status.getValue(),
            descripcion: this.props.descripcion,
            tags: this.props.tags,
            metadata: this.props.metadata,
            subidoPor: this.props.uploadedBy,
            verificada: this.props.verificada,
            verificadoPor: this.props.verificadoPor,
            verificadoEn: this.props.verificadoEn,
            createdAt: this.props.uploadedAt,
            updatedAt: this.props.updatedAt,
            deletedAt: this.props.deletedAt,
            deletedBy: this.props.deletedBy,
        };
    }
}

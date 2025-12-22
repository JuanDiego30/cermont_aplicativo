/**
 * @entity EvidenciaEntity
 * @description Entidad de dominio para evidencias de ejecución
 */

export type TipoEvidencia = 'FOTO' | 'VIDEO' | 'DOCUMENTO' | 'AUDIO';

export interface EvidenciaProps {
    id: string;
    ejecucionId: string;
    ordenId: string;
    tipo: TipoEvidencia;
    nombreArchivo: string;
    rutaArchivo: string;
    tamano: number;
    mimeType: string;
    descripcion: string;
    tags: string[];
    subidoPor: string;
    createdAt: Date;
    updatedAt: Date;
}

export class EvidenciaEntity {
    constructor(private readonly props: EvidenciaProps) { }

    get id(): string { return this.props.id; }
    get ejecucionId(): string { return this.props.ejecucionId; }
    get ordenId(): string { return this.props.ordenId; }
    get tipo(): TipoEvidencia { return this.props.tipo; }
    get nombreArchivo(): string { return this.props.nombreArchivo; }
    get rutaArchivo(): string { return this.props.rutaArchivo; }
    get tamano(): number { return this.props.tamano; }
    get mimeType(): string { return this.props.mimeType; }
    get descripcion(): string { return this.props.descripcion; }
    get tags(): string[] { return this.props.tags; }
    get subidoPor(): string { return this.props.subidoPor; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }

    /**
     * Factory method para crear nueva evidencia
     */
    static create(props: Omit<EvidenciaProps, 'id' | 'createdAt' | 'updatedAt'>): EvidenciaEntity {
        const now = new Date();
        return new EvidenciaEntity({
            ...props,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
        });
    }

    /**
     * Factory method para reconstituir desde persistencia
     */
    static fromPersistence(props: EvidenciaProps): EvidenciaEntity {
        return new EvidenciaEntity(props);
    }

    /**
     * Verifica si la evidencia pertenece a una orden
     */
    perteneceAOrden(ordenId: string): boolean {
        return this.props.ordenId === ordenId;
    }

    /**
     * Convierte entidad a formato de persistencia
     */
    toPersistence(): Omit<EvidenciaProps, 'id'> & { id?: string } {
        return {
            id: this.props.id,
            ejecucionId: this.props.ejecucionId,
            ordenId: this.props.ordenId,
            tipo: this.props.tipo,
            nombreArchivo: this.props.nombreArchivo,
            rutaArchivo: this.props.rutaArchivo,
            tamano: this.props.tamano,
            mimeType: this.props.mimeType,
            descripcion: this.props.descripcion,
            tags: this.props.tags,
            subidoPor: this.props.subidoPor,
            createdAt: this.props.createdAt,
            updatedAt: this.props.updatedAt,
        };
    }
}

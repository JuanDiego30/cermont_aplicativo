import mongoose, { Document, Model } from 'mongoose';
import { EvidenceType } from '../utils/constants';
declare const CATEGORIAS: readonly ["foto", "documento", "video", "otros"];
type Categoria = typeof CATEGORIAS[number];
declare const STATUSES: readonly ["UPLOADED", "VERIFIED", "REJECTED"];
type Status = typeof STATUSES[number];
declare const MIME_TYPES: readonly ["image/jpeg", "image/png", "application/pdf", "video/mp4", "application/octet-stream"];
type MimeType = typeof MIME_TYPES[number];
interface Archivo {
    nombre: string;
    url: string;
    mimeType: MimeType;
    tamaño: number;
    uploadedAt: Date;
    _id: mongoose.Types.ObjectId;
}
interface EvidenceDoc extends Document {
    orderId: mongoose.Types.ObjectId;
    tipo: EvidenceType;
    categoria: Categoria;
    descripcion: string;
    archivos: Archivo[];
    ubicacion?: string;
    coordenadas?: {
        lat: number;
        lng: number;
    };
    fecha: Date;
    uploadedBy: mongoose.Types.ObjectId;
    tags?: string[];
    status: Status;
    verifiedBy?: mongoose.Types.ObjectId;
    verifiedAt?: Date;
    metadata?: mongoose.Schema.Types.Mixed;
    createdAt: Date;
    updatedAt: Date;
    totalArchivos: number;
    tamañoTotal: number;
    tieneUbicacion: boolean;
    estaVerificada: boolean;
    isValid(): boolean;
}
interface EvidenceModel extends Model<EvidenceDoc> {
    findByOrder(orderId: mongoose.Types.ObjectId, options?: {
        page?: number;
        limit?: number;
        tipo?: EvidenceType;
        categoria?: Categoria;
        sort?: {
            [key: string]: 1 | -1;
        };
    }): Promise<{
        docs: EvidenceDoc[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    findByTags(tags: string[], options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        docs: EvidenceDoc[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getUnverified(reviewerId?: mongoose.Types.ObjectId, limit?: number): Promise<EvidenceDoc[]>;
}
declare const Evidence: mongoose.Model<{
    status: "REJECTED" | "UPLOADED" | "VERIFIED";
    metadata: any;
    tags: string[];
    descripcion: string;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Archivo> & Archivo>;
    categoria: "video" | "documento" | "foto" | "otros";
    tipo: "antes" | "durante" | "despues";
    uploadedBy: mongoose.Types.ObjectId;
    fecha: NativeDate;
    orderId: mongoose.Types.ObjectId;
    coordenadas?: {
        lat?: number | null;
        lng?: number | null;
    } | null;
    ubicacion?: string | null;
    verifiedBy?: mongoose.Types.ObjectId | null;
    verifiedAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    status: "REJECTED" | "UPLOADED" | "VERIFIED";
    metadata: any;
    tags: string[];
    descripcion: string;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Archivo> & Archivo>;
    categoria: "video" | "documento" | "foto" | "otros";
    tipo: "antes" | "durante" | "despues";
    uploadedBy: mongoose.Types.ObjectId;
    fecha: NativeDate;
    orderId: mongoose.Types.ObjectId;
    coordenadas?: {
        lat?: number | null;
        lng?: number | null;
    } | null;
    ubicacion?: string | null;
    verifiedBy?: mongoose.Types.ObjectId | null;
    verifiedAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
    toJSON: {
        virtuals: true;
        getters: true;
    };
    toObject: {
        virtuals: true;
        getters: true;
    };
    strict: true;
    collection: string;
}> & {
    status: "REJECTED" | "UPLOADED" | "VERIFIED";
    metadata: any;
    tags: string[];
    descripcion: string;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Archivo> & Archivo>;
    categoria: "video" | "documento" | "foto" | "otros";
    tipo: "antes" | "durante" | "despues";
    uploadedBy: mongoose.Types.ObjectId;
    fecha: NativeDate;
    orderId: mongoose.Types.ObjectId;
    coordenadas?: {
        lat?: number | null;
        lng?: number | null;
    } | null;
    ubicacion?: string | null;
    verifiedBy?: mongoose.Types.ObjectId | null;
    verifiedAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    toJSON: {
        virtuals: true;
        getters: true;
    };
    toObject: {
        virtuals: true;
        getters: true;
    };
    strict: true;
    collection: string;
}, {
    status: "REJECTED" | "UPLOADED" | "VERIFIED";
    metadata: any;
    tags: string[];
    descripcion: string;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Archivo> & Archivo>;
    categoria: "video" | "documento" | "foto" | "otros";
    tipo: "antes" | "durante" | "despues";
    uploadedBy: mongoose.Types.ObjectId;
    fecha: NativeDate;
    orderId: mongoose.Types.ObjectId;
    coordenadas?: {
        lat?: number | null;
        lng?: number | null;
    } | null;
    ubicacion?: string | null;
    verifiedBy?: mongoose.Types.ObjectId | null;
    verifiedAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    status: "REJECTED" | "UPLOADED" | "VERIFIED";
    metadata: any;
    tags: string[];
    descripcion: string;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Archivo> & Archivo>;
    categoria: "video" | "documento" | "foto" | "otros";
    tipo: "antes" | "durante" | "despues";
    uploadedBy: mongoose.Types.ObjectId;
    fecha: NativeDate;
    orderId: mongoose.Types.ObjectId;
    coordenadas?: {
        lat?: number | null;
        lng?: number | null;
    } | null;
    ubicacion?: string | null;
    verifiedBy?: mongoose.Types.ObjectId | null;
    verifiedAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
    toJSON: {
        virtuals: true;
        getters: true;
    };
    toObject: {
        virtuals: true;
        getters: true;
    };
    strict: true;
    collection: string;
}>> & mongoose.FlatRecord<{
    status: "REJECTED" | "UPLOADED" | "VERIFIED";
    metadata: any;
    tags: string[];
    descripcion: string;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Archivo> & Archivo>;
    categoria: "video" | "documento" | "foto" | "otros";
    tipo: "antes" | "durante" | "despues";
    uploadedBy: mongoose.Types.ObjectId;
    fecha: NativeDate;
    orderId: mongoose.Types.ObjectId;
    coordenadas?: {
        lat?: number | null;
        lng?: number | null;
    } | null;
    ubicacion?: string | null;
    verifiedBy?: mongoose.Types.ObjectId | null;
    verifiedAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export type IEvidenceDoc = EvidenceDoc;
export type IEvidenceModel = EvidenceModel;
export default Evidence;
//# sourceMappingURL=Evidence.d.ts.map
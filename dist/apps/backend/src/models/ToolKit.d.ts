import mongoose, { Document, Model, HydratedDocument } from 'mongoose';
import { TOOLKIT_CATEGORIES } from '';
type Categoria = (typeof TOOLKIT_CATEGORIES)[number];
interface Item {
    nombre: string;
    cantidad: number;
    descripcion?: string;
    esencial?: boolean;
    requiereCertificacion?: boolean;
    _id: mongoose.Types.ObjectId;
}
interface ToolKitDoc extends Document {
    nombre: string;
    descripcion?: string;
    tags?: string[];
    categoria: Categoria;
    herramientas: Item[];
    equipos: Item[];
    elementosSeguridad: Item[];
    isActive: boolean;
    creadoPor: mongoose.Types.ObjectId;
    vecesUtilizado: number;
    ultimaUso?: Date;
    ordersUsedIn: mongoose.Types.ObjectId[];
    version: number;
    createdAt: Date;
    updatedAt: Date;
    totalItems: number;
    herramientasEsenciales: Item[];
    equiposConCertificacion: Item[];
    totalEsenciales: number;
    requiereCertificacion: boolean;
    incrementUsage(orderId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<HydratedDocument<ToolKitDoc>>;
    clone(newName: string, clonerId: mongoose.Types.ObjectId): Promise<HydratedDocument<ToolKitDoc>>;
    isSufficientForOrder(orderCategoria: string): boolean;
}
interface ToolKitModel extends Model<ToolKitDoc> {
    findByCategory(category: Categoria, options?: {
        page?: number;
        limit?: number;
        sort?: {
            [key: string]: 1 | -1;
        };
    }): Promise<ToolKitDoc[]>;
    getMostUsed(limit?: number, options?: {
        categoria?: Categoria;
    }): Promise<ToolKitDoc[]>;
    search(query: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<ToolKitDoc[]>;
    getForOrder(orderId: mongoose.Types.ObjectId, orderCategoria: string): Promise<ToolKitDoc[]>;
    getStatsByCategory(): Promise<any[]>;
}
declare const ToolKit: mongoose.Model<{
    version: number;
    nombre: string;
    isActive: boolean;
    tags: string[];
    creadoPor: mongoose.Types.ObjectId;
    categoria: any;
    herramientas: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    equipos: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    elementosSeguridad: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    vecesUtilizado: number;
    ordersUsedIn: mongoose.Types.ObjectId[];
    descripcion?: string | null;
    ultimaUso?: NativeDate | null;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    version: number;
    nombre: string;
    isActive: boolean;
    tags: string[];
    creadoPor: mongoose.Types.ObjectId;
    categoria: any;
    herramientas: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    equipos: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    elementosSeguridad: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    vecesUtilizado: number;
    ordersUsedIn: mongoose.Types.ObjectId[];
    descripcion?: string | null;
    ultimaUso?: NativeDate | null;
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
    version: number;
    nombre: string;
    isActive: boolean;
    tags: string[];
    creadoPor: mongoose.Types.ObjectId;
    categoria: any;
    herramientas: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    equipos: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    elementosSeguridad: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    vecesUtilizado: number;
    ordersUsedIn: mongoose.Types.ObjectId[];
    descripcion?: string | null;
    ultimaUso?: NativeDate | null;
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
    version: number;
    nombre: string;
    isActive: boolean;
    tags: string[];
    creadoPor: mongoose.Types.ObjectId;
    categoria: any;
    herramientas: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    equipos: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    elementosSeguridad: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    vecesUtilizado: number;
    ordersUsedIn: mongoose.Types.ObjectId[];
    descripcion?: string | null;
    ultimaUso?: NativeDate | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    version: number;
    nombre: string;
    isActive: boolean;
    tags: string[];
    creadoPor: mongoose.Types.ObjectId;
    categoria: any;
    herramientas: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    equipos: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    elementosSeguridad: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    vecesUtilizado: number;
    ordersUsedIn: mongoose.Types.ObjectId[];
    descripcion?: string | null;
    ultimaUso?: NativeDate | null;
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
    version: number;
    nombre: string;
    isActive: boolean;
    tags: string[];
    creadoPor: mongoose.Types.ObjectId;
    categoria: any;
    herramientas: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    equipos: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    elementosSeguridad: mongoose.Types.DocumentArray<Item, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Item> & Item>;
    vecesUtilizado: number;
    ordersUsedIn: mongoose.Types.ObjectId[];
    descripcion?: string | null;
    ultimaUso?: NativeDate | null;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default ToolKit;
export type IToolKitDoc = ToolKitDoc;
export type IToolKitModel = ToolKitModel;
//# sourceMappingURL=ToolKit.d.ts.map
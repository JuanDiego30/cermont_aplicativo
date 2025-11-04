import mongoose, { Document, Model, HydratedDocument } from 'mongoose';
import { ORDER_STATUS } from '../utils/constants';
declare const PRIORIDADES: readonly ["baja", "media", "alta", "urgente"];
type Prioridad = typeof PRIORIDADES[number];
declare const CATEGORIAS: readonly ["instalacion", "mantenimiento", "reparacion", "consultoria", "otro"];
type Categoria = typeof CATEGORIAS[number];
declare const MONEDAS: readonly ["COP", "USD"];
type Moneda = typeof MONEDAS[number];
declare const ARCHIVO_TIPOS: readonly ["documento", "foto", "otro"];
type ArchivoTipo = typeof ARCHIVO_TIPOS[number];
interface Contact {
    nombre?: string;
    email?: string;
    telefono?: string;
}
interface Archivo {
    nombre: string;
    url: string;
    tipo?: ArchivoTipo;
    tamaño?: number;
    uploadedBy?: mongoose.Types.ObjectId;
    uploadedAt: Date;
    _id: mongoose.Types.ObjectId;
}
interface HistorialEstado {
    estadoAnterior?: (typeof ORDER_STATUS)[number];
    estadoNuevo: (typeof ORDER_STATUS)[number];
    cambiadoPor: mongoose.Types.ObjectId;
    comentario?: string;
    fecha: Date;
    duracionEnEstado?: number;
}
interface Nota {
    contenido: string;
    autor: mongoose.Types.ObjectId;
    createdAt: Date;
}
interface Historial {
    accion: string;
    usuario?: mongoose.Types.ObjectId;
    detalles?: mongoose.Schema.Types.Mixed;
    fecha: Date;
}
interface Facturacion {
    numeroFactura?: string;
    fechaFactura?: Date;
    montoFacturado?: number;
    sesNumber?: string;
    fechaSES?: Date;
    aprobadoPor?: string;
    fechaAprobacion?: Date;
    fechaPago?: Date;
}
interface Metricas {
    duracionEstimadaDias?: number;
    duracionRealDias?: number;
    sla: {
        tiempoRespuestaHoras?: number;
        tiempoResolucionHoras?: number;
        cumplido?: boolean;
        fechaLimite?: Date;
    };
    diasAtrasados?: number;
    variacionCostoPorcentaje?: number;
}
interface Coordenadas {
    type: 'Point';
    coordinates: [number, number];
}
interface OrderDoc extends Document {
    numeroOrden: string;
    code: string;
    clienteNombre: string;
    clienteContacto?: Contact;
    poNumber?: string;
    descripcion: string;
    alcance?: string;
    lugar: string;
    coordenadas?: Coordenadas;
    fechaInicio: Date;
    fechaFinEstimada?: Date;
    fechaFinReal?: Date;
    estado: (typeof ORDER_STATUS)[number];
    prioridad: Prioridad;
    asignadoA: mongoose.Types.ObjectId[];
    supervisorId?: mongoose.Types.ObjectId;
    creadoPor: mongoose.Types.ObjectId;
    workPlanId?: mongoose.Types.ObjectId;
    workplans?: mongoose.Types.ObjectId[];
    costoEstimado?: number;
    costoReal?: number;
    moneda: Moneda;
    metricas?: Metricas;
    historialEstados: HistorialEstado[];
    archivos?: Archivo[];
    notas?: Nota[];
    historial?: Historial[];
    facturacion?: Facturacion;
    tags?: string[];
    categoria: Categoria;
    isActive?: boolean;
    isArchived?: boolean;
    requiereAprobacion?: boolean;
    aprobadoPorCliente?: boolean;
    cctvReports?: mongoose.Types.ObjectId[];
    evidences?: mongoose.Types.ObjectId[];
    toolKits?: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    duracionDias: number;
    progreso: number;
    variacionCosto: number;
    estaAtrasada: boolean;
    diasRestantes: number | null;
    esUrgente: boolean;
    estadoDescriptivo: string;
    cambiarEstado(nuevoEstado: (typeof ORDER_STATUS)[number], userId: mongoose.Types.ObjectId, comentario?: string): Promise<HydratedDocument<OrderDoc>>;
    agregarNota(contenido: string, autorId: mongoose.Types.ObjectId): Promise<HydratedDocument<OrderDoc>>;
    cumpleSLA(): boolean;
    tiempoRestanteSLA(): number | null;
}
interface OrderModel extends Model<OrderDoc> {
    findActive(options?: {
        page?: number;
        limit?: number;
    }): Promise<OrderDoc[]>;
    findByStatus(status: (typeof ORDER_STATUS)[number], options?: {
        page?: number;
        limit?: number;
    }): Promise<OrderDoc[]>;
    findCurrentMonth(options?: {
        page?: number;
        limit?: number;
    }): Promise<OrderDoc[]>;
    findVencidas(options?: {
        limit?: number;
    }): Promise<OrderDoc[]>;
    findProximasAVencer(dias?: number, options?: {
        limit?: number;
    }): Promise<OrderDoc[]>;
    search(query: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<OrderDoc[]>;
    getEstadisticas(): Promise<any>;
    findByCliente(clienteNombre: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<OrderDoc[]>;
    findAsignadasA(userId: mongoose.Types.ObjectId, options?: {
        limit?: number;
    }): Promise<OrderDoc[]>;
}
declare const Order: mongoose.Model<{
    code: string;
    isActive: boolean;
    tags: string[];
    clienteNombre: string;
    descripcion: string;
    lugar: string;
    fechaInicio: NativeDate;
    numeroOrden: string;
    estado: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
    prioridad: "baja" | "media" | "alta" | "urgente";
    asignadoA: mongoose.Types.ObjectId[];
    creadoPor: mongoose.Types.ObjectId;
    workplans: mongoose.Types.ObjectId[];
    costoEstimado: number;
    costoReal: number;
    moneda: "COP" | "USD";
    historialEstados: mongoose.Types.DocumentArray<{
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }> & {
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }>;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Archivo> & Archivo>;
    notas: mongoose.Types.DocumentArray<{
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }> & {
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }>;
    historial: mongoose.Types.DocumentArray<{
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }> & {
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }>;
    categoria: "instalacion" | "mantenimiento" | "reparacion" | "consultoria" | "otro";
    isArchived: boolean;
    requiereAprobacion: boolean;
    aprobadoPorCliente: boolean;
    cctvReports: mongoose.Types.ObjectId[];
    evidences: mongoose.Types.ObjectId[];
    toolKits: mongoose.Types.ObjectId[];
    facturacion?: {
        numeroFactura?: string | null;
        fechaFactura?: NativeDate | null;
        montoFacturado?: number | null;
        sesNumber?: string | null;
        fechaSES?: NativeDate | null;
        aprobadoPor?: string | null;
        fechaAprobacion?: NativeDate | null;
        fechaPago?: NativeDate | null;
    } | null;
    clienteContacto?: Contact | null;
    poNumber?: string | null;
    alcance?: string | null;
    coordenadas?: {
        type: "Point";
        coordinates: number[] | number[];
    } | null;
    fechaFinEstimada?: NativeDate | null;
    fechaFinReal?: NativeDate | null;
    supervisorId?: mongoose.Types.ObjectId | null;
    workPlanId?: mongoose.Types.ObjectId | null;
    metricas?: {
        duracionEstimadaDias: number;
        duracionRealDias: number;
        diasAtrasados: number;
        variacionCostoPorcentaje: number;
        sla?: {
            tiempoRespuestaHoras: number;
            tiempoResolucionHoras: number;
            cumplido: boolean;
            fechaLimite?: NativeDate | null;
        } | null;
    } | null;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    code: string;
    isActive: boolean;
    tags: string[];
    clienteNombre: string;
    descripcion: string;
    lugar: string;
    fechaInicio: NativeDate;
    numeroOrden: string;
    estado: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
    prioridad: "baja" | "media" | "alta" | "urgente";
    asignadoA: mongoose.Types.ObjectId[];
    creadoPor: mongoose.Types.ObjectId;
    workplans: mongoose.Types.ObjectId[];
    costoEstimado: number;
    costoReal: number;
    moneda: "COP" | "USD";
    historialEstados: mongoose.Types.DocumentArray<{
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }> & {
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }>;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Archivo> & Archivo>;
    notas: mongoose.Types.DocumentArray<{
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }> & {
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }>;
    historial: mongoose.Types.DocumentArray<{
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }> & {
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }>;
    categoria: "instalacion" | "mantenimiento" | "reparacion" | "consultoria" | "otro";
    isArchived: boolean;
    requiereAprobacion: boolean;
    aprobadoPorCliente: boolean;
    cctvReports: mongoose.Types.ObjectId[];
    evidences: mongoose.Types.ObjectId[];
    toolKits: mongoose.Types.ObjectId[];
    facturacion?: {
        numeroFactura?: string | null;
        fechaFactura?: NativeDate | null;
        montoFacturado?: number | null;
        sesNumber?: string | null;
        fechaSES?: NativeDate | null;
        aprobadoPor?: string | null;
        fechaAprobacion?: NativeDate | null;
        fechaPago?: NativeDate | null;
    } | null;
    clienteContacto?: Contact | null;
    poNumber?: string | null;
    alcance?: string | null;
    coordenadas?: {
        type: "Point";
        coordinates: number[] | number[];
    } | null;
    fechaFinEstimada?: NativeDate | null;
    fechaFinReal?: NativeDate | null;
    supervisorId?: mongoose.Types.ObjectId | null;
    workPlanId?: mongoose.Types.ObjectId | null;
    metricas?: {
        duracionEstimadaDias: number;
        duracionRealDias: number;
        diasAtrasados: number;
        variacionCostoPorcentaje: number;
        sla?: {
            tiempoRespuestaHoras: number;
            tiempoResolucionHoras: number;
            cumplido: boolean;
            fechaLimite?: NativeDate | null;
        } | null;
    } | null;
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
    code: string;
    isActive: boolean;
    tags: string[];
    clienteNombre: string;
    descripcion: string;
    lugar: string;
    fechaInicio: NativeDate;
    numeroOrden: string;
    estado: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
    prioridad: "baja" | "media" | "alta" | "urgente";
    asignadoA: mongoose.Types.ObjectId[];
    creadoPor: mongoose.Types.ObjectId;
    workplans: mongoose.Types.ObjectId[];
    costoEstimado: number;
    costoReal: number;
    moneda: "COP" | "USD";
    historialEstados: mongoose.Types.DocumentArray<{
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }> & {
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }>;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Archivo> & Archivo>;
    notas: mongoose.Types.DocumentArray<{
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }> & {
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }>;
    historial: mongoose.Types.DocumentArray<{
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }> & {
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }>;
    categoria: "instalacion" | "mantenimiento" | "reparacion" | "consultoria" | "otro";
    isArchived: boolean;
    requiereAprobacion: boolean;
    aprobadoPorCliente: boolean;
    cctvReports: mongoose.Types.ObjectId[];
    evidences: mongoose.Types.ObjectId[];
    toolKits: mongoose.Types.ObjectId[];
    facturacion?: {
        numeroFactura?: string | null;
        fechaFactura?: NativeDate | null;
        montoFacturado?: number | null;
        sesNumber?: string | null;
        fechaSES?: NativeDate | null;
        aprobadoPor?: string | null;
        fechaAprobacion?: NativeDate | null;
        fechaPago?: NativeDate | null;
    } | null;
    clienteContacto?: Contact | null;
    poNumber?: string | null;
    alcance?: string | null;
    coordenadas?: {
        type: "Point";
        coordinates: number[] | number[];
    } | null;
    fechaFinEstimada?: NativeDate | null;
    fechaFinReal?: NativeDate | null;
    supervisorId?: mongoose.Types.ObjectId | null;
    workPlanId?: mongoose.Types.ObjectId | null;
    metricas?: {
        duracionEstimadaDias: number;
        duracionRealDias: number;
        diasAtrasados: number;
        variacionCostoPorcentaje: number;
        sla?: {
            tiempoRespuestaHoras: number;
            tiempoResolucionHoras: number;
            cumplido: boolean;
            fechaLimite?: NativeDate | null;
        } | null;
    } | null;
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
    code: string;
    isActive: boolean;
    tags: string[];
    clienteNombre: string;
    descripcion: string;
    lugar: string;
    fechaInicio: NativeDate;
    numeroOrden: string;
    estado: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
    prioridad: "baja" | "media" | "alta" | "urgente";
    asignadoA: mongoose.Types.ObjectId[];
    creadoPor: mongoose.Types.ObjectId;
    workplans: mongoose.Types.ObjectId[];
    costoEstimado: number;
    costoReal: number;
    moneda: "COP" | "USD";
    historialEstados: mongoose.Types.DocumentArray<{
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }> & {
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }>;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Archivo> & Archivo>;
    notas: mongoose.Types.DocumentArray<{
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }> & {
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }>;
    historial: mongoose.Types.DocumentArray<{
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }> & {
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }>;
    categoria: "instalacion" | "mantenimiento" | "reparacion" | "consultoria" | "otro";
    isArchived: boolean;
    requiereAprobacion: boolean;
    aprobadoPorCliente: boolean;
    cctvReports: mongoose.Types.ObjectId[];
    evidences: mongoose.Types.ObjectId[];
    toolKits: mongoose.Types.ObjectId[];
    facturacion?: {
        numeroFactura?: string | null;
        fechaFactura?: NativeDate | null;
        montoFacturado?: number | null;
        sesNumber?: string | null;
        fechaSES?: NativeDate | null;
        aprobadoPor?: string | null;
        fechaAprobacion?: NativeDate | null;
        fechaPago?: NativeDate | null;
    } | null;
    clienteContacto?: Contact | null;
    poNumber?: string | null;
    alcance?: string | null;
    coordenadas?: {
        type: "Point";
        coordinates: number[] | number[];
    } | null;
    fechaFinEstimada?: NativeDate | null;
    fechaFinReal?: NativeDate | null;
    supervisorId?: mongoose.Types.ObjectId | null;
    workPlanId?: mongoose.Types.ObjectId | null;
    metricas?: {
        duracionEstimadaDias: number;
        duracionRealDias: number;
        diasAtrasados: number;
        variacionCostoPorcentaje: number;
        sla?: {
            tiempoRespuestaHoras: number;
            tiempoResolucionHoras: number;
            cumplido: boolean;
            fechaLimite?: NativeDate | null;
        } | null;
    } | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    code: string;
    isActive: boolean;
    tags: string[];
    clienteNombre: string;
    descripcion: string;
    lugar: string;
    fechaInicio: NativeDate;
    numeroOrden: string;
    estado: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
    prioridad: "baja" | "media" | "alta" | "urgente";
    asignadoA: mongoose.Types.ObjectId[];
    creadoPor: mongoose.Types.ObjectId;
    workplans: mongoose.Types.ObjectId[];
    costoEstimado: number;
    costoReal: number;
    moneda: "COP" | "USD";
    historialEstados: mongoose.Types.DocumentArray<{
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }> & {
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }>;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Archivo> & Archivo>;
    notas: mongoose.Types.DocumentArray<{
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }> & {
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }>;
    historial: mongoose.Types.DocumentArray<{
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }> & {
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }>;
    categoria: "instalacion" | "mantenimiento" | "reparacion" | "consultoria" | "otro";
    isArchived: boolean;
    requiereAprobacion: boolean;
    aprobadoPorCliente: boolean;
    cctvReports: mongoose.Types.ObjectId[];
    evidences: mongoose.Types.ObjectId[];
    toolKits: mongoose.Types.ObjectId[];
    facturacion?: {
        numeroFactura?: string | null;
        fechaFactura?: NativeDate | null;
        montoFacturado?: number | null;
        sesNumber?: string | null;
        fechaSES?: NativeDate | null;
        aprobadoPor?: string | null;
        fechaAprobacion?: NativeDate | null;
        fechaPago?: NativeDate | null;
    } | null;
    clienteContacto?: Contact | null;
    poNumber?: string | null;
    alcance?: string | null;
    coordenadas?: {
        type: "Point";
        coordinates: number[] | number[];
    } | null;
    fechaFinEstimada?: NativeDate | null;
    fechaFinReal?: NativeDate | null;
    supervisorId?: mongoose.Types.ObjectId | null;
    workPlanId?: mongoose.Types.ObjectId | null;
    metricas?: {
        duracionEstimadaDias: number;
        duracionRealDias: number;
        diasAtrasados: number;
        variacionCostoPorcentaje: number;
        sla?: {
            tiempoRespuestaHoras: number;
            tiempoResolucionHoras: number;
            cumplido: boolean;
            fechaLimite?: NativeDate | null;
        } | null;
    } | null;
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
    code: string;
    isActive: boolean;
    tags: string[];
    clienteNombre: string;
    descripcion: string;
    lugar: string;
    fechaInicio: NativeDate;
    numeroOrden: string;
    estado: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
    prioridad: "baja" | "media" | "alta" | "urgente";
    asignadoA: mongoose.Types.ObjectId[];
    creadoPor: mongoose.Types.ObjectId;
    workplans: mongoose.Types.ObjectId[];
    costoEstimado: number;
    costoReal: number;
    moneda: "COP" | "USD";
    historialEstados: mongoose.Types.DocumentArray<{
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }> & {
        estadoNuevo: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada";
        cambiadoPor: mongoose.Types.ObjectId;
        fecha: NativeDate;
        duracionEnEstado: number;
        estadoAnterior?: "pendiente" | "planificacion" | "en_progreso" | "completada" | "facturacion" | "facturada" | "pagada" | "cancelada" | null;
        comentario?: string | null;
    }>;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, Archivo> & Archivo>;
    notas: mongoose.Types.DocumentArray<{
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }> & {
        createdAt: NativeDate;
        contenido: string;
        autor: mongoose.Types.ObjectId;
    }>;
    historial: mongoose.Types.DocumentArray<{
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }> & {
        fecha: NativeDate;
        accion: string;
        usuario?: mongoose.Types.ObjectId | null;
        detalles?: any;
    }>;
    categoria: "instalacion" | "mantenimiento" | "reparacion" | "consultoria" | "otro";
    isArchived: boolean;
    requiereAprobacion: boolean;
    aprobadoPorCliente: boolean;
    cctvReports: mongoose.Types.ObjectId[];
    evidences: mongoose.Types.ObjectId[];
    toolKits: mongoose.Types.ObjectId[];
    facturacion?: {
        numeroFactura?: string | null;
        fechaFactura?: NativeDate | null;
        montoFacturado?: number | null;
        sesNumber?: string | null;
        fechaSES?: NativeDate | null;
        aprobadoPor?: string | null;
        fechaAprobacion?: NativeDate | null;
        fechaPago?: NativeDate | null;
    } | null;
    clienteContacto?: Contact | null;
    poNumber?: string | null;
    alcance?: string | null;
    coordenadas?: {
        type: "Point";
        coordinates: number[] | number[];
    } | null;
    fechaFinEstimada?: NativeDate | null;
    fechaFinReal?: NativeDate | null;
    supervisorId?: mongoose.Types.ObjectId | null;
    workPlanId?: mongoose.Types.ObjectId | null;
    metricas?: {
        duracionEstimadaDias: number;
        duracionRealDias: number;
        diasAtrasados: number;
        variacionCostoPorcentaje: number;
        sla?: {
            tiempoRespuestaHoras: number;
            tiempoResolucionHoras: number;
            cumplido: boolean;
            fechaLimite?: NativeDate | null;
        } | null;
    } | null;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default Order;
export type IOrderDoc = OrderDoc;
export type IOrderModel = OrderModel;
//# sourceMappingURL=Order.d.ts.map
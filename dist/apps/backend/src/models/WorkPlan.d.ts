import mongoose, { Document, Model, HydratedDocument } from 'mongoose';
import { WORKPLAN_STATUS, BUSINESS_UNITS, ORDER_PRIORITY } from '../utils/constants';
type Estado = (typeof WORKPLAN_STATUS)[keyof typeof WORKPLAN_STATUS];
type UnidadNegocio = (typeof BUSINESS_UNITS)[keyof typeof BUSINESS_UNITS];
type Prioridad = (typeof ORDER_PRIORITY)[keyof typeof ORDER_PRIORITY];
interface Material {
    descripcion: any;
    cantidad: any;
    unidad?: any;
    proveedor?: any;
    costo?: any;
    solicitado?: any;
    recibido?: any;
    fechaSolicitud?: any;
    fechaRecepcion?: any;
    _id?: any;
}
interface Herramienta {
    descripcion: any;
    cantidad: any;
    disponible?: any;
    ubicacion?: any;
    toolkitId?: any;
    _id?: any;
}
interface Equipo {
    descripcion: any;
    cantidad: any;
    certificado?: any;
    _id?: any;
}
interface ElementoSeguridad {
    descripcion: any;
    cantidad: any;
    categoria?: any;
    _id?: any;
}
interface Actividad {
    actividad: any;
    fechaInicio: any;
    fechaFin: any;
    responsable?: any;
    completada?: any;
    fechaCompletada?: any;
    duracionReal?: any;
    observaciones?: any;
    _id?: any;
}
interface Aprobacion {
    aprobadoPor: any;
    rol: any;
    aprobado: any;
    comentarios?: any;
    fecha: any;
    _id?: any;
}
interface Riesgo {
    descripcion: any;
    nivel: any;
    medidaControl?: any;
    responsable?: any;
    _id?: any;
}
interface Archivo {
    nombre: any;
    url: any;
    tipo?: any;
    categoria?: any;
    uploadedBy?: any;
    uploadedAt: any;
    _id?: any;
}
interface WorkPlanDoc extends Document {
    orderId: any;
    titulo: any;
    descripcion?: any;
    alcance: any;
    unidadNegocio: any;
    responsables: {
        ingResidente?: any;
        tecnicoElectricista?: any;
        hes?: any;
    };
    creadoPor: any;
    materiales: any[];
    herramientas: any[];
    equipos: any[];
    elementosSeguridad: any[];
    personalRequerido: {
        electricistas?: any;
        tecnicosTelecomunicacion?: any;
        instrumentistas?: any;
        obreros?: any;
    };
    cronograma: any[];
    estado: any;
    aprobaciones: any[];
    aprobadoPor?: any;
    fechaAprobacion?: any;
    observaciones?: any;
    riesgos: any[];
    metricas: {
        costoTotalEstimado?: any;
        duracionTotalDias?: any;
        porcentajeCompletado?: any;
        materialesCompletos?: any;
        herramientasCompletas?: any;
    };
    archivos: any[];
    requiereRevision?: any;
    prioridad: any;
    updatedBy?: any;
    createdAt: any;
    updatedAt: any;
    costoTotalMateriales: any;
    totalPersonal: any;
    progresoActividades: any;
    estaAprobado: any;
    totalHerramientas: any;
    totalEquipos: any;
    materialesRecibidos: any;
    tieneCertificadosVencidos: any;
    duracionTotal: any;
    completeActivity(activityId: any, userId: any): Promise<HydratedDocument<WorkPlanDoc>>;
    aprobar(userId: any, rol: any, comentarios?: any): Promise<HydratedDocument<WorkPlanDoc>>;
    rechazar(userId: any, rol: any, comentarios: any): Promise<HydratedDocument<WorkPlanDoc>>;
    verificarRecursos(): {
        todoListo: any;
        faltantes: {
            materiales: any[];
            herramientas: any[];
            equiposSinCert: any[];
            certVencidos: any[];
        };
    };
    getProximasActividades(dias?: any): any[];
}
interface WorkPlanModel extends Model<WorkPlanDoc> {
    findByStatus(status: Estado, options?: {
        page?: number;
        limit?: number;
    }): Promise<WorkPlanDoc[]>;
    findPendingApproval(options?: {
        page?: number;
        limit?: number;
    }): Promise<WorkPlanDoc[]>;
    findByOrder(orderId: mongoose.Types.ObjectId): Promise<WorkPlanDoc | null>;
    findByResponsable(userId: mongoose.Types.ObjectId, options?: {
        page?: number;
        limit?: number;
    }): Promise<WorkPlanDoc[]>;
    findByUnidad(unidad: UnidadNegocio, options?: {
        estado?: any;
        page?: number;
        limit?: number;
    }): Promise<WorkPlanDoc[]>;
    search(query: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<WorkPlanDoc[]>;
    getEstadisticas(): Promise<any[]>;
    getByPrioridad(prioridad: Prioridad): Promise<WorkPlanDoc[]>;
}
declare const WorkPlan: mongoose.Model<{
    alcance: string;
    estado: "draft" | "approved" | "in_progress" | "completed" | "rejected";
    prioridad: "baja" | "media" | "alta" | "urgente";
    creadoPor: mongoose.Types.ObjectId;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Archivo> & Archivo>;
    orderId: mongoose.Types.ObjectId;
    titulo: string;
    unidadNegocio: "IT" | "MNT" | "SC" | "GEN" | "Otros";
    materiales: mongoose.Types.DocumentArray<Material, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Material> & Material>;
    herramientas: mongoose.Types.DocumentArray<Herramienta, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Herramienta> & Herramienta>;
    equipos: mongoose.Types.DocumentArray<Equipo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Equipo> & Equipo>;
    elementosSeguridad: mongoose.Types.DocumentArray<ElementoSeguridad, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, ElementoSeguridad> & ElementoSeguridad>;
    cronograma: mongoose.Types.DocumentArray<Actividad, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Actividad> & Actividad>;
    aprobaciones: mongoose.Types.DocumentArray<Aprobacion, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Aprobacion> & Aprobacion>;
    riesgos: mongoose.Types.DocumentArray<Riesgo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Riesgo> & Riesgo>;
    requiereRevision: boolean;
    updatedBy?: mongoose.Types.ObjectId | null;
    descripcion?: string | null;
    metricas?: {
        costoTotalEstimado: number;
        duracionTotalDias: number;
        porcentajeCompletado: number;
        materialesCompletos: boolean;
        herramientasCompletas: boolean;
    } | null;
    aprobadoPor?: mongoose.Types.ObjectId | null;
    fechaAprobacion?: NativeDate | null;
    responsables?: {
        ingResidente?: mongoose.Types.ObjectId | null;
        tecnicoElectricista?: mongoose.Types.ObjectId | null;
        hes?: mongoose.Types.ObjectId | null;
    } | null;
    personalRequerido?: {
        electricistas: number;
        tecnicosTelecomunicacion: number;
        instrumentistas: number;
        obreros: number;
    } | null;
    observaciones?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    alcance: string;
    estado: "draft" | "approved" | "in_progress" | "completed" | "rejected";
    prioridad: "baja" | "media" | "alta" | "urgente";
    creadoPor: mongoose.Types.ObjectId;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Archivo> & Archivo>;
    orderId: mongoose.Types.ObjectId;
    titulo: string;
    unidadNegocio: "IT" | "MNT" | "SC" | "GEN" | "Otros";
    materiales: mongoose.Types.DocumentArray<Material, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Material> & Material>;
    herramientas: mongoose.Types.DocumentArray<Herramienta, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Herramienta> & Herramienta>;
    equipos: mongoose.Types.DocumentArray<Equipo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Equipo> & Equipo>;
    elementosSeguridad: mongoose.Types.DocumentArray<ElementoSeguridad, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, ElementoSeguridad> & ElementoSeguridad>;
    cronograma: mongoose.Types.DocumentArray<Actividad, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Actividad> & Actividad>;
    aprobaciones: mongoose.Types.DocumentArray<Aprobacion, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Aprobacion> & Aprobacion>;
    riesgos: mongoose.Types.DocumentArray<Riesgo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Riesgo> & Riesgo>;
    requiereRevision: boolean;
    updatedBy?: mongoose.Types.ObjectId | null;
    descripcion?: string | null;
    metricas?: {
        costoTotalEstimado: number;
        duracionTotalDias: number;
        porcentajeCompletado: number;
        materialesCompletos: boolean;
        herramientasCompletas: boolean;
    } | null;
    aprobadoPor?: mongoose.Types.ObjectId | null;
    fechaAprobacion?: NativeDate | null;
    responsables?: {
        ingResidente?: mongoose.Types.ObjectId | null;
        tecnicoElectricista?: mongoose.Types.ObjectId | null;
        hes?: mongoose.Types.ObjectId | null;
    } | null;
    personalRequerido?: {
        electricistas: number;
        tecnicosTelecomunicacion: number;
        instrumentistas: number;
        obreros: number;
    } | null;
    observaciones?: string | null;
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
    alcance: string;
    estado: "draft" | "approved" | "in_progress" | "completed" | "rejected";
    prioridad: "baja" | "media" | "alta" | "urgente";
    creadoPor: mongoose.Types.ObjectId;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Archivo> & Archivo>;
    orderId: mongoose.Types.ObjectId;
    titulo: string;
    unidadNegocio: "IT" | "MNT" | "SC" | "GEN" | "Otros";
    materiales: mongoose.Types.DocumentArray<Material, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Material> & Material>;
    herramientas: mongoose.Types.DocumentArray<Herramienta, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Herramienta> & Herramienta>;
    equipos: mongoose.Types.DocumentArray<Equipo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Equipo> & Equipo>;
    elementosSeguridad: mongoose.Types.DocumentArray<ElementoSeguridad, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, ElementoSeguridad> & ElementoSeguridad>;
    cronograma: mongoose.Types.DocumentArray<Actividad, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Actividad> & Actividad>;
    aprobaciones: mongoose.Types.DocumentArray<Aprobacion, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Aprobacion> & Aprobacion>;
    riesgos: mongoose.Types.DocumentArray<Riesgo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Riesgo> & Riesgo>;
    requiereRevision: boolean;
    updatedBy?: mongoose.Types.ObjectId | null;
    descripcion?: string | null;
    metricas?: {
        costoTotalEstimado: number;
        duracionTotalDias: number;
        porcentajeCompletado: number;
        materialesCompletos: boolean;
        herramientasCompletas: boolean;
    } | null;
    aprobadoPor?: mongoose.Types.ObjectId | null;
    fechaAprobacion?: NativeDate | null;
    responsables?: {
        ingResidente?: mongoose.Types.ObjectId | null;
        tecnicoElectricista?: mongoose.Types.ObjectId | null;
        hes?: mongoose.Types.ObjectId | null;
    } | null;
    personalRequerido?: {
        electricistas: number;
        tecnicosTelecomunicacion: number;
        instrumentistas: number;
        obreros: number;
    } | null;
    observaciones?: string | null;
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
    alcance: string;
    estado: "draft" | "approved" | "in_progress" | "completed" | "rejected";
    prioridad: "baja" | "media" | "alta" | "urgente";
    creadoPor: mongoose.Types.ObjectId;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Archivo> & Archivo>;
    orderId: mongoose.Types.ObjectId;
    titulo: string;
    unidadNegocio: "IT" | "MNT" | "SC" | "GEN" | "Otros";
    materiales: mongoose.Types.DocumentArray<Material, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Material> & Material>;
    herramientas: mongoose.Types.DocumentArray<Herramienta, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Herramienta> & Herramienta>;
    equipos: mongoose.Types.DocumentArray<Equipo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Equipo> & Equipo>;
    elementosSeguridad: mongoose.Types.DocumentArray<ElementoSeguridad, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, ElementoSeguridad> & ElementoSeguridad>;
    cronograma: mongoose.Types.DocumentArray<Actividad, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Actividad> & Actividad>;
    aprobaciones: mongoose.Types.DocumentArray<Aprobacion, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Aprobacion> & Aprobacion>;
    riesgos: mongoose.Types.DocumentArray<Riesgo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Riesgo> & Riesgo>;
    requiereRevision: boolean;
    updatedBy?: mongoose.Types.ObjectId | null;
    descripcion?: string | null;
    metricas?: {
        costoTotalEstimado: number;
        duracionTotalDias: number;
        porcentajeCompletado: number;
        materialesCompletos: boolean;
        herramientasCompletas: boolean;
    } | null;
    aprobadoPor?: mongoose.Types.ObjectId | null;
    fechaAprobacion?: NativeDate | null;
    responsables?: {
        ingResidente?: mongoose.Types.ObjectId | null;
        tecnicoElectricista?: mongoose.Types.ObjectId | null;
        hes?: mongoose.Types.ObjectId | null;
    } | null;
    personalRequerido?: {
        electricistas: number;
        tecnicosTelecomunicacion: number;
        instrumentistas: number;
        obreros: number;
    } | null;
    observaciones?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    alcance: string;
    estado: "draft" | "approved" | "in_progress" | "completed" | "rejected";
    prioridad: "baja" | "media" | "alta" | "urgente";
    creadoPor: mongoose.Types.ObjectId;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Archivo> & Archivo>;
    orderId: mongoose.Types.ObjectId;
    titulo: string;
    unidadNegocio: "IT" | "MNT" | "SC" | "GEN" | "Otros";
    materiales: mongoose.Types.DocumentArray<Material, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Material> & Material>;
    herramientas: mongoose.Types.DocumentArray<Herramienta, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Herramienta> & Herramienta>;
    equipos: mongoose.Types.DocumentArray<Equipo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Equipo> & Equipo>;
    elementosSeguridad: mongoose.Types.DocumentArray<ElementoSeguridad, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, ElementoSeguridad> & ElementoSeguridad>;
    cronograma: mongoose.Types.DocumentArray<Actividad, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Actividad> & Actividad>;
    aprobaciones: mongoose.Types.DocumentArray<Aprobacion, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Aprobacion> & Aprobacion>;
    riesgos: mongoose.Types.DocumentArray<Riesgo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Riesgo> & Riesgo>;
    requiereRevision: boolean;
    updatedBy?: mongoose.Types.ObjectId | null;
    descripcion?: string | null;
    metricas?: {
        costoTotalEstimado: number;
        duracionTotalDias: number;
        porcentajeCompletado: number;
        materialesCompletos: boolean;
        herramientasCompletas: boolean;
    } | null;
    aprobadoPor?: mongoose.Types.ObjectId | null;
    fechaAprobacion?: NativeDate | null;
    responsables?: {
        ingResidente?: mongoose.Types.ObjectId | null;
        tecnicoElectricista?: mongoose.Types.ObjectId | null;
        hes?: mongoose.Types.ObjectId | null;
    } | null;
    personalRequerido?: {
        electricistas: number;
        tecnicosTelecomunicacion: number;
        instrumentistas: number;
        obreros: number;
    } | null;
    observaciones?: string | null;
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
    alcance: string;
    estado: "draft" | "approved" | "in_progress" | "completed" | "rejected";
    prioridad: "baja" | "media" | "alta" | "urgente";
    creadoPor: mongoose.Types.ObjectId;
    archivos: mongoose.Types.DocumentArray<Archivo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Archivo> & Archivo>;
    orderId: mongoose.Types.ObjectId;
    titulo: string;
    unidadNegocio: "IT" | "MNT" | "SC" | "GEN" | "Otros";
    materiales: mongoose.Types.DocumentArray<Material, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Material> & Material>;
    herramientas: mongoose.Types.DocumentArray<Herramienta, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Herramienta> & Herramienta>;
    equipos: mongoose.Types.DocumentArray<Equipo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Equipo> & Equipo>;
    elementosSeguridad: mongoose.Types.DocumentArray<ElementoSeguridad, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, ElementoSeguridad> & ElementoSeguridad>;
    cronograma: mongoose.Types.DocumentArray<Actividad, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Actividad> & Actividad>;
    aprobaciones: mongoose.Types.DocumentArray<Aprobacion, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Aprobacion> & Aprobacion>;
    riesgos: mongoose.Types.DocumentArray<Riesgo, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, Riesgo> & Riesgo>;
    requiereRevision: boolean;
    updatedBy?: mongoose.Types.ObjectId | null;
    descripcion?: string | null;
    metricas?: {
        costoTotalEstimado: number;
        duracionTotalDias: number;
        porcentajeCompletado: number;
        materialesCompletos: boolean;
        herramientasCompletas: boolean;
    } | null;
    aprobadoPor?: mongoose.Types.ObjectId | null;
    fechaAprobacion?: NativeDate | null;
    responsables?: {
        ingResidente?: mongoose.Types.ObjectId | null;
        tecnicoElectricista?: mongoose.Types.ObjectId | null;
        hes?: mongoose.Types.ObjectId | null;
    } | null;
    personalRequerido?: {
        electricistas: number;
        tecnicosTelecomunicacion: number;
        instrumentistas: number;
        obreros: number;
    } | null;
    observaciones?: string | null;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default WorkPlan;
export type IWorkPlanDoc = WorkPlanDoc;
export type IWorkPlanModel = WorkPlanModel;
//# sourceMappingURL=WorkPlan.d.ts.map
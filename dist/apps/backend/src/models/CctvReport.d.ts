import mongoose, { Document, Model } from 'mongoose';
declare const STATUSES: readonly ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"];
type Status = typeof STATUSES[number];
declare const SISTEMA_ACTIVO: readonly ["AC", "SOLAR", "AMBOS", "NINGUNO"];
type SistemaActivo = typeof SISTEMA_ACTIVO[number];
declare const LUCES_OBST: readonly ["SI", "NO", "N/A"];
type LucesObstruccion = typeof LUCES_OBST[number];
interface Equipment {
    tipo?: string;
    modelo?: string;
    serial?: string;
}
interface CctvReportDoc extends Document {
    orderId: mongoose.Types.ObjectId;
    camaraNo: number;
    rutinaNo: number;
    lugar: string;
    fecha: Date;
    alturaEstructura: number;
    alturaCamara: number;
    distanciaCamCaja: number;
    camara: Equipment;
    encoderPoe: Equipment;
    radio: Equipment;
    antenaExterna: Equipment & {
        nombre?: string;
    };
    switchEquipo: Equipment;
    ubicacion?: string;
    master: {
        radio: Equipment;
    };
    electrico: {
        ac110?: boolean;
        fotovoltaico?: boolean;
        cajaConexion?: boolean;
        transferenciaAutomatica?: boolean;
        puestaTierraOk?: boolean;
        sistemaActivo?: SistemaActivo;
        alimentacionOrigen?: string;
        gabineteBaseTorre?: string;
        tbt?: string;
        lucesObstruccion?: LucesObstruccion;
    };
    observaciones?: string;
    alcance?: string;
    fotos: {
        camaraAntes?: string[];
        camaraDespues?: string[];
        radioAntes?: string[];
        radioDespues?: string[];
        cajaAntes?: string[];
        cajaDespues?: string[];
        electricaAntes?: string[];
        electricaDespues?: string[];
        patAntes?: string[];
        patDespues?: string[];
        generalAntes?: string[];
        generalDespues?: string[];
    };
    tecnicoId: mongoose.Types.ObjectId;
    status: Status;
    aprobadoPor?: mongoose.Types.ObjectId;
    fechaAprobacion?: Date;
    comentariosAprobacion?: string;
    createdAt: Date;
    updatedAt: Date;
    totalFotos: number;
    estaAprobado: boolean;
    requiereAprobacion: boolean;
    isComplete(): boolean;
}
interface CctvReportModel extends Model<CctvReportDoc> {
    findByDateRange(startDate: Date, endDate: Date, options?: {
        page?: number;
        limit?: number;
        populate?: string;
        sort?: {
            [key: string]: 1 | -1;
        };
    }): Promise<{
        docs: CctvReportDoc[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    findByOrderAndDate(orderId: mongoose.Types.ObjectId, startDate?: Date, endDate?: Date, options?: {
        populate?: string;
        select?: string;
    }): Promise<CctvReportDoc[]>;
    getPendingApprovals(approverId?: mongoose.Types.ObjectId, limit?: number): Promise<CctvReportDoc[]>;
}
declare const CctvReport: mongoose.Model<{
    status: "DRAFT" | "APPROVED" | "REJECTED" | "SUBMITTED";
    lugar: string;
    fecha: NativeDate;
    orderId: mongoose.Types.ObjectId;
    tecnicoId: mongoose.Types.ObjectId;
    camaraNo: number;
    rutinaNo: number;
    alturaEstructura: number;
    alturaCamara: number;
    distanciaCamCaja: number;
    electrico?: {
        ac110: boolean;
        fotovoltaico: boolean;
        cajaConexion: boolean;
        transferenciaAutomatica: boolean;
        puestaTierraOk: boolean;
        sistemaActivo: "AC" | "SOLAR" | "AMBOS" | "NINGUNO";
        lucesObstruccion: "N/A" | "SI" | "NO";
        alimentacionOrigen?: string | null;
        gabineteBaseTorre?: string | null;
        tbt?: string | null;
    } | null;
    alcance?: string | null;
    aprobadoPor?: mongoose.Types.ObjectId | null;
    fechaAprobacion?: NativeDate | null;
    observaciones?: string | null;
    ubicacion?: string | null;
    camara?: Equipment | null;
    encoderPoe?: Equipment | null;
    radio?: Equipment | null;
    antenaExterna?: {
        nombre?: string | null;
        tipo?: any;
        modelo?: any;
        serial?: any;
    } | null;
    switchEquipo?: Equipment | null;
    master?: {
        radio?: Equipment | null;
    } | null;
    fotos?: {
        camaraAntes: string[];
        camaraDespues: string[];
        radioAntes: string[];
        radioDespues: string[];
        cajaAntes: string[];
        cajaDespues: string[];
        electricaAntes: string[];
        electricaDespues: string[];
        patAntes: string[];
        patDespues: string[];
        generalAntes: string[];
        generalDespues: string[];
    } | null;
    comentariosAprobacion?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    status: "DRAFT" | "APPROVED" | "REJECTED" | "SUBMITTED";
    lugar: string;
    fecha: NativeDate;
    orderId: mongoose.Types.ObjectId;
    tecnicoId: mongoose.Types.ObjectId;
    camaraNo: number;
    rutinaNo: number;
    alturaEstructura: number;
    alturaCamara: number;
    distanciaCamCaja: number;
    electrico?: {
        ac110: boolean;
        fotovoltaico: boolean;
        cajaConexion: boolean;
        transferenciaAutomatica: boolean;
        puestaTierraOk: boolean;
        sistemaActivo: "AC" | "SOLAR" | "AMBOS" | "NINGUNO";
        lucesObstruccion: "N/A" | "SI" | "NO";
        alimentacionOrigen?: string | null;
        gabineteBaseTorre?: string | null;
        tbt?: string | null;
    } | null;
    alcance?: string | null;
    aprobadoPor?: mongoose.Types.ObjectId | null;
    fechaAprobacion?: NativeDate | null;
    observaciones?: string | null;
    ubicacion?: string | null;
    camara?: Equipment | null;
    encoderPoe?: Equipment | null;
    radio?: Equipment | null;
    antenaExterna?: {
        nombre?: string | null;
        tipo?: any;
        modelo?: any;
        serial?: any;
    } | null;
    switchEquipo?: Equipment | null;
    master?: {
        radio?: Equipment | null;
    } | null;
    fotos?: {
        camaraAntes: string[];
        camaraDespues: string[];
        radioAntes: string[];
        radioDespues: string[];
        cajaAntes: string[];
        cajaDespues: string[];
        electricaAntes: string[];
        electricaDespues: string[];
        patAntes: string[];
        patDespues: string[];
        generalAntes: string[];
        generalDespues: string[];
    } | null;
    comentariosAprobacion?: string | null;
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
    status: "DRAFT" | "APPROVED" | "REJECTED" | "SUBMITTED";
    lugar: string;
    fecha: NativeDate;
    orderId: mongoose.Types.ObjectId;
    tecnicoId: mongoose.Types.ObjectId;
    camaraNo: number;
    rutinaNo: number;
    alturaEstructura: number;
    alturaCamara: number;
    distanciaCamCaja: number;
    electrico?: {
        ac110: boolean;
        fotovoltaico: boolean;
        cajaConexion: boolean;
        transferenciaAutomatica: boolean;
        puestaTierraOk: boolean;
        sistemaActivo: "AC" | "SOLAR" | "AMBOS" | "NINGUNO";
        lucesObstruccion: "N/A" | "SI" | "NO";
        alimentacionOrigen?: string | null;
        gabineteBaseTorre?: string | null;
        tbt?: string | null;
    } | null;
    alcance?: string | null;
    aprobadoPor?: mongoose.Types.ObjectId | null;
    fechaAprobacion?: NativeDate | null;
    observaciones?: string | null;
    ubicacion?: string | null;
    camara?: Equipment | null;
    encoderPoe?: Equipment | null;
    radio?: Equipment | null;
    antenaExterna?: {
        nombre?: string | null;
        tipo?: any;
        modelo?: any;
        serial?: any;
    } | null;
    switchEquipo?: Equipment | null;
    master?: {
        radio?: Equipment | null;
    } | null;
    fotos?: {
        camaraAntes: string[];
        camaraDespues: string[];
        radioAntes: string[];
        radioDespues: string[];
        cajaAntes: string[];
        cajaDespues: string[];
        electricaAntes: string[];
        electricaDespues: string[];
        patAntes: string[];
        patDespues: string[];
        generalAntes: string[];
        generalDespues: string[];
    } | null;
    comentariosAprobacion?: string | null;
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
    status: "DRAFT" | "APPROVED" | "REJECTED" | "SUBMITTED";
    lugar: string;
    fecha: NativeDate;
    orderId: mongoose.Types.ObjectId;
    tecnicoId: mongoose.Types.ObjectId;
    camaraNo: number;
    rutinaNo: number;
    alturaEstructura: number;
    alturaCamara: number;
    distanciaCamCaja: number;
    electrico?: {
        ac110: boolean;
        fotovoltaico: boolean;
        cajaConexion: boolean;
        transferenciaAutomatica: boolean;
        puestaTierraOk: boolean;
        sistemaActivo: "AC" | "SOLAR" | "AMBOS" | "NINGUNO";
        lucesObstruccion: "N/A" | "SI" | "NO";
        alimentacionOrigen?: string | null;
        gabineteBaseTorre?: string | null;
        tbt?: string | null;
    } | null;
    alcance?: string | null;
    aprobadoPor?: mongoose.Types.ObjectId | null;
    fechaAprobacion?: NativeDate | null;
    observaciones?: string | null;
    ubicacion?: string | null;
    camara?: Equipment | null;
    encoderPoe?: Equipment | null;
    radio?: Equipment | null;
    antenaExterna?: {
        nombre?: string | null;
        tipo?: any;
        modelo?: any;
        serial?: any;
    } | null;
    switchEquipo?: Equipment | null;
    master?: {
        radio?: Equipment | null;
    } | null;
    fotos?: {
        camaraAntes: string[];
        camaraDespues: string[];
        radioAntes: string[];
        radioDespues: string[];
        cajaAntes: string[];
        cajaDespues: string[];
        electricaAntes: string[];
        electricaDespues: string[];
        patAntes: string[];
        patDespues: string[];
        generalAntes: string[];
        generalDespues: string[];
    } | null;
    comentariosAprobacion?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    status: "DRAFT" | "APPROVED" | "REJECTED" | "SUBMITTED";
    lugar: string;
    fecha: NativeDate;
    orderId: mongoose.Types.ObjectId;
    tecnicoId: mongoose.Types.ObjectId;
    camaraNo: number;
    rutinaNo: number;
    alturaEstructura: number;
    alturaCamara: number;
    distanciaCamCaja: number;
    electrico?: {
        ac110: boolean;
        fotovoltaico: boolean;
        cajaConexion: boolean;
        transferenciaAutomatica: boolean;
        puestaTierraOk: boolean;
        sistemaActivo: "AC" | "SOLAR" | "AMBOS" | "NINGUNO";
        lucesObstruccion: "N/A" | "SI" | "NO";
        alimentacionOrigen?: string | null;
        gabineteBaseTorre?: string | null;
        tbt?: string | null;
    } | null;
    alcance?: string | null;
    aprobadoPor?: mongoose.Types.ObjectId | null;
    fechaAprobacion?: NativeDate | null;
    observaciones?: string | null;
    ubicacion?: string | null;
    camara?: Equipment | null;
    encoderPoe?: Equipment | null;
    radio?: Equipment | null;
    antenaExterna?: {
        nombre?: string | null;
        tipo?: any;
        modelo?: any;
        serial?: any;
    } | null;
    switchEquipo?: Equipment | null;
    master?: {
        radio?: Equipment | null;
    } | null;
    fotos?: {
        camaraAntes: string[];
        camaraDespues: string[];
        radioAntes: string[];
        radioDespues: string[];
        cajaAntes: string[];
        cajaDespues: string[];
        electricaAntes: string[];
        electricaDespues: string[];
        patAntes: string[];
        patDespues: string[];
        generalAntes: string[];
        generalDespues: string[];
    } | null;
    comentariosAprobacion?: string | null;
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
    status: "DRAFT" | "APPROVED" | "REJECTED" | "SUBMITTED";
    lugar: string;
    fecha: NativeDate;
    orderId: mongoose.Types.ObjectId;
    tecnicoId: mongoose.Types.ObjectId;
    camaraNo: number;
    rutinaNo: number;
    alturaEstructura: number;
    alturaCamara: number;
    distanciaCamCaja: number;
    electrico?: {
        ac110: boolean;
        fotovoltaico: boolean;
        cajaConexion: boolean;
        transferenciaAutomatica: boolean;
        puestaTierraOk: boolean;
        sistemaActivo: "AC" | "SOLAR" | "AMBOS" | "NINGUNO";
        lucesObstruccion: "N/A" | "SI" | "NO";
        alimentacionOrigen?: string | null;
        gabineteBaseTorre?: string | null;
        tbt?: string | null;
    } | null;
    alcance?: string | null;
    aprobadoPor?: mongoose.Types.ObjectId | null;
    fechaAprobacion?: NativeDate | null;
    observaciones?: string | null;
    ubicacion?: string | null;
    camara?: Equipment | null;
    encoderPoe?: Equipment | null;
    radio?: Equipment | null;
    antenaExterna?: {
        nombre?: string | null;
        tipo?: any;
        modelo?: any;
        serial?: any;
    } | null;
    switchEquipo?: Equipment | null;
    master?: {
        radio?: Equipment | null;
    } | null;
    fotos?: {
        camaraAntes: string[];
        camaraDespues: string[];
        radioAntes: string[];
        radioDespues: string[];
        cajaAntes: string[];
        cajaDespues: string[];
        electricaAntes: string[];
        electricaDespues: string[];
        patAntes: string[];
        patDespues: string[];
        generalAntes: string[];
        generalDespues: string[];
    } | null;
    comentariosAprobacion?: string | null;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export type ICctvReportDoc = CctvReportDoc;
export type ICctvReportModel = CctvReportModel;
export default CctvReport;
//# sourceMappingURL=CctvReport.d.ts.map
import { WORKPLAN_STATUS, BUSINESS_UNITS, SECURITY_ELEMENT_CATEGORIES } from '@/lib/constants';
export interface WorkPlan {
    _id: string;
    orderId: string;
    titulo: string;
    descripcion?: string;
    alcance: string;
    unidadNegocio: keyof typeof BUSINESS_UNITS;
    responsables: {
        ingResidente?: string;
        tecnicoElectricista?: string;
        hes?: string;
    };
    creadoPor: string;
    materiales: Array<{
        descripcion: string;
        cantidad: number;
        unidad: string;
        proveedor?: string;
        costo: number;
        solicitado: boolean;
        recibido: boolean;
        fechaSolicitud?: string;
        fechaRecepcion?: string;
    }>;
    herramientas: Array<{
        descripcion: string;
        cantidad: number;
        disponible: boolean;
        ubicacion?: string;
    }>;
    equipos: Array<{
        descripcion: string;
        cantidad: number;
        certificado?: {
            numero?: string;
            vigencia?: string;
            vencido: boolean;
        };
    }>;
    elementosSeguridad: Array<{
        descripcion: string;
        cantidad: number;
        categoria: keyof typeof SECURITY_ELEMENT_CATEGORIES;
    }>;
    personalRequerido: {
        electricistas: number;
        tecnicosTelecomunicacion: number;
        instrumentistas: number;
        obreros: number;
    };
    cronograma: Array<{
        actividad: string;
        fechaInicio: string;
        fechaFin: string;
        responsable?: string;
        completada: boolean;
        fechaCompletada?: string;
        duracionReal?: number;
        observaciones?: string;
    }>;
    estado: keyof typeof WORKPLAN_STATUS;
    aprobaciones: Array<{
        aprobadoPor: string;
        rol: 'engineer' | 'coordinator_hes' | 'admin';
        fechaAprobacion: string;
        comentarios?: string;
    }>;
    createdAt: string;
    updatedAt: string;
}
export interface CreateWorkPlanData {
    orderId: string;
    titulo: string;
    descripcion?: string;
    alcance: string;
    unidadNegocio: WorkPlan['unidadNegocio'];
    responsables?: Partial<WorkPlan['responsables']>;
    materiales?: WorkPlan['materiales'];
    herramientas?: WorkPlan['herramientas'];
    equipos?: WorkPlan['equipos'];
    elementosSeguridad?: WorkPlan['elementosSeguridad'];
    personalRequerido?: Partial<WorkPlan['personalRequerido']>;
    cronograma?: Omit<WorkPlan['cronograma'][0], 'completada' | 'fechaCompletada' | 'duracionReal' | 'observaciones'>[];
}
export interface WorkPlanFilters {
    estado?: WorkPlan['estado'];
    unidadNegocio?: WorkPlan['unidadNegocio'];
    orderId?: string;
    creadoPor?: string;
    fechaDesde?: string;
    fechaHasta?: string;
}
export interface WorkPlansResponse {
    workplans: WorkPlan[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasNext: boolean;
        hasPrev: boolean;
        cursor?: string;
    };
}
//# sourceMappingURL=workplan.types.d.ts.map
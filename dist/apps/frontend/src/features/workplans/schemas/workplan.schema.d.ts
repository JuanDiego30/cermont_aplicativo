import { z } from 'zod';
export declare const createWorkPlanInputSchema: z.ZodObject<{
    orderId: z.ZodString;
    titulo: z.ZodString;
    descripcion: z.ZodOptional<z.ZodString>;
    alcance: z.ZodString;
    unidadNegocio: z.ZodEnum<{
        IT: "IT";
        MNT: "MNT";
        SC: "SC";
        GEN: "GEN";
        Otros: "Otros";
    }>;
    startDate: z.ZodString;
    endDate: z.ZodString;
    assignedUsers: z.ZodString;
    tools: z.ZodString;
    estado: z.ZodEnum<{
        borrador: "borrador";
        en_revision: "en_revision";
        aprobado: "aprobado";
        en_ejecucion: "en_ejecucion";
        completado: "completado";
        cancelado: "cancelado";
    }>;
}, z.core.$strip>;
export declare const createWorkPlanSchema: z.ZodObject<{
    orderId: z.ZodString;
    titulo: z.ZodString;
    descripcion: z.ZodOptional<z.ZodString>;
    alcance: z.ZodString;
    unidadNegocio: z.ZodEnum<{
        IT: "IT";
        MNT: "MNT";
        SC: "SC";
        GEN: "GEN";
        Otros: "Otros";
    }>;
    startDate: z.ZodString;
    endDate: z.ZodString;
    assignedUsers: z.ZodArray<z.ZodString>;
    tools: z.ZodArray<z.ZodString>;
    estado: z.ZodDefault<z.ZodEnum<{
        borrador: "borrador";
        en_revision: "en_revision";
        aprobado: "aprobado";
        en_ejecucion: "en_ejecucion";
        completado: "completado";
        cancelado: "cancelado";
    }>>;
}, z.core.$strip>;
export declare const cronogramaSchema: z.ZodOptional<z.ZodArray<z.ZodObject<{
    actividad: z.ZodString;
    fechaInicio: z.ZodString;
    fechaFin: z.ZodString;
    responsable: z.ZodOptional<z.ZodString>;
}, z.core.$strip>>>;
export declare const workPlanSchema: z.ZodObject<{
    orderId: z.ZodString;
    titulo: z.ZodString;
    descripcion: z.ZodOptional<z.ZodString>;
    alcance: z.ZodString;
    unidadNegocio: z.ZodEnum<{
        IT: "IT";
        MNT: "MNT";
        SC: "SC";
        GEN: "GEN";
        Otros: "Otros";
    }>;
    startDate: z.ZodString;
    endDate: z.ZodString;
    assignedUsers: z.ZodArray<z.ZodString>;
    tools: z.ZodArray<z.ZodString>;
    estado: z.ZodDefault<z.ZodEnum<{
        borrador: "borrador";
        en_revision: "en_revision";
        aprobado: "aprobado";
        en_ejecucion: "en_ejecucion";
        completado: "completado";
        cancelado: "cancelado";
    }>>;
    recursos: z.ZodOptional<z.ZodObject<{
        tecnicosTelecomunicacion: z.ZodOptional<z.ZodNumber>;
        instrumentistas: z.ZodOptional<z.ZodNumber>;
        obreros: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    cronograma: z.ZodOptional<z.ZodArray<z.ZodObject<{
        actividad: z.ZodString;
        fechaInicio: z.ZodString;
        fechaFin: z.ZodString;
        responsable: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type CreateWorkPlanInputData = z.infer<typeof createWorkPlanInputSchema>;
export type CreateWorkPlanFormData = z.infer<typeof createWorkPlanSchema>;
export type WorkPlanFormData = z.infer<typeof workPlanSchema>;
//# sourceMappingURL=workplan.schema.d.ts.map
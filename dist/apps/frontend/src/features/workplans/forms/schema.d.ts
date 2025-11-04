import { z } from 'zod';
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
        OTROS: "OTROS";
    }>;
    responsables: z.ZodOptional<z.ZodObject<{
        ingResidente: z.ZodOptional<z.ZodString>;
        tecnicoElectricista: z.ZodOptional<z.ZodString>;
        hes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    materiales: z.ZodOptional<z.ZodArray<z.ZodObject<{
        descripcion: z.ZodString;
        cantidad: z.ZodNumber;
        unidad: z.ZodString;
        proveedor: z.ZodOptional<z.ZodString>;
        costo: z.ZodNumber;
    }, z.core.$strip>>>;
    herramientas: z.ZodOptional<z.ZodArray<z.ZodObject<{
        descripcion: z.ZodString;
        cantidad: z.ZodNumber;
        ubicacion: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    equipos: z.ZodOptional<z.ZodArray<z.ZodObject<{
        descripcion: z.ZodString;
        cantidad: z.ZodNumber;
        certificado: z.ZodOptional<z.ZodObject<{
            numero: z.ZodOptional<z.ZodString>;
            vigencia: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
    elementosSeguridad: z.ZodOptional<z.ZodArray<z.ZodObject<{
        descripcion: z.ZodString;
        cantidad: z.ZodNumber;
        categoria: z.ZodEnum<{
            EPP: "EPP";
            Señalización: "Señalización";
            "Protecci\u00F3n colectiva": "Protección colectiva";
            Emergencia: "Emergencia";
            Otro: "Otro";
        }>;
    }, z.core.$strip>>>;
    personalRequerido: z.ZodOptional<z.ZodObject<{
        electricistas: z.ZodOptional<z.ZodNumber>;
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
export type WorkPlanFormData = z.infer<typeof workPlanSchema>;
//# sourceMappingURL=schema.d.ts.map
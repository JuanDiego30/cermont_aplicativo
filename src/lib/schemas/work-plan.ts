import { z } from "zod";

const actividadSchema = z.object({
  nombre: z.string().min(3, "Describe la actividad"),
  responsable: z.string().optional(),
  fechaInicioPrevista: z.string().optional(),
  fechaFinPrevista: z.string().optional(),
  recursos: z.string().optional(),
  estado: z.enum(["pendiente", "programada", "en_progreso", "finalizada"]).default("pendiente"),
  notas: z.string().optional(),
});

export const workPlanSchema = z.object({
  proyecto: z.object({
    nombre: z.string().min(3, "Nombre del proyecto requerido"),
    cliente: z.string().min(3, "Cliente requerido"),
    ubicacion: z.string().min(3, "Ubicación requerida"),
    fechaPlaneacion: z.string().min(1, "Fecha de planeación requerida"),
    responsable: z.string().min(3, "Responsable requerido"),
    supervisor: z.string().optional(),
    contactoCliente: z.string().optional(),
  }),
  alcance: z.object({
    objetivoGeneral: z.string().min(5, "Objetivo general requerido"),
    alcanceDetallado: z.string().optional(),
    riesgosPrincipales: z.string().optional(),
    mitigaciones: z.string().optional(),
  }),
  actividades: z
    .array(actividadSchema)
    .min(1, "Registra al menos una actividad para la planeación"),
  herramientas: z.object({
    checklist: z.array(z.string()).default([]),
    adicionales: z.array(z.string()).default([]),
    observaciones: z.string().optional(),
    responsableLogistica: z.string().optional(),
    fechaVerificacion: z.string().optional(),
  }),
  documentacion: z.object({
    actaInicio: z.boolean().default(false),
    informeTecnico: z.boolean().default(false),
    reportesFotograficos: z.boolean().default(false),
    planosActualizados: z.boolean().default(false),
    fechaEntregaComprometida: z.string().min(1, "Define la fecha comprometida"),
    responsableEntrega: z.string().optional(),
    envioFacturacion: z.boolean().default(false),
    notas: z.string().optional(),
  }),
  costos: z.object({
    costoEstimado: z.union([z.number(), z.string()]).optional(),
    costoReal: z.union([z.number(), z.string()]).optional(),
    gastosNoPlaneados: z.union([z.number(), z.string()]).optional(),
    comentarios: z.string().optional(),
  }),
  observacionesGenerales: z.string().optional(),
});

export type WorkPlanFormData = z.infer<typeof workPlanSchema>;

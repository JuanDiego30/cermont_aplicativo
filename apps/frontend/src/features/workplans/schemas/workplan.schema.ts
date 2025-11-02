// src/features/workplans/schemas/workplan.schema.ts
import { z } from 'zod';
import { BUSINESS_UNITS, SECURITY_ELEMENT_CATEGORIES } from '@/lib/constants';

export const workPlanSchema = z.object({
  orderId: z.string().min(1, 'El ID de orden es requerido'),
  titulo: z.string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  descripcion: z.string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  alcance: z.string()
    .min(10, 'El alcance debe tener al menos 10 caracteres')
    .max(3000, 'El alcance no puede exceder 3000 caracteres'),
  unidadNegocio: z.enum([BUSINESS_UNITS.IT, BUSINESS_UNITS.MNT, BUSINESS_UNITS.SC, BUSINESS_UNITS.GEN, BUSINESS_UNITS.OTROS]),
  responsables: z.object({
    ingResidente: z.string().optional(),
    tecnicoElectricista: z.string().optional(),
    hes: z.string().optional(),
  }).optional(),
  materiales: z.array(z.object({
    descripcion: z.string().min(1, 'La descripción es requerida'),
    cantidad: z.number().min(0, 'La cantidad no puede ser negativa'),
    unidad: z.string().min(1, 'La unidad es requerida'),
    proveedor: z.string().optional(),
    costo: z.number().min(0, 'El costo no puede ser negativo'),
  })).optional(),
  herramientas: z.array(z.object({
    descripcion: z.string().min(1, 'La descripción es requerida'),
    cantidad: z.number().min(1, 'La cantidad debe ser al menos 1'),
    ubicacion: z.string().optional(),
  })).optional(),
  equipos: z.array(z.object({
    descripcion: z.string().min(1, 'La descripción es requerida'),
    cantidad: z.number().min(1, 'La cantidad debe ser al menos 1'),
    certificado: z.object({
      numero: z.string().optional(),
      vigencia: z.string().optional(),
    }).optional(),
  })).optional(),
  elementosSeguridad: z.array(z.object({
    descripcion: z.string().min(1, 'La descripción es requerida'),
    cantidad: z.number().min(1, 'La cantidad debe ser al menos 1'),
    categoria: z.enum([
      SECURITY_ELEMENT_CATEGORIES.EPP,
      SECURITY_ELEMENT_CATEGORIES.SENALIZACION,
      SECURITY_ELEMENT_CATEGORIES.PROTECCION_COLECTIVA,
      SECURITY_ELEMENT_CATEGORIES.EMERGENCIA,
      SECURITY_ELEMENT_CATEGORIES.OTRO,
    ]),
  })).optional(),
  personalRequerido: z.object({
    electricistas: z.number().min(0).optional(),
    tecnicosTelecomunicacion: z.number().min(0).optional(),
    instrumentistas: z.number().min(0).optional(),
    obreros: z.number().min(0).optional(),
  }).optional(),
  cronograma: z.array(z.object({
    actividad: z.string().min(1, 'La actividad es requerida'),
    fechaInicio: z.string().min(1, 'La fecha de inicio es requerida'),
    fechaFin: z.string().min(1, 'La fecha de fin es requerida'),
    responsable: z.string().optional(),
  })).optional(),
});

export type WorkPlanFormData = z.infer<typeof workPlanSchema>;
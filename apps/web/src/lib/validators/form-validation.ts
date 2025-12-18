/**
 * ARCHIVO: form-validation.ts
 * FUNCION: Utilidades avanzadas de validación de formularios
 * IMPLEMENTACION: Basado en patrones de vercel/examples/hydrogen forms
 * DEPENDENCIAS: zod
 * EXPORTS: useFormValidation, validateForm, FormErrors, ValidationResult
 */
import { z, type ZodSchema, type ZodError } from 'zod';

/**
 * Tipo para errores de formulario
 */
export type FormErrors<T> = {
  [K in keyof T]?: string[];
} & {
  _form?: string[];
};

/**
 * Resultado de validación
 */
export type ValidationResult<T> = 
  | { success: true; data: T; errors: null }
  | { success: false; data: null; errors: FormErrors<T> };

/**
 * Convierte errores de Zod a formato de formulario
 */
export function formatZodErrors<T>(error: ZodError): FormErrors<T> {
  const errors: FormErrors<T> = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : '_form';
    const key = path as keyof FormErrors<T>;
    
    if (!errors[key]) {
      (errors as Record<string, string[]>)[path] = [];
    }
    (errors as Record<string, string[]>)[path].push(issue.message);
  });
  
  return errors;
}

/**
 * Valida datos contra un schema de Zod
 * Basado en patrones de vercel/examples/hydrogen
 */
export function validateForm<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: null,
    };
  }
  
  return {
    success: false,
    data: null,
    errors: formatZodErrors<T>(result.error),
  };
}

/**
 * Valida un campo individual
 */
export function validateField<T, K extends keyof T>(
  schema: ZodSchema<T>,
  field: K,
  value: unknown
): string | null {
  try {
    // Crear un schema parcial para el campo específico
    const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;
    const fieldSchema = shape[field as string] as z.ZodTypeAny | undefined;
    
    if (fieldSchema) {
      fieldSchema.parse(value);
    }
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'Valor inválido';
    }
    return 'Error de validación';
  }
}

/**
 * Validadores comunes reutilizables
 */
export const commonValidators = {
  // Email
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
  
  // Contraseña
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  
  // Contraseña simple (sin requisitos estrictos)
  passwordSimple: z.string()
    .min(6, 'Mínimo 6 caracteres'),
  
  // Teléfono Colombia
  phoneCO: z.string()
    .regex(/^(\+57)?[0-9]{10}$/, 'Teléfono inválido (10 dígitos)'),
  
  // NIT Colombia
  nit: z.string()
    .regex(/^[0-9]{9}-[0-9]$/, 'NIT inválido (formato: 123456789-0)'),
  
  // Cédula Colombia
  cedula: z.string()
    .regex(/^[0-9]{6,10}$/, 'Cédula inválida (6-10 dígitos)'),
  
  // UUID
  uuid: z.string().uuid('ID inválido'),
  
  // URL
  url: z.string().url('URL inválida'),
  
  // Requerido no vacío
  required: z.string().min(1, 'Este campo es requerido'),
  
  // Número positivo
  positiveNumber: z.number().positive('Debe ser un número positivo'),
  
  // Fecha
  date: z.string().datetime('Fecha inválida'),
  
  // Fecha opcional
  dateOptional: z.string().datetime('Fecha inválida').optional(),
};

/**
 * Confirmación de contraseña
 */
export const passwordConfirmSchema = z.object({
  password: commonValidators.password,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

/**
 * Schema de dirección Colombia
 */
export const addressSchema = z.object({
  direccion: z.string().min(10, 'Dirección muy corta'),
  ciudad: z.string().min(2, 'Ciudad requerida'),
  departamento: z.string().min(2, 'Departamento requerido'),
  codigoPostal: z.string().optional(),
  referencias: z.string().optional(),
});

/**
 * Schema de cliente
 */
export const clienteSchema = z.object({
  nombre: z.string().min(2, 'Nombre muy corto'),
  nit: commonValidators.nit.optional(),
  telefono: commonValidators.phoneCO,
  email: commonValidators.email,
  direccion: z.string().min(10, 'Dirección muy corta'),
  ciudad: z.string().min(2, 'Ciudad requerida'),
  contactoPrincipal: z.string().optional(),
});

/**
 * Schema de orden de trabajo
 */
export const ordenTrabajoSchema = z.object({
  clienteId: z.string().uuid('Cliente requerido'),
  descripcion: z.string().min(10, 'Descripción muy corta'),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']),
  tipoServicio: z.enum(['INSTALACION', 'MANTENIMIENTO', 'REPARACION', 'DIAGNOSTICO']),
  fechaProgramada: z.string().datetime().optional(),
  direccionServicio: z.string().min(10, 'Dirección requerida'),
  notas: z.string().max(500, 'Máximo 500 caracteres').optional(),
  tecnicoAsignado: z.string().uuid().optional(),
});

/**
 * Schema de ejecución de trabajo
 */
export const ejecucionSchema = z.object({
  ordenId: z.string().uuid('Orden requerida'),
  descripcionTrabajo: z.string().min(20, 'Descripción del trabajo muy corta'),
  materialesUsados: z.array(z.object({
    nombre: z.string(),
    cantidad: z.number().positive(),
    unidad: z.string(),
  })).optional(),
  horaInicio: z.string().datetime(),
  horaFin: z.string().datetime(),
  observaciones: z.string().optional(),
  firmaCliente: z.string().optional(),
});

/**
 * Helper para crear mensajes de error personalizados
 * @deprecated Usar directamente en el schema con .refine() o mensajes personalizados en z.string()
 */
export function createErrorMap(customMessages: Record<string, string>) {
  return ((issue: { code: string }, ctx: { defaultError: string }) => {
    const customMessage = customMessages[issue.code];
    if (customMessage) {
      return { message: customMessage };
    }
    return { message: ctx.defaultError };
  }) as unknown as z.ZodErrorMap;
}

// Tipos inferidos
export type ClienteInput = z.infer<typeof clienteSchema>;
export type OrdenTrabajoInput = z.infer<typeof ordenTrabajoSchema>;
export type EjecucionInput = z.infer<typeof ejecucionSchema>;
export type AddressInput = z.infer<typeof addressSchema>;

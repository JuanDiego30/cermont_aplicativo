/**
 * Formulario Models
 * Models for formularios module matching backend DTOs
 */

export type TipoFormulario = 'CHECKLIST' | 'INSPECCION' | 'MANTENIMIENTO' | 'REPORTE' | 'CERTIFICACION' | 'HES' | 'OTRO';

export type FormSubmissionStatus = 'PENDIENTE' | 'COMPLETADO' | 'VALIDADO' | 'RECHAZADO';

/**
 * Campo de formulario
 */
export interface FormFieldResponseDto {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  order: number;
  options?: string[];
}

/**
 * Template de formulario (response)
 */
export interface FormTemplateResponseDto {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: string;
  contextType: string;
  fields: FormFieldResponseDto[];
  schema: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  createdBy: string;
}

/**
 * DTO para crear template de formulario
 */
export interface CreateFormTemplateDto {
  nombre: string;
  tipo: TipoFormulario;
  categoria: string;
  version?: string;
  schema: Record<string, unknown>;
  uiSchema?: Record<string, unknown>;
  descripcion?: string;
  tags?: string[];
  activo?: boolean;
}

/**
 * DTO para actualizar template de formulario
 */
export interface UpdateFormTemplateDto {
  nombre?: string;
  tipo?: TipoFormulario;
  categoria?: string;
  version?: string;
  schema?: Record<string, unknown>;
  uiSchema?: Record<string, unknown>;
  descripcion?: string;
  tags?: string[];
  activo?: boolean;
}

/**
 * Query parameters para listar templates
 */
export interface ListTemplatesQueryDto {
  contextType?: string;
  publishedOnly?: boolean;
  activeOnly?: boolean;
}

/**
 * DTO para enviar formulario completado
 */
export interface SubmitFormDto {
  templateId: string;
  contextType?: string;
  contextId?: string;
  answers: Record<string, any>;
  ordenId?: string;
  data?: any;
  estado?: string;
}

/**
 * Query parameters para listar submissions
 */
export interface ListSubmissionsQueryDto {
  templateId?: string;
  contextType?: string;
  contextId?: string;
}

/**
 * Response de un submission (formulario completado)
 */
export interface FormSubmissionResponseDto {
  id: string;
  templateId: string;
  status: FormSubmissionStatus;
  answers: Record<string, any>;
  submittedAt: string;
  validatedAt?: string;
}


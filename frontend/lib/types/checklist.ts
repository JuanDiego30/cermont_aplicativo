/**
 * Tipo de pregunta en el checklist
 */
export enum QuestionType {
  YES_NO = 'YES_NO',
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  PHOTO = 'PHOTO',
  SIGNATURE = 'SIGNATURE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  DATE = 'DATE',
  TIME = 'TIME',
}

/**
 * Categor�a de checklist
 */
export enum ChecklistCategory {
  PRE_EJECUCION = 'PRE_EJECUCION',
  DURANTE_EJECUCION = 'DURANTE_EJECUCION',
  POST_EJECUCION = 'POST_EJECUCION',
  SEGURIDAD = 'SEGURIDAD',
  CALIDAD = 'CALIDAD',
  AMBIENTAL = 'AMBIENTAL',
}

/**
 * Pregunta individual del checklist
 */
export type ChecklistQuestion = {
  id: string;
  order: number;
  question: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  validations?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  helpText?: string;
  criticalQuestion: boolean;
};

/**
 * Secci�n del checklist
 */
export type ChecklistSection = {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: ChecklistQuestion[];
};

/**
 * Template de Checklist
 */
export type ChecklistTemplate = {
  id: string;
  name: string;
  description: string;
  category: ChecklistCategory;
  kitId?: string;
  sections: ChecklistSection[];
  active: boolean;
  version: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
};

/**
 * Respuesta a una pregunta
 */
export type QuestionAnswer = {
  questionId: string;
  answer: string | number | boolean | string[];
  photos?: string[];
  signature?: string;
  notes?: string;
  answeredAt: string;
  answeredBy: string;
};

/**
 * Checklist completado
 */
export type CompletedChecklist = {
  id: string;
  templateId: string;
  templateName: string;
  orderId: string;
  orderCode: string;
  answers: QuestionAnswer[];
  completedBy: string;
  completedAt?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
};

/**
 * DTO para crear template
 */
export type CreateChecklistTemplateDTO = Omit<
  ChecklistTemplate,
  'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'usageCount'
>;

/**
 * DTO para actualizar template
 */
export type UpdateChecklistTemplateDTO = Partial<CreateChecklistTemplateDTO>;

/**
 * DTO para iniciar checklist
 */
export type StartChecklistDTO = {
  templateId: string;
  orderId: string;
};

/**
 * DTO para guardar respuesta
 */
export type SaveAnswerDTO = {
  checklistId: string;
  questionId: string;
  answer: string | number | boolean | string[];
  photos?: File[];
  signature?: string;
  notes?: string;
};

/**
 * DTO para completar checklist
 */
export type CompleteChecklistDTO = {
  checklistId: string;
  location?: {
    latitude: number;
    longitude: number;
  };
};


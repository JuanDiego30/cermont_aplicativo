/**
 * Checklist Types
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

export enum ChecklistCategory {
  PRE_EJECUCION = 'PRE_EJECUCION',
  DURANTE_EJECUCION = 'DURANTE_EJECUCION',
  POST_EJECUCION = 'POST_EJECUCION',
  SEGURIDAD = 'SEGURIDAD',
  CALIDAD = 'CALIDAD',
  AMBIENTAL = 'AMBIENTAL',
}

export type ChecklistQuestion = {
  id: string;
  order: number;
  question: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  validations?: { min?: number; max?: number; pattern?: string };
  helpText?: string;
  criticalQuestion: boolean;
};

export type ChecklistSection = {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: ChecklistQuestion[];
};

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

export type QuestionAnswer = {
  questionId: string;
  answer: string | number | boolean | string[];
  photos?: string[];
  signature?: string;
  notes?: string;
  answeredAt: string;
  answeredBy: string;
};

export type CompletedChecklist = {
  id: string;
  templateId: string;
  templateName: string;
  orderId: string;
  orderCode: string;
  answers: QuestionAnswer[];
  completedBy: string;
  completedAt?: string;
  location?: { latitude: number; longitude: number };
  status: 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
};

export type CreateChecklistTemplateDTO = {
  name: string;
  description: string;
  category: ChecklistCategory;
  sections: Omit<ChecklistSection, 'id'>[];
  kitId?: string;
  active: boolean;
  version: string;
};

export type UpdateChecklistTemplateDTO = Partial<CreateChecklistTemplateDTO>;
export type StartChecklistDTO = { templateId: string; orderId: string };
export type SaveAnswerDTO = { questionId: string; answer: string | number | boolean | string[]; photos?: string[]; notes?: string };
export type CompleteChecklistDTO = { location?: { latitude: number; longitude: number } };

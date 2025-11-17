/**
 * Estados posibles de una orden de trabajo
 */
export enum OrderState {
  SOLICITUD = 'SOLICITUD',
  VISITA = 'VISITA',
  PO = 'PO',
  PLANEACION = 'PLANEACION',
  EJECUCION = 'EJECUCION',
  INFORME = 'INFORME',
  ACTA = 'ACTA',
  SES = 'SES',
  FACTURA = 'FACTURA',
  PAGO = 'PAGO',
}

/**
 * Entidad: Orden de trabajo
 * Representa una orden de trabajo en el sistema ATG
 */
export interface Order extends Record<string, unknown> {
  /** ID único de la orden */
  id: string;

  /** Identificador externo para integraciones */
  externalId?: string;

  /** Caso o expediente asociado */
  caseId?: string;

  /** Nombre del cliente */
  clientName: string;

  /** Descripción del trabajo a realizar */
  description: string;

  /** Dirección o ubicación del trabajo */
  location: string;

  /** Estado actual de la orden */
  state: OrderState;

  /** Prioridad del trabajo */
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';

  /** ID del responsable asignado */
  responsibleId?: string;

  /** ID del plan de trabajo enlazado */
  workPlanId?: string;

  /** Fecha estimada de inicio */
  requestedAt?: Date;

  /** Fecha límite comprometida */
  dueDate?: Date;

  /** Colaborador operativo actual */
  assignedTeam?: string;

  /** Lista de etiquetas libres para búsqueda */
  tags?: string[];

  /** Notas adicionales */
  notes?: string;

  /** Contacto principal */
  contact?: {
    name: string;
    phone?: string;
    email?: string;
  };

  /** Historial de cambios de estado */
  stateHistory?: Array<{
    state: OrderState;
    changedAt: Date;
    changedBy: string;
    comment?: string;
  }>;

  /** Indica si la orden está archivada */
  archived: boolean;

  /** Fecha en que se archivó la orden */
  archivedAt?: Date;

  /** ID del usuario que archivó la orden */
  archivedBy?: string;

  /** Tiempo estimado en horas */
  estimatedHours?: number;

  /** Tiempo real registrado en horas */
  actualHours?: number;

  /** Metadatos específicos de la orden */
  metadata?: Record<string, unknown>;

  /** IDs de evidencias relacionadas */
  evidenceIds?: string[];

  /** ID del usuario que creó la orden */
  createdBy: string;

  /** Fecha de creación */
  createdAt: Date;

  /** Fecha de última actualización */
  updatedAt: Date;
}


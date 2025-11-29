/**
 * Estados posibles del flujo de vida de una orden
 * @enum {string}
 */
export enum OrderState {
  SOLICITUD = 'SOLICITUD',
  VISITA = 'VISITA',
  PO = 'PO', // Purchase Order
  PLANEACION = 'PLANEACION',
  EJECUCION = 'EJECUCION',
  INFORME = 'INFORME',
  ACTA = 'ACTA',
  SES = 'SES', // Seguridad, Salud y Medio Ambiente
  FACTURA = 'FACTURA',
  PAGO = 'PAGO',
}

/**
 * Niveles de prioridad estandarizados
 */
export enum OrderPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL', // Agregado para casos urgentes
}

/**
 * Información de contacto asociada a la orden
 */
export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  role?: string; // Ej: 'Gerente', 'Técnico en sitio'
}

/**
 * Registro de transición de estado
 */
export interface StateTransition {
  fromState?: OrderState;
  toState: OrderState;
  changedAt: Date;
  changedBy: string;
  reason?: string;
}

/**
 * Entidad: Orden de Trabajo
 * Representa el núcleo operativo del sistema ATG.
 */
export interface Order {
  id: string;
  orderNumber: string;
  
  // Referencias externas
  externalId?: string;
  caseId?: string;

  // Información del Cliente (Unificada)
  clientName: string;
  clientContact: ContactInfo;

  // Detalles del trabajo
  description: string;
  location?: string;
  notes?: string;
  tags?: string[];

  // Estado y Clasificación
  state: OrderState;
  priority: OrderPriority;

  // Asignación
  responsibleId: string;   // ID del usuario responsable (Owner)
  assignedTeam?: string;   // Equipo operativo asignado

  // Planificación
  workPlanId?: string;     // ID del plan asociado
  requestedAt?: Date;      // Fecha solicitada por cliente
  dueDate?: Date;          // Fecha compromiso de entrega
  
  // Métricas de Tiempo
  estimatedHours?: number;
  actualHours?: number;

  // Auditoría de cambios de estado
  stateHistory: StateTransition[];

  // Archivo / Eliminación
  archived: boolean;
  archivedAt?: Date;
  archivedBy?: string;

  deletedAt?: Date | null;
  deletedBy?: string;
  deletionReason?: string;

  // Metadatos del sistema
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;

  /** 
   * Metadatos flexibles para integraciones o plugins
   * Preferir campos tipados si son core del negocio.
   */
  metadata?: Record<string, unknown>;
}



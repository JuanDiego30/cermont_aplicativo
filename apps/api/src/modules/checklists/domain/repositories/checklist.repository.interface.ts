/**
 * @repository IChecklistRepository
 */
export const CHECKLIST_REPOSITORY = Symbol('CHECKLIST_REPOSITORY');

export interface ChecklistData {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  items: ChecklistItemData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItemData {
  id: string;
  descripcion: string;
  requerido: boolean;
  orden: number;
}

export interface ChecklistOrdenData {
  id: string;
  checklistId: string;
  ordenId: string;
  completado: boolean;
  items: ChecklistOrdenItemData[];
}

export interface ChecklistOrdenItemData {
  itemId: string;
  completado: boolean;
  observaciones?: string;
}

export interface CreateChecklistInput {
  nombre: string;
  descripcion?: string;
  tipo: string;
  items: { descripcion: string; requerido: boolean; orden: number }[];
}

export interface IChecklistRepository {
  findAll(): Promise<ChecklistData[]>;
  findById(id: string): Promise<ChecklistData | null>;
  findByTipo(tipo: string): Promise<ChecklistData[]>;
  create(data: CreateChecklistInput): Promise<ChecklistData>;
  delete(id: string): Promise<void>;
  findByOrden(ordenId: string): Promise<ChecklistOrdenData[]>;
  assignToOrden(ordenId: string, checklistId: string): Promise<ChecklistOrdenData>;
  toggleItem(ordenId: string, checklistId: string, itemId: string, completado: boolean, observaciones?: string): Promise<ChecklistOrdenItemData>;
}

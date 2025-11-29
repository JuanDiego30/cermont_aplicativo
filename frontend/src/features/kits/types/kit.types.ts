/**
 * Kit Types
 */

export type Kit = {
  id: string;
  name: string;
  description: string;
  category: 'ELECTRICIDAD' | 'INSTRUMENTACION' | 'MECANICA' | 'CIVIL' | 'SEGURIDAD';
  tools: ToolItem[];
  equipment: EquipmentItem[];
  documents: DocumentItem[];
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ToolItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  required: boolean;
  certificationRequired: boolean;
  certificationExpiry?: string;
};

export type EquipmentItem = {
  id: string;
  name: string;
  model?: string;
  serialNumber?: string;
  quantity: number;
  certificationRequired: boolean;
  certificationExpiry?: string;
  nextMaintenanceDate?: string;
};

export type DocumentItem = {
  id: string;
  name: string;
  type: 'AST' | 'PROCEDIMIENTO' | 'INSTRUCTIVO' | 'FORMATO';
  required: boolean;
  template?: string;
};

export type CreateKitDTO = Omit<Kit, 'id' | 'createdAt' | 'updatedAt' | 'active' | 'createdBy'>;
export type UpdateKitDTO = Partial<CreateKitDTO>;

export type KitStats = {
  total: number;
  active: number;
  inactive: number;
  byCategory: Record<Kit['category'], number>;
  totalTools: number;
  totalEquipment: number;
  totalDocuments: number;
};

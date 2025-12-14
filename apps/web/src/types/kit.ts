/**
 * ARCHIVO: kit.ts
 * FUNCION: Define tipos para kits de materiales y su asignación a órdenes
 * IMPLEMENTACION: Interfaces para Kit, KitItem, CreateKitInput, UpdateKitInput, KitAssignment
 * DEPENDENCIAS: Ninguna (tipos puros)
 * EXPORTS: Kit, KitItem, CreateKitInput, UpdateKitInput, KitAssignment
 */
export interface Kit {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  items: KitItem[];
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KitItem {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  descripcion?: string;
}

export interface CreateKitInput {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  items?: Omit<KitItem, 'id'>[];
}

export interface UpdateKitInput extends Partial<CreateKitInput> {
  activo?: boolean;
}

export interface KitAssignment {
  id: string;
  kitId: string;
  kit?: Kit;
  ordenId: string;
  cantidad: number;
  asignadoEn: string;
  asignadoPor: string;
}

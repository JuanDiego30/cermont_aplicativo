/**
 * ARCHIVO: planeacion.api.ts
 * FUNCION: Cliente API REST para gestión de planeación de órdenes
 * IMPLEMENTACION: Métodos HTTP via apiClient para CRUD de planeación y kits
 * DEPENDENCIAS: @/lib/api (apiClient)
 * EXPORTS: Interfaces (Planeacion, PlaneacionItem, KitTipico), planeacionApi
 */
import { apiClient } from '@/lib/api-client';

export interface Planeacion {
  id: string;
  ordenId: string;
  fechaInicioProgramada: string;
  fechaFinProgramada: string;
  observaciones?: string;
  recursosAsignados?: string;
  presupuesto?: number;
  requierePermisos: boolean;
  permisosObtenidos: boolean;
  items: PlaneacionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaneacionItem {
  id: string;
  planeacionId: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  precioTotal: number;
  esKit: boolean;
  kitId?: string;
}

export interface CreatePlaneacionInput {
  ordenId: string;
  fechaInicioProgramada: string;
  fechaFinProgramada: string;
  observaciones?: string;
  recursosAsignados?: string;
  presupuesto?: number;
  requierePermisos?: boolean;
  items?: Omit<PlaneacionItem, 'id' | 'planeacionId'>[];
}

export interface UpdatePlaneacionInput {
  fechaInicioProgramada?: string;
  fechaFinProgramada?: string;
  observaciones?: string;
  recursosAsignados?: string;
  presupuesto?: number;
  requierePermisos?: boolean;
  permisosObtenidos?: boolean;
}

export interface KitTipico {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  items: KitItem[];
  precioTotal: number;
  activo: boolean;
}

export interface KitItem {
  id: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
}

export const planeacionApi = {
  /**
   * Obtener planeación por orden ID
   */
  getByOrdenId: async (ordenId: string): Promise<Planeacion> => {
    const response = await apiClient.get<{ status: string; data: Planeacion }>(
      `/planeacion/orden/${ordenId}`
    );
    return response.data;
  },

  /**
   * Crear planeación
   */
  create: async (data: CreatePlaneacionInput): Promise<Planeacion> => {
    const response = await apiClient.post<{ status: string; data: Planeacion }>(
      '/planeacion',
      data
    );
    return response.data;
  },

  /**
   * Actualizar planeación
   */
  update: async (id: string, data: UpdatePlaneacionInput): Promise<Planeacion> => {
    const response = await apiClient.put<{ status: string; data: Planeacion }>(
      `/planeacion/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Agregar item a planeación
   */
  addItem: async (planeacionId: string, item: Omit<PlaneacionItem, 'id' | 'planeacionId'>): Promise<PlaneacionItem> => {
    const response = await apiClient.post<{ status: string; data: PlaneacionItem }>(
      `/planeacion/${planeacionId}/items`,
      item
    );
    return response.data;
  },

  /**
   * Eliminar item de planeación
   */
  removeItem: async (planeacionId: string, itemId: string): Promise<void> => {
    await apiClient.delete(`/planeacion/${planeacionId}/items/${itemId}`);
  },

  /**
   * Aplicar kit a planeación
   */
  applyKit: async (planeacionId: string, kitId: string): Promise<Planeacion> => {
    const response = await apiClient.post<{ status: string; data: Planeacion }>(
      `/planeacion/${planeacionId}/aplicar-kit`,
      { kitId }
    );
    return response.data;
  },

  /**
   * Obtener todos los kits típicos
   */
  getKits: async (categoria?: string): Promise<KitTipico[]> => {
    const params = categoria ? `?categoria=${categoria}` : '';
    const response = await apiClient.get<{ status: string; data: KitTipico[] }>(
      `/kits${params}`
    );
    return response.data;
  },

  /**
   * Obtener kit por ID
   */
  getKitById: async (id: string): Promise<KitTipico> => {
    const response = await apiClient.get<{ status: string; data: KitTipico }>(
      `/kits/${id}`
    );
    return response.data;
  },
};

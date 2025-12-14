/**
 * ARCHIVO: orden.ts
 * FUNCION: Define tipos para órdenes de servicio (versión español/legacy)
 * IMPLEMENTACION: Interfaces TypeScript con estados en español (SOLICITADA, PLANEADA, etc.)
 * DEPENDENCIAS: Ninguna (tipos puros)
 * EXPORTS: Orden, CreateOrdenDTO, UpdateOrdenDTO
 * NOTA: Considerar unificar con order.ts para evitar duplicidad
 */
export interface Orden {
    id: string;
    numero: string;
    clienteId: string;
    cliente?: {
        nombre: string;
        email?: string;
    };
    descripcion?: string;
    tipoServicio: string;
    estado: 'SOLICITADA' | 'PLANEADA' | 'EN_EJECUCION' | 'COMPLETADA' | 'FACTURADA' | 'PAGADA' | 'CANCELADA';
    montoEstimado: number;
    responsableId?: string;
    fechaEstimadaInicio?: string;
    fechaEstimadaFin?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrdenDTO {
    numero?: string;
    clienteId: string;
    descripcion?: string;
    tipoServicio: string;
    montoEstimado: number;
    fechaEstimadaInicio: string;
    fechaEstimadaFin: string;
    responsableId?: string;
}

export interface UpdateOrdenDTO {
    clienteId?: string;
    descripcion?: string;
    tipoServicio?: string;
    estado?: string;
    montoEstimado?: number;
    fechaEstimadaInicio?: string;
    fechaEstimadaFin?: string;
    responsableId?: string;
}

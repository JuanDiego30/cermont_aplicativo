/**
 * @file formulario.utils.ts
 * @description Utility functions and constants for Formularios
 */

import { EstadoFormulario } from '../types/formulario.types';

export const ESTADO_FORMULARIO_CONFIG: Record<EstadoFormulario, { label: string; color: string }> = {
    borrador: { label: 'Borrador', color: 'gray' },
    activo: { label: 'Activo', color: 'green' },
    archivado: { label: 'Archivado', color: 'yellow' },
    ACTIVO: { label: 'Activo', color: 'green' },
    INACTIVO: { label: 'Inactivo', color: 'red' },
    BORRADOR: { label: 'Borrador', color: 'gray' },
};

export const TIPO_CAMPO_CONFIG: Record<string, { label: string; icon: string }> = {
    texto: { label: 'Texto', icon: 'TextIcon' },
    numero: { label: 'Número', icon: 'HashIcon' },
    fecha: { label: 'Fecha', icon: 'CalendarIcon' },
    seleccion: { label: 'Selección', icon: 'ListIcon' },
    foto: { label: 'Foto', icon: 'CameraIcon' },
    firma: { label: 'Firma', icon: 'PencilIcon' },
};

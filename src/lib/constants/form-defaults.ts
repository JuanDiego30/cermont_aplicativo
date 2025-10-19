/**
 * Valores por defecto para formularios
 */

import type { CctvFormData } from '../schemas/cctv';

/**
 * Valores iniciales para el formulario CCTV
 */
export const CCTV_FORM_DEFAULTS: Partial<CctvFormData> = {
  // Generalidades
  lugar: '',
  fecha: new Date().toISOString().split('T')[0],
  camaraNo: '',
  rutinaNo: '',
  alturaEstructura: '',
  alturaCamara: '',
  ubicacion: '',
  
  // Configuración CCTV - Cámara
  camara: {
    tipo: '',
    modelo: '',
    serial: '',
  },
  
  // Encoder/PoE
  encoderPoe: {
    tipo: '',
    modelo: '',
    serial: '',
  },
  
  // Radio
  radio: {
    tipo: '',
    modelo: '',
    serial: '',
  },
  
  // Antena externa
  antenaExterna: {
    nombre: '',
    tipo: '',
    serial: '',
  },
  
  // Switch
  switchEquipo: {
    tipo: '',
    modelo: '',
    serial: '',
  },
  
  // Master
  master: {
    radio: {
      tipo: '',
      modelo: '',
      serial: '',
    },
  },
  
  // Sistema eléctrico - valores por defecto
  electrico: {
    ac110: false,
    fotovoltaico: false,
    cajaConexion: false,
    transferenciaAutomatica: false,
    puestaTierraOk: false,
    activoAC: false,
    activoSol: false,
    alimentacionOrigen: '',
    sistemaActivo: 'AC',
    gabineteBaseTorre: '',
    tbt: '',
    lucesObstruccion: '',
  },
  
  // Distancias
  distanciaCamCaja: '',
  
  // Observaciones
  observaciones: '',
  
  // Fotos
  fotos: {
    camaraAntes: undefined,
    camaraDespues: undefined,
    radioAntes: undefined,
    radioDespues: undefined,
    cajaAntes: undefined,
    cajaDespues: undefined,
    electricaAntes: undefined,
    electricaDespues: undefined,
    patAntes: undefined,
    patDespues: undefined,
  },
};

/**
 * Opciones comunes para selects
 */
export const FORM_OPTIONS = {
  departamentos: [
    'Antioquia',
    'Atlántico',
    'Bogotá D.C.',
    'Bolívar',
    'Boyacá',
    'Caldas',
    'Caquetá',
    'Cauca',
    'Cesar',
    'Córdoba',
    'Cundinamarca',
    'Chocó',
    'Huila',
    'La Guajira',
    'Magdalena',
    'Meta',
    'Nariño',
    'Norte de Santander',
    'Quindío',
    'Risaralda',
    'Santander',
    'Sucre',
    'Tolima',
    'Valle del Cauca',
  ],
  
  fabricantes: [
    'Hikvision',
    'Dahua',
    'Axis',
    'Samsung',
    'Bosch',
    'Hanwha',
    'Otro',
  ],
  
  tiposConexion: [
    'Ethernet',
    'Fibra óptica',
    'Wi-Fi',
    'Radio enlace',
    'Celular 4G/5G',
  ],
} as const;

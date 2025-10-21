/**
 * Valores por defecto para formularios
 */

import type { CctvFormData } from '../schemas/cctv';
import type { WorkPlanFormData } from '../schemas/work-plan';

export type ToolLibraryItem = {
  id: string;
  nombre: string;
  critico?: boolean;
};

export type ToolLibraryCategory = {
  id: string;
  nombre: string;
  items: ToolLibraryItem[];
};

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

export const WORK_PLAN_TOOLS_LIBRARY: ToolLibraryCategory[] = [
  {
    id: 'herramientas-mano',
    nombre: 'Herramientas de mano',
    items: [
      { id: 'martillo', nombre: 'Martillo' },
      { id: 'destornilladores', nombre: 'Juego de destornilladores' },
      { id: 'llaves-allen', nombre: 'Llaves Allen' },
      { id: 'llave-ajustable', nombre: 'Llave ajustable' },
      { id: 'cinta-metrica', nombre: 'Cinta métrica' },
      { id: 'prensa', nombre: 'Prensa tipo C' },
    ],
  },
  {
    id: 'herramientas-electricas',
    nombre: 'Herramientas eléctricas',
    items: [
      { id: 'taladro', nombre: 'Taladro percutor' },
      { id: 'atornillador-impacto', nombre: 'Atornillador de impacto' },
      { id: 'pulidora', nombre: 'Pulidora / esmeril' },
      { id: 'caladora', nombre: 'Sierra caladora' },
      { id: 'multimetro', nombre: 'Multímetro' },
      { id: 'tester-optico', nombre: 'Tester de fibra / potencia óptica' },
    ],
  },
  {
    id: 'equipos-seguridad',
    nombre: 'Seguridad industrial',
    items: [
      { id: 'arnes', nombre: 'Arnés de cuerpo completo', critico: true },
      { id: 'linea-vida', nombre: 'Línea de vida certificada', critico: true },
      { id: 'casco', nombre: 'Casco dieléctrico' },
      { id: 'guantes', nombre: 'Guantes dieléctricos' },
      { id: 'botas', nombre: 'Botas punta de acero' },
      { id: 'proteccion-visual', nombre: 'Protección visual (gafas)' },
      { id: 'proteccion-auditiva', nombre: 'Protección auditiva' },
      { id: 'kit-alturas', nombre: 'Kit de trabajo en alturas completo', critico: true },
    ],
  },
  {
    id: 'equipos-medicion',
    nombre: 'Instrumentos de medición',
    items: [
      { id: 'medidor-nivel', nombre: 'Medidor de nivel' },
      { id: 'termometro-infrarrojo', nombre: 'Termómetro infrarrojo' },
      { id: 'pinza-amperimetrica', nombre: 'Pinza amperimétrica' },
      { id: 'analizador-redes', nombre: 'Analizador de redes / PQA' },
    ],
  },
] as const;

export const WORK_PLAN_DEFAULTS: WorkPlanFormData = {
  proyecto: {
    nombre: '',
    cliente: '',
    ubicacion: '',
    fechaPlaneacion: new Date().toISOString().slice(0, 10),
    responsable: '',
    supervisor: '',
    contactoCliente: '',
  },
  alcance: {
    objetivoGeneral: '',
    alcanceDetallado: '',
    riesgosPrincipales: '',
    mitigaciones: '',
  },
  actividades: [
    {
      nombre: '',
      responsable: '',
      fechaInicioPrevista: '',
      fechaFinPrevista: '',
      recursos: '',
      estado: 'pendiente',
      notas: '',
    },
  ],
  herramientas: {
    checklist: [],
    adicionales: [],
    observaciones: '',
    responsableLogistica: '',
    fechaVerificacion: '',
  },
  documentacion: {
    actaInicio: false,
    informeTecnico: false,
    reportesFotograficos: false,
    planosActualizados: false,
    fechaEntregaComprometida: '',
    responsableEntrega: '',
    envioFacturacion: false,
    notas: '',
  },
  costos: {
    costoEstimado: '',
    costoReal: '',
    gastosNoPlaneados: '',
    comentarios: '',
  },
  observacionesGenerales: '',
};

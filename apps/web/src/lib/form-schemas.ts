/**
 * ARCHIVO: form-schemas.ts
 * FUNCION: Esquemas de formularios dinámicos basados en PDFs de Cermont
 * IMPLEMENTACION: Define FormField y FormSchema para AST, Permisos, Inspecciones
 * EXPORTS: FormField, FormSchema, formSchemas
 */

// ============================================
// TIPOS BASE
// ============================================

export type FieldType =
    | 'text'
    | 'email'
    | 'tel'
    | 'number'
    | 'date'
    | 'time'
    | 'datetime'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'textarea'
    | 'file'
    | 'signature'
    | 'gps';

export interface SelectOption {
    value: string;
    label: string;
}

export interface FormField {
    id: string;
    type: FieldType;
    label: string;
    required: boolean;
    placeholder?: string;
    helpText?: string;
    options?: SelectOption[];
    validation?: {
        pattern?: string;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
    };
    acceptedFileTypes?: string[];
    multiple?: boolean;
    defaultValue?: unknown;
    order: number;
}

export interface FormSchema {
    id: string;
    name: string;
    codigo: string;
    description: string;
    version: string;
    categoria: 'seguridad' | 'operativo' | 'inspeccion' | 'administrativo';
    fields: FormField[];
    requiresSignatures: {
        tecnico?: boolean;
        supervisor?: boolean;
        cliente?: boolean;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

// ============================================
// ESQUEMAS PREDEFINIDOS BASADOS EN PDFs CERMONT
// ============================================

export const formSchemas: Record<string, FormSchema> = {
    // ============================================
    // AST - Análisis de Trabajo Seguro (FT-HES-126)
    // ============================================
    ast: {
        id: 'ast',
        name: 'Análisis de Trabajo Seguro (ATS)',
        codigo: 'FT-HES-126',
        description: 'Procedimiento para identificar peligros y riesgos antes de cada trabajo',
        version: '02',
        categoria: 'seguridad',
        requiresSignatures: {
            tecnico: true,
            supervisor: true,
        },
        fields: [
            {
                id: 'lugar',
                type: 'text',
                label: 'Lugar/Facilidad',
                required: true,
                placeholder: 'Ej: Torre 5, Pozo A3',
                order: 1,
            },
            {
                id: 'fecha',
                type: 'date',
                label: 'Fecha',
                required: true,
                order: 2,
            },
            {
                id: 'hora_inicio',
                type: 'time',
                label: 'Hora de Inicio',
                required: true,
                order: 3,
            },
            {
                id: 'trabajo_realizar',
                type: 'textarea',
                label: 'Trabajo a Realizar',
                required: true,
                placeholder: 'Descripción detallada del trabajo',
                validation: { minLength: 20 },
                order: 4,
            },
            {
                id: 'epp_requerido',
                type: 'checkbox',
                label: 'Equipos de Protección Personal Requeridos',
                required: true,
                options: [
                    { value: 'casco', label: 'Casco de Seguridad' },
                    { value: 'gafas', label: 'Gafas de Seguridad' },
                    { value: 'arnes', label: 'Arnés de Seguridad' },
                    { value: 'guantes', label: 'Guantes' },
                    { value: 'botas', label: 'Botas de Seguridad' },
                    { value: 'respirador', label: 'Respirador' },
                    { value: 'protector_auditivo', label: 'Protector Auditivo' },
                    { value: 'overol', label: 'Overol/Traje de Trabajo' },
                ],
                order: 5,
            },
            {
                id: 'procedimientos_especiales',
                type: 'checkbox',
                label: 'Procedimientos Especiales Requeridos',
                required: true,
                options: [
                    { value: 'trabajo_alturas', label: 'Trabajo en Alturas' },
                    { value: 'espacio_confinado', label: 'Espacio Confinado' },
                    { value: 'trabajo_caliente', label: 'Trabajo en Caliente' },
                    { value: 'electrico', label: 'Trabajo Eléctrico' },
                    { value: 'izaje', label: 'Izaje de Cargas' },
                    { value: 'excavacion', label: 'Excavación' },
                ],
                order: 6,
            },
            {
                id: 'pasos_trabajo',
                type: 'textarea',
                label: 'Secuencia de Pasos del Trabajo',
                required: true,
                placeholder: 'Listar cada paso con verbo de acción (Levantar, Abrir, Cerrar, etc)',
                helpText: 'Use verbos de acción para cada paso',
                order: 7,
            },
            {
                id: 'riesgos_identificados',
                type: 'textarea',
                label: 'Riesgos Potenciales Identificados',
                required: true,
                placeholder: 'Caídas, golpes, atrapamientos, etc.',
                order: 8,
            },
            {
                id: 'controles_recomendados',
                type: 'textarea',
                label: 'Controles y Medidas Preventivas',
                required: true,
                placeholder: 'Medidas para mitigar cada riesgo identificado',
                order: 9,
            },
            {
                id: 'foto_area_trabajo',
                type: 'file',
                label: 'Foto del Área de Trabajo',
                required: false,
                acceptedFileTypes: ['image/*'],
                order: 10,
            },
        ],
    },

    // ============================================
    // PERMISO DE TRABAJO EN CALIENTE
    // ============================================
    permiso_caliente: {
        id: 'permiso_caliente',
        name: 'Permiso de Trabajo en Caliente',
        codigo: 'FT-HES-201',
        description: 'Autorización para trabajos con llama abierta, soldadura o corte',
        version: '01',
        categoria: 'seguridad',
        requiresSignatures: {
            tecnico: true,
            supervisor: true,
            cliente: true,
        },
        fields: [
            {
                id: 'ubicacion',
                type: 'text',
                label: 'Ubicación Exacta',
                required: true,
                order: 1,
            },
            {
                id: 'fecha_trabajo',
                type: 'date',
                label: 'Fecha del Trabajo',
                required: true,
                order: 2,
            },
            {
                id: 'hora_inicio',
                type: 'time',
                label: 'Hora de Inicio',
                required: true,
                order: 3,
            },
            {
                id: 'hora_fin_estimada',
                type: 'time',
                label: 'Hora de Fin Estimada',
                required: true,
                order: 4,
            },
            {
                id: 'tipo_trabajo',
                type: 'select',
                label: 'Tipo de Trabajo',
                required: true,
                options: [
                    { value: 'soldadura', label: 'Soldadura' },
                    { value: 'corte', label: 'Corte con Oxicorte' },
                    { value: 'esmerilado', label: 'Esmerilado' },
                    { value: 'otro', label: 'Otro' },
                ],
                order: 5,
            },
            {
                id: 'descripcion_trabajo',
                type: 'textarea',
                label: 'Descripción del Trabajo',
                required: true,
                order: 6,
            },
            {
                id: 'verificaciones_previas',
                type: 'checkbox',
                label: 'Verificaciones Previas (OBLIGATORIAS)',
                required: true,
                options: [
                    { value: 'area_despejada', label: 'Área despejada de materiales combustibles' },
                    { value: 'extintor_disponible', label: 'Extintor disponible a menos de 5 metros' },
                    { value: 'ventilacion', label: 'Ventilación adecuada' },
                    { value: 'detector_gases', label: 'Detector de gases disponible' },
                    { value: 'vigia_fuego', label: 'Vigía de fuego asignado' },
                ],
                order: 7,
            },
            {
                id: 'foto_antes',
                type: 'file',
                label: 'Foto Condiciones Iniciales',
                required: true,
                acceptedFileTypes: ['image/*'],
                order: 8,
            },
        ],
    },

    // ============================================
    // INSPECCIÓN LÍNEA DE VIDA VERTICAL
    // ============================================
    inspeccion_linea_vida: {
        id: 'inspeccion_linea_vida',
        name: 'Inspección Línea de Vida Vertical',
        codigo: 'FT-HES-301',
        description: 'Formato de inspección de sistemas de línea de vida vertical',
        version: '01',
        categoria: 'inspeccion',
        requiresSignatures: {
            tecnico: true,
            supervisor: true,
        },
        fields: [
            {
                id: 'numero_linea',
                type: 'text',
                label: 'Número de Identificación de la Línea',
                required: true,
                order: 1,
            },
            {
                id: 'ubicacion',
                type: 'text',
                label: 'Ubicación',
                required: true,
                order: 2,
            },
            {
                id: 'fecha_inspeccion',
                type: 'date',
                label: 'Fecha de Inspección',
                required: true,
                order: 3,
            },
            {
                id: 'fabricante',
                type: 'text',
                label: 'Fabricante',
                required: true,
                order: 4,
            },
            {
                id: 'diametro_cable',
                type: 'select',
                label: 'Diámetro del Cable',
                required: true,
                options: [
                    { value: '6mm', label: '6 mm' },
                    { value: '8mm', label: '8 mm' },
                    { value: '10mm', label: '10 mm' },
                    { value: '12mm', label: '12 mm' },
                ],
                order: 5,
            },
            {
                id: 'estado_anclajes',
                type: 'radio',
                label: 'Estado de Anclajes Superiores',
                required: true,
                options: [
                    { value: 'conforme', label: 'Conforme' },
                    { value: 'no_conforme', label: 'No Conforme' },
                    { value: 'pendiente', label: 'Requiere Revisión' },
                ],
                order: 6,
            },
            {
                id: 'estado_cable',
                type: 'radio',
                label: 'Estado del Cable',
                required: true,
                options: [
                    { value: 'conforme', label: 'Conforme - Sin daños visibles' },
                    { value: 'no_conforme', label: 'No Conforme - Presenta daños' },
                    { value: 'pendiente', label: 'Requiere Revisión Especializada' },
                ],
                order: 7,
            },
            {
                id: 'estado_tensores',
                type: 'radio',
                label: 'Estado de Tensores',
                required: true,
                options: [
                    { value: 'conforme', label: 'Conforme' },
                    { value: 'no_conforme', label: 'No Conforme' },
                ],
                order: 8,
            },
            {
                id: 'observaciones',
                type: 'textarea',
                label: 'Observaciones y Hallazgos',
                required: false,
                order: 9,
            },
            {
                id: 'acciones_correctivas',
                type: 'textarea',
                label: 'Acciones Correctivas Requeridas',
                required: false,
                order: 10,
            },
            {
                id: 'fotos_evidencia',
                type: 'file',
                label: 'Fotos de Evidencia',
                required: true,
                acceptedFileTypes: ['image/*'],
                multiple: true,
                order: 11,
            },
        ],
    },

    // ============================================
    // MANTENIMIENTO CCTV
    // ============================================
    mantenimiento_cctv: {
        id: 'mantenimiento_cctv',
        name: 'Formato Mantenimiento CCTV',
        codigo: 'FT-MNT-401',
        description: 'Registro de mantenimiento preventivo/correctivo de sistemas CCTV',
        version: '01',
        categoria: 'operativo',
        requiresSignatures: {
            tecnico: true,
            supervisor: true,
        },
        fields: [
            {
                id: 'numero_equipo',
                type: 'text',
                label: 'Número de Equipo/Cámara',
                required: true,
                order: 1,
            },
            {
                id: 'ubicacion',
                type: 'text',
                label: 'Ubicación del Equipo',
                required: true,
                order: 2,
            },
            {
                id: 'fecha_mantenimiento',
                type: 'date',
                label: 'Fecha',
                required: true,
                order: 3,
            },
            {
                id: 'tipo_mantenimiento',
                type: 'select',
                label: 'Tipo de Mantenimiento',
                required: true,
                options: [
                    { value: 'preventivo', label: 'Preventivo' },
                    { value: 'correctivo', label: 'Correctivo' },
                ],
                order: 4,
            },
            {
                id: 'actividades_realizadas',
                type: 'checkbox',
                label: 'Actividades Realizadas',
                required: true,
                options: [
                    { value: 'limpieza_lente', label: 'Limpieza de lente' },
                    { value: 'verificacion_imagen', label: 'Verificación de imagen' },
                    { value: 'ajuste_enfoque', label: 'Ajuste de enfoque' },
                    { value: 'revision_cableado', label: 'Revisión de cableado' },
                    { value: 'verificacion_grabacion', label: 'Verificación de grabación' },
                    { value: 'actualizacion_firmware', label: 'Actualización de firmware' },
                    { value: 'reemplazo_componente', label: 'Reemplazo de componente' },
                ],
                order: 5,
            },
            {
                id: 'estado_final',
                type: 'select',
                label: 'Estado Final del Equipo',
                required: true,
                options: [
                    { value: 'operativo', label: 'Operativo' },
                    { value: 'con_fallas', label: 'Con Fallas Menores' },
                    { value: 'fuera_servicio', label: 'Fuera de Servicio' },
                ],
                order: 6,
            },
            {
                id: 'observaciones',
                type: 'textarea',
                label: 'Observaciones',
                required: false,
                order: 7,
            },
            {
                id: 'foto_antes',
                type: 'file',
                label: 'Foto Antes',
                required: false,
                acceptedFileTypes: ['image/*'],
                order: 8,
            },
            {
                id: 'foto_despues',
                type: 'file',
                label: 'Foto Después',
                required: false,
                acceptedFileTypes: ['image/*'],
                order: 9,
            },
        ],
    },
};

// Lista de esquemas disponibles
export const availableSchemas = Object.keys(formSchemas).map((key) => ({
    id: formSchemas[key].id,
    name: formSchemas[key].name,
    codigo: formSchemas[key].codigo,
    categoria: formSchemas[key].categoria,
}));

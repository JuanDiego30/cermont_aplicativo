/**
 * Seed de Templates de Formularios de Inspección CERMONT
 *
 * Templates basados en los formatos físicos de CERMONT S.A.S.:
 * - Inspección de Arnés de Seguridad
 * - Inspección de Escaleras
 * - Inspección de Pulidora/Herramientas Eléctricas
 * - Inspección de Equipos CCTV/Electrónicos
 * - Inspección de Líneas de Vida
 */

import { PrismaClient, TipoFormulario } from '../generated/prisma/client';

// Interface para el schema JSON de formularios
interface FormFieldDef {
  name: string;
  type: 'text' | 'date' | 'number' | 'select' | 'textarea' | 'signature' | 'photo';
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

interface MatrixItemDef {
  code: string;
  description: string;
  category?: string;
}

interface FormSectionDef {
  title: string;
  type?: 'fields' | 'matrix';
  fields?: FormFieldDef[];
  // Para secciones tipo matrix
  options?: string[];
  optionLabels?: Record<string, string>;
  items?: MatrixItemDef[];
}

interface FormSchemaDef {
  version: string;
  sections: FormSectionDef[];
}

// ============================================
// TEMPLATE 1: INSPECCIÓN DE ARNÉS DE SEGURIDAD
// ============================================
const arnesSchema: FormSchemaDef = {
  version: '1.0',
  sections: [
    {
      title: 'Identificación',
      type: 'fields',
      fields: [
        { name: 'fecha', type: 'date', label: 'Fecha de Inspección', required: true },
        { name: 'inspector', type: 'text', label: 'Inspector', required: true },
        { name: 'equipo_id', type: 'text', label: 'Código del Arnés', required: true },
        { name: 'marca', type: 'text', label: 'Marca' },
        { name: 'modelo', type: 'text', label: 'Modelo' },
        { name: 'fecha_fabricacion', type: 'date', label: 'Fecha de Fabricación' },
        { name: 'fecha_vencimiento', type: 'date', label: 'Fecha de Vencimiento' },
      ],
    },
    {
      title: 'Inspección de Componentes',
      type: 'matrix',
      options: ['B', 'R', 'M', 'NA'],
      optionLabels: { B: 'Bueno', R: 'Regular', M: 'Malo', NA: 'No Aplica' },
      items: [
        // Correas principales
        {
          code: '1.1',
          description: 'Correas sin cortes, desgaste o deshilachado',
          category: 'Correas',
        },
        { code: '1.2', description: 'Costuras visibles e intactas', category: 'Correas' },
        { code: '1.3', description: 'Sin quemaduras o daño por químicos', category: 'Correas' },
        { code: '1.4', description: 'Sin decoloración excesiva', category: 'Correas' },
        // Hebillas y ajustes
        { code: '2.1', description: 'Hebillas funcionan correctamente', category: 'Hebillas' },
        { code: '2.2', description: 'Mecanismos de ajuste operativos', category: 'Hebillas' },
        { code: '2.3', description: 'Sin oxidación o corrosión', category: 'Hebillas' },
        // Argollas
        { code: '3.1', description: 'Argolla dorsal sin deformación', category: 'Argollas' },
        { code: '3.2', description: 'Argollas laterales en buen estado', category: 'Argollas' },
        { code: '3.3', description: 'Sin grietas visibles', category: 'Argollas' },
        // Etiquetas
        { code: '4.1', description: 'Etiqueta del fabricante legible', category: 'Etiquetas' },
        { code: '4.2', description: 'Fecha de fabricación visible', category: 'Etiquetas' },
      ],
    },
    {
      title: 'Resultado y Observaciones',
      type: 'fields',
      fields: [
        {
          name: 'resultado',
          type: 'select',
          label: 'Resultado de Inspección',
          required: true,
          options: ['APROBADO', 'APROBADO CON OBSERVACIONES', 'RECHAZADO'],
        },
        {
          name: 'observaciones',
          type: 'textarea',
          label: 'Observaciones',
          placeholder: 'Detalle las observaciones encontradas...',
        },
        { name: 'proxima_inspeccion', type: 'date', label: 'Próxima Inspección' },
      ],
    },
    {
      title: 'Firmas',
      type: 'fields',
      fields: [
        {
          name: 'firma_inspector',
          type: 'signature',
          label: 'Firma del Inspector',
          required: true,
        },
        { name: 'firma_responsable', type: 'signature', label: 'Firma del Responsable HSE' },
      ],
    },
  ],
};

// ============================================
// TEMPLATE 2: INSPECCIÓN DE ESCALERAS
// ============================================
const escalerasSchema: FormSchemaDef = {
  version: '1.0',
  sections: [
    {
      title: 'Identificación',
      type: 'fields',
      fields: [
        { name: 'fecha', type: 'date', label: 'Fecha de Inspección', required: true },
        { name: 'inspector', type: 'text', label: 'Inspector', required: true },
        { name: 'equipo_id', type: 'text', label: 'Código de la Escalera', required: true },
        {
          name: 'tipo',
          type: 'select',
          label: 'Tipo de Escalera',
          options: ['Tijera', 'Extensión', 'Fija', 'Móvil'],
        },
        {
          name: 'material',
          type: 'select',
          label: 'Material',
          options: ['Aluminio', 'Fibra de vidrio', 'Acero', 'Madera'],
        },
        { name: 'capacidad_kg', type: 'number', label: 'Capacidad (kg)' },
        { name: 'altura_m', type: 'number', label: 'Altura (m)' },
      ],
    },
    {
      title: 'Inspección de Componentes',
      type: 'matrix',
      options: ['B', 'R', 'M', 'NA'],
      optionLabels: { B: 'Bueno', R: 'Regular', M: 'Malo', NA: 'No Aplica' },
      items: [
        // Estructura
        {
          code: '1.1',
          description: 'Largueros sin abolladuras o deformaciones',
          category: 'Estructura',
        },
        { code: '1.2', description: 'Peldaños firmes y nivelados', category: 'Estructura' },
        { code: '1.3', description: 'Sin grietas o fracturas visibles', category: 'Estructura' },
        { code: '1.4', description: 'Soldaduras en buen estado', category: 'Estructura' },
        // Seguridad
        {
          code: '2.1',
          description: 'Zapatas antideslizantes en buen estado',
          category: 'Seguridad',
        },
        { code: '2.2', description: 'Sistema de bloqueo funcional', category: 'Seguridad' },
        { code: '2.3', description: 'Tensores/cables intactos (si aplica)', category: 'Seguridad' },
        { code: '2.4', description: 'Etiquetas de seguridad legibles', category: 'Seguridad' },
        // Mecanismos
        { code: '3.1', description: 'Bisagras sin juego excesivo', category: 'Mecanismos' },
        {
          code: '3.2',
          description: 'Poleas y cuerdas operativas (extensión)',
          category: 'Mecanismos',
        },
        { code: '3.3', description: 'Ganchos de seguridad funcionales', category: 'Mecanismos' },
      ],
    },
    {
      title: 'Resultado y Observaciones',
      type: 'fields',
      fields: [
        {
          name: 'resultado',
          type: 'select',
          label: 'Resultado de Inspección',
          required: true,
          options: ['APROBADO', 'APROBADO CON OBSERVACIONES', 'RECHAZADO'],
        },
        { name: 'observaciones', type: 'textarea', label: 'Observaciones' },
        { name: 'proxima_inspeccion', type: 'date', label: 'Próxima Inspección' },
        {
          name: 'firma_inspector',
          type: 'signature',
          label: 'Firma del Inspector',
          required: true,
        },
      ],
    },
  ],
};

// ============================================
// TEMPLATE 3: INSPECCIÓN DE PULIDORA/HERRAMIENTAS ELÉCTRICAS
// ============================================
const pulidoraSchema: FormSchemaDef = {
  version: '1.0',
  sections: [
    {
      title: 'Identificación del Equipo',
      type: 'fields',
      fields: [
        { name: 'fecha', type: 'date', label: 'Fecha de Inspección', required: true },
        { name: 'inspector', type: 'text', label: 'Inspector', required: true },
        { name: 'equipo_id', type: 'text', label: 'Código del Equipo', required: true },
        {
          name: 'tipo_herramienta',
          type: 'select',
          label: 'Tipo de Herramienta',
          options: ['Pulidora', 'Taladro', 'Sierra circular', 'Esmeril', 'Otro'],
        },
        { name: 'marca', type: 'text', label: 'Marca' },
        { name: 'modelo', type: 'text', label: 'Modelo' },
        { name: 'voltaje', type: 'select', label: 'Voltaje', options: ['110V', '220V', 'Batería'] },
        { name: 'serial', type: 'text', label: 'Número de Serie' },
      ],
    },
    {
      title: 'Inspección de Componentes',
      type: 'matrix',
      options: ['B', 'R', 'M', 'NA'],
      optionLabels: { B: 'Bueno', R: 'Regular', M: 'Malo', NA: 'No Aplica' },
      items: [
        // Eléctrico
        {
          code: '1.1',
          description: 'Cable de alimentación sin cortes ni empalmes',
          category: 'Eléctrico',
        },
        { code: '1.2', description: 'Enchufe en buen estado', category: 'Eléctrico' },
        { code: '1.3', description: 'Interruptor funciona correctamente', category: 'Eléctrico' },
        {
          code: '1.4',
          description: 'Sin olor a quemado o calentamiento anormal',
          category: 'Eléctrico',
        },
        // Mecánico
        { code: '2.1', description: 'Carcasa sin fisuras o roturas', category: 'Mecánico' },
        { code: '2.2', description: 'Guardas de seguridad instaladas', category: 'Mecánico' },
        { code: '2.3', description: 'Mango/empuñadura en buen estado', category: 'Mecánico' },
        {
          code: '2.4',
          description: 'Sistema de bloqueo del disco funcional',
          category: 'Mecánico',
        },
        // Operativo
        {
          code: '3.1',
          description: 'Disco/accesorio sin grietas o desgaste',
          category: 'Operativo',
        },
        { code: '3.2', description: 'Vibración normal al operar', category: 'Operativo' },
        { code: '3.3', description: 'RPM dentro de rango especificado', category: 'Operativo' },
      ],
    },
    {
      title: 'Resultado',
      type: 'fields',
      fields: [
        {
          name: 'resultado',
          type: 'select',
          label: 'Resultado',
          required: true,
          options: [
            'APROBADO',
            'APROBADO CON OBSERVACIONES',
            'RECHAZADO',
            'REQUIERE MANTENIMIENTO',
          ],
        },
        { name: 'observaciones', type: 'textarea', label: 'Observaciones' },
        { name: 'proxima_inspeccion', type: 'date', label: 'Próxima Inspección' },
        {
          name: 'firma_inspector',
          type: 'signature',
          label: 'Firma del Inspector',
          required: true,
        },
      ],
    },
  ],
};

// ============================================
// TEMPLATE 4: INSPECCIÓN DE EQUIPOS CCTV/ELECTRÓNICOS
// ============================================
const cctvSchema: FormSchemaDef = {
  version: '1.0',
  sections: [
    {
      title: 'Identificación del Equipo',
      type: 'fields',
      fields: [
        { name: 'fecha', type: 'date', label: 'Fecha de Inspección', required: true },
        { name: 'inspector', type: 'text', label: 'Inspector', required: true },
        { name: 'equipo_id', type: 'text', label: 'Código del Equipo', required: true },
        {
          name: 'tipo_equipo',
          type: 'select',
          label: 'Tipo de Equipo',
          options: ['Cámara domo', 'Cámara bullet', 'DVR/NVR', 'Monitor', 'Switch PoE', 'Otro'],
        },
        { name: 'ubicacion', type: 'text', label: 'Ubicación', required: true },
        { name: 'ip_address', type: 'text', label: 'Dirección IP' },
        { name: 'marca', type: 'text', label: 'Marca' },
        { name: 'modelo', type: 'text', label: 'Modelo' },
      ],
    },
    {
      title: 'Inspección Física',
      type: 'matrix',
      options: ['B', 'R', 'M', 'NA'],
      optionLabels: { B: 'Bueno', R: 'Regular', M: 'Malo', NA: 'No Aplica' },
      items: [
        { code: '1.1', description: 'Carcasa sin daños físicos', category: 'Físico' },
        { code: '1.2', description: 'Soporte/montaje firme', category: 'Físico' },
        { code: '1.3', description: 'Conectores y cables en buen estado', category: 'Físico' },
        { code: '1.4', description: 'Limpieza del lente/sensor', category: 'Físico' },
        {
          code: '1.5',
          description: 'Sin exposición a elementos (agua, polvo)',
          category: 'Físico',
        },
      ],
    },
    {
      title: 'Inspección Funcional',
      type: 'matrix',
      options: ['B', 'R', 'M', 'NA'],
      optionLabels: { B: 'Bueno', R: 'Regular', M: 'Malo', NA: 'No Aplica' },
      items: [
        { code: '2.1', description: 'Imagen clara y enfocada', category: 'Funcional' },
        { code: '2.2', description: 'Movimiento PTZ funcional (si aplica)', category: 'Funcional' },
        { code: '2.3', description: 'Visión nocturna/IR operativa', category: 'Funcional' },
        { code: '2.4', description: 'Grabación funcionando', category: 'Funcional' },
        { code: '2.5', description: 'Conexión de red estable', category: 'Funcional' },
      ],
    },
    {
      title: 'Resultado',
      type: 'fields',
      fields: [
        {
          name: 'resultado',
          type: 'select',
          label: 'Resultado',
          required: true,
          options: [
            'OPERATIVO',
            'OPERATIVO CON OBSERVACIONES',
            'NO OPERATIVO',
            'REQUIERE MANTENIMIENTO',
          ],
        },
        { name: 'observaciones', type: 'textarea', label: 'Observaciones' },
        { name: 'foto_evidencia', type: 'photo', label: 'Foto de evidencia' },
        { name: 'proxima_inspeccion', type: 'date', label: 'Próxima Inspección' },
        {
          name: 'firma_inspector',
          type: 'signature',
          label: 'Firma del Inspector',
          required: true,
        },
      ],
    },
  ],
};

// ============================================
// TEMPLATE 5: INSPECCIÓN DE LÍNEAS DE VIDA
// ============================================
const lineasVidaSchema: FormSchemaDef = {
  version: '1.0',
  sections: [
    {
      title: 'Identificación del Sistema',
      type: 'fields',
      fields: [
        { name: 'fecha', type: 'date', label: 'Fecha de Inspección', required: true },
        { name: 'inspector', type: 'text', label: 'Inspector Certificado', required: true },
        { name: 'certificacion_inspector', type: 'text', label: 'No. Certificación Inspector' },
        { name: 'sistema_id', type: 'text', label: 'Código del Sistema', required: true },
        {
          name: 'tipo_linea',
          type: 'select',
          label: 'Tipo de Línea',
          options: ['Horizontal fija', 'Horizontal temporal', 'Vertical fija', 'Retráctil'],
        },
        { name: 'ubicacion', type: 'text', label: 'Ubicación', required: true },
        { name: 'longitud_m', type: 'number', label: 'Longitud (m)' },
        { name: 'capacidad_usuarios', type: 'number', label: 'Capacidad (usuarios)' },
        { name: 'fabricante', type: 'text', label: 'Fabricante' },
        { name: 'fecha_instalacion', type: 'date', label: 'Fecha de Instalación' },
      ],
    },
    {
      title: 'Inspección de Anclajes',
      type: 'matrix',
      options: ['B', 'R', 'M', 'NA'],
      optionLabels: { B: 'Bueno', R: 'Regular', M: 'Malo', NA: 'No Aplica' },
      items: [
        { code: '1.1', description: 'Anclajes sin corrosión', category: 'Anclajes' },
        { code: '1.2', description: 'Tornillos/pernos apretados', category: 'Anclajes' },
        { code: '1.3', description: 'Placas base sin deformación', category: 'Anclajes' },
        { code: '1.4', description: 'Soldaduras sin fisuras (si aplica)', category: 'Anclajes' },
        { code: '1.5', description: 'Superficie de anclaje en buen estado', category: 'Anclajes' },
      ],
    },
    {
      title: 'Inspección de Cable/Cuerda',
      type: 'matrix',
      options: ['B', 'R', 'M', 'NA'],
      optionLabels: { B: 'Bueno', R: 'Regular', M: 'Malo', NA: 'No Aplica' },
      items: [
        { code: '2.1', description: 'Sin hilos rotos o desgaste', category: 'Cable' },
        { code: '2.2', description: 'Sin nudos o torceduras', category: 'Cable' },
        { code: '2.3', description: 'Tensión adecuada', category: 'Cable' },
        { code: '2.4', description: 'Terminales y grilletes en buen estado', category: 'Cable' },
        { code: '2.5', description: 'Sin exposición a químicos o calor', category: 'Cable' },
      ],
    },
    {
      title: 'Inspección de Dispositivos',
      type: 'matrix',
      options: ['B', 'R', 'M', 'NA'],
      optionLabels: { B: 'Bueno', R: 'Regular', M: 'Malo', NA: 'No Aplica' },
      items: [
        {
          code: '3.1',
          description: 'Carros/deslizadores funcionan libremente',
          category: 'Dispositivos',
        },
        { code: '3.2', description: 'Mosquetones sin deformación', category: 'Dispositivos' },
        {
          code: '3.3',
          description: 'Absorbedores de energía sin activar',
          category: 'Dispositivos',
        },
        { code: '3.4', description: 'Tensores/templadores operativos', category: 'Dispositivos' },
      ],
    },
    {
      title: 'Resultado y Certificación',
      type: 'fields',
      fields: [
        {
          name: 'resultado',
          type: 'select',
          label: 'Resultado de Inspección',
          required: true,
          options: ['APROBADO', 'APROBADO CON OBSERVACIONES', 'RECHAZADO - FUERA DE SERVICIO'],
        },
        { name: 'observaciones', type: 'textarea', label: 'Observaciones' },
        {
          name: 'acciones_correctivas',
          type: 'textarea',
          label: 'Acciones Correctivas Requeridas',
        },
        { name: 'proxima_inspeccion', type: 'date', label: 'Próxima Inspección', required: true },
        { name: 'foto_evidencia', type: 'photo', label: 'Foto de evidencia' },
        {
          name: 'firma_inspector',
          type: 'signature',
          label: 'Firma del Inspector',
          required: true,
        },
        { name: 'firma_supervisor_hse', type: 'signature', label: 'Firma Supervisor HSE' },
      ],
    },
  ],
};

// ============================================
// FUNCIÓN PRINCIPAL DE SEED
// ============================================
export async function seedFormTemplates(prisma: PrismaClient) {
  console.log('📋 Creando templates de formularios de inspección...');

  const templates = [
    {
      nombre: 'Inspección de Arnés de Seguridad',
      tipo: 'inspeccion' as TipoFormulario,
      categoria: 'Trabajo en Alturas',
      version: '1.0',
      schema: arnesSchema,
      descripcion:
        'Formato de inspección preoperacional de arnés de cuerpo completo según normas de trabajo en alturas',
      tags: ['HSE', 'alturas', 'EPP', 'arnés'],
      activo: true,
    },
    {
      nombre: 'Inspección de Escaleras',
      tipo: 'inspeccion' as TipoFormulario,
      categoria: 'Trabajo en Alturas',
      version: '1.0',
      schema: escalerasSchema,
      descripcion: 'Formato de inspección de escaleras portátiles (tijera, extensión, fijas)',
      tags: ['HSE', 'alturas', 'escaleras'],
      activo: true,
    },
    {
      nombre: 'Inspección de Pulidora y Herramientas Eléctricas',
      tipo: 'inspeccion' as TipoFormulario,
      categoria: 'Herramientas',
      version: '1.0',
      schema: pulidoraSchema,
      descripcion: 'Formato de inspección preoperacional de herramientas eléctricas portátiles',
      tags: ['HSE', 'herramientas', 'eléctrico'],
      activo: true,
    },
    {
      nombre: 'Inspección de Equipos CCTV y Electrónicos',
      tipo: 'inspeccion' as TipoFormulario,
      categoria: 'Electrónico',
      version: '1.0',
      schema: cctvSchema,
      descripcion: 'Formato de inspección de cámaras de seguridad, DVR y equipos de vigilancia',
      tags: ['CCTV', 'seguridad', 'electrónico', 'mantenimiento'],
      activo: true,
    },
    {
      nombre: 'Inspección de Líneas de Vida',
      tipo: 'inspeccion' as TipoFormulario,
      categoria: 'Trabajo en Alturas',
      version: '1.0',
      schema: lineasVidaSchema,
      descripcion:
        'Formato de inspección periódica de sistemas de líneas de vida horizontales y verticales',
      tags: ['HSE', 'alturas', 'líneas de vida', 'certificación'],
      activo: true,
    },
  ];

  let creados = 0;
  let actualizados = 0;

  for (const template of templates) {
    const existing = await prisma.formTemplate.findFirst({
      where: { nombre: template.nombre },
    });

    if (existing) {
      await prisma.formTemplate.update({
        where: { id: existing.id },
        data: {
          ...template,
          schema: template.schema as any,
        },
      });
      console.log(`  ✓ Actualizado: ${template.nombre}`);
      actualizados++;
    } else {
      await prisma.formTemplate.create({
        data: {
          ...template,
          schema: template.schema as any,
        },
      });
      console.log(`  ✓ Creado: ${template.nombre}`);
      creados++;
    }
  }

  console.log(`📋 Templates de formularios: ${creados} creados, ${actualizados} actualizados`);
  return { creados, actualizados };
}

// Ejecutar si es el módulo principal
if (require.main === module) {
  const { PrismaClient } = require('../generated/prisma/client');
  const prisma = new PrismaClient();

  seedFormTemplates(prisma)
    .then(() => {
      console.log('✅ Seed de templates completado');
      process.exit(0);
    })
    .catch(e => {
      console.error('❌ Error en seed:', e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

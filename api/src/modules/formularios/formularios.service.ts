// ============================================
// FORMULARIOS SERVICE - Cermont FSM
// Lógica de negocio para formularios dinámicos
// ============================================

import { PrismaClient } from '@prisma/client';
import {
  CrearTemplateInput,
  ActualizarTemplateInput,
  GuardarRespuestaInput,
  SchemaFormulario,
  FormularioTemplate,
} from './formularios.types.js';

const prisma = new PrismaClient();

// ============================================
// SERVICIO DE FORMULARIOS
// ============================================

class FormulariosService {

  // ============================================
  // TEMPLATES CRUD
  // ============================================

  /**
   * Crear un nuevo template de formulario
   */
  async crearTemplate(data: CrearTemplateInput, userId: string) {
    const template = await prisma.formularioTemplate.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        schema: JSON.stringify(data.schema),
        version: 1,
        creadoPorId: userId,
      }
    });

    return {
      ...template,
      schema: JSON.parse(template.schema) as SchemaFormulario,
    };
  }

  /**
   * Obtener todos los templates activos
   */
  async getTemplates(filtros?: { activo?: boolean; busqueda?: string }) {
    const where: any = {};

    if (filtros?.activo !== undefined) {
      where.activo = filtros.activo;
    }

    if (filtros?.busqueda) {
      where.OR = [
        { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
        { descripcion: { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    const templates = await prisma.formularioTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { respuestas: true }
        }
      }
    });

    return templates.map(t => ({
      ...t,
      schema: JSON.parse(t.schema) as SchemaFormulario,
    }));
  }

  /**
   * Obtener template por ID
   */
  async getTemplateById(id: string) {
    const template = await prisma.formularioTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new Error('Template no encontrado');
    }

    return {
      ...template,
      schema: JSON.parse(template.schema) as SchemaFormulario,
    };
  }

  /**
   * Actualizar template
   */
  async actualizarTemplate(id: string, data: ActualizarTemplateInput, userId: string) {
    const templateActual = await prisma.formularioTemplate.findUnique({
      where: { id }
    });

    if (!templateActual) {
      throw new Error('Template no encontrado');
    }

    // Si se actualiza el schema, incrementar versión
    const nuevaVersion = data.schema ? templateActual.version + 1 : templateActual.version;

    const template = await prisma.formularioTemplate.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        schema: data.schema ? JSON.stringify(data.schema) : undefined,
        version: nuevaVersion,
        activo: data.activo,
      }
    });

    return {
      ...template,
      schema: JSON.parse(template.schema) as SchemaFormulario,
    };
  }

  /**
   * Duplicar template
   */
  async duplicarTemplate(id: string, nuevoNombre: string, userId: string) {
    const original = await this.getTemplateById(id);

    const copia = await prisma.formularioTemplate.create({
      data: {
        nombre: nuevoNombre,
        descripcion: original.descripcion ? `Copia de: ${original.descripcion}` : undefined,
        schema: JSON.stringify(original.schema),
        version: 1,
        creadoPorId: userId,
      }
    });

    return {
      ...copia,
      schema: JSON.parse(copia.schema) as SchemaFormulario,
    };
  }

  /**
   * Desactivar template (soft delete)
   */
  async desactivarTemplate(id: string) {
    const template = await prisma.formularioTemplate.update({
      where: { id },
      data: { activo: false }
    });

    return template;
  }

  // ============================================
  // RESPUESTAS
  // ============================================

  /**
   * Guardar respuesta a un formulario
   */
  async guardarRespuesta(data: GuardarRespuestaInput, userId: string) {
    // Verificar que el template existe y está activo
    const template = await prisma.formularioTemplate.findUnique({
      where: { id: data.templateId }
    });

    if (!template) {
      throw new Error('Template no encontrado');
    }

    if (!template.activo) {
      throw new Error('Este formulario ya no está activo');
    }

    // Validar respuestas contra el schema
    const schema = JSON.parse(template.schema) as SchemaFormulario;
    this.validarRespuestas(schema, data.respuestas);

    const respuesta = await prisma.formularioRespuesta.create({
      data: {
        templateId: data.templateId,
        ordenId: data.ordenId,
        respuestas: JSON.stringify(data.respuestas),
        completadoPorId: userId,
      },
      include: {
        template: true,
      }
    });

    return {
      ...respuesta,
      respuestas: JSON.parse(respuesta.respuestas),
      template: {
        ...respuesta.template,
        schema: JSON.parse(respuesta.template.schema),
      }
    };
  }

  /**
   * Validar respuestas contra el schema
   */
  private validarRespuestas(schema: SchemaFormulario, respuestas: Record<string, any>) {
    const errores: string[] = [];

    for (const campo of schema.campos) {
      const valor = respuestas[campo.nombre];

      // Verificar campos requeridos
      if (campo.requerido && (valor === undefined || valor === null || valor === '')) {
        errores.push(`El campo "${campo.etiqueta}" es requerido`);
        continue;
      }

      // Saltar validación si el campo está vacío y no es requerido
      if (valor === undefined || valor === null || valor === '') {
        continue;
      }

      // Validaciones específicas
      if (campo.validaciones) {
        const { min, max, minLength, maxLength, pattern, mensaje } = campo.validaciones;

        if (typeof valor === 'number') {
          if (min !== undefined && valor < min) {
            errores.push(mensaje || `"${campo.etiqueta}" debe ser mayor o igual a ${min}`);
          }
          if (max !== undefined && valor > max) {
            errores.push(mensaje || `"${campo.etiqueta}" debe ser menor o igual a ${max}`);
          }
        }

        if (typeof valor === 'string') {
          if (minLength !== undefined && valor.length < minLength) {
            errores.push(mensaje || `"${campo.etiqueta}" debe tener al menos ${minLength} caracteres`);
          }
          if (maxLength !== undefined && valor.length > maxLength) {
            errores.push(mensaje || `"${campo.etiqueta}" debe tener máximo ${maxLength} caracteres`);
          }
          if (pattern && !new RegExp(pattern).test(valor)) {
            errores.push(mensaje || `"${campo.etiqueta}" tiene un formato inválido`);
          }
        }
      }
    }

    if (errores.length > 0) {
      throw new Error(`Validación fallida: ${errores.join(', ')}`);
    }
  }

  /**
   * Obtener respuestas por template
   */
  async getRespuestasByTemplate(templateId: string, filtros?: { ordenId?: string; page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = filtros || {};
    const skip = (page - 1) * limit;

    const where: any = { templateId };
    if (filtros?.ordenId) {
      where.ordenId = filtros.ordenId;
    }

    const [respuestas, total] = await Promise.all([
      prisma.formularioRespuesta.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          template: {
            select: { nombre: true, version: true }
          }
        }
      }),
      prisma.formularioRespuesta.count({ where })
    ]);

    return {
      data: respuestas.map(r => ({
        ...r,
        respuestas: JSON.parse(r.respuestas),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtener respuesta por ID
   */
  async getRespuestaById(id: string) {
    const respuesta = await prisma.formularioRespuesta.findUnique({
      where: { id },
      include: {
        template: true,
      }
    });

    if (!respuesta) {
      throw new Error('Respuesta no encontrada');
    }

    return {
      ...respuesta,
      respuestas: JSON.parse(respuesta.respuestas),
      template: {
        ...respuesta.template,
        schema: JSON.parse(respuesta.template.schema),
      }
    };
  }

  /**
   * Obtener respuestas de una orden
   */
  async getRespuestasByOrden(ordenId: string) {
    const respuestas = await prisma.formularioRespuesta.findMany({
      where: { ordenId },
      orderBy: { createdAt: 'desc' },
      include: {
        template: {
          select: { id: true, nombre: true, version: true }
        }
      }
    });

    return respuestas.map(r => ({
      ...r,
      respuestas: JSON.parse(r.respuestas),
    }));
  }

  /**
   * Eliminar respuesta
   */
  async eliminarRespuesta(id: string) {
    await prisma.formularioRespuesta.delete({
      where: { id }
    });

    return { success: true };
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  /**
   * Obtener estadísticas de un template
   */
  async getEstadisticasTemplate(templateId: string) {
    const template = await prisma.formularioTemplate.findUnique({
      where: { id: templateId },
      include: {
        _count: { select: { respuestas: true } }
      }
    });

    if (!template) {
      throw new Error('Template no encontrado');
    }

    const respuestas = await prisma.formularioRespuesta.findMany({
      where: { templateId },
      select: { respuestas: true, createdAt: true }
    });

    // Contar respuestas por día (últimos 30 días)
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const respuestasPorDia = respuestas
      .filter(r => r.createdAt >= hace30Dias)
      .reduce((acc, r) => {
        const fecha = r.createdAt.toISOString().split('T')[0];
        acc[fecha] = (acc[fecha] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalRespuestas: template._count.respuestas,
      respuestasPorDia,
      ultimaRespuesta: respuestas.length > 0 
        ? respuestas[respuestas.length - 1].createdAt 
        : null,
    };
  }
}

export const formulariosService = new FormulariosService();

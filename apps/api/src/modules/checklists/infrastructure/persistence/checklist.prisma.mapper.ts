/**
 * @mapper ChecklistPrismaMapper
 * 
 * Mapea entre Prisma Model y Domain Entity
 */

import { Checklist } from '../../domain/entities/checklist.entity';
import { ChecklistItem } from '../../domain/entities/checklist-item.entity';
import { ChecklistStatus } from '../../domain/value-objects/checklist-status.vo';

/**
 * Mapea desde Prisma Template a Domain Entity
 */
export class ChecklistPrismaMapper {
  /**
   * ChecklistTemplate (Prisma) → Domain Entity
   */
  public static templateToDomain(raw: any): Checklist {
    // Mapear items del template
    const items = (raw.items || []).map((item: any) =>
      ChecklistItem.fromPersistence({
        id: item.id,
        label: item.nombre || item.descripcion || '',
        isRequired: item.requereCertificacion || false,
        isChecked: false, // Templates no tienen estado checked
        orden: item.orden || 0,
      }),
    );

    // Determinar status desde activo
    const status = raw.activo ? 'ACTIVE' : 'DRAFT';

    return Checklist.fromPersistence({
      id: raw.id,
      name: raw.nombre,
      description: raw.descripcion || null,
      status,
      tipo: raw.tipo || null,
      categoria: raw.categoria || null,
      items,
      ordenId: null, // Template no está asignado
      ejecucionId: null,
      templateId: null, // Es el template mismo
      completada: false,
      completadoPorId: null,
      completadoEn: null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  /**
   * ChecklistEjecucion (Prisma) → Domain Entity
   */
  public static ejecucionToDomain(raw: any): Checklist {
    // Mapear items de ejecución
    const items = (raw.items || []).map((item: any) =>
      ChecklistItem.fromPersistence({
        id: item.id,
        label: item.nombre,
        isRequired: item.templateItem?.requereCertificacion || false,
        isChecked: item.completado || false,
        checkedAt: item.completadoEn || undefined,
        observaciones: item.observaciones || undefined,
        orden: item.templateItem?.orden || 0,
      }),
    );

    // Determinar status desde completada
    let status = 'ACTIVE';
    if (raw.completada) {
      status = 'COMPLETED';
    }

    return Checklist.fromPersistence({
      id: raw.id,
      name: raw.nombre,
      description: raw.descripcion || null,
      status,
      tipo: raw.template?.tipo || null,
      categoria: raw.template?.categoria || null,
      items,
      ordenId: null, // Ejecución no tiene ordenId directo
      ejecucionId: raw.ejecucionId,
      templateId: raw.templateId || null,
      completada: raw.completada || false,
      completadoPorId: raw.completadoPorId || null,
      completadoEn: raw.completadoEn || null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  /**
   * Domain Entity → Prisma Template (para create/update)
   */
  public static toTemplatePersistence(checklist: Checklist): any {
    const persistence = checklist.toPersistence();

    return {
      id: persistence.id,
      nombre: persistence.name,
      descripcion: persistence.description,
      tipo: persistence.tipo,
      categoria: persistence.categoria,
      activo: persistence.status === 'ACTIVE',
      items: persistence.items.map((item, index) => ({
        id: item.id,
        nombre: item.label,
        descripcion: item.label, // Usar label como descripción también
        tipo: 'item',
        orden: item.orden ?? index,
        requereCertificacion: item.isRequired,
      })),
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
    };
  }

  /**
   * Domain Entity → Prisma Ejecucion (para create/update)
   */
  public static toEjecucionPersistence(checklist: Checklist): any {
    const persistence = checklist.toPersistence();

    return {
      id: persistence.id,
      ejecucionId: persistence.ejecucionId,
      templateId: persistence.templateId,
      nombre: persistence.name,
      descripcion: persistence.description,
      completada: persistence.completada,
      completadoPorId: persistence.completadoPorId,
      completadoEn: persistence.completadoEn,
      items: persistence.items.map((item) => ({
        id: item.id,
        nombre: item.label,
        estado: item.isChecked ? 'completado' : 'pendiente',
        completado: item.isChecked,
        completadoEn: item.checkedAt,
        observaciones: item.observaciones,
        templateItemId: null, // Se asigna desde el template
      })),
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
    };
  }
}


/**
 * Mapper: KitMapper
 *
 * Converts between Kit domain entity and DTOs/Persistence
 */
import { Kit } from '../../domain/entities/kit.entity';
import { KitItem } from '../../domain/entities/kit-item.entity';
import { KitResponseDto, KitItemResponseDto } from '../dto/kit.dtos';

export class KitMapper {
  /**
   * Entity → Response DTO
   */
  public static toResponseDto(kit: Kit): KitResponseDto {
    return {
      id: kit.getId().getValue(),
      codigo: kit.getCodigo().getValue(),
      nombre: kit.getNombre(),
      descripcion: kit.getDescripcion(),
      categoria: kit.getCategoria().getValue(),
      tipo: kit.getTipo().getValue(),
      estado: kit.getEstado().getValue(),
      items: kit.getItems().map(item => this.itemToResponseDto(item)),
      costoTotal: kit.getCostoTotal().getValue(),
      cantidadItems: kit.getCantidadItems(),
      duracionEstimadaHoras: kit.getDuracionEstimadaHoras(),
      esPlantilla: kit.esPlantilla(),
      creadoPor: kit.getCreadoPor(),
      creadoEn: kit.getCreadoEn().toISOString(),
      actualizadoEn: kit.getActualizadoEn()?.toISOString(),
    };
  }

  /**
   * KitItem Entity → Response DTO
   */
  public static itemToResponseDto(item: KitItem): KitItemResponseDto {
    return {
      id: item.getId(),
      nombre: item.getNombre(),
      cantidad: item.getCantidad().getValue(),
      costoUnitario: item.getCostoUnitario().getValue(),
      costoTotal: item.getCostoTotal().getValue(),
      itemType: item.getItemType().getValue(),
      unidad: item.getUnidad(),
      esOpcional: item.isOpcional(),
      requiereCertificacion: item.isRequiereCertificacion(),
      notas: item.getNotas(),
    };
  }

  /**
   * Entity → Prisma data for save
   */
  public static toPrisma(kit: Kit): Record<string, unknown> {
    // Convert items to legacy format for KitTipico model
    const herramientas = kit.getHerramientas().map(i => ({
      nombre: i.getNombre(),
      cantidad: i.getCantidad().getValue(),
      certificacion: i.isRequiereCertificacion(),
    }));

    const equipos = kit.getEquipos().map(i => ({
      nombre: i.getNombre(),
      cantidad: i.getCantidad().getValue(),
      certificacion: i.isRequiereCertificacion(),
    }));

    return {
      id: kit.getId().getValue(),
      nombre: kit.getNombre(),
      descripcion: kit.getDescripcion(),
      herramientas: herramientas,
      equipos: equipos,
      documentos: [],
      checklistItems: [],
      duracionEstimadaHoras: kit.getDuracionEstimadaHoras(),
      costoEstimado: kit.getCostoTotal().getValue(),
      activo: kit.esActivo() || kit.esEnUso(),
      createdAt: kit.getCreadoEn(),
      updatedAt: kit.getActualizadoEn() || new Date(),
    };
  }

  /**
   * Prisma data → Entity
   */
  public static fromPrisma(data: Record<string, unknown>): Kit {
    // Convert legacy format to items
    const items: unknown[] = [];

    // Add herramientas
    const herramientas = (data['herramientas'] as unknown[]) || [];
    for (const h of herramientas) {
      const herr = h as Record<string, unknown>;
      items.push({
        id: `herr-${Math.random().toString(36).substr(2, 9)}`,
        itemId: `herr-${Math.random().toString(36).substr(2, 9)}`,
        itemType: 'HERRAMIENTA',
        nombre: herr['nombre'] as string,
        cantidad: (herr['cantidad'] as number) || 1,
        costoUnitario: 0,
        unidad: 'unidad',
        esOpcional: false,
        requiereCertificacion: (herr['certificacion'] as boolean) || false,
      });
    }

    // Add equipos
    const equipos = (data['equipos'] as unknown[]) || [];
    for (const e of equipos) {
      const eq = e as Record<string, unknown>;
      items.push({
        id: `equip-${Math.random().toString(36).substr(2, 9)}`,
        itemId: `equip-${Math.random().toString(36).substr(2, 9)}`,
        itemType: 'EQUIPO',
        nombre: eq['nombre'] as string,
        cantidad: (eq['cantidad'] as number) || 1,
        costoUnitario: 0,
        unidad: 'unidad',
        esOpcional: false,
        requiereCertificacion: (eq['certificacion'] as boolean) || false,
      });
    }

    const activo = data['activo'] as boolean;

    return Kit.fromPersistence({
      id: data['id'] as string,
      codigo: `KIT-${(data['id'] as string).substring(0, 7).toUpperCase()}`,
      nombre: data['nombre'] as string,
      descripcion: data['descripcion'] as string | undefined,
      categoria: 'GENERAL',
      tipo: 'BASICO',
      estado: activo ? 'ACTIVO' : 'INACTIVO',
      items,
      costoTotal: (data['costoEstimado'] as number) || 0,
      esPlantilla: false,
      duracionEstimadaHoras: (data['duracionEstimadaHoras'] as number) || 0,
      creadoPor: 'system',
      creadoEn: (data['createdAt'] as Date) || new Date(),
      actualizadoEn: data['updatedAt'] as Date | undefined,
      version: 1,
    });
  }
}

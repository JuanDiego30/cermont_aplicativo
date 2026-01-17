// ============================================
// Mappers para conversión Entity <-> DTO
// REGLA 4: Separación de capas
// ============================================

import { Monto, OrdenNumero, OrdenEstado } from "../value-objects";
import { mapNullableObject, nullToUndefined } from "../utils/mapper.util";

// DTOs con definite assignment
export class CreateOrdenDTO {
  numero!: string;
  monto!: number;
  estado!: string;
  clienteId!: string;
  descripcion?: string;
}

export class UpdateOrdenDTO {
  monto?: number;
  estado?: string;
  descripcion?: string;
}

export class OrdenResponseDTO {
  id!: string;
  numero!: string;
  monto!: number;
  estado!: string;
  clienteId!: string;
  descripcion?: string;
  createdAt!: string;
  updatedAt!: string;
}

// Mapper
export class OrdenMapper {
  /**
   * REGLA 4: DTO → Domain Entity
   * Convierte DTO a entidad de dominio con validación
   */
  static toDomain(dto: CreateOrdenDTO) {
    return {
      numero: OrdenNumero.create(dto.numero),
      monto: Monto.create(dto.monto),
      estado: OrdenEstado.create(dto.estado),
      clienteId: dto.clienteId,
      descripcion: dto.descripcion || "",
    };
  }

  /**
   * REGLA 4: Entity → Response DTO
   * Formatea entidad para respuesta HTTP
   */
  static toDTO(entity: Record<string, unknown>): OrdenResponseDTO {
    const numeroValue = entity.numero as OrdenNumero | string;
    const montoValue = entity.monto as Monto | number;
    const estadoValue = entity.estado as OrdenEstado | string;

    return {
      id: entity.id as string,
      numero:
        numeroValue instanceof OrdenNumero
          ? numeroValue.getValue()
          : String(numeroValue),
      monto:
        montoValue instanceof Monto
          ? montoValue.getValue()
          : Number(montoValue),
      estado:
        estadoValue instanceof OrdenEstado
          ? estadoValue.getValue()
          : String(estadoValue),
      clienteId: entity.clienteId as string,
      descripcion: nullToUndefined(entity.descripcion as string | null | undefined),
      createdAt:
        (entity.createdAt as Date)?.toISOString?.() || new Date().toISOString(),
      updatedAt:
        (entity.updatedAt as Date)?.toISOString?.() || new Date().toISOString(),
    };
  }

  /**
   * REGLA 4: Database → Domain Entity
   * Convierte row de BD a entidad de dominio
   */
  static fromDatabase(raw: Record<string, unknown>) {
    return mapNullableObject({
      id: raw.id as string,
      numero: OrdenNumero.create(raw.numero as string),
      monto: Monto.create(raw.monto as number),
      estado: OrdenEstado.create(raw.estado as string),
      clienteId: raw.clienteId as string,
      descripcion: raw.descripcion as string | null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  /**
   * REGLA 4: Domain Entity → Persistence
   * Convierte entidad a formato de BD
   */
  static toPersistence(entity: Record<string, unknown>) {
    const numeroValue = entity.numero as OrdenNumero | string;
    const montoValue = entity.monto as Monto | number;
    const estadoValue = entity.estado as OrdenEstado | string;

    return {
      numero:
        numeroValue instanceof OrdenNumero
          ? numeroValue.getValue()
          : String(numeroValue),
      monto:
        montoValue instanceof Monto
          ? montoValue.getValue()
          : Number(montoValue),
      estado:
        estadoValue instanceof OrdenEstado
          ? estadoValue.getValue()
          : String(estadoValue),
      clienteId: entity.clienteId as string,
      descripcion: entity.descripcion as string,
    };
  }

  /**
   * Convertir array de entities a DTOs
   */
  static toDTOArray(entities: Record<string, unknown>[]): OrdenResponseDTO[] {
    return entities.map((entity) => this.toDTO(entity));
  }
}

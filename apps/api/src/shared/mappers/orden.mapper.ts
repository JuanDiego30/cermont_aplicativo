// ============================================
// Mappers para conversión Entity <-> DTO
// REGLA 4: Separación de capas
// ============================================

import { Monto, OrdenNumero, OrdenEstado } from '../value-objects';

// DTOs
export class CreateOrdenDTO {
  numero: string;
  monto: number;
  estado: string;
  clienteId: string;
  descripcion?: string;
}

export class UpdateOrdenDTO {
  monto?: number;
  estado?: string;
  descripcion?: string;
}

export class OrdenResponseDTO {
  id: string;
  numero: string;
  monto: number;
  estado: string;
  clienteId: string;
  descripcion?: string;
  createdAt: string;
  updatedAt: string;
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
      descripcion: dto.descripcion || '',
    };
  }

  /**
   * REGLA 4: Entity → Response DTO
   * Formatea entidad para respuesta HTTP
   */
  static toDTO(entity: any): OrdenResponseDTO {
    return {
      id: entity.id,
      numero: entity.numero instanceof OrdenNumero ? entity.numero.getValue() : entity.numero,
      monto: entity.monto instanceof Monto ? entity.monto.getValue() : entity.monto,
      estado: entity.estado instanceof OrdenEstado ? entity.estado.getValue() : entity.estado,
      clienteId: entity.clienteId,
      descripcion: entity.descripcion,
      createdAt: entity.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: entity.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  /**
   * REGLA 4: Database → Domain Entity
   * Convierte row de BD a entidad de dominio
   */
  static fromDatabase(raw: any) {
    return {
      id: raw.id,
      numero: OrdenNumero.create(raw.numero),
      monto: Monto.create(raw.monto),
      estado: OrdenEstado.create(raw.estado),
      clienteId: raw.clienteId,
      descripcion: raw.descripcion,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  /**
   * REGLA 4: Domain Entity → Persistence
   * Convierte entidad a formato de BD
   */
  static toPersistence(entity: any) {
    return {
      numero: entity.numero instanceof OrdenNumero ? entity.numero.getValue() : entity.numero,
      monto: entity.monto instanceof Monto ? entity.monto.getValue() : entity.monto,
      estado: entity.estado instanceof OrdenEstado ? entity.estado.getValue() : entity.estado,
      clienteId: entity.clienteId,
      descripcion: entity.descripcion,
    };
  }

  /**
   * Convertir array de entities a DTOs
   */
  static toDTOArray(entities: any[]): OrdenResponseDTO[] {
    return entities.map((entity) => this.toDTO(entity));
  }
}

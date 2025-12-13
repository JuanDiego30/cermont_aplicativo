/**
 * @mapper UserMapper
 * 
 * Mapea entre Entity, DTOs y formatos de respuesta.
 * Principio SRP: Solo se encarga de transformaciones.
 */

import { UserEntity } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';
import { type CreateUserInput } from '../dto/create-user.dto';
import { type CreateUserData } from '../../domain/entities/user.entity';

export class UserMapper {
  /**
   * Convierte Entity a Response DTO
   */
  static toResponse(entity: UserEntity): UserResponseDto {
    return {
      id: entity.id.getValue(),
      email: entity.email.getValue(),
      name: entity.name,
      role: entity.role.getValue(),
      phone: entity.phone,
      avatar: entity.avatar,
      active: entity.isActive,
      lastLogin: entity.lastLogin?.toISOString(),
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt?.toISOString(),
    };
  }

  /**
   * Convierte lista de entities a lista de Response DTOs
   */
  static toResponseList(entities: UserEntity[]): UserResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }

  /**
   * Convierte CreateUserInput DTO a datos para Entity.create()
   */
  static createDtoToEntityData(
    dto: CreateUserInput,
    createdBy?: string,
  ): CreateUserData {
    return {
      email: dto.email,
      name: dto.name,
      plainPassword: dto.password,
      role: dto.role,
      phone: dto.phone || undefined,
      avatar: dto.avatar || undefined,
      createdBy,
    };
  }

  /**
   * Extrae datos de actualización válidos
   */
  static extractUpdateData(dto: {
    name?: string;
    phone?: string | null;
    avatar?: string | null;
  }): { name?: string; phone?: string; avatar?: string } {
    const data: { name?: string; phone?: string; avatar?: string } = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
    }

    if (dto.phone !== undefined) {
      data.phone = dto.phone ?? undefined;
    }

    if (dto.avatar !== undefined) {
      data.avatar = dto.avatar ?? undefined;
    }

    return data;
  }
}

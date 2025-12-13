/**
 * @mapper UserPrismaMapper
 * 
 * Mapea entre Prisma model y Domain Entity.
 */

import { UserEntity, type PersistenceData } from '../../domain/entities/user.entity';

/**
 * Tipo del modelo Prisma User
 */
interface PrismaUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  active: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export class UserPrismaMapper {
  /**
   * Convierte modelo Prisma a Entity de dominio
   */
  static toDomain(prismaUser: PrismaUser): UserEntity {
    return UserEntity.fromPersistence({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      passwordHash: prismaUser.password,
      role: prismaUser.role,
      phone: prismaUser.phone,
      avatar: prismaUser.avatar,
      active: prismaUser.active,
      lastLogin: prismaUser.lastLogin,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  /**
   * Convierte Entity a datos Prisma para create
   */
  static toCreateData(entity: UserEntity): {
    id: string;
    email: string;
    name: string;
    password: string;
    role: string;
    phone?: string;
    avatar?: string;
    active: boolean;
  } {
    const persistence = entity.toPersistence();
    return {
      id: persistence.id,
      email: persistence.email,
      name: persistence.name,
      password: persistence.passwordHash,
      role: persistence.role,
      phone: persistence.phone ?? undefined,
      avatar: persistence.avatar ?? undefined,
      active: persistence.active,
    };
  }

  /**
   * Convierte Entity a datos Prisma para update
   */
  static toUpdateData(entity: UserEntity): {
    email: string;
    name: string;
    password: string;
    role: string;
    phone: string | null;
    avatar: string | null;
    active: boolean;
    lastLogin: Date | null;
  } {
    const persistence = entity.toPersistence();
    return {
      email: persistence.email,
      name: persistence.name,
      password: persistence.passwordHash,
      role: persistence.role,
      phone: persistence.phone ?? null,
      avatar: persistence.avatar ?? null,
      active: persistence.active,
      lastLogin: persistence.lastLogin ?? null,
    };
  }
}

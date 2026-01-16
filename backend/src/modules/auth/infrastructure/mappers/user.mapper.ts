import { User as PrismaUser } from '@/prisma/client';
import { AuthUserEntity } from '../../domain/entities/auth-user.entity';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): AuthUserEntity {
    return AuthUserEntity.fromDatabase({
      id: prismaUser.id,
      email: prismaUser.email,
      password: prismaUser.password || '', // Hash should exist
      name: prismaUser.name,
      role: prismaUser.role as any,
      active: prismaUser.active,
      avatar: prismaUser.avatar,
      phone: prismaUser.phone,
      lastLogin: prismaUser.lastLogin,
    });
  }

  static toPersistence(user: AuthUserEntity) {
    return {
      id: user.id,
      email: user.email.getValue(),
      password: user.getPasswordHash(),
      name: user.name,
      role: user.role,
      active: user.active,
      avatar: user.avatar,
      phone: user.phone,
      lastLogin: user.lastLogin,
      createdAt: undefined, // Let Prisma handle default? Or user entity doesn't track it?
      updatedAt: undefined,
    };
  }

  static toResponse(user: AuthUserEntity) {
    return user.toPublicObject();
  }
}

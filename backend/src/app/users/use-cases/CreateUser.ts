import bcrypt from 'bcrypt';
import type { User } from '@/domain/entities/User.js';
import type { IUserRepository } from '@/domain/repositories/IUserRepository.js';
import { UserRole } from '@/shared/constants/roles.js';
import type { IAuditLogRepository } from '@/domain/repositories/IAuditLogRepository.js';
import { AuditAction } from '@/domain/entities/AuditLog.js';

interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdBy: string;
}

export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const { email, password, name, role, createdBy } = input;

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado');
    }

    // Validar contraseña
    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
      active: true,
      mfaEnabled: false,
      passwordHistory: [],
      lastPasswordChange: new Date(),
      passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      loginAttempts: 0,
    });

    // Auditoría
    await this.auditLogRepository.create({
      entityType: 'User',
      entityId: user.id,
      action: AuditAction.CREATE_USER,
      userId: createdBy,
      before: null,
      after: { email, name, role },
    });

    return user;
  }
}




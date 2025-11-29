import bcrypt from 'bcrypt';
import type { User } from '../../../domain/entities/User.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { UserRole } from '../../../shared/constants/roles.js';
import { AuditService } from '../../../domain/services/AuditService.js';

interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdBy: string;
  ip?: string;
  userAgent?: string;
}

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    this.validateInput(input);

    await this.ensureEmailIsAvailable(input.email);

    const hashedPassword = await this.hashPassword(input.password);

    const user = await this.createUser({ ...input, password: hashedPassword });

    await this.registerAuditLog(user, input);

    return user;
  }

  private validateInput(input: CreateUserInput): void {
    if (!input.email || !input.password || !input.name || !input.role || !input.createdBy) {
      throw new Error('Todos los campos obligatorios deben ser completados');
    }
    if (input.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }
  }

  private async ensureEmailIsAvailable(email: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async createUser(input: Omit<CreateUserInput, 'password'> & { password: string }): Promise<User> {
    return this.userRepository.create({
      email: input.email,
      password: input.password,
      name: input.name,
      role: input.role,
      active: true,
      mfaEnabled: false,
      security: {
        passwordHistory: [],
      },
      lastPasswordChange: new Date(),
      passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      loginAttempts: 0,
    });
  }

  private async registerAuditLog(user: User, input: CreateUserInput): Promise<void> {
    await this.auditService.logCreate(
      'User',
      user.id,
      input.createdBy,
      { email: user.email, name: user.name, role: user.role },
      input.ip || 'unknown',
      input.userAgent
    );
  }
}






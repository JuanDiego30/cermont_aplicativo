import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import type { IPasswordHasher } from '../../../domain/services/IPasswordHasher.js';
import type { User } from '../../../domain/entities/User.js';
import { UserRole } from '../../../shared/constants/roles.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const CONFIG = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    HISTORY_SIZE: 5,
    EXPIRATION_DAYS: 90,
    REGEX: {
      UPPERCASE: /[A-Z]/,
      LOWERCASE: /[a-z]/,
      DIGIT: /[0-9]/,
      SPECIAL: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      WHITESPACE: /\s/,
    },
  },
  NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
} as const;

const ERROR_MESSAGES = {
  USER_NOT_FOUND: (id: string) => `Usuario con ID ${id} no encontrado`,
  INVALID_USER_ID: 'El ID del usuario es inválido',
  NO_FIELDS: 'Debe proporcionar al menos un campo para actualizar',
  INVALID_NAME: `El nombre debe tener entre ${CONFIG.NAME.MIN_LENGTH} y ${CONFIG.NAME.MAX_LENGTH} caracteres`,
  INVALID_ROLE: 'Rol inválido o no permitido (ROOT)',
  PASSWORD_WEAK: 'La contraseña no cumple con los requisitos de seguridad (mayúscula, minúscula, número, especial)',
  PASSWORD_REUSED: 'La contraseña ya fue utilizada recientemente',
  PASSWORD_SAME: 'La nueva contraseña no puede ser igual a la actual',
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[UpdateUserUseCase]',
} as const;

export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  password?: string;
  mfaEnabled?: boolean;
  updatedBy: string;
  ip?: string;
  userAgent?: string;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly auditService: AuditService,
    private readonly passwordHasher: IPasswordHasher // Inyección de dependencia
  ) {}

  async execute(userId: string, input: UpdateUserInput): Promise<User> {
    this.validateInput(userId, input);

    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND(userId));
    }

    const updateData: Partial<User> = await this.prepareUpdateData(existingUser, input);
    const updatedUser = await this.userRepository.update(userId, updateData);

    await this.logAudit(existingUser, updatedUser, input);

    logger.info(`${LOG_CONTEXT.USE_CASE} Usuario actualizado exitosamente`, {
      userId,
      updatedBy: input.updatedBy,
      changedFields: Object.keys(updateData),
    });

    return updatedUser;
  }

  private validateInput(userId: string, input: UpdateUserInput): void {
    if (!userId || userId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.INVALID_USER_ID);
    }

    const hasUpdates = [input.name, input.role, input.password, input.mfaEnabled].some(
      (val) => val !== undefined
    );

    if (!hasUpdates) {
      throw new Error(ERROR_MESSAGES.NO_FIELDS);
    }

    if (input.name) {
      const len = input.name.trim().length;
      if (len < CONFIG.NAME.MIN_LENGTH || len > CONFIG.NAME.MAX_LENGTH) {
        throw new Error(ERROR_MESSAGES.INVALID_NAME);
      }
    }

    if (input.role) {
      if (!Object.values(UserRole).includes(input.role)) {
        throw new Error('Rol inválido');
      }
      if (input.role === UserRole.ROOT) {
        throw new Error(ERROR_MESSAGES.INVALID_ROLE);
      }
    }

    if (input.password) {
      this.validatePasswordStrength(input.password);
    }
  }

  private async prepareUpdateData(existingUser: User, input: UpdateUserInput): Promise<Partial<User>> {
    const data: Partial<User> = {};

    if (input.name) data.name = input.name.trim();
    if (input.role) data.role = input.role;
    if (input.mfaEnabled !== undefined) data.mfaEnabled = input.mfaEnabled;

    if (input.password) {
      await this.validatePasswordHistory(input.password, existingUser);
      const { hash, history, expiresAt, lastChange } = await this.processNewPassword(
        input.password,
        existingUser
      );
      data.password = hash;
      data.security = {
        passwordHistory: history,
      };
      data.passwordExpiresAt = expiresAt;
      data.lastPasswordChange = lastChange;
    }

    return data;
  }

  private validatePasswordStrength(password: string): void {
    const { MIN_LENGTH, MAX_LENGTH, REGEX } = CONFIG.PASSWORD;

    if (password.length < MIN_LENGTH || password.length > MAX_LENGTH) {
      throw new Error(`La contraseña debe tener entre ${MIN_LENGTH} y ${MAX_LENGTH} caracteres`);
    }

    const isStrong =
      REGEX.UPPERCASE.test(password) &&
      REGEX.LOWERCASE.test(password) &&
      REGEX.DIGIT.test(password) &&
      REGEX.SPECIAL.test(password) &&
      !REGEX.WHITESPACE.test(password);

    if (!isStrong) {
      throw new Error(ERROR_MESSAGES.PASSWORD_WEAK);
    }
  }

  private async validatePasswordHistory(newPassword: string, user: User): Promise<void> {
    const isSameAsCurrent = await this.passwordHasher.compare(newPassword, user.password);
    if (isSameAsCurrent) {
      throw new Error(ERROR_MESSAGES.PASSWORD_SAME);
    }

    if (user.security?.passwordHistory?.length) {
      for (const oldHash of user.security.passwordHistory) {
        const isReused = await this.passwordHasher.compare(newPassword, oldHash);
        if (isReused) {
          throw new Error(ERROR_MESSAGES.PASSWORD_REUSED);
        }
      }
    }
  }

  private async processNewPassword(newPassword: string, user: User) {
    const hash = await this.passwordHasher.hash(newPassword);
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + CONFIG.PASSWORD.EXPIRATION_DAYS);

    const history = [...(user.security?.passwordHistory || [])];
    history.push(user.password);
    if (history.length > CONFIG.PASSWORD.HISTORY_SIZE) {
      history.shift();
    }

    return {
      hash,
      history,
      expiresAt,
      lastChange: now,
    };
  }

  private async logAudit(before: User, after: User, input: UpdateUserInput): Promise<void> {
    const changes = Object.keys(after).filter(
      (key) => (before as any)[key] !== (after as any)[key] && key !== 'password'
    );

    await this.auditService.log({
      entityType: 'User',
      entityId: after.id,
      action: AuditAction.UPDATE,
      userId: input.updatedBy,
      before: before as unknown as Record<string, unknown>,
      after: after as unknown as Record<string, unknown>,
      ip: input.ip || 'unknown',
      userAgent: input.userAgent,
      reason: `User updated: ${changes.join(', ')}`,
    });
  }
}



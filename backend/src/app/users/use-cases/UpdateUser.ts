import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { passwordHasher } from '../../../shared/security/passwordHasher.js';
import type { User } from '../../../domain/entities/User.js';
import { UserRole } from '../../../shared/constants/roles.js';

export class UserUpdateError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'UserUpdateError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      Object.setPrototypeOf(this, new.target.prototype);
    }
  }
}

export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  password?: string;
  mfaEnabled?: boolean;
}

export class UpdateUser {
  private static readonly MIN_PASSWORD_LENGTH = 8;
  private static readonly MAX_PASSWORD_LENGTH = 128;
  private static readonly PASSWORD_EXPIRATION_DAYS = 90;
  private static readonly PASSWORD_HISTORY_SIZE = 5;
  private static readonly MIN_NAME_LENGTH = 3;
  private static readonly MAX_NAME_LENGTH = 100;

  // Regex para validar ObjectId de MongoDB (24 caracteres hexadecimales)
  private static readonly OBJECTID_REGEX = /^[a-f\d]{24}$/i;

  private static readonly UPPERCASE_REGEX = /[A-Z]/;
  private static readonly LOWERCASE_REGEX = /[a-z]/;
  private static readonly DIGIT_REGEX = /[0-9]/;
  private static readonly SPECIAL_CHAR_REGEX =
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
  private static readonly WHITESPACE_REGEX = /\s/;

  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, input: UpdateUserInput): Promise<User> {
    try {
      this.validateUserId(userId);

      const existingUser = await this.userRepository.findById(userId);

      if (!existingUser) {
        throw new UserUpdateError(
          `Usuario con ID ${userId} no encontrado`,
          'USER_NOT_FOUND',
          404
        );
      }

      this.validateInput(input, existingUser);

      const updateData: Partial<User> = {};

      if (input.name !== undefined) {
        updateData.name = input.name.trim();
      }

      if (input.role !== undefined) {
        updateData.role = input.role;
      }

      if (input.mfaEnabled !== undefined) {
        updateData.mfaEnabled = input.mfaEnabled;
      }

      if (input.password !== undefined) {
        this.validatePasswordStrength(input.password);
        await this.validatePasswordHistory(input.password, existingUser);

        const passwordHash = await passwordHasher.hash(input.password);
        updateData.password = passwordHash;

        const passwordHistory = [...(existingUser.passwordHistory ?? [])];
        passwordHistory.push(existingUser.password);

        if (passwordHistory.length > UpdateUser.PASSWORD_HISTORY_SIZE) {
          passwordHistory.shift();
        }

        updateData.passwordHistory = passwordHistory;

        const now = new Date();
        const passwordExpiresAt = new Date(now);
        passwordExpiresAt.setDate(
          passwordExpiresAt.getDate() + UpdateUser.PASSWORD_EXPIRATION_DAYS
        );

        updateData.passwordExpiresAt = passwordExpiresAt;
        updateData.lastPasswordChange = now;
      }

      const updatedUser = await this.userRepository.update(userId, updateData);

      const changes = Object.keys(updateData).filter(
        (key) => key !== 'password' && key !== 'passwordHistory'
      );

      console.info(
        `[UpdateUser] Usuario actualizado: ${userId} (${existingUser.email}) - Cambios: ${changes.join(
          ', '
        )}`
      );

      if (input.password) {
        console.info('[UpdateUser] Contraseña actualizada');
      }

      return updatedUser;
    } catch (error: unknown) {
      if (error instanceof UserUpdateError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[UpdateUser] Error inesperado:', errorMessage);

      throw new Error('Error interno al actualizar el usuario');
    }
  }

  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new UserUpdateError(
        'El ID del usuario es requerido',
        'INVALID_USER_ID',
        400
      );
    }

    if (!UpdateUser.OBJECTID_REGEX.test(userId.trim())) {
      throw new UserUpdateError(
        `El ID del usuario tiene un formato inválido: ${userId}`,
        'INVALID_USER_ID_FORMAT',
        400
      );
    }
  }

  private validateInput(input: UpdateUserInput, existingUser: User): void {
    const { name, role, password, mfaEnabled } = input;

    if (
      name === undefined &&
      role === undefined &&
      password === undefined &&
      mfaEnabled === undefined
    ) {
      throw new UserUpdateError(
        'Debe proporcionar al menos un campo para actualizar',
        'NO_FIELDS_TO_UPDATE',
        400
      );
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        throw new UserUpdateError(
          'El nombre no puede estar vacío',
          'INVALID_NAME',
          400
        );
      }

      const trimmedName = name.trim();

      if (trimmedName.length < UpdateUser.MIN_NAME_LENGTH) {
        throw new UserUpdateError(
          `El nombre debe tener al menos ${UpdateUser.MIN_NAME_LENGTH} caracteres`,
          'NAME_TOO_SHORT',
          400
        );
      }

      if (trimmedName.length > UpdateUser.MAX_NAME_LENGTH) {
        throw new UserUpdateError(
          `El nombre no puede exceder ${UpdateUser.MAX_NAME_LENGTH} caracteres`,
          'NAME_TOO_LONG',
          400
        );
      }
    }

    if (role !== undefined) {
      const validRoles = Object.values(UserRole);

      if (!validRoles.includes(role)) {
        throw new UserUpdateError(
          `Rol inválido. Valores permitidos: ${validRoles.join(', ')}`,
          'INVALID_ROLE',
          400
        );
      }

      if (role === UserRole.ROOT && existingUser.role !== UserRole.ROOT) {
        throw new UserUpdateError(
          'No se puede asignar el rol ROOT',
          'CANNOT_ASSIGN_ROOT_ROLE',
          403
        );
      }
    }

    if (mfaEnabled !== undefined && typeof mfaEnabled !== 'boolean') {
      throw new UserUpdateError(
        'El campo mfaEnabled debe ser un booleano',
        'INVALID_MFA_ENABLED_TYPE',
        400
      );
    }
  }

  private validatePasswordStrength(password: string): void {
    if (password.length < UpdateUser.MIN_PASSWORD_LENGTH) {
      throw new UserUpdateError(
        `La contraseña debe tener al menos ${UpdateUser.MIN_PASSWORD_LENGTH} caracteres`,
        'PASSWORD_TOO_SHORT',
        400
      );
    }

    if (password.length > UpdateUser.MAX_PASSWORD_LENGTH) {
      throw new UserUpdateError(
        `La contraseña no puede exceder ${UpdateUser.MAX_PASSWORD_LENGTH} caracteres`,
        'PASSWORD_TOO_LONG',
        400
      );
    }

    if (!UpdateUser.UPPERCASE_REGEX.test(password)) {
      throw new UserUpdateError(
        'La contraseña debe contener al menos una letra mayúscula',
        'PASSWORD_MISSING_UPPERCASE',
        400
      );
    }

    if (!UpdateUser.LOWERCASE_REGEX.test(password)) {
      throw new UserUpdateError(
        'La contraseña debe contener al menos una letra minúscula',
        'PASSWORD_MISSING_LOWERCASE',
        400
      );
    }

    if (!UpdateUser.DIGIT_REGEX.test(password)) {
      throw new UserUpdateError(
        'La contraseña debe contener al menos un número',
        'PASSWORD_MISSING_NUMBER',
        400
      );
    }

    if (!UpdateUser.SPECIAL_CHAR_REGEX.test(password)) {
      throw new UserUpdateError(
        'La contraseña debe contener al menos un carácter especial',
        'PASSWORD_MISSING_SPECIAL',
        400
      );
    }

    if (UpdateUser.WHITESPACE_REGEX.test(password)) {
      throw new UserUpdateError(
        'La contraseña no puede contener espacios',
        'PASSWORD_CONTAINS_SPACES',
        400
      );
    }
  }

  private async validatePasswordHistory(
    newPassword: string,
    user: User
  ): Promise<void> {
    const passwordHistory = user.passwordHistory ?? [];

    const matchesCurrent = await passwordHasher.verify(user.password, newPassword);

    if (matchesCurrent) {
      throw new UserUpdateError(
        'La nueva contraseña no puede ser igual a la contraseña actual',
        'PASSWORD_SAME_AS_CURRENT',
        400
      );
    }

    for (const oldHash of passwordHistory) {
      const matchesOld = await passwordHasher.verify(oldHash, newPassword);

      if (matchesOld) {
        throw new UserUpdateError(
          'La contraseña ya fue utilizada recientemente. Por favor elige una contraseña diferente',
          'PASSWORD_IN_HISTORY',
          400
        );
      }
    }
  }
}


/**
 * Change Password Use Case
 * 
 * Permite a un usuario cambiar su contraseña con validaciones de seguridad:
 * - Verificación de contraseña actual
 * - Historial de contraseñas (no reutilizar últimas 5)
 * - Expiración de contraseña (90 días)
 * - Auditoría de cambios
 * 
 * @file src/app/auth/use-cases/ChangePassword.ts
 */

import bcrypt from 'bcrypt';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import type { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { auditLogRepository } from '../../../infra/db/repositories/AuditLogRepository';
import { AuditAction } from '../../../domain/entities/AuditLog';

interface ChangePasswordInput {
  userId: string;
  oldPassword: string;
  newPassword: string;
  ip?: string;           // ← Agregado para auditoría
  userAgent?: string;    // ← Agregado para auditoría
}

export class ChangePasswordUseCase {
  constructor(
    private userRepository: IUserRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    const { userId, oldPassword, newPassword, ip, userAgent } = input;

    // 1. Buscar usuario
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // 2. Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      // Registrar intento fallido
      await this.auditLogRepository.create({
        entityType: 'User',
        entityId: userId,
        action: AuditAction.PASSWORD_CHANGE_FAILED,  // ← Usar enum
        userId,
        before: null,
        after: null,
        ip: ip || 'unknown',
        userAgent: userAgent || 'unknown',
        reason: 'Contraseña actual incorrecta',
      });

      throw new Error('Contraseña actual incorrecta');
    }

    // 3. Validar nueva contraseña
    this.validatePassword(newPassword);

    // 4. Verificar historial (no reutilizar contraseñas anteriores)
    await this.checkPasswordHistory(user, newPassword);

    // 5. Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 6. Preparar historial actualizado
    const passwordHistory = user.passwordHistory || [];
    const updatedHistory = [...passwordHistory.slice(-4), user.password]; // Últimas 5

    // 7. Actualizar contraseña en la base de datos
    await this.userRepository.update(userId, {
      password: hashedPassword,
      passwordHistory: updatedHistory,
      lastPasswordChange: new Date(),
      passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
    });

    // 8. Registrar cambio exitoso en auditoría
    await this.auditLogRepository.create({
      entityType: 'User',
      entityId: userId,
      action: AuditAction.PASSWORD_CHANGE,  // ← Usar enum
      userId,
      before: { 
        lastPasswordChange: user.lastPasswordChange,
        passwordExpiresAt: user.passwordExpiresAt,
      },
      after: { 
        message: 'Contraseña actualizada exitosamente',
        lastPasswordChange: new Date(),
        passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      ip: ip || 'unknown',
      userAgent: userAgent || 'unknown',
    });
  }

  /**
   * Validar complejidad de la nueva contraseña
   */
  private validatePassword(password: string): void {
    // Longitud mínima
    if (password.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
    }

    // Debe contener al menos una mayúscula
    if (!/[A-Z]/.test(password)) {
      throw new Error('La contraseña debe contener al menos una letra mayúscula');
    }

    // Debe contener al menos una minúscula
    if (!/[a-z]/.test(password)) {
      throw new Error('La contraseña debe contener al menos una letra minúscula');
    }

    // Debe contener al menos un número
    if (!/[0-9]/.test(password)) {
      throw new Error('La contraseña debe contener al menos un número');
    }

    // Debe contener al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new Error('La contraseña debe contener al menos un carácter especial');
    }

    // No debe contener espacios
    if (/\s/.test(password)) {
      throw new Error('La contraseña no debe contener espacios');
    }
  }

  /**
   * Verificar que no se reutilice una contraseña anterior
   */
  private async checkPasswordHistory(user: any, newPassword: string): Promise<void> {
    const passwordHistory = user.passwordHistory || [];

    // Verificar contra las últimas 5 contraseñas
    for (const oldHash of passwordHistory) {
      const isRepeated = await bcrypt.compare(newPassword, oldHash);
      if (isRepeated) {
        throw new Error('No puedes reutilizar contraseñas anteriores (últimas 5)');
      }
    }

    // También verificar contra la contraseña actual
    const isCurrentPassword = await bcrypt.compare(newPassword, user.password);
    if (isCurrentPassword) {
      throw new Error('La nueva contraseña no puede ser igual a la actual');
    }
  }
}


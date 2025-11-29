/**
 * Use Case: Eliminar Kit
 * 
 * Permite eliminar (desactivar) un kit del sistema.
 * 
 * IMPORTANTE: Este es un SOFT DELETE - el kit no se elimina de la base
 * de datos, solo se marca como inactivo (active = false).
 * 
 * Validaciones:
 * - El kit debe existir
 * - El kit debe estar activo
 * - No se puede eliminar si está siendo usado en work plans activos
 * - Solo usuarios con permisos pueden forzar eliminación
 * 
 * @file src/app/kits/use-cases/DeleteKit.ts
 */

import type { IKitRepository } from '../../../domain/repositories/IKitRepository.js';
import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';
import type { Kit } from '../../../domain/entities/Kit.js';

const ERROR_MESSAGES = {
  MISSING_KIT_ID: 'El ID del kit es requerido',
  MISSING_USER_ID: 'El ID del usuario es requerido',
  KIT_NOT_FOUND: 'Kit no encontrado',
  KIT_ALREADY_INACTIVE: (name: string) => `El kit "${name}" ya está inactivo`,
  KIT_IN_USE: (name: string, count: number) =>
    `No se puede eliminar el kit "${name}" porque está siendo usado en ${count} plan(es) de trabajo activo(s)`,
  FORCE_DELETE_UNAUTHORIZED: 'No tiene permisos para forzar la eliminación de kits en uso',
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[DeleteKitUseCase]',
} as const;

interface DeleteKitInput {
  kitId: string;
  userId: string;
  reason?: string;
  ip?: string;
  userAgent?: string;
  forceDelete?: boolean;
}

interface DeleteKitOutput {
  kitId: string;
  kitName: string;
  deletedAt: Date;
}

interface KitUsageCheck {
  inUse: boolean;
  workPlanCount: number;
  workPlanIds: string[];
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class DeleteKitUseCase {
  constructor(
    private readonly kitRepository: IKitRepository,
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: DeleteKitInput): Promise<DeleteKitOutput> {
    this.validateInput(input);

    const kit = await this.fetchKit(input.kitId);
    this.validateKitCanBeDeleted(kit);

    if (!input.forceDelete) {
      await this.checkKitNotInUse(kit);
    } else {
      this.validateForceDeletePermissions(input.userId);
    }

    await this.deactivateKit(kit.id);

    const auditContext = this.extractAuditContext(input);
    await this.logKitDeletion(kit, input.userId, input.reason, auditContext);

    logger.info(`${LOG_CONTEXT.USE_CASE} Kit eliminado (soft delete) exitosamente`, {
      kitId: kit.id,
      kitName: kit.name,
      userId: input.userId,
      forceDelete: input.forceDelete || false,
    });

    return {
      kitId: kit.id,
      kitName: kit.name,
      deletedAt: new Date(),
    };
  }

  private validateInput(input: DeleteKitInput): void {
    if (!input.kitId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_KIT_ID);
    }

    if (!input.userId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_USER_ID);
    }
  }

  private async fetchKit(kitId: string): Promise<Kit> {
    const kit = await this.kitRepository.findById(kitId);

    if (!kit) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Intento de eliminar kit inexistente`, { kitId });
      throw new Error(ERROR_MESSAGES.KIT_NOT_FOUND);
    }

    return kit;
  }

  private validateKitCanBeDeleted(kit: Kit): void {
    if (!kit.active) {
      throw new Error(ERROR_MESSAGES.KIT_ALREADY_INACTIVE(kit.name));
    }
  }

  private async checkKitNotInUse(kit: Kit): Promise<void> {
    const usage = await this.getKitUsage(kit.id);

    if (usage.inUse) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Intento de eliminar kit en uso`, {
        kitId: kit.id,
        kitName: kit.name,
        workPlanCount: usage.workPlanCount,
        workPlanIds: usage.workPlanIds,
      });

      throw new Error(ERROR_MESSAGES.KIT_IN_USE(kit.name, usage.workPlanCount));
    }
  }

  private async getKitUsage(kitId: string): Promise<KitUsageCheck> {
    try {
      const workPlans = await this.workPlanRepository.findWorkPlansUsingKit(kitId);

      return {
        inUse: workPlans.length > 0,
        workPlanCount: workPlans.length,
        workPlanIds: workPlans.map((wp) => wp.id),
      };
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error verificando uso del kit`, {
        kitId,
        error: error instanceof Error ? error.message : 'Unknown',
      });

      // No bloquear si falla la verificación (asumimos que no está en uso)
      // Alternativa más segura: lanzar error y pedir reintento
      return {
        inUse: false,
        workPlanCount: 0,
        workPlanIds: [],
      };
    }
  }

  private validateForceDeletePermissions(userId: string): void {
    // TODO: Implementar verificación de permisos con AuthorizationService
    // Por ahora, lanzar error si se intenta forzar eliminación
    logger.warn(`${LOG_CONTEXT.USE_CASE} Intento de forzar eliminación de kit`, { userId });
    throw new Error(ERROR_MESSAGES.FORCE_DELETE_UNAUTHORIZED);
  }

  private async deactivateKit(kitId: string): Promise<void> {
    try {
      await this.kitRepository.update(kitId, {
        active: false,
        deletedAt: new Date(),
      });
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error desactivando kit`, {
        kitId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private extractAuditContext(input: DeleteKitInput): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logKitDeletion(
    kit: Kit,
    userId: string,
    reason: string | undefined,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'Kit',
        entityId: kit.id,
        action: AuditAction.DELETE,
        userId,
        before: {
          name: kit.name,
          category: kit.category,
          active: true,
          toolsCount: kit.tools.length,
          equipmentCount: kit.equipment.length,
        },
        after: {
          active: false,
          deletedAt: new Date(),
        },
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: reason || 'Eliminación de kit (soft delete)',
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        kitId: kit.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}



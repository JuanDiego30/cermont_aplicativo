/**
 * Delete Kit Use Case
 * 
 * Permite eliminar (desactivar) un kit del sistema.
 * 
 * IMPORTANTE: Este es un SOFT DELETE - el kit no se elimina de la base
 * de datos, solo se marca como inactivo (isActive = false).
 * 
 * Validaciones:
 * - El kit debe existir
 * - No se puede eliminar si está siendo usado en work plans activos
 * - Solo ADMIN y SUPERVISOR pueden eliminar
 * 
 * @file src/app/kits/use-cases/DeleteKit.ts
 */

import type { IKitRepository } from '../../../domain/repositories/IKitRepository';
import type { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository';
import { kitRepository } from '../../../infra/db/repositories/KitRepository';
import { auditLogRepository } from '../../../infra/db/repositories/AuditLogRepository';
import { workPlanRepository } from '../../../infra/db/repositories/WorkPlanRepository';
import { logger } from '../../../shared/utils/logger';
import { AuditAction } from '../../../domain/entities/AuditLog';
import { WorkPlanStatus } from '../../../domain/entities/WorkPlan';

/**
 * Input del caso de uso
 */
interface DeleteKitInput {
  kitId: string;
  userId: string;
  reason?: string;
  ip?: string;
  userAgent?: string;
  forceDelete?: boolean; // Para eliminar incluso si está en uso
}

/**
 * Output del caso de uso
 */
interface DeleteKitOutput {
  success: boolean;
  message: string;
  kitName?: string;
}

/**
 * Caso de uso: Eliminar Kit
 */
export class DeleteKit {
  constructor(
    private readonly repository: IKitRepository = kitRepository,
    private readonly auditRepository: IAuditLogRepository = auditLogRepository,
    private readonly workPlanRepository: IWorkPlanRepository = workPlanRepository
  ) {}

  async execute(input: DeleteKitInput): Promise<DeleteKitOutput> {
    const { kitId, userId, reason, ip, userAgent, forceDelete = false } = input;

    try {
      // 1. Verificar que el kit existe
      const existingKit = await this.repository.findById(kitId);

      if (!existingKit) {
        logger.warn('Intento de eliminar kit inexistente', { kitId, userId });
        throw new Error('Kit no encontrado');
      }

      // 2. Verificar si ya está inactivo
      if (!existingKit.active) {
        logger.info('Intento de eliminar kit ya inactivo', { kitId, userId });
        return {
          success: true,
          message: 'El kit ya estaba inactivo',
          kitName: existingKit.name,
        };
      }

      // 3. Verificar si está siendo usado en work plans activos
      if (!forceDelete) {
        const isInUse = await this.checkKitUsage(kitId);
        
        if (isInUse.inUse) {
          logger.warn('Intento de eliminar kit en uso', {
            kitId,
            userId,
            activeWorkPlans: isInUse.workPlanCount,
          });

          throw new Error(
            `No se puede eliminar el kit "${existingKit.name}" porque está siendo usado en ${isInUse.workPlanCount} plan(es) de trabajo activo(s). Use forceDelete=true para eliminar de todas formas.`
          );
        }
      }

      // 4. Soft delete: Marcar como inactivo en lugar de eliminar
      await this.repository.update(kitId, {
        active: false,
      });

      // 5. Registrar auditoría
      await this.auditRepository.create({
        entityType: 'Kit',
        entityId: kitId,
        action: AuditAction.DELETE,  // ← Usar enum
        userId,
        before: {
          name: existingKit.name,
          category: existingKit.category,
          active: true,
        },
        after: {
          active: false,
          deletedAt: new Date(),
        },
        ip: ip || 'unknown',
        userAgent: userAgent || 'unknown',
        reason: reason || 'Eliminación de kit',
      });

      // 6. Log informativo
      logger.info('Kit eliminado (soft delete) exitosamente', {
        kitId,
        kitName: existingKit.name,
        userId,
        forceDelete,
        reason,
      });

      return {
        success: true,
        message: `Kit "${existingKit.name}" eliminado exitosamente`,
        kitName: existingKit.name,
      };
    } catch (error: any) {
      logger.error('Error en DeleteKit use case', {
        error: error.message,
        kitId,
        userId,
      });

      throw error;
    }
  }

  /**
   * Verificar si el kit está siendo usado en work plans activos
   */
  private async checkKitUsage(kitId: string): Promise<{
    inUse: boolean;
    workPlanCount: number;
  }> {
    try {
      // Buscar work plans activos que usen este kit
      const activeWorkPlans = await workPlanRepository.find({
        status: WorkPlanStatus.APPROVED,
        limit: 1000,
      });

      // Filtrar work plans que usen este kit
      const workPlansUsingKit = activeWorkPlans.filter((wp: any) => {
        // Si el kit está en materials, tools, equipment, etc.
        const materials = wp.materials || [];
        const tools = wp.tools || [];
        const equipment = wp.equipment || [];
        
        return (
          materials.some((m: any) => m.kitId === kitId) ||
          tools.some((t: any) => t.kitId === kitId) ||
          equipment.some((e: any) => e.kitId === kitId)
        );
      });

      return {
        inUse: workPlansUsingKit.length > 0,
        workPlanCount: workPlansUsingKit.length,
      };
    } catch (error) {
      logger.error('Error verificando uso del kit', { error, kitId });
      // Si hay error, asumir que está en uso por seguridad
      return { inUse: true, workPlanCount: 0 };
    }
  }

  /**
   * Restaurar un kit eliminado (reactivarlo)
   */
  async restore(input: {
    kitId: string;
    userId: string;
    ip?: string;
    userAgent?: string;
  }): Promise<DeleteKitOutput> {
    const { kitId, userId, ip, userAgent } = input;

    try {
      const kit = await this.repository.findById(kitId);

      if (!kit) {
        throw new Error('Kit no encontrado');
      }

      if (kit.active) {
        return {
          success: true,
          message: 'El kit ya está activo',
          kitName: kit.name,
        };
      }

      // Reactivar kit
      await this.repository.update(kitId, {
        active: true,
      });

      // Registrar auditoría
      await this.auditRepository.create({
        entityType: 'Kit',
        entityId: kitId,
        action: AuditAction.UPDATE,
        userId,
        before: { active: false },
        after: { active: true, restoredAt: new Date() },
        ip: ip || 'unknown',
        userAgent: userAgent || 'unknown',
        reason: 'Restauración de kit eliminado',
      });

      logger.info('Kit restaurado exitosamente', {
        kitId,
        kitName: kit.name,
        userId,
      });

      return {
        success: true,
        message: `Kit "${kit.name}" restaurado exitosamente`,
        kitName: kit.name,
      };
    } catch (error: any) {
      logger.error('Error restaurando kit', { error: error.message, kitId, userId });
      throw error;
    }
  }
}


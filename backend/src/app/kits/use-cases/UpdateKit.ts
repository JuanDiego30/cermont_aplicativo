/**
 * Use Case: Actualizar Kit
 * 
 * Permite actualizar un kit existente del sistema.
 * 
 * Campos actualizables:
 * - name: Nombre del kit
 * - description: Descripción del kit
 * - category: Categoría del kit
 * - tools: Lista de herramientas
 * - equipment: Lista de equipos
 * - documents: Lista de documentos
 * - active: Estado activo/inactivo
 * 
 * Validaciones:
 * - El kit debe existir
 * - No se pueden modificar campos inmutables (id, createdAt, createdBy)
 * - Si se cambia el nombre, verificar que no exista otro con ese nombre
 * - Validar estructura de tools, equipment, documents
 * 
 * @file src/app/kits/use-cases/UpdateKit.ts
 */

import type { IKitRepository } from '../../../domain/repositories/IKitRepository.js';
import type { Kit } from '../../../domain/entities/Kit.js';
import { KitCategory, KitItem, KitDocument } from '../../../domain/entities/Kit.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const KIT_LIMITS = {
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_TOOLS: 50,
  MAX_EQUIPMENT: 50,
  MAX_DOCUMENTS: 20,
} as const;

const ERROR_MESSAGES = {
  MISSING_KIT_ID: 'El ID del kit es requerido',
  MISSING_USER_ID: 'El ID del usuario es requerido',
  MISSING_UPDATES: 'Debe proporcionar al menos un campo para actualizar',
  KIT_NOT_FOUND: (id: string) => `Kit ${id} no encontrado`,
  NO_CHANGES: 'No hay cambios para aplicar',
  DUPLICATE_NAME: (name: string, category: string) =>
    `Ya existe un kit con el nombre "${name}" en la categoría ${category}`,
  INVALID_FIELD: (field: string) => `El campo "${field}" no se puede modificar`,
  NAME_TOO_SHORT: `El nombre debe tener al menos ${KIT_LIMITS.MIN_NAME_LENGTH} caracteres`,
  NAME_TOO_LONG: `El nombre no puede exceder ${KIT_LIMITS.MAX_NAME_LENGTH} caracteres`,
  DESCRIPTION_TOO_SHORT: `La descripción debe tener al menos ${KIT_LIMITS.MIN_DESCRIPTION_LENGTH} caracteres`,
  DESCRIPTION_TOO_LONG: `La descripción no puede exceder ${KIT_LIMITS.MAX_DESCRIPTION_LENGTH} caracteres`,
  INVALID_CATEGORY: (validCategories: string[]) =>
    `Categoría inválida. Debe ser una de: ${validCategories.join(', ')}`,
  TOO_MANY_TOOLS: `El kit no puede tener más de ${KIT_LIMITS.MAX_TOOLS} herramientas`,
  TOO_MANY_EQUIPMENT: `El kit no puede tener más de ${KIT_LIMITS.MAX_EQUIPMENT} equipos`,
  TOO_MANY_DOCUMENTS: `El kit no puede tener más de ${KIT_LIMITS.MAX_DOCUMENTS} documentos`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[UpdateKitUseCase]',
} as const;

const IMMUTABLE_FIELDS = ['id', 'createdAt', 'createdBy'] as const;

interface UpdateKitInput {
  kitId: string;
  updates: {
    name?: string;
    description?: string;
    category?: KitCategory;
    tools?: KitItem[];
    equipment?: KitItem[];
    documents?: KitDocument[];
    active?: boolean;
  };
  userId: string;
  ip?: string;
  userAgent?: string;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class UpdateKitUseCase {
  constructor(
    private readonly kitRepository: IKitRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: UpdateKitInput): Promise<Kit> {
    this.validateInput(input);

    const existingKit = await this.fetchKit(input.kitId);

    this.validateUpdates(input.updates);
    await this.checkNameUniqueness(input.updates, existingKit);

    const hasChanges = this.detectChanges(existingKit, input.updates);
    if (!hasChanges) {
      throw new Error(ERROR_MESSAGES.NO_CHANGES);
    }

    const updatedKit = await this.updateKit(input.kitId, input.updates);

    const auditContext = this.extractAuditContext(input);
    await this.logKitUpdate(existingKit, updatedKit, input.userId, auditContext);

    logger.info(`${LOG_CONTEXT.USE_CASE} Kit actualizado exitosamente`, {
      kitId: updatedKit.id,
      userId: input.userId,
      updatedFields: Object.keys(input.updates),
    });

    return updatedKit;
  }

  private validateInput(input: UpdateKitInput): void {
    if (!input.kitId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_KIT_ID);
    }

    if (!input.userId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_USER_ID);
    }

    if (!input.updates || Object.keys(input.updates).length === 0) {
      throw new Error(ERROR_MESSAGES.MISSING_UPDATES);
    }

    this.checkImmutableFields(input.updates);
  }

  private checkImmutableFields(updates: Record<string, any>): void {
    for (const field of IMMUTABLE_FIELDS) {
      if (field in updates) {
        throw new Error(ERROR_MESSAGES.INVALID_FIELD(field));
      }
    }
  }

  private async fetchKit(kitId: string): Promise<Kit> {
    const kit = await this.kitRepository.findById(kitId);

    if (!kit) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Intento de actualizar kit inexistente`, { kitId });
      throw new Error(ERROR_MESSAGES.KIT_NOT_FOUND(kitId));
    }

    return kit;
  }

  private validateUpdates(updates: UpdateKitInput['updates']): void {
    if (updates.name !== undefined) {
      this.validateName(updates.name);
    }

    if (updates.description !== undefined) {
      this.validateDescription(updates.description);
    }

    if (updates.category !== undefined) {
      this.validateCategory(updates.category);
    }

    if (updates.tools !== undefined) {
      this.validateTools(updates.tools);
    }

    if (updates.equipment !== undefined) {
      this.validateEquipment(updates.equipment);
    }

    if (updates.documents !== undefined) {
      this.validateDocuments(updates.documents);
    }
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.NAME_TOO_SHORT);
    }

    const trimmedLength = name.trim().length;

    if (trimmedLength < KIT_LIMITS.MIN_NAME_LENGTH) {
      throw new Error(ERROR_MESSAGES.NAME_TOO_SHORT);
    }

    if (trimmedLength > KIT_LIMITS.MAX_NAME_LENGTH) {
      throw new Error(ERROR_MESSAGES.NAME_TOO_LONG);
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.DESCRIPTION_TOO_SHORT);
    }

    const trimmedLength = description.trim().length;

    if (trimmedLength < KIT_LIMITS.MIN_DESCRIPTION_LENGTH) {
      throw new Error(ERROR_MESSAGES.DESCRIPTION_TOO_SHORT);
    }

    if (trimmedLength > KIT_LIMITS.MAX_DESCRIPTION_LENGTH) {
      throw new Error(ERROR_MESSAGES.DESCRIPTION_TOO_LONG);
    }
  }

  private validateCategory(category: KitCategory): void {
    const validCategories = Object.values(KitCategory) as string[];

    if (!validCategories.includes(category)) {
      throw new Error(ERROR_MESSAGES.INVALID_CATEGORY(validCategories));
    }
  }

  private validateTools(tools: KitItem[]): void {
    if (tools.length > KIT_LIMITS.MAX_TOOLS) {
      throw new Error(ERROR_MESSAGES.TOO_MANY_TOOLS);
    }

    const emptyTools = tools.filter((tool) => !tool.name || tool.name.trim().length === 0);

    if (emptyTools.length > 0) {
      throw new Error('Las herramientas no pueden tener nombres vacíos');
    }
  }

  private validateEquipment(equipment: KitItem[]): void {
    if (equipment.length > KIT_LIMITS.MAX_EQUIPMENT) {
      throw new Error(ERROR_MESSAGES.TOO_MANY_EQUIPMENT);
    }

    const emptyEquipment = equipment.filter((item) => !item.name || item.name.trim().length === 0);

    if (emptyEquipment.length > 0) {
      throw new Error('Los equipos no pueden tener nombres vacíos');
    }
  }

  private validateDocuments(documents: KitDocument[]): void {
    if (documents.length > KIT_LIMITS.MAX_DOCUMENTS) {
      throw new Error(ERROR_MESSAGES.TOO_MANY_DOCUMENTS);
    }

    const emptyDocuments = documents.filter((doc) => !doc.name || doc.name.trim().length === 0);

    if (emptyDocuments.length > 0) {
      throw new Error('Los documentos no pueden tener nombres vacíos');
    }
  }

  private async checkNameUniqueness(
    updates: UpdateKitInput['updates'],
    existingKit: Kit
  ): Promise<void> {
    // Solo verificar si se está cambiando el nombre
    if (!updates.name || updates.name === existingKit.name) {
      return;
    }

    const category = updates.category || existingKit.category;
    const duplicate = await this.kitRepository.findByNameAndCategory(updates.name, category);

    if (duplicate && duplicate.id !== existingKit.id) {
      throw new Error(ERROR_MESSAGES.DUPLICATE_NAME(updates.name, category));
    }
  }

  private detectChanges(existingKit: Kit, updates: UpdateKitInput['updates']): boolean {
    for (const [key, value] of Object.entries(updates)) {
      const existingValue = existingKit[key as keyof Kit];

      // Comparación profunda para arrays
      if (Array.isArray(value) && Array.isArray(existingValue)) {
        if (JSON.stringify(value) !== JSON.stringify(existingValue)) {
          return true;
        }
      } else if (value !== existingValue) {
        return true;
      }
    }

    return false;
  }

  private async updateKit(kitId: string, updates: UpdateKitInput['updates']): Promise<Kit> {
    try {
      const updated = await this.kitRepository.update(kitId, updates);

      if (!updated) {
        throw new Error('Error actualizando el kit');
      }

      return updated;
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error actualizando kit en BD`, {
        kitId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private extractAuditContext(input: UpdateKitInput): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logKitUpdate(
    before: Kit,
    after: Kit,
    userId: string,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      // Registrar solo los campos que cambiaron
      const changes = this.getChangedFields(before, after);

      await this.auditService.log({
        entityType: 'Kit',
        entityId: after.id,
        action: AuditAction.UPDATE,
        userId,
        before: changes.before,
        after: changes.after,
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: `Kit actualizado - ${Object.keys(changes.before).length} campos modificados`,
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        kitId: after.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }

  private getChangedFields(
    before: Kit,
    after: Kit
  ): {
    before: Record<string, any>;
    after: Record<string, any>;
  } {
    const beforeChanges: Record<string, any> = {};
    const afterChanges: Record<string, any> = {};

    for (const key of Object.keys(after)) {
      const beforeValue = before[key as keyof Kit];
      const afterValue = after[key as keyof Kit];

      // Comparar valores
      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        beforeChanges[key] = beforeValue;
        afterChanges[key] = afterValue;
      }
    }

    return { before: beforeChanges, after: afterChanges };
  }
}


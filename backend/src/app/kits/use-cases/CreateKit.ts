/**
 * Create Kit Use Case
 * 
 * Permite crear un nuevo kit típico en el sistema.
 * 
 * Los kits son plantillas predefinidas de materiales, herramientas,
 * equipos y EPP para diferentes tipos de trabajos.
 * 
 * Tipos de kits:
 * - LINEA_VIDA: Instalación de líneas de vida
 * - ALTURA: Trabajos en altura
 * - MANTENIMIENTO: Mantenimiento preventivo
 * - INSPECCION: Inspección de equipos
 * - CUSTOM: Kits personalizados
 * 
 * @file src/app/kits/use-cases/CreateKit.ts
 */

import type { IKitRepository } from '../../../domain/repositories/IKitRepository';
import type { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import type { Kit, KitCategory } from '../../../domain/entities/Kit';
import { kitRepository } from '../../../infra/db/repositories/KitRepository';
import { auditLogRepository } from '../../../infra/db/repositories/AuditLogRepository';
import { logger } from '../../../shared/utils/logger';
import { AuditAction } from '../../../domain/entities/AuditLog';

/**
 * Input del caso de uso
 */
interface CreateKitInput {
  name: string;
  description: string;
  category: KitCategory;
  tools: string[];
  equipment: string[];
  documents: string[];
  active?: boolean;
  userId: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Caso de uso: Crear Kit
 */
export class CreateKit {
  constructor(
    private readonly repository: IKitRepository = kitRepository,
    private readonly auditRepository: IAuditLogRepository = auditLogRepository
  ) {}

  async execute(input: CreateKitInput): Promise<Kit> {
    const { userId, ip, userAgent, ...kitData } = input;

    try {
      // 1. Validar datos de entrada
      this.validateInput(kitData);

      // 2. Verificar si ya existe un kit con el mismo nombre
      const result = await this.repository.findAll({
        category: kitData.category,
        active: true,
        limit: 100,
      });

      const duplicateName = result.kits.find(
        (kit) => kit.name.toLowerCase() === kitData.name.toLowerCase()
      );

      if (duplicateName) {
        throw new Error(`Ya existe un kit con el nombre "${kitData.name}" en la categoría ${kitData.category}`);
      }

      // 3. Crear el kit
      const kit = await this.repository.create({
        name: kitData.name,
        description: kitData.description,
        category: kitData.category,
        tools: kitData.tools,
        equipment: kitData.equipment,
        documents: kitData.documents,
        active: kitData.active ?? true,
        createdBy: userId,
      });

      // 4. Registrar auditoría
      await this.auditRepository.create({
        entityType: 'Kit',
        entityId: kit.id,
        action: AuditAction.CREATE, // ← Usar enum
        userId,
        before: null,
        after: {
          name: kit.name,
          category: kit.category,
          toolsCount: kit.tools.length,
          equipmentCount: kit.equipment.length,
        },
        ip: ip || 'unknown',
        userAgent: userAgent || 'unknown',
      });

      // 5. Log informativo
      logger.info('Kit creado exitosamente', {
        kitId: kit.id,
        userId,
        name: kit.name,
        category: kit.category,
        toolsCount: kit.tools.length,
        equipmentCount: kit.equipment.length,
      });

      return kit;
    } catch (error: any) {
      logger.error('Error en CreateKit use case', {
        error: error.message,
        userId,
        kitName: kitData.name,
      });

      throw error;
    }
  }

  /**
   * Validar datos de entrada
   */
  private validateInput(data: Omit<CreateKitInput, 'userId' | 'ip' | 'userAgent'>): void {
    // Validar nombre
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('El nombre del kit es requerido');
    }

    if (data.name.length < 3) {
      throw new Error('El nombre del kit debe tener al menos 3 caracteres');
    }

    if (data.name.length > 100) {
      throw new Error('El nombre del kit no puede exceder 100 caracteres');
    }

    // Validar descripción
    if (!data.description || data.description.trim().length === 0) {
      throw new Error('La descripción del kit es requerida');
    }

    if (data.description.length < 10) {
      throw new Error('La descripción debe tener al menos 10 caracteres');
    }

    // Validar categoría
    const validCategories = [
      'LINEA_VIDA',
      'ALTURA',
      'MANTENIMIENTO',
      'INSPECCION',
      'CUSTOM',
    ];

    if (!validCategories.includes(data.category)) {
      throw new Error(
        `Categoría inválida. Debe ser una de: ${validCategories.join(', ')}`
      );
    }

    // Validar que tenga al menos herramientas o equipos
    if (
      (!data.tools || data.tools.length === 0) &&
      (!data.equipment || data.equipment.length === 0)
    ) {
      throw new Error('El kit debe contener al menos herramientas o equipos');
    }

    // Validar que los arrays no estén vacíos si se proporcionan
    if (data.tools && data.tools.length > 0) {
      const emptyTools = data.tools.filter((t) => !t || t.trim().length === 0);
      if (emptyTools.length > 0) {
        throw new Error('Las herramientas no pueden estar vacías');
      }
    }

    if (data.equipment && data.equipment.length > 0) {
      const emptyEquipment = data.equipment.filter((e) => !e || e.trim().length === 0);
      if (emptyEquipment.length > 0) {
        throw new Error('Los equipos no pueden estar vacíos');
      }
    }
  }
}


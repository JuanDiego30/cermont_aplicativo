/**
 * Use Case: Crear Kit
 * 
 * Permite crear un nuevo kit típico en el sistema.
 * 
 * Los kits son plantillas predefinidas de materiales, herramientas,
 * equipos y EPP para diferentes tipos de trabajos.
 * 
 * Categorías de kits:
 * - LINEA_VIDA: Instalación de líneas de vida
 * - ALTURA: Trabajos en altura
 * - MANTENIMIENTO: Mantenimiento preventivo
 * - INSPECCION: Inspección de equipos
 * - CUSTOM: Kits personalizados
 * 
 * @file src/app/kits/use-cases/CreateKit.ts
 */

import type { IKitRepository } from '../../../domain/repositories/IKitRepository.js';
import { Kit, KitCategory, KitItem, KitDocument } from '../../../domain/entities/Kit.js';
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
  MISSING_NAME: 'El nombre del kit es requerido',
  NAME_TOO_SHORT: `El nombre del kit debe tener al menos ${KIT_LIMITS.MIN_NAME_LENGTH} caracteres`,
  NAME_TOO_LONG: `El nombre del kit no puede exceder ${KIT_LIMITS.MAX_NAME_LENGTH} caracteres`,
  MISSING_DESCRIPTION: 'La descripción del kit es requerida',
  DESCRIPTION_TOO_SHORT: `La descripción debe tener al menos ${KIT_LIMITS.MIN_DESCRIPTION_LENGTH} caracteres`,
  DESCRIPTION_TOO_LONG: `La descripción no puede exceder ${KIT_LIMITS.MAX_DESCRIPTION_LENGTH} caracteres`,
  INVALID_CATEGORY: (validCategories: string[]) =>
    `Categoría inválida. Debe ser una de: ${validCategories.join(', ')}`,
  NO_ITEMS: 'El kit debe contener al menos herramientas, equipos o documentos',
  DUPLICATE_NAME: (name: string, category: string) =>
    `Ya existe un kit con el nombre "${name}" en la categoría ${category}`,
  EMPTY_TOOL: 'Las herramientas no pueden estar vacías',
  EMPTY_EQUIPMENT: 'Los equipos no pueden estar vacíos',
  EMPTY_DOCUMENT: 'Los documentos no pueden estar vacíos',
  TOO_MANY_TOOLS: `El kit no puede tener más de ${KIT_LIMITS.MAX_TOOLS} herramientas`,
  TOO_MANY_EQUIPMENT: `El kit no puede tener más de ${KIT_LIMITS.MAX_EQUIPMENT} equipos`,
  TOO_MANY_DOCUMENTS: `El kit no puede tener más de ${KIT_LIMITS.MAX_DOCUMENTS} documentos`,
  MISSING_USER_ID: 'El ID del usuario es requerido',
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[CreateKitUseCase]',
} as const;

// Interfaces de entrada (permiten valores opcionales que serán normalizados)
interface ToolItemInput {
  id?: string;
  name: string;
  quantity?: number;
  specifications?: string;
}

interface EquipmentItemInput {
  id?: string;
  name: string;
  quantity?: number;
  specifications?: string;
}

interface DocumentItemInput {
  id?: string;
  name: string;
  type?: string;
  url?: string;
  required?: boolean;
}

interface CreateKitInput {
  name: string;
  description: string;
  category: KitCategory;
  tools?: (string | ToolItemInput)[];
  equipment?: (string | EquipmentItemInput)[];
  documents?: (string | DocumentItemInput)[];
  active?: boolean;
  userId: string;
  ip?: string;
  userAgent?: string;
}

interface NormalizedKitData {
  name: string;
  description: string;
  category: KitCategory;
  tools: KitItem[];
  equipment: KitItem[];
  documents: KitDocument[];
  active: boolean;
  createdBy: string;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class CreateKitUseCase {
  constructor(
    private readonly kitRepository: IKitRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: CreateKitInput): Promise<Kit> {
    this.validateInput(input);

    const normalizedData = this.normalizeKitData(input);

    await this.checkDuplicateName(normalizedData.name, normalizedData.category);

    const kit = await this.createKit(normalizedData);

    const auditContext = this.extractAuditContext(input);
    await this.logKitCreation(kit, input.userId, auditContext);

    logger.info(`${LOG_CONTEXT.USE_CASE} Kit creado exitosamente`, {
      kitId: kit.id,
      userId: input.userId,
      name: kit.name,
      category: kit.category,
      toolsCount: kit.tools.length,
      equipmentCount: kit.equipment.length,
      documentsCount: kit.documents.length,
    });

    return kit;
  }

  private validateInput(input: CreateKitInput): void {
    if (!input.userId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_USER_ID);
    }

    this.validateName(input.name);
    this.validateDescription(input.description);
    this.validateCategory(input.category);
    this.validateHasItems(input);
    this.validateArrays(input);
  }

  private validateName(name: unknown): void {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.MISSING_NAME);
    }

    const trimmedLength = name.trim().length;

    if (trimmedLength < KIT_LIMITS.MIN_NAME_LENGTH) {
      throw new Error(ERROR_MESSAGES.NAME_TOO_SHORT);
    }

    if (trimmedLength > KIT_LIMITS.MAX_NAME_LENGTH) {
      throw new Error(ERROR_MESSAGES.NAME_TOO_LONG);
    }
  }

  private validateDescription(description: unknown): void {
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.MISSING_DESCRIPTION);
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

  private validateHasItems(input: CreateKitInput): void {
    const hasTools = input.tools && input.tools.length > 0;
    const hasEquipment = input.equipment && input.equipment.length > 0;
    const hasDocuments = input.documents && input.documents.length > 0;

    if (!hasTools && !hasEquipment && !hasDocuments) {
      throw new Error(ERROR_MESSAGES.NO_ITEMS);
    }
  }

  private validateArrays(input: CreateKitInput): void {
    if (input.tools) {
      this.validateTools(input.tools);
    }

    if (input.equipment) {
      this.validateEquipment(input.equipment);
    }

    if (input.documents) {
      this.validateDocuments(input.documents);
    }
  }

  private validateTools(tools: (string | ToolItemInput)[]): void {
    if (tools.length > KIT_LIMITS.MAX_TOOLS) {
      throw new Error(ERROR_MESSAGES.TOO_MANY_TOOLS);
    }

    const emptyTools = tools.filter((tool) => {
      if (typeof tool === 'string') {
        return !tool || tool.trim().length === 0;
      }
      return !tool.name || tool.name.trim().length === 0;
    });

    if (emptyTools.length > 0) {
      throw new Error(ERROR_MESSAGES.EMPTY_TOOL);
    }
  }

  private validateEquipment(equipment: (string | EquipmentItemInput)[]): void {
    if (equipment.length > KIT_LIMITS.MAX_EQUIPMENT) {
      throw new Error(ERROR_MESSAGES.TOO_MANY_EQUIPMENT);
    }

    const emptyEquipment = equipment.filter((item) => {
      if (typeof item === 'string') {
        return !item || item.trim().length === 0;
      }
      return !item.name || item.name.trim().length === 0;
    });

    if (emptyEquipment.length > 0) {
      throw new Error(ERROR_MESSAGES.EMPTY_EQUIPMENT);
    }
  }

  private validateDocuments(documents: (string | DocumentItemInput)[]): void {
    if (documents.length > KIT_LIMITS.MAX_DOCUMENTS) {
      throw new Error(ERROR_MESSAGES.TOO_MANY_DOCUMENTS);
    }

    const emptyDocuments = documents.filter((doc) => {
      if (typeof doc === 'string') {
        return !doc || doc.trim().length === 0;
      }
      return !doc.name || doc.name.trim().length === 0;
    });

    if (emptyDocuments.length > 0) {
      throw new Error(ERROR_MESSAGES.EMPTY_DOCUMENT);
    }
  }

  private normalizeKitData(input: CreateKitInput): NormalizedKitData {
    return {
      name: input.name.trim(),
      description: input.description.trim(),
      category: input.category,
      tools: this.normalizeTools(input.tools || []),
      equipment: this.normalizeEquipment(input.equipment || []),
      documents: this.normalizeDocuments(input.documents || []),
      active: input.active ?? true,
      createdBy: input.userId,
    };
  }

  private normalizeTools(tools: (string | ToolItemInput)[]): KitItem[] {
    return tools.map((tool) => {
      if (typeof tool === 'string') {
        return {
          name: tool.trim(),
          quantity: 1,
        };
      }
      return {
        name: tool.name.trim(),
        quantity: tool.quantity ?? 1,
        specifications: tool.specifications,
      };
    });
  }

  private normalizeEquipment(equipment: (string | EquipmentItemInput)[]): KitItem[] {
    return equipment.map((item) => {
      if (typeof item === 'string') {
        return {
          name: item.trim(),
          quantity: 1,
        };
      }
      return {
        name: item.name.trim(),
        quantity: item.quantity ?? 1,
        specifications: item.specifications,
      };
    });
  }

  private normalizeDocuments(documents: (string | DocumentItemInput)[]): KitDocument[] {
    return documents.map((doc) => {
      if (typeof doc === 'string') {
        return {
          name: doc.trim(),
          type: 'DOCUMENT',
          required: false,
        };
      }
      return {
        name: doc.name.trim(),
        type: doc.type ?? 'DOCUMENT',
        url: doc.url,
        required: doc.required ?? false,
      };
    });
  }

  private async checkDuplicateName(name: string, category: KitCategory): Promise<void> {
    const existing = await this.kitRepository.findByNameAndCategory(name, category);

    if (existing) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Intento de crear kit duplicado`, {
        name,
        category,
        existingId: existing.id,
      });
      throw new Error(ERROR_MESSAGES.DUPLICATE_NAME(name, category));
    }
  }

  private async createKit(data: NormalizedKitData): Promise<Kit> {
    try {
      return await this.kitRepository.create(data);
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error creando kit en BD`, {
        name: data.name,
        category: data.category,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private extractAuditContext(input: CreateKitInput): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logKitCreation(
    kit: Kit,
    userId: string,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'Kit',
        entityId: kit.id,
        action: AuditAction.CREATE,
        userId,
        before: null, // No hay estado anterior en un create
        after: {
          name: kit.name,
          category: kit.category,
          toolsCount: kit.tools.length,
          equipmentCount: kit.equipment.length,
          documentsCount: kit.documents.length,
          active: kit.active,
        },
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: `Kit tipo ${kit.category} creado`,
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        kitId: kit.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}



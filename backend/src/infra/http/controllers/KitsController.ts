import type { Request, Response } from 'express';
import { CreateKit } from '../../../app/kits/use-cases/CreateKit';
import { UpdateKit } from '../../../app/kits/use-cases/UpdateKit';
import { ListKits } from '../../../app/kits/use-cases/ListKits';
import { DeleteKit } from '../../../app/kits/use-cases/DeleteKit';
import { kitRepository } from '../../db/repositories/KitRepository';
import { AuditService } from '../../../domain/services/AuditService';
import { auditLogRepository } from '../../db/repositories/AuditLogRepository';
import { logger } from '../../../shared/utils/logger';
import type { KitCategory } from '../../../domain/entities/Kit';
import { AuditAction } from '../../../domain/entities/AuditLog';

const auditService = new AuditService(auditLogRepository);

/**
 * Controlador de Kits T�picos
 * Maneja las peticiones HTTP relacionadas con kits
 */
export class KitsController {
  /**
   * GET /api/kits
   * Listar kits con filtros y paginaci�n
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const {
        category,
        active,
        search,
        limit = 20,
      } = req.query;

      const filters: any = {};
      if (category) filters.category = category as string;
      if (active !== undefined) filters.active = active === 'true';
      if (search) filters.search = search as string;

      const listKitsUseCase = new ListKits(kitRepository);
      const result = await listKitsUseCase.execute(filters);

      res.json({
        kits: result.kits,
        total: result.total,
        page: 1,
        totalPages: Math.ceil(result.total / parseInt(limit as string, 10)),
      });
    } catch (error) {
      logger.error('Error al listar kits', { error, query: req.query });
      res.status(500).json({
        type: 'internal_error',
        title: 'Error al listar kits',
        status: 500,
        detail: 'Ocurri� un error al obtener la lista de kits',
      });
    }
  }

  /**
   * GET /api/kits/:id
   * Obtener kit por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const kit = await kitRepository.findById(id);

      if (!kit) {
        res.status(404).json({
          type: 'not_found',
          title: 'Kit no encontrado',
          status: 404,
          detail: `No se encontr� el kit con ID ${id}`,
        });
        return;
      }

      res.json(kit);
    } catch (error) {
      logger.error('Error al obtener kit', { error, kitId: req.params.id });
      res.status(500).json({
        type: 'internal_error',
        title: 'Error al obtener kit',
        status: 500,
        detail: 'Ocurri� un error al obtener el kit',
      });
    }
  }

  /**
   * GET /api/kits/category/:category
   * Obtener kits por categor�a
   */
  static async getByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;

      const kits = await kitRepository.findByCategory(category as KitCategory);

      res.json(kits);
    } catch (error) {
      logger.error('Error al obtener kits por categor�a', {
        error,
        category: req.params.category,
      });
      res.status(500).json({
        type: 'internal_error',
        title: 'Error al obtener kits',
        status: 500,
        detail: 'Ocurri� un error al obtener los kits por categor�a',
      });
    }
  }

  /**
   * POST /api/kits
   * Crear nuevo kit
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const kitData = req.body;

      const createKitUseCase = new CreateKit(kitRepository);
      const kit = await createKitUseCase.execute({
        ...kitData,
        userId,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });

      // Auditor�a
      await auditService.log({
        entityType: 'kit',
        entityId: kit.id,
        action: AuditAction.CREATE,
        userId,
        after: kit as any,
        ip: req.ip || '',
        userAgent: req.get('user-agent'),
      });

      res.status(201).json(kit);
    } catch (error) {
      logger.error('Error al crear kit', { error, body: req.body });
      res.status(500).json({
        type: 'internal_error',
        title: 'Error al crear kit',
        status: 500,
        detail: 'Ocurri� un error al crear el kit',
      });
    }
  }

  /**
   * PUT /api/kits/:id
   * Actualizar kit
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const updates = req.body;

      // Obtener kit original para auditor�a
      const originalKit = await kitRepository.findById(id);

      if (!originalKit) {
        res.status(404).json({
          type: 'not_found',
          title: 'Kit no encontrado',
          status: 404,
          detail: `No se encontr� el kit con ID ${id}`,
        });
        return;
      }

      const updateKitUseCase = new UpdateKit(kitRepository);
      const updatedKit = await updateKitUseCase.execute(id, updates, userId);

      // Auditor�a
      await auditService.log({
        entityType: 'kit',
        entityId: id,
        action: AuditAction.UPDATE,
        userId,
        before: originalKit as any,
        after: updatedKit as any,
        ip: req.ip || '',
        userAgent: req.get('user-agent'),
      });

      res.json(updatedKit);
    } catch (error) {
      logger.error('Error al actualizar kit', { error, kitId: req.params.id });
      res.status(500).json({
        type: 'internal_error',
        title: 'Error al actualizar kit',
        status: 500,
        detail: 'Ocurri� un error al actualizar el kit',
      });
    }
  }

  /**
   * DELETE /api/kits/:id
   * Eliminar kit (soft delete)
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      // Obtener kit para auditor�a
      const kit = await kitRepository.findById(id);

      if (!kit) {
        res.status(404).json({
          type: 'not_found',
          title: 'Kit no encontrado',
          status: 404,
          detail: `No se encontr� el kit con ID ${id}`,
        });
        return;
      }

      const deleteKitUseCase = new DeleteKit(kitRepository);
      const result = await deleteKitUseCase.execute({
        kitId: id,
        userId,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });

      if (result.success) {
        // Auditor�a
        await auditService.log({
          entityType: 'kit',
          entityId: id,
          action: AuditAction.DELETE,
          userId,
          before: kit as any,
          ip: req.ip || '',
          userAgent: req.get('user-agent'),
        });

        res.status(204).send();
      } else {
        res.status(500).json({
          type: 'internal_error',
          title: 'Error al eliminar kit',
          status: 500,
          detail: result.message || 'No se pudo eliminar el kit',
        });
      }
    } catch (error) {
      logger.error('Error al eliminar kit', { error, kitId: req.params.id });
      res.status(500).json({
        type: 'internal_error',
        title: 'Error al eliminar kit',
        status: 500,
        detail: 'Ocurri� un error al eliminar el kit',
      });
    }
  }

  /**
   * POST /api/kits/:id/duplicate
   * Duplicar kit
   */
  static async duplicate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const duplicatedKit = await kitRepository.duplicate(id, userId);

      if (!duplicatedKit) {
        res.status(404).json({
          type: 'not_found',
          title: 'Kit no encontrado',
          status: 404,
          detail: `No se encontr� el kit con ID ${id}`,
        });
        return;
      }

      // Auditor�a
      await auditService.log({
        entityType: 'kit',
        entityId: duplicatedKit.id,
        action: AuditAction.CREATE,
        userId,
        after: duplicatedKit as any,
        ip: req.ip || '',
        userAgent: req.get('user-agent'),
        reason: `Duplicado desde kit ${id}`,
      });

      res.status(201).json(duplicatedKit);
    } catch (error) {
      logger.error('Error al duplicar kit', { error, kitId: req.params.id });
      res.status(500).json({
        type: 'internal_error',
        title: 'Error al duplicar kit',
        status: 500,
        detail: 'Ocurri� un error al duplicar el kit',
      });
    }
  }

  /**
   * GET /api/kits/stats
   * Obtener estad�sticas de kits
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await kitRepository.getStats();
      res.json(stats);
    } catch (error) {
      logger.error('Error al obtener estad�sticas de kits', { error });
      res.status(500).json({
        type: 'internal_error',
        title: 'Error al obtener estad�sticas',
        status: 500,
        detail: 'Ocurri� un error al obtener las estad�sticas de kits',
      });
    }
  }
}

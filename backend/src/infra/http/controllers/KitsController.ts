import type { Request, Response } from 'express';
import { CreateKitUseCase } from '../../../app/kits/use-cases/CreateKit.js';
import { UpdateKitUseCase } from '../../../app/kits/use-cases/UpdateKit.js';
import { ListKitsUseCase } from '../../../app/kits/use-cases/ListKits.js';
import { DeleteKitUseCase } from '../../../app/kits/use-cases/DeleteKit.js';
import { SuggestKitUseCase } from '../../../app/kits/use-cases/SuggestKit.js';
import { kitRepository } from '../../db/repositories/KitRepository.js';
import { workPlanRepository } from '../../db/repositories/WorkPlanRepository.js'; // Necesario para delete safe
import { AuditService } from '../../../domain/services/AuditService.js';
import { auditLogRepository } from '../../db/repositories/AuditLogRepository.js';
import { logger } from '../../../shared/utils/logger.js';
import type { KitCategory } from '../../../domain/entities/Kit.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';

// Servicios
const auditService = new AuditService(auditLogRepository);

export class KitsController {
  
  static list = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        category,
        active,
        search,
        limit = 20,
        page = 1
      } = req.query;

      const listKitsUseCase = new ListKitsUseCase(kitRepository);
      const result = await listKitsUseCase.execute({
        category: category as any,
        active: active !== undefined ? active === 'true' : undefined,
        search: search as string,
        page: Number(page),
        limit: Number(limit),
      });

      res.json({
        kits: result.kits,
        total: result.pagination.total,
        page: result.pagination.page,
        totalPages: result.pagination.totalPages,
      });
    } catch (error: any) {
      logger.error('Error al listar kits', { error: error.message });
      res.status(500).json({
        type: 'internal_error',
        title: 'Error al listar kits',
        status: 500,
        detail: 'Ocurrió un error al obtener la lista de kits',
      });
    }
  };

  static getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const kit = await kitRepository.findById(id);

      if (!kit) {
        res.status(404).json({
          type: 'not_found',
          title: 'Kit no encontrado',
          status: 404,
          detail: `No se encontró el kit con ID ${id}`,
        });
        return;
      }

      res.json(kit);
    } catch (error: any) {
      logger.error('Error al obtener kit', { error: error.message, kitId: req.params.id });
      res.status(500).json({
        type: 'internal_error',
        title: 'Error al obtener kit',
        status: 500,
        detail: 'Ocurrió un error al obtener el kit',
      });
    }
  };

  static create = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const kitData = req.body;
      const createKitUseCase = new CreateKitUseCase(kitRepository, auditService);
      
      const kit = await createKitUseCase.execute({
        ...kitData,
        userId,
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
      });

      res.status(201).json(kit);
    } catch (error: any) {
      logger.error('Error al crear kit', { error: error.message });
      
      // Manejo de errores de negocio
      if (error.message.includes('requerido') || error.message.includes('existe')) {
        res.status(400).json({
          type: 'bad_request',
          title: 'Error de validación',
          status: 400,
          detail: error.message,
        });
        return;
      }

      res.status(500).json({
        type: 'internal_error',
        title: 'Error al crear kit',
        status: 500,
        detail: error.message,
      });
    }
  };

  static update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const originalKit = await kitRepository.findById(id);
      if (!originalKit) {
        res.status(404).json({ type: 'not_found', title: 'Kit no encontrado', status: 404 });
        return;
      }

      const updateKitUseCase = new UpdateKitUseCase(kitRepository, auditService);
      const updatedKit = await updateKitUseCase.execute({
        kitId: id,
        updates: req.body,
        userId,
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
      });

      res.json(updatedKit);
    } catch (error: any) {
      logger.error('Error al actualizar kit', { error: error.message });
      res.status(500).json({ type: 'internal_error', status: 500, detail: error.message });
    }
  };

  static delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const kit = await kitRepository.findById(id);
      if (!kit) {
        res.status(404).json({ type: 'not_found', status: 404 });
        return;
      }

      // Inyección de workPlanRepository para validar dependencias
      const deleteKitUseCase = new DeleteKitUseCase(kitRepository, workPlanRepository, auditService);
      
      await deleteKitUseCase.execute({
        kitId: id,
        userId,
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
      });

      res.status(204).send();
    } catch (error: any) {
      logger.error('Error al eliminar kit', { error: error.message });
      res.status(500).json({ type: 'internal_error', status: 500, detail: error.message });
    }
  };

  static duplicate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Buscar original
      const original = await kitRepository.findById(id);
      if (!original) {
        res.status(404).json({ type: 'not_found', status: 404 });
        return;
      }

      // Crear copia usando CreateKitUseCase
      const createUseCase = new CreateKitUseCase(kitRepository, auditService);
      const duplicatedKit = await createUseCase.execute({
        name: `${original.name} (Copia)`,
        description: original.description,
        category: original.category,
        tools: original.tools,
        equipment: original.equipment,
        documents: original.documents,
        active: true,
        userId,
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
      });

      res.status(201).json(duplicatedKit);
    } catch (error: any) {
      logger.error('Error al duplicar kit', { error: error.message });
      res.status(500).json({ type: 'internal_error', status: 500, detail: error.message });
    }
  };

  static getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await kitRepository.getStats();
      res.json(stats);
    } catch (error: any) {
      logger.error('Error al obtener estadísticas', { error: error.message });
      res.status(500).json({ type: 'internal_error', status: 500, detail: error.message });
    }
  };

  static getByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category } = req.params;
      
      const listKitsUseCase = new ListKitsUseCase(kitRepository);
      const result = await listKitsUseCase.execute({
        category: category as any,
        active: true,
      });

      res.json({
        kits: result.kits,
        total: result.pagination.total,
      });
    } catch (error: any) {
      logger.error('Error al obtener kits por categoría', { error: error.message });
      res.status(500).json({ type: 'internal_error', status: 500, detail: error.message });
    }
  };

  static suggest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { description, category, limit } = req.body;

      const suggestUseCase = new SuggestKitUseCase(kitRepository);
      const result = await suggestUseCase.execute({
        description,
        category,
        limit: limit ? Number(limit) : undefined,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error al sugerir kit', { error: error.message });
      res.status(400).json({ type: 'bad_request', status: 400, detail: error.message });
    }
  };
}


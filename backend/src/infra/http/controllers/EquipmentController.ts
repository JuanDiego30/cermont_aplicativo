/**
 * HTTP Controller: EquipmentController
 * Maneja endpoints REST para equipos certificados
 * 
 * @file backend/src/infra/http/controllers/EquipmentController.ts
 */

import type { Request, Response } from 'express';
import { CreateCertifiedEquipmentUseCase } from '../../../app/equipment/use-cases/CreateCertifiedEquipment.js';
import { CheckExpiringCertificationsUseCase } from '../../../app/equipment/use-cases/CheckExpiringCertifications.js';
import { CertifiedEquipmentRepository } from '../../db/repositories/CertifiedEquipmentRepository.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditLogRepository } from '../../db/repositories/AuditLogRepository.js';
import { logger } from '../../../shared/utils/logger.js';
import type { EquipmentCategory, EquipmentStatus } from '../../../domain/entities/CertifiedEquipment.js';

const LOG_CONTEXT = '[EquipmentController]';

// ============================================================================
// Helper Functions
// ============================================================================

function getPaginationParams(query: any) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  return { page, limit };
}

function getStatusCode(error: Error): number {
  const message = error.message.toLowerCase();
  if (message.includes('no encontrado') || message.includes('not found')) return 404;
  if (message.includes('duplicado') || message.includes('duplicate')) return 409;
  if (message.includes('requerido') || message.includes('inválid')) return 400;
  return 500;
}

// ============================================================================
// Controller
// ============================================================================

export class EquipmentController {
  /**
   * GET /api/equipment
   * Lista equipos con filtros y paginación
   */
  static async list(req: Request, res: Response) {
    try {
      const { category, status, search, location, assignedTo, sortBy, sortOrder } = req.query;
      const { page, limit } = getPaginationParams(req.query);

      const equipmentRepository = new CertifiedEquipmentRepository();

      const result = await equipmentRepository.findAll({
        category: category as EquipmentCategory,
        status: status as EquipmentStatus,
        search: search as string,
        location: location as string,
        assignedTo: assignedTo as string,
        page,
        limit,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      });

      res.json({
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      logger.error(`${LOG_CONTEXT} Error listando equipos`, { error });
      res.status(500).json({
        success: false,
        error: 'Error al listar equipos certificados',
      });
    }
  }

  /**
   * GET /api/equipment/:id
   * Obtiene un equipo por ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const equipmentRepository = new CertifiedEquipmentRepository();

      const equipment = await equipmentRepository.findById(id);

      if (!equipment) {
        return res.status(404).json({
          success: false,
          error: 'Equipo no encontrado',
        });
      }

      res.json({ success: true, data: equipment });
    } catch (error) {
      logger.error(`${LOG_CONTEXT} Error obteniendo equipo`, { error });
      res.status(500).json({
        success: false,
        error: 'Error al obtener equipo',
      });
    }
  }

  /**
   * POST /api/equipment
   * Crea un nuevo equipo certificado
   */
  static async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const equipmentRepository = new CertifiedEquipmentRepository();
      const auditLogRepository = new AuditLogRepository();
      const auditService = new AuditService(auditLogRepository);

      const createUseCase = new CreateCertifiedEquipmentUseCase(
        equipmentRepository,
        auditService
      );

      const equipment = await createUseCase.execute({
        ...req.body,
        createdBy: userId,
      });

      res.status(201).json({ success: true, data: equipment });
    } catch (error) {
      const statusCode = getStatusCode(error as Error);
      logger.error(`${LOG_CONTEXT} Error creando equipo`, { error });
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear equipo',
      });
    }
  }

  /**
   * PATCH /api/equipment/:id
   * Actualiza un equipo
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const equipmentRepository = new CertifiedEquipmentRepository();

      const equipment = await equipmentRepository.update(id, req.body);

      res.json({ success: true, data: equipment });
    } catch (error) {
      const statusCode = getStatusCode(error as Error);
      logger.error(`${LOG_CONTEXT} Error actualizando equipo`, { error });
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar equipo',
      });
    }
  }

  /**
   * DELETE /api/equipment/:id
   * Elimina un equipo (soft delete)
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const equipmentRepository = new CertifiedEquipmentRepository();

      await equipmentRepository.delete(id);

      res.json({ success: true, message: 'Equipo retirado exitosamente' });
    } catch (error) {
      logger.error(`${LOG_CONTEXT} Error eliminando equipo`, { error });
      res.status(500).json({
        success: false,
        error: 'Error al eliminar equipo',
      });
    }
  }

  /**
   * GET /api/equipment/stats/by-status
   * Estadísticas por estado
   */
  static async statsByStatus(req: Request, res: Response) {
    try {
      const equipmentRepository = new CertifiedEquipmentRepository();
      const stats = await equipmentRepository.countByStatus();

      res.json({ success: true, data: stats });
    } catch (error) {
      logger.error(`${LOG_CONTEXT} Error en estadísticas`, { error });
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas',
      });
    }
  }

  /**
   * GET /api/equipment/stats/by-category
   * Estadísticas por categoría
   */
  static async statsByCategory(req: Request, res: Response) {
    try {
      const equipmentRepository = new CertifiedEquipmentRepository();
      const stats = await equipmentRepository.countByCategory();

      res.json({ success: true, data: stats });
    } catch (error) {
      logger.error(`${LOG_CONTEXT} Error en estadísticas`, { error });
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas',
      });
    }
  }

  /**
   * GET /api/equipment/alerts/expiring
   * Obtiene alertas de certificaciones próximas a vencer
   */
  static async getExpiringAlerts(req: Request, res: Response) {
    try {
      const { daysAhead = 30 } = req.query;

      const equipmentRepository = new CertifiedEquipmentRepository();
      const checkUseCase = new CheckExpiringCertificationsUseCase(equipmentRepository);

      const alerts = await checkUseCase.execute(Number(daysAhead));

      res.json({
        success: true,
        data: alerts,
        meta: {
          total: alerts.length,
          high: alerts.filter(a => a.severity === 'HIGH').length,
          medium: alerts.filter(a => a.severity === 'MEDIUM').length,
          low: alerts.filter(a => a.severity === 'LOW').length,
        },
      });
    } catch (error) {
      logger.error(`${LOG_CONTEXT} Error obteniendo alertas`, { error });
      res.status(500).json({
        success: false,
        error: 'Error al obtener alertas',
      });
    }
  }

  /**
   * PATCH /api/equipment/:id/assign
   * Asigna equipo a un usuario
   */
  static async assign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const equipmentRepository = new CertifiedEquipmentRepository();
      const equipment = await equipmentRepository.markAsInUse(id, userId);

      res.json({ success: true, data: equipment });
    } catch (error) {
      logger.error(`${LOG_CONTEXT} Error asignando equipo`, { error });
      res.status(500).json({
        success: false,
        error: 'Error al asignar equipo',
      });
    }
  }

  /**
   * PATCH /api/equipment/:id/release
   * Libera equipo (marca como disponible)
   */
  static async release(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const equipmentRepository = new CertifiedEquipmentRepository();
      const equipment = await equipmentRepository.markAsAvailable(id);

      res.json({ success: true, data: equipment });
    } catch (error) {
      logger.error(`${LOG_CONTEXT} Error liberando equipo`, { error });
      res.status(500).json({
        success: false,
        error: 'Error al liberar equipo',
      });
    }
  }

  /**
   * GET /api/equipment/category/:category/available
   * Lista equipos disponibles por categoría
   */
  static async getAvailableByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;

      const equipmentRepository = new CertifiedEquipmentRepository();
      const equipment = await equipmentRepository.findAvailableByCategory(category as EquipmentCategory);

      res.json({ success: true, data: equipment });
    } catch (error) {
      logger.error(`${LOG_CONTEXT} Error obteniendo equipos disponibles`, { error });
      res.status(500).json({
        success: false,
        error: 'Error al obtener equipos disponibles',
      });
    }
  }
}

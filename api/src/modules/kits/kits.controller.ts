// ============================================
// KITS TÍPICOS CONTROLLER - Cermont FSM
// ============================================

import { Request, Response } from 'express';
import { kitsService } from './kits.service.js';
import { createKitSchema, updateKitSchema, kitFiltersSchema } from './kits.types.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { z } from 'zod';

export class KitsController {
    
    /**
     * GET /api/kits
     * Listar kits con filtros
     */
    list = asyncHandler(async (req: Request, res: Response) => {
        const filters = kitFiltersSchema.parse(req.query);
        const result = await kitsService.findAll(filters);
        
        res.json({
            success: true,
            data: result.data,
            pagination: {
                page: filters.page,
                limit: filters.limit,
                total: result.total,
                pages: result.pages,
            }
        });
    });

    /**
     * GET /api/kits/active
     * Listar solo kits activos (para dropdowns)
     */
    listActive = asyncHandler(async (_req: Request, res: Response) => {
        const data = await kitsService.findAllActive();
        
        res.json({
            success: true,
            data,
        });
    });

    /**
     * GET /api/kits/:id
     * Obtener kit por ID
     */
    getById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const kit = await kitsService.findById(id);
        
        res.json({
            success: true,
            data: kit,
        });
    });

    /**
     * POST /api/kits
     * Crear nuevo kit
     */
    create = asyncHandler(async (req: Request, res: Response) => {
        const data = createKitSchema.parse(req.body);
        const kit = await kitsService.create(data);
        
        res.status(201).json({
            success: true,
            message: 'Kit creado exitosamente',
            data: kit,
        });
    });

    /**
     * PATCH /api/kits/:id
     * Actualizar kit
     */
    update = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const data = updateKitSchema.parse(req.body);
        const kit = await kitsService.update(id, data);
        
        res.json({
            success: true,
            message: 'Kit actualizado',
            data: kit,
        });
    });

    /**
     * POST /api/kits/:id/activate
     * Activar kit
     */
    activate = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const kit = await kitsService.activate(id);
        
        res.json({
            success: true,
            message: 'Kit activado',
            data: kit,
        });
    });

    /**
     * POST /api/kits/:id/deactivate
     * Desactivar kit (soft delete)
     */
    deactivate = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const kit = await kitsService.deactivate(id);
        
        res.json({
            success: true,
            message: 'Kit desactivado',
            data: kit,
        });
    });

    /**
     * DELETE /api/kits/:id
     * Eliminar kit permanentemente
     */
    delete = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await kitsService.delete(id);
        
        res.json({
            success: true,
            message: 'Kit eliminado permanentemente',
        });
    });

    /**
     * POST /api/kits/:id/duplicate
     * Duplicar kit con nuevo nombre
     */
    duplicate = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { nombre } = z.object({
            nombre: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
        }).parse(req.body);
        
        const kit = await kitsService.duplicate(id, nombre);
        
        res.status(201).json({
            success: true,
            message: 'Kit duplicado exitosamente',
            data: kit,
        });
    });
}

export const kitsController = new KitsController();

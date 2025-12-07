import { Request, Response } from 'express';
import { ordenesService } from './ordenes.service.js';
import { createOrderSchema, updateOrderSchema, orderFiltersSchema } from './ordenes.types.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export class OrdenesController {

    list = asyncHandler(async (req: Request, res: Response) => {
        const filters = orderFiltersSchema.parse(req.query);
        const result = await ordenesService.findAll(filters);
        res.json(result);
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const orden = await ordenesService.findById(id);
        res.json(orden);
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const data = createOrderSchema.parse(req.body);
        const userId = req.user?.userId;
        if (!userId) throw new AppError('No autenticado', 401);

        const orden = await ordenesService.create(data, userId);
        res.status(201).json(orden);
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const data = updateOrderSchema.parse(req.body);
        const orden = await ordenesService.update(id, data);
        res.json(orden);
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await ordenesService.delete(id);
        res.json(result);
    });

    assignResponsable = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { responsableId } = req.body;
        if (!responsableId) throw new AppError('responsableId es requerido', 400);

        const orden = await ordenesService.assignResponsable(id, responsableId);
        res.json(orden);
    });

    changeStatus = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { estado } = req.body;
        if (!estado) throw new AppError('estado es requerido', 400);

        const orden = await ordenesService.changeStatus(id, estado);
        res.json(orden);
    });
}

export const ordenesController = new OrdenesController();

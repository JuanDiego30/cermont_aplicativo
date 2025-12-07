import { Request, Response } from 'express';
import { usuariosService } from './usuarios.service.js';
import { createUserSchema, updateUserSchema, userFiltersSchema } from './usuarios.types.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export class UsuariosController {

    list = asyncHandler(async (req: Request, res: Response) => {
        const filters = userFiltersSchema.parse(req.query);
        const result = await usuariosService.findAll(filters);
        res.json(result);
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const usuario = await usuariosService.findById(id);
        res.json(usuario);
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const data = createUserSchema.parse(req.body);
        const usuario = await usuariosService.create(data);
        res.status(201).json(usuario);
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const data = updateUserSchema.parse(req.body);
        const usuario = await usuariosService.update(id, data);
        res.json(usuario);
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await usuariosService.delete(id);
        res.json(result);
    });

    changePassword = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { newPassword } = req.body;
        const result = await usuariosService.changePassword(id, newPassword);
        res.json(result);
    });
}

export const usuariosController = new UsuariosController();

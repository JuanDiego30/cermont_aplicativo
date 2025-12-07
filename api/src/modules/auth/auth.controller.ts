import { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.types.js';
import { AppError } from '../../shared/errors/AppError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export class AuthController {

    login = asyncHandler(async (req: Request, res: Response) => {
        const data = loginSchema.parse(req.body);
        const result = await authService.login(data, req.ip, req.get('user-agent'));

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        res.json({
            message: 'Login exitoso',
            token: result.token,
            user: result.user
        });
    });

    register = asyncHandler(async (req: Request, res: Response) => {
        const data = registerSchema.parse(req.body);
        const result = await authService.register(data, req.ip, req.get('user-agent'));

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token: result.token,
            user: result.user
        });
    });

    refresh = asyncHandler(async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!refreshToken) throw new AppError('Refresh token requerido', 401);

        const result = await authService.refresh(refreshToken, req.ip, req.get('user-agent'));

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        res.json({ token: result.accessToken });
    });

    logout = asyncHandler(async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
        const authHeader = req.headers.authorization;
        const accessToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

        await authService.logout(accessToken, refreshToken);

        res.clearCookie('refreshToken', { path: '/' });
        res.json({ message: 'Sesión cerrada exitosamente' });
    });

    me = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError('No autenticado', 401);

        const user = await authService.findUserById(userId);
        if (!user) throw new AppError('Usuario no encontrado', 404);

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone,
            }
        });
    });

    verify = asyncHandler(async (req: Request, res: Response) => {
        const token = req.body.token || req.headers.authorization?.replace('Bearer ', '');
        if (!token) throw new AppError('Token requerido', 400);

        const payload = authService.validateToken(token);
        if (!payload) throw new AppError('Token inválido o expirado', 401);

        const user = await authService.findUserById(payload.userId);
        if (!user || !user.active) throw new AppError('Usuario no válido', 401);

        res.json({
            valid: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        });
    });

    forgotPassword = asyncHandler(async (req: Request, res: Response) => {
        const data = forgotPasswordSchema.parse(req.body);
        await authService.forgotPassword(data);
        res.json({ message: 'Si el correo existe, se enviarán las instrucciones.' });
    });

    resetPassword = asyncHandler(async (req: Request, res: Response) => {
        const data = resetPasswordSchema.parse(req.body);
        await authService.resetPassword(data);
        res.json({ message: 'Contraseña actualizada exitosamente' });
    });
}

export const authController = new AuthController();

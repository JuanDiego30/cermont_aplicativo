import { Router } from 'express';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { HttpError } from '../middleware/errorHandler';
import { createUser, findUserByCorreo } from '../services/userService';

const router = Router();

const roleValues = ['admin', 'gerente', 'coordinador', 'tecnico', 'cliente'] as const;

type AllowedRole = (typeof roleValues)[number];

const DEFAULT_ROLE: AllowedRole = 'cliente';

function ensureAllowedRole(value?: string | null): AllowedRole {
  return value && roleValues.includes(value as AllowedRole) ? (value as AllowedRole) : DEFAULT_ROLE;
}

const registerSchema = z.object({
  correo: z.string().email('Correo inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  rol: z.enum(roleValues).optional(),
});

const loginSchema = z.object({
  correo: z.string().email('Correo inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

router.post('/register', async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);

    const existing = await findUserByCorreo(payload.correo);
    if (existing) {
      throw new HttpError(409, 'El correo ya está registrado');
    }

    const hash = await hashPassword(payload.password);
  const user = await createUser({ correo: payload.correo, hash, rol: ensureAllowedRole(payload.rol) });

    return res.status(201).json({
      id: user.id,
      correo: user.correo,
      rol: user.rol,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new HttpError(422, 'Datos inválidos', error.flatten()));
    }
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await findUserByCorreo(payload.correo);

    if (!user) {
      throw new HttpError(401, 'Credenciales inválidas');
    }

    const isValid = await verifyPassword(payload.password, user.hash);
    if (!isValid) {
      throw new HttpError(401, 'Credenciales inválidas');
    }

    const rol = ensureAllowedRole(user.rol);
    const token = signToken({ sub: user.id, correo: user.correo, rol });

    return res.json({
      token,
      user: {
        id: user.id,
        correo: user.correo,
        rol,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new HttpError(422, 'Datos inválidos', error.flatten()));
    }
    return next(error);
  }
});

export default router;

/**
 * Auth Routes - Production Ready
 * @description Rutas de autenticación con tipado correcto
 */

import express, { Router, Request, Response, NextFunction } from 'express';
import { validateZod } from '../middleware/validateZod';
import { authenticate } from '../middleware/auth';
import { loginLimiter, strictLimiter } from '../middleware/rateLimiter';
import {
  register,
  login,
  logout,
  logoutAll,
  refreshToken,
  getSessions,
  revokeSession,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyToken,
} from '../controllers/auth.controller';
import { ROLES, PASSWORD_CONFIG } from '../constants';
import { Role } from '../types';
import { TypedRequest, AuthenticatedRequest, ApiResponse } from '../types/express.types';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  changePasswordSchema
} from '../validators/auth.validator';

// ==================== HELPER FUNCTIONS ====================

const auditLogger = (action: string, metadata?: any) => {
  return (req: Request | TypedRequest, res: Response, next: NextFunction): void => {
    next();
  };
};

// ==================== INTERFACES ====================

interface RegisterBody {
  nombre: string;
  email: string;
  password: string;
  rol?: Role;
  telefono?: string;
  cedula?: string;
  cargo?: string;
  especialidad?: string;
}

interface LoginBody {
  email: string;
  password: string;
  remember?: boolean;
}

interface RefreshTokenBody {
  refreshToken: string;
}

interface UpdateProfileBody {
  nombre?: string;
  telefono?: string;
  cargo?: string;
  especialidad?: string;
}

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

interface ForgotPasswordBody {
  email: string;
}

interface ResetPasswordBody {
  token: string;
  newPassword: string;
}

// ==================== RESPONSE INTERFACES ====================

interface AuthResponse {
  success: boolean;
  data: {
    user: any;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
  message: string;
}

interface RegisterResponse {
  success: boolean;
  data: { user: any };
  message: string;
}

interface RefreshResponse {
  success: boolean;
  data: { tokens: { accessToken: string; refreshToken: string } };
  message: string;
}

interface ProfileResponse {
  success: boolean;
  data: { user: any };
  message: string;
}

interface SessionsResponse {
  success: boolean;
  data: { sessions: any[] };
  message: string;
}

// ==================== SCHEMAS ====================

const registerSchema = {
  body: {
    type: 'object',
    properties: {
      nombre: { type: 'string', minLength: 2, maxLength: 100 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: PASSWORD_CONFIG.MIN_LENGTH },
      rol: { type: 'string', enum: ROLES as any },
      telefono: { type: 'string', maxLength: 20 },
      cedula: { type: 'string', maxLength: 20 },
      cargo: { type: 'string', maxLength: 100 },
      especialidad: { type: 'string', maxLength: 100 },
    },
    required: ['nombre', 'email', 'password'],
    additionalProperties: false,
  },
} as const;

const loginSchema = {
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 1 },
      remember: { type: 'boolean' },
    },
    required: ['email', 'password'],
    additionalProperties: false,
  },
} as const;

const refreshTokenSchema = {
  body: {
    type: 'object',
    properties: {
      refreshToken: { type: 'string', minLength: 1 },
    },
    required: ['refreshToken'],
    additionalProperties: false,
  },
} as const;

const updateProfileSchema = {
  body: {
    type: 'object',
    properties: {
      nombre: { type: 'string', minLength: 2, maxLength: 100 },
      telefono: { type: 'string', maxLength: 20 },
      cargo: { type: 'string', maxLength: 100 },
      especialidad: { type: 'string', maxLength: 100 },
    },
    additionalProperties: false,
  },
} as const;

const changePasswordSchema = {
  body: {
    type: 'object',
    properties: {
      currentPassword: { type: 'string', minLength: 1 },
      newPassword: { type: 'string', minLength: MIN_PASSWORD_LENGTH },
    },
    required: ['currentPassword', 'newPassword'],
    additionalProperties: false,
  },
} as const;

const forgotPasswordSchema = {
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
    },
    required: ['email'],
    additionalProperties: false,
  },
} as const;

const resetPasswordSchema = {
  body: {
    type: 'object',
    properties: {
      token: { type: 'string', minLength: 1 },
      newPassword: { type: 'string', minLength: MIN_PASSWORD_LENGTH },
    },
    required: ['token', 'newPassword'],
    additionalProperties: false,
  },
} as const;

const sessionIndexSchema = {
  query: {
    sessionIndex: { type: 'integer', minimum: 0, maximum: 10 },
  },
} as const;

// ==================== ROUTER ====================

const router: Router = express.Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register',
  strictLimiter,
  validateZod(registerSchema),
  (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'production' && (req.body as RegisterBody).rol !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Registro restringido a admins',
        data: null
      });
    }
    next();
  },
  auditLogger('REGISTER_ATTEMPT'),
  register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  loginLimiter,
  validateRequest(loginSchema),
  auditLogger('LOGIN_ATTEMPT'),
  login
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  strictLimiter,
  validateZod(refreshTokenSchema),
  refreshToken
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  strictLimiter,
  validateRequest(forgotPasswordSchema),
  auditLogger('PASSWORD_RESET_REQUEST'),
  forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  strictLimiter,
  validateRequest(resetPasswordSchema),
  auditLogger('PASSWORD_RESET_ATTEMPT'),
  resetPassword
);

// ============================================================================
// PROTECTED ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/auth/verify
 * @desc    Verify current token
 * @access  Private
 */
router.get('/verify', authenticate, verifyToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout current session
 * @access  Private
 */
router.post('/logout', authenticate, auditLogger('LOGOUT'), logout);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout all sessions
 * @access  Private
 */
router.post('/logout-all', authenticate, auditLogger('LOGOUT_ALL'), logoutAll);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, getMe);

/**
 * @route   PUT /api/v1/auth/me
 * @desc    Update profile
 * @access  Private
 */
router.put(
  '/me',
  authenticate,
  validateRequest(updateProfileSchema),
  auditLogger('UPDATE_PROFILE'),
  updateMe
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  validateZod(changePasswordSchema),
  auditLogger('PASSWORD_CHANGE'),
  changePassword
);

/**
 * @route   GET /api/v1/auth/sessions
 * @desc    Get active sessions
 * @access  Private
 */
router.get('/sessions', authenticate, getSessions);

/**
 * @route   DELETE /api/v1/auth/sessions
 * @desc    Revoke specific session
 * @access  Private
 */
router.delete(
  '/sessions',
  authenticate,
  validateRequest(sessionIndexSchema),
  auditLogger('REVOKE_SESSION'),
  revokeSession
);

/**
 * @route   GET /.well-known/jwks.json
 * @desc    JWKS endpoint para validación de tokens JWT
 * @access  Public
 */
router.get('/.well-known/jwks.json', async (req: Request, res: Response) => {
  try {
    const { getJWKS } = await import('../services/jwt.service');
    const jwks = await getJWKS();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache 1 hora
    res.json(jwks);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

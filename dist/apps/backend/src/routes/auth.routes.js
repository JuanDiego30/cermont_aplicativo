import express from 'express';
import { validateRequest } from '';
import { authenticate } from '';
import { loginLimiter, strictLimiter } from '';
import { auditAction } from '';
import { register, login, logout, logoutAll, refreshToken, getSessions, revokeSession, getMe, updateMe, changePassword, forgotPassword, resetPassword, verifyToken, } from '';
import { ROLES, MIN_PASSWORD_LENGTH } from '';
const router = express.Router();
const registerSchema = {
    body: {
        type: 'object',
        properties: {
            nombre: { type: 'string', minLength: 2, maxLength: 100, trim: true },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: MIN_PASSWORD_LENGTH },
            rol: { type: 'string', enum: ROLES },
            telefono: { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$', maxLength: 20 },
            cedula: { type: 'string', pattern: '^[0-9A-Z]{5,20}$' },
            cargo: { type: 'string', maxLength: 100 },
            especialidad: { type: 'string', maxLength: 100 },
        },
        required: ['nombre', 'email', 'password'],
        additionalProperties: false,
    },
};
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
};
const refreshTokenSchema = {
    body: {
        type: 'object',
        properties: {
            refreshToken: { type: 'string', minLength: 1 },
        },
        required: ['refreshToken'],
        additionalProperties: false,
    },
};
const updateProfileSchema = {
    body: {
        type: 'object',
        properties: {
            nombre: { type: 'string', minLength: 2, maxLength: 100, trim: true },
            telefono: { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$', maxLength: 20 },
            cargo: { type: 'string', maxLength: 100 },
            especialidad: { type: 'string', maxLength: 100 },
        },
        additionalProperties: false,
    },
};
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
};
const forgotPasswordSchema = {
    body: {
        type: 'object',
        properties: {
            email: { type: 'string', format: 'email' },
        },
        required: ['email'],
        additionalProperties: false,
    },
};
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
};
const sessionIndexSchema = {
    params: {
        sessionIndex: { type: 'integer', minimum: 0, maximum: 10 },
    },
};
router.post('/register', strictLimiter, validateRequest(registerSchema), (req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.body.rol !== 'client') {
        return res.status(403).json({ message: 'Registro restringido a admins' });
    }
    next();
}, auditAction('REGISTER_ATTEMPT'), register);
router.post('/login', loginLimiter, validateRequest(loginSchema), auditAction('LOGIN_ATTEMPT'), login);
router.post('/refresh', strictLimiter, validateRequest(refreshTokenSchema), refreshToken);
router.post('/forgot-password', strictLimiter, validateRequest(forgotPasswordSchema), auditAction('PASSWORD_RESET_REQUEST'), forgotPassword);
router.post('/reset-password', strictLimiter, validateRequest(resetPasswordSchema), auditAction('PASSWORD_RESET_ATTEMPT'), resetPassword);
router.get('/verify', authenticate, verifyToken);
router.post('/logout', authenticate, auditAction('LOGOUT'), logout);
router.post('/logout-all', authenticate, auditAction('LOGOUT_ALL'), logoutAll);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, validateRequest(updateProfileSchema), auditAction('UPDATE_PROFILE'), updateMe);
router.post('/change-password', authenticate, validateRequest(changePasswordSchema), auditAction('PASSWORD_CHANGE'), changePassword);
router.get('/sessions', authenticate, getSessions);
router.delete('/sessions/:sessionIndex', authenticate, validateRequest(sessionIndexSchema), auditAction('REVOKE_SESSION'), revokeSession);
export default router;
//# sourceMappingURL=auth.routes.js.map
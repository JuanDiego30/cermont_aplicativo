/**
 * Authentication Routes
 *
 * DOC-10 compliance:
 * - POST /api/auth/login — public
 * - POST /api/auth/refresh — public (reads cookie)
 * - POST /api/auth/logout — authenticated
 * - GET /api/auth/me — authenticated
 * - PATCH /api/auth/change-password — authenticated
 * - POST /api/auth/forgot-password — public (rate limited)
 * - POST /api/auth/reset-password — public (rate limited)
 *
 * All inputs validated by middleware BEFORE controller.
 */

import {
	ChangePasswordSchema,
	ForgotPasswordSchema,
	LoginSchema,
	ResetPasswordSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../../middlewares/auth.middleware";
import { validateBody } from "../../middlewares/validate";
import * as AuthController from "./auth.controller";

const router = Router();

/**
 * Rate limiter para endpoints de autenticación.
 * Previene ataques de fuerza bruta en login/refresh.
 * 10 intentos máximo por ventana de 15 minutos.
 */
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 10, // máximo 10 intentos
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		error: {
			code: "RATE_LIMIT_EXCEEDED",
			message: "Demasiados intentos. Espera 15 minutos.",
		},
	},
});

/**
 * POST /api/auth/login
 * Public endpoint — no authentication required
 * Body validated against LoginSchema (Zod)
 * Rate limited: 10 intentos / 15 min
 */
router.post("/login", authLimiter, validateBody(LoginSchema), AuthController.login);

/**
 * POST /api/auth/refresh
 * Public endpoint — reads refreshToken from HttpOnly cookie
 * No body validation needed
 * Rate limited: 10 intentos / 15 min
 */
router.post("/refresh", authLimiter, AuthController.refresh);

/**
 * POST /api/auth/logout
 * Protected endpoint — requires valid access token
 * Also reads refreshToken from cookie
 * No body validation needed — logout uses cookie, not body
 */
router.post("/logout", authenticate, AuthController.logout);

/**
 * GET /api/auth/me
 * Protected endpoint — returns authenticated user's profile
 */
router.get("/me", authenticate, AuthController.getMe);

/**
 * PATCH /api/auth/change-password
 * Authenticated endpoint — validates current and new passwords
 */
router.patch(
	"/change-password",
	authenticate,
	validateBody(ChangePasswordSchema),
	AuthController.changePassword,
);

/**
 * POST /api/auth/forgot-password
 * Public endpoint — requests password reset
 * Returns success even if email doesn't exist (security)
 */
router.post(
	"/forgot-password",
	authLimiter,
	validateBody(ForgotPasswordSchema),
	AuthController.forgotPassword,
);

/**
 * POST /api/auth/reset-password
 * Public endpoint — resets password using token
 */
router.post(
	"/reset-password",
	authLimiter,
	validateBody(ResetPasswordSchema),
	AuthController.resetPassword,
);

export default router;

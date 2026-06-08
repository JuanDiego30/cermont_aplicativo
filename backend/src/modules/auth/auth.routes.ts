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

import { ChangePasswordSchema, ForgotPasswordSchema, LoginSchema, ResetPasswordSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validateBody } from "../../middlewares/validate";
import * as AuthController from "./auth.controller";

const router = Router();

/**
 * POST /api/auth/login
 * Public endpoint — no authentication required
 * Body validated against LoginSchema (Zod)
 */
router.post("/login", validateBody(LoginSchema), AuthController.login);

/**
 * POST /api/auth/refresh
 * Public endpoint — reads refreshToken from HttpOnly cookie
 * No body validation needed
 */
router.post("/refresh", AuthController.refresh);

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
router.post("/forgot-password", validateBody(ForgotPasswordSchema), AuthController.forgotPassword);

/**
 * POST /api/auth/reset-password
 * Public endpoint — resets password using token
 */
router.post("/reset-password", validateBody(ResetPasswordSchema), AuthController.resetPassword);

export default router;

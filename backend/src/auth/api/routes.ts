/**
 * Authentication Routes
 *
 * DOC-10 compliance:
 * - POST /api/auth/login — public
 * - POST /api/auth/refresh — public (reads cookie)
 * - POST /api/auth/logout — authenticated
 * - GET /api/auth/me — authenticated
 * - PATCH /api/auth/change-password — authenticated
 *
 * All inputs validated by middleware BEFORE controller.
 */

import {
	ChangePasswordSchema,
	ForgotPasswordSchema,
	LoginSchema,
	NoBodySchema,
	PasskeyCredentialParamsSchema,
	PasskeyLoginVerifySchema,
	PasskeyRegisterOptionsSchema,
	PasskeyRegisterVerifySchema,
	ResetPasswordSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../_shared/middlewares/auth.middleware";
import { authorizeAllAuthenticated } from "../../_shared/middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../_shared/middlewares/validate";
import * as AuthController from "./controller";
import * as PasskeyController from "./passkey.controller";

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
 */
router.post(
	"/logout",
	authenticate,
	authorizeAllAuthenticated(),
	validateBody(NoBodySchema),
	AuthController.logout,
);

/**
 * GET /api/auth/me
 * Protected endpoint — returns authenticated user's profile
 */
router.get("/me", authenticate, authorizeAllAuthenticated(), AuthController.getMe);

/**
 * PATCH /api/auth/change-password
 * Authenticated endpoint — validates current and new passwords
 */
router.patch(
	"/change-password",
	authenticate,
	authorizeAllAuthenticated(),
	validateBody(ChangePasswordSchema),
	AuthController.changePassword,
);

router.post("/forgot-password", validateBody(ForgotPasswordSchema), AuthController.forgotPassword);

router.post("/reset-password", validateBody(ResetPasswordSchema), AuthController.resetPassword);

router.get("/passkeys", authenticate, authorizeAllAuthenticated(), PasskeyController.listPasskeys);

router.post(
	"/passkeys/register/options",
	authenticate,
	authorizeAllAuthenticated(),
	validateBody(PasskeyRegisterOptionsSchema),
	PasskeyController.registrationOptions,
);

router.post(
	"/passkeys/register/verify",
	authenticate,
	authorizeAllAuthenticated(),
	validateBody(PasskeyRegisterVerifySchema),
	PasskeyController.verifyRegistration,
);

router.post("/passkeys/login/options", PasskeyController.loginOptions);

router.post(
	"/passkeys/login/verify",
	validateBody(PasskeyLoginVerifySchema),
	PasskeyController.verifyLogin,
);

router.delete(
	"/passkeys/:credentialId",
	authenticate,
	authorizeAllAuthenticated(),
	validateParams(PasskeyCredentialParamsSchema),
	PasskeyController.deletePasskey,
);

export default router;

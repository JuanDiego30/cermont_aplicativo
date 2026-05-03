import type {
	PasskeyLoginVerifyInput,
	PasskeyRegisterOptionsInput,
	PasskeyRegisterVerifyInput,
} from "@cermont/shared-types";
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/server";
import type { Request, Response } from "express";
import { sendSuccess } from "../../_shared/common/interceptors/response.interceptor";
import { requireUser } from "../../_shared/common/utils/request";
import * as PasskeyService from "../application/passkey.service";
import { setRefreshTokenCookie } from "./controller";

export async function listPasskeys(req: Request, res: Response): Promise<void> {
	const userContext = requireUser(req);
	const passkeys = await PasskeyService.listPasskeys(userContext._id);
	sendSuccess(res, passkeys);
}

export async function registrationOptions(req: Request, res: Response): Promise<void> {
	const userContext = requireUser(req);
	const _body = req.body as PasskeyRegisterOptionsInput;
	const options = await PasskeyService.generatePasskeyRegistrationOptions(userContext._id);
	sendSuccess(res, options);
}

export async function verifyRegistration(req: Request, res: Response): Promise<void> {
	const userContext = requireUser(req);
	const { credential, deviceLabel } = req.body as PasskeyRegisterVerifyInput;
	const passkeys = await PasskeyService.verifyPasskeyRegistration(
		userContext._id,
		credential as unknown as RegistrationResponseJSON,
		deviceLabel,
	);
	sendSuccess(res, passkeys);
}

export async function loginOptions(_req: Request, res: Response): Promise<void> {
	const options = await PasskeyService.generatePasskeyLoginOptions();
	sendSuccess(res, options);
}

export async function verifyLogin(req: Request, res: Response): Promise<void> {
	const { credential } = req.body as PasskeyLoginVerifyInput;
	const { accessToken, refreshToken, user } = await PasskeyService.verifyPasskeyLogin(
		credential as unknown as AuthenticationResponseJSON,
	);
	setRefreshTokenCookie(res, refreshToken);
	sendSuccess(res, { accessToken, user });
}

export async function deletePasskey(req: Request, res: Response): Promise<void> {
	const userContext = requireUser(req);
	const passkeys = await PasskeyService.deletePasskey(
		userContext._id,
		String(req.params.credentialId),
	);
	sendSuccess(res, passkeys);
}

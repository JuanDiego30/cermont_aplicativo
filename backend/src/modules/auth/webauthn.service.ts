import type {
	WebAuthnAuthenticationResponse,
	WebAuthnRegistrationResponse,
} from "@cermont/shared-types";
import type {
	AuthenticationResponseJSON,
	AuthenticatorTransportFuture,
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
	RegistrationResponseJSON,
	WebAuthnCredential,
} from "@simplewebauthn/server";
import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from "@simplewebauthn/server";
import {
	AppError,
	BadRequestError,
	NotFoundError,
	UnauthorizedError,
} from "../../common/errors/AppError";
import { env } from "../../config/env";
import { User } from "../../models";
import { createAuditLog } from "../audit/audit.service";
import { issueLoginSession, type LoginContract } from "./auth.service";

function getRpId(): string {
	return new URL(env.FRONTEND_URL).hostname;
}

function getExpectedOrigin(): string {
	return env.FRONTEND_URL;
}

export async function getRegistrationOptions(
	userId: string,
): Promise<PublicKeyCredentialCreationOptionsJSON> {
	const user = await User.findById(userId).select("+webauthnCredentials");
	if (!user) {
		throw new NotFoundError("User", userId);
	}

	const options = await generateRegistrationOptions({
		rpName: "CERMONT",
		rpID: getRpId(),
		userName: user.email,
		userDisplayName: user.name,
		attestationType: "none",
		excludeCredentials: user.webauthnCredentials.map((cred) => ({
			id: cred.credentialId,
			transports: cred.transports as AuthenticatorTransportFuture[] | undefined,
		})),
		authenticatorSelection: {
			residentKey: "preferred",
			userVerification: "preferred",
		},
	});

	user.webauthnChallenge = options.challenge;
	await user.save();

	return options;
}

export async function verifyRegistration(
	userId: string,
	response: WebAuthnRegistrationResponse,
	deviceName?: string,
): Promise<{ verified: boolean }> {
	const user = await User.findById(userId).select("+webauthnChallenge +webauthnCredentials");
	if (!user) {
		throw new NotFoundError("User", userId);
	}
	if (!user.webauthnChallenge) {
		throw new BadRequestError("No pending passkey registration for this user");
	}

	const verification = await verifyRegistrationResponse({
		response: response as RegistrationResponseJSON,
		expectedChallenge: user.webauthnChallenge,
		expectedOrigin: getExpectedOrigin(),
		expectedRPID: getRpId(),
	});

	user.webauthnChallenge = undefined;

	if (!verification.verified || !verification.registrationInfo) {
		await user.save();
		return { verified: false };
	}

	const { credential } = verification.registrationInfo;
	user.webauthnCredentials.push({
		credentialId: credential.id,
		publicKey: Buffer.from(credential.publicKey).toString("base64url"),
		counter: credential.counter,
		transports: credential.transports,
		deviceName,
		createdAt: new Date(),
	});
	await user.save();

	await createAuditLog({
		action: "PASSKEY_REGISTERED",
		entity: "User",
		entityId: user._id.toString(),
		userId: user._id.toString(),
		userEmail: user.email,
		metadata: { deviceName: deviceName || "" },
	});

	return { verified: true };
}

export async function getAuthenticationOptions(
	email: string,
): Promise<PublicKeyCredentialRequestOptionsJSON> {
	const user = await User.findOne({ email }).select("+webauthnCredentials");
	if (!user || user.webauthnCredentials.length === 0) {
		throw new BadRequestError("No passkeys registered for this account");
	}

	const options = await generateAuthenticationOptions({
		rpID: getRpId(),
		userVerification: "preferred",
		allowCredentials: user.webauthnCredentials.map((cred) => ({
			id: cred.credentialId,
			transports: cred.transports as AuthenticatorTransportFuture[] | undefined,
		})),
	});

	user.webauthnChallenge = options.challenge;
	await user.save();

	return options;
}

export async function verifyAuthentication(
	email: string,
	response: WebAuthnAuthenticationResponse,
): Promise<LoginContract> {
	const user = await User.findOne({ email }).select(
		"+webauthnChallenge +webauthnCredentials +tokenVersion",
	);
	if (!user) {
		throw new UnauthorizedError("Invalid passkey login attempt");
	}
	if (!user.isActive) {
		throw new UnauthorizedError("User account is deactivated");
	}
	if (!user.webauthnChallenge) {
		throw new BadRequestError("No pending passkey login for this account");
	}

	const storedCredential = user.webauthnCredentials.find(
		(cred) => cred.credentialId === response.id,
	);
	if (!storedCredential) {
		throw new UnauthorizedError("Passkey not recognized for this account");
	}

	const credential: WebAuthnCredential = {
		id: storedCredential.credentialId,
		publicKey: new Uint8Array(Buffer.from(storedCredential.publicKey, "base64url")),
		counter: storedCredential.counter,
		transports: storedCredential.transports as AuthenticatorTransportFuture[] | undefined,
	};

	const verification = await verifyAuthenticationResponse({
		response: response as AuthenticationResponseJSON,
		expectedChallenge: user.webauthnChallenge,
		expectedOrigin: getExpectedOrigin(),
		expectedRPID: getRpId(),
		credential,
	});

	user.webauthnChallenge = undefined;

	if (!verification.verified) {
		await user.save();
		throw new UnauthorizedError("Passkey verification failed");
	}

	storedCredential.counter = verification.authenticationInfo.newCounter;
	await user.save();

	if (!user.isActive) {
		throw new AppError("User account is deactivated", 401, "ACCOUNT_DEACTIVATED");
	}

	return issueLoginSession(user, "passkey");
}

import type { WebAuthnCredentialDocument } from "@cermont/shared-types";
import type {
	AuthenticationResponseJSON,
	AuthenticatorTransportFuture,
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
	RegistrationResponseJSON,
} from "@simplewebauthn/server";
import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from "@simplewebauthn/server";
import {
	BadRequestError,
	ConflictError,
	NotFoundError,
	UnauthorizedError,
} from "../../_shared/common/errors";
import { container } from "../../_shared/config/container";
import { env } from "../../_shared/config/env";
import {
	consumeAuthenticationChallenge,
	consumeRegistrationChallenge,
	rememberAuthenticationChallenge,
	rememberRegistrationChallenge,
} from "./passkey-challenge.store";
import type { LoginResponse } from "./service";
import { generateTokenPair } from "./service";

export interface PasskeySummary {
	credentialId: string;
	deviceLabel: string;
	transports: string[];
	createdAt: Date;
	lastUsedAt?: Date;
}

function getWebAuthnConfig() {
	const frontendUrl = new URL(env.FRONTEND_URL);
	return {
		rpName: "Cermont S.A.S.",
		rpID: frontendUrl.hostname,
		origin: frontendUrl.origin,
	};
}

function toPasskeySummary(credential: WebAuthnCredentialDocument): PasskeySummary {
	return {
		credentialId: credential.credentialId,
		deviceLabel: credential.deviceLabel || "Dispositivo sin nombre",
		transports: credential.transports ?? [],
		createdAt: credential.createdAt,
		lastUsedAt: credential.lastUsedAt,
	};
}

export async function listPasskeys(userId: string): Promise<PasskeySummary[]> {
	const user = await container.userRepository.findByIdLean(userId);
	if (!user) {
		throw new NotFoundError("User", userId);
	}
	return (user.webAuthnCredentials ?? []).map(toPasskeySummary);
}

export async function generatePasskeyRegistrationOptions(
	userId: string,
): Promise<PublicKeyCredentialCreationOptionsJSON> {
	const user = await container.userRepository.findByIdLean(userId);
	if (!user) {
		throw new NotFoundError("User", userId);
	}
	if (!user.isActive) {
		throw new UnauthorizedError("User account is deactivated");
	}

	const { rpName, rpID } = getWebAuthnConfig();
	const options = await generateRegistrationOptions({
		rpName,
		rpID,
		userID: new TextEncoder().encode(user._id),
		userName: user.email,
		userDisplayName: user.name,
		attestationType: "none",
		excludeCredentials: (user.webAuthnCredentials ?? []).map((credential) => ({
			id: credential.credentialId,
			transports: credential.transports as AuthenticatorTransportFuture[] | undefined,
		})),
		authenticatorSelection: {
			residentKey: "preferred",
			userVerification: "required",
		},
		preferredAuthenticatorType: "localDevice",
	});

	rememberRegistrationChallenge(user._id, options.challenge);
	return options;
}

export async function verifyPasskeyRegistration(
	userId: string,
	response: RegistrationResponseJSON,
	deviceLabel?: string,
): Promise<PasskeySummary[]> {
	const user = await container.userRepository.findByIdLean(userId);
	if (!user) {
		throw new NotFoundError("User", userId);
	}
	if (!user.isActive) {
		throw new UnauthorizedError("User account is deactivated");
	}

	const expectedChallenge = consumeRegistrationChallenge(user._id);
	if (!expectedChallenge) {
		throw new BadRequestError(
			"Passkey registration challenge expired",
			"PASSKEY_CHALLENGE_EXPIRED",
		);
	}

	const duplicate = await container.userRepository.findByWebAuthnCredentialId(response.id);
	if (duplicate) {
		throw new ConflictError("This passkey is already registered");
	}

	const { origin, rpID } = getWebAuthnConfig();
	const verification = await verifyRegistrationResponse({
		response,
		expectedChallenge,
		expectedOrigin: origin,
		expectedRPID: rpID,
		requireUserVerification: true,
	});

	if (!verification.verified) {
		throw new BadRequestError(
			"Passkey registration could not be verified",
			"PASSKEY_VERIFY_FAILED",
		);
	}

	const credential = verification.registrationInfo.credential;
	const now = new Date();
	const updated = await container.userRepository.addWebAuthnCredential(user._id, {
		credentialId: credential.id,
		publicKey: Buffer.from(credential.publicKey),
		counter: credential.counter,
		transports: credential.transports ?? response.response.transports ?? [],
		deviceLabel: deviceLabel?.trim() || "Dispositivo biométrico",
		createdAt: now,
	});

	return (updated?.webAuthnCredentials ?? []).map(toPasskeySummary);
}

export async function generatePasskeyLoginOptions(): Promise<PublicKeyCredentialRequestOptionsJSON> {
	const { rpID } = getWebAuthnConfig();
	const options = await generateAuthenticationOptions({
		rpID,
		userVerification: "required",
	});
	rememberAuthenticationChallenge(options.challenge);
	return options;
}

export async function verifyPasskeyLogin(
	response: AuthenticationResponseJSON,
): Promise<LoginResponse> {
	const user = await container.userRepository.findByWebAuthnCredentialId(response.id);
	if (!user) {
		throw new UnauthorizedError("Passkey is not registered");
	}
	if (!user.isActive) {
		throw new UnauthorizedError("User account is deactivated");
	}

	const credential = (user.webAuthnCredentials ?? []).find(
		(item) => item.credentialId === response.id,
	);
	if (!credential) {
		throw new UnauthorizedError("Passkey is not registered");
	}

	const { origin, rpID } = getWebAuthnConfig();
	const verification = await verifyAuthenticationResponse({
		response,
		expectedChallenge: async (challenge) => consumeAuthenticationChallenge(challenge),
		expectedOrigin: origin,
		expectedRPID: rpID,
		credential: {
			id: credential.credentialId,
			publicKey: new Uint8Array(credential.publicKey),
			counter: credential.counter,
			transports: credential.transports as AuthenticatorTransportFuture[] | undefined,
		},
		requireUserVerification: true,
	});

	if (!verification.verified) {
		throw new UnauthorizedError("Passkey authentication could not be verified");
	}

	await container.userRepository.updateWebAuthnCredentialCounter(
		verification.authenticationInfo.credentialID,
		verification.authenticationInfo.newCounter,
		new Date(),
	);

	const tokenPair = await generateTokenPair(user._id, user.email, user.role);
	return {
		accessToken: tokenPair.accessToken,
		refreshToken: tokenPair.refreshToken,
		user: {
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			isActive: user.isActive,
		},
	};
}

export async function deletePasskey(
	userId: string,
	credentialId: string,
): Promise<PasskeySummary[]> {
	const user = await container.userRepository.findByIdLean(userId);
	if (!user) {
		throw new NotFoundError("User", userId);
	}
	const hasCredential = (user.webAuthnCredentials ?? []).some(
		(credential) => credential.credentialId === credentialId,
	);
	if (!hasCredential) {
		throw new NotFoundError("Passkey", credentialId);
	}

	const updated = await container.userRepository.deleteWebAuthnCredential(userId, credentialId);
	return (updated?.webAuthnCredentials ?? []).map(toPasskeySummary);
}

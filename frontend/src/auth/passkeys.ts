"use client";

import type {
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";
import {
	browserSupportsWebAuthn,
	platformAuthenticatorIsAvailable,
	startAuthentication,
	startRegistration,
} from "@simplewebauthn/browser";
import { apiClient } from "@/_shared/lib/http/api-client";

interface ApiEnvelope<T> {
	success?: boolean;
	data?: T;
}

export interface PasskeySummary {
	credentialId: string;
	deviceLabel: string;
	transports: string[];
	createdAt: string;
	lastUsedAt?: string;
}

interface PasskeyLoginData {
	accessToken: string;
	user: {
		_id?: string;
		id?: string;
		email?: string | null;
		name?: string | null;
		role?: string;
	};
}

export function supportsWebAuthn(): boolean {
	return typeof window !== "undefined" && browserSupportsWebAuthn();
}

export async function hasPlatformAuthenticator(): Promise<boolean> {
	if (!supportsWebAuthn()) {
		return false;
	}
	return platformAuthenticatorIsAvailable();
}

export async function registerPasskey(deviceLabel?: string): Promise<PasskeySummary[]> {
	const optionsResponse = await apiClient.post<ApiEnvelope<PublicKeyCredentialCreationOptionsJSON>>(
		"/auth/passkeys/register/options",
		{ deviceLabel },
	);
	const optionsJSON = optionsResponse.data;
	if (!optionsJSON) {
		throw new Error("No se pudo iniciar el registro de huella.");
	}

	const credential = await startRegistration({ optionsJSON });
	const verifyResponse = await apiClient.post<ApiEnvelope<PasskeySummary[]>>(
		"/auth/passkeys/register/verify",
		{ credential, deviceLabel },
	);

	return verifyResponse.data ?? [];
}

export async function loginWithPasskey(): Promise<PasskeyLoginData> {
	const optionsResponse = await apiClient.post<ApiEnvelope<PublicKeyCredentialRequestOptionsJSON>>(
		"/auth/passkeys/login/options",
	);
	const optionsJSON = optionsResponse.data;
	if (!optionsJSON) {
		throw new Error("No se pudo iniciar el ingreso por huella.");
	}

	const credential = await startAuthentication({ optionsJSON });
	const verifyResponse = await apiClient.post<ApiEnvelope<PasskeyLoginData>>(
		"/auth/passkeys/login/verify",
		{ credential },
	);

	if (!verifyResponse.data?.accessToken || !verifyResponse.data.user) {
		throw new Error("No se pudo completar el ingreso por huella.");
	}

	return verifyResponse.data;
}

export async function listPasskeys(): Promise<PasskeySummary[]> {
	const response = await apiClient.get<ApiEnvelope<PasskeySummary[]>>("/auth/passkeys");
	return response.data ?? [];
}

export async function deletePasskey(credentialId: string): Promise<PasskeySummary[]> {
	const response = await apiClient.delete<ApiEnvelope<PasskeySummary[]>>(
		`/auth/passkeys/${credentialId}`,
	);
	return response.data ?? [];
}

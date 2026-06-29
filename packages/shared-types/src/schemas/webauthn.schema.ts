import { z } from "zod";

// ──────────────────────────────────────────────────────────────────────────────
// WebAuthn / Passkey JSON shapes — per W3C WebAuthn spec dictdefs
// (RegistrationResponseJSON / AuthenticationResponseJSON), as produced by
// @simplewebauthn/browser's startRegistration()/startAuthentication().
// ──────────────────────────────────────────────────────────────────────────────

const ClientExtensionResultsSchema = z.object({}).passthrough();

export const AuthenticatorAttestationResponseSchema = z
	.object({
		clientDataJSON: z.string(),
		attestationObject: z.string(),
		authenticatorData: z.string().optional(),
		transports: z.array(z.string()).optional(),
		publicKeyAlgorithm: z.number().optional(),
		publicKey: z.string().optional(),
	})
	.strict();

export const AuthenticatorAssertionResponseSchema = z
	.object({
		clientDataJSON: z.string(),
		authenticatorData: z.string(),
		signature: z.string(),
		userHandle: z.string().optional(),
	})
	.strict();

export const WebAuthnRegistrationResponseSchema = z
	.object({
		id: z.string(),
		rawId: z.string(),
		response: AuthenticatorAttestationResponseSchema,
		authenticatorAttachment: z.string().optional(),
		clientExtensionResults: ClientExtensionResultsSchema,
		type: z.literal("public-key"),
	})
	.strict();

export const WebAuthnAuthenticationResponseSchema = z
	.object({
		id: z.string(),
		rawId: z.string(),
		response: AuthenticatorAssertionResponseSchema,
		authenticatorAttachment: z.string().optional(),
		clientExtensionResults: ClientExtensionResultsSchema,
		type: z.literal("public-key"),
	})
	.strict();

export const WebAuthnRegisterVerifyRequestSchema = z
	.object({
		response: WebAuthnRegistrationResponseSchema,
		deviceName: z.string().max(100).optional(),
	})
	.strict();

export const WebAuthnLoginOptionsRequestSchema = z
	.object({
		email: z.string().email(),
	})
	.strict();

export const WebAuthnLoginVerifyRequestSchema = z
	.object({
		email: z.string().email(),
		response: WebAuthnAuthenticationResponseSchema,
	})
	.strict();

export type WebAuthnRegistrationResponse = z.infer<typeof WebAuthnRegistrationResponseSchema>;
export type WebAuthnAuthenticationResponse = z.infer<typeof WebAuthnAuthenticationResponseSchema>;
export type WebAuthnRegisterVerifyRequest = z.infer<typeof WebAuthnRegisterVerifyRequestSchema>;
export type WebAuthnLoginOptionsRequest = z.infer<typeof WebAuthnLoginOptionsRequestSchema>;
export type WebAuthnLoginVerifyRequest = z.infer<typeof WebAuthnLoginVerifyRequestSchema>;

import { normalizeUserRole, type UserRole } from "@cermont/shared-types/rbac";

export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

type JwtHeader = {
	alg?: string;
	typ?: string;
};

type RefreshTokenPayload = {
	sub?: string;
	_id?: string;
	role?: string;
	exp?: number;
	jti?: string;
};

export interface VerifiedRefreshTokenClaims {
	subjectId: string;
	role: UserRole;
	expiresAt: number;
	tokenId: string;
}

let cachedSecret = "";
let cachedKeyPromise: Promise<CryptoKey> | null = null;

function decodeBase64UrlToText(value: string): string {
	const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
	const padding = (4 - (normalized.length % 4)) % 4;
	const padded = `${normalized}${"=".repeat(padding)}`;
	const binary = atob(padded);
	const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

function decodeBase64UrlToBytes(value: string): ArrayBuffer {
	const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
	const padding = (4 - (normalized.length % 4)) % 4;
	const padded = `${normalized}${"=".repeat(padding)}`;
	const binary = atob(padded);
	const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
	return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function getRefreshTokenSecret(): string {
	return process.env.REFRESH_TOKEN_SECRET?.trim() ?? "";
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
	if (cachedSecret !== secret || cachedKeyPromise === null) {
		cachedSecret = secret;
		cachedKeyPromise = globalThis.crypto.subtle.importKey(
			"raw",
			new TextEncoder().encode(secret),
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["verify"],
		);
	}

	return cachedKeyPromise;
}

function parseJwt(token: string): {
	header: JwtHeader;
	payload: RefreshTokenPayload;
	signingInput: string;
	signature: ArrayBuffer;
} | null {
	const parts = token.split(".");
	if (parts.length !== 3) {
		return null;
	}

	const [encodedHeader, encodedPayload, encodedSignature] = parts;
	if (!encodedHeader || !encodedPayload || !encodedSignature) {
		return null;
	}

	try {
		return {
			header: JSON.parse(decodeBase64UrlToText(encodedHeader)) as JwtHeader,
			payload: JSON.parse(decodeBase64UrlToText(encodedPayload)) as RefreshTokenPayload,
			signingInput: `${encodedHeader}.${encodedPayload}`,
			signature: decodeBase64UrlToBytes(encodedSignature),
		};
	} catch {
		return null;
	}
}

function resolveSubjectId(payload: RefreshTokenPayload): string {
	if (typeof payload.sub === "string" && payload.sub.trim()) {
		return payload.sub.trim();
	}

	if (typeof payload._id === "string" && payload._id.trim()) {
		return payload._id.trim();
	}

	return "";
}

function isExpired(expiresAt: number): boolean {
	return expiresAt <= Math.floor(Date.now() / 1000);
}

export async function verifyRefreshToken(
	token: string,
): Promise<VerifiedRefreshTokenClaims | null> {
	if (!globalThis.crypto?.subtle) {
		return null;
	}

	const secret = getRefreshTokenSecret();
	if (!secret) {
		return null;
	}

	const parsedToken = parseJwt(token);
	if (!parsedToken || parsedToken.header.alg !== "HS256") {
		return null;
	}

	const signingKey = await getSigningKey(secret);
	const signatureIsValid = await globalThis.crypto.subtle.verify(
		"HMAC",
		signingKey,
		parsedToken.signature,
		new TextEncoder().encode(parsedToken.signingInput),
	);

	if (!signatureIsValid) {
		return null;
	}

	const subjectId = resolveSubjectId(parsedToken.payload);
	const role =
		typeof parsedToken.payload.role === "string"
			? normalizeUserRole(parsedToken.payload.role)
			: false;
	const expiresAt = parsedToken.payload.exp;
	const tokenId = typeof parsedToken.payload.jti === "string" ? parsedToken.payload.jti.trim() : "";

	if (
		!subjectId ||
		!role ||
		typeof expiresAt !== "number" ||
		!Number.isFinite(expiresAt) ||
		isExpired(expiresAt) ||
		!tokenId
	) {
		return null;
	}

	return {
		subjectId,
		role,
		expiresAt,
		tokenId,
	};
}

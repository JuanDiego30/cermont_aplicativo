const ERROR_MESSAGES: Record<string, string> = {
	INVALID_CREDENTIALS: "Correo o contraseña incorrectos.",
	ACCOUNT_LOCKED: "Tu cuenta ha sido bloqueada. Contacta a soporte.",
	TOO_MANY_ATTEMPTS: "Demasiados intentos. Intenta en 15 minutos.",
	ACCOUNT_DISABLED: "Tu cuenta ha sido deshabilitada. Contacta a soporte.",
	SESSION_EXPIRED: "Tu sesión ha expirado. Inicia sesión nuevamente.",
	SERVER_ERROR: "Error del servidor. Intenta más tarde.",
	NETWORK_ERROR: "Sin conexión a internet. Conéctese a una red para iniciar sesión.",
	VALIDATION_ERROR: "Verifique los campos e intente de nuevo.",
};

export function resolveLoginError<ErrorValue>(err: ErrorValue): string {
	if (!err) {
		return ERROR_MESSAGES.SERVER_ERROR;
	}

	if (err instanceof Error) {
		const msg = err.message;
		if (msg.includes("Invalid email or password")) {
			return ERROR_MESSAGES.INVALID_CREDENTIALS;
		}
		const knownCode = Object.keys(ERROR_MESSAGES).find(
			(code) => msg.includes(code) || msg.includes(ERROR_MESSAGES[code]),
		);
		if (knownCode) {
			return ERROR_MESSAGES[knownCode];
		}
		return msg;
	}

	if (typeof err === "object" && err !== null) {
		if ("code" in err && typeof err.code === "string" && ERROR_MESSAGES[err.code]) {
			return ERROR_MESSAGES[err.code];
		}
		if ("message" in err && typeof err.message === "string") {
			return err.message;
		}
	}

	return ERROR_MESSAGES.SERVER_ERROR;
}

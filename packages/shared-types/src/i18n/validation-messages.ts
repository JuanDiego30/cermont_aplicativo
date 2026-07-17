import { z } from "zod";

type ZodIssue = Parameters<Parameters<typeof z.setErrorMap>[0]>[0];

function handleTooSmall(issue: ZodIssue): { message: string } {
	const origin = issue.origin ?? "";
	if (origin === "string") {
		return { message: `Debe tener al menos ${issue.minimum} caracteres` };
	}
	if (origin === "number" || origin === "int" || origin === "bigint") {
		return { message: `Debe ser mayor o igual a ${issue.minimum}` };
	}
	if (origin === "array" || origin === "set") {
		return { message: `Debe tener al menos ${issue.minimum} elemento(s)` };
	}
	return { message: `Valor demasiado pequeño (mínimo: ${issue.minimum})` };
}

function handleTooBig(issue: ZodIssue): { message: string } {
	const origin = issue.origin ?? "";
	if (origin === "string") {
		return { message: `Debe tener máximo ${issue.maximum} caracteres` };
	}
	if (origin === "number" || origin === "int" || origin === "bigint") {
		return { message: `Debe ser menor o igual a ${issue.maximum}` };
	}
	return { message: `Valor demasiado grande (máximo: ${issue.maximum})` };
}

function handleInvalidType(issue: ZodIssue): { message: string } {
	if (issue.input === undefined || issue.input === null) {
		return { message: "Este campo es obligatorio" };
	}
	return { message: `Se esperaba ${issue.expected}` };
}

function handleInvalidFormat(issue: ZodIssue): { message: string } {
	if (issue.format === "email") {
		return { message: "Correo electrónico no válido" };
	}
	if (issue.format === "url") {
		return { message: "URL no válida" };
	}
	return { message: "Formato no válido" };
}

const spanishErrors: Parameters<typeof z.setErrorMap>[0] = (issue) => {
	switch (issue.code) {
		case z.ZodIssueCode.too_small:
			return handleTooSmall(issue);
		case z.ZodIssueCode.too_big:
			return handleTooBig(issue);
		case z.ZodIssueCode.invalid_type:
			return handleInvalidType(issue);
		case z.ZodIssueCode.invalid_format:
			return handleInvalidFormat(issue);
		default:
			return null;
	}
};

export function setSpanishErrorMap(): void {
	z.setErrorMap(spanishErrors);
}

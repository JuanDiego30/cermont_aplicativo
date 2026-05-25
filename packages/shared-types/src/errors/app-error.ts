export interface SerializedError {
	readonly message: string;
	readonly code?: string;
}

export function toSerializedError(error: unknown): SerializedError {
	if (error instanceof Error) {
		return { message: error.message };
	}
	if (typeof error === "string") {
		return { message: error };
	}
	return { message: "An unexpected error occurred" };
}

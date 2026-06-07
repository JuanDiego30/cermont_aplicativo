const TRANSIENT_DATABASE_ERROR_NAMES = new Set([
	"MongooseServerSelectionError",
	"MongoServerSelectionError",
	"MongoNetworkError",
	"MongoTimeoutError",
]);

export function isTransientDatabaseError(error: Error): boolean {
	if (TRANSIENT_DATABASE_ERROR_NAMES.has(error.name)) {
		return true;
	}

	return /topology was destroyed|connection (was closed|refused)|server selection/i.test(
		error.message,
	);
}

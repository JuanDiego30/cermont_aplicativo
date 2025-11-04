export function parseApiError(error) {
    if (error instanceof Error) {
        return error.message;
    }
    const apiError = error;
    return (apiError.response?.data?.error?.message ||
        apiError.response?.data?.message ||
        'Ha ocurrido un error. Por favor, intenta nuevamente.');
}
//# sourceMappingURL=error-handler.js.map
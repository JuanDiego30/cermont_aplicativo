export function parseApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  const apiError = error as {
    response?: {
      data?: {
        error?: { message?: string };
        message?: string;
      };
    };
  };

  return (
    apiError.response?.data?.error?.message ||
    apiError.response?.data?.message ||
    'Ha ocurrido un error. Por favor, intenta nuevamente.'
  );
}

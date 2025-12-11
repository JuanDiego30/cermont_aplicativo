// Error handling utilities

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(response: Response, data?: { message?: string; error?: string; code?: string }) {
    const message = data?.message || data?.error || response.statusText || 'Error desconocido';
    return new ApiError(message, response.status, data?.code);
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Error de conexión') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthError extends Error {
  constructor(message: string = 'No autorizado') {
    super(message);
    this.name = 'AuthError';
  }
}

// Error message mapping
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Datos inválidos',
  401: 'No autorizado. Por favor, inicia sesión nuevamente.',
  403: 'No tienes permisos para realizar esta acción',
  404: 'Recurso no encontrado',
  409: 'Conflicto con el estado actual del recurso',
  422: 'No se pudo procesar la solicitud',
  429: 'Demasiadas solicitudes. Intenta más tarde.',
  500: 'Error interno del servidor',
  502: 'Error de conexión con el servidor',
  503: 'Servicio no disponible temporalmente',
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return ERROR_MESSAGES[error.statusCode] || error.message;
  }
  
  if (error instanceof ValidationError) {
    return error.message;
  }
  
  if (error instanceof NetworkError) {
    return 'Error de conexión. Verifica tu internet.';
  }
  
  if (error instanceof AuthError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Ha ocurrido un error inesperado';
}

export function handleApiError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error;
  }
  
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    throw new NetworkError();
  }
  
  throw new ApiError(getErrorMessage(error));
}

// Error logging utility
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const errorInfo = {
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : 'UnknownError',
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  };
  
  // In production, send to error monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to Sentry, LogRocket, etc.
    console.error('[Error]', errorInfo);
  } else {
    console.error('[Error]', errorInfo);
  }
}

// Retry utility for failed requests
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2,
    shouldRetry = (error) => error instanceof NetworkError,
  } = options;

  let lastError: unknown;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < retries && shouldRetry(error)) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempt)));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

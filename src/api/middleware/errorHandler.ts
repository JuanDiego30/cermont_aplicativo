import type { NextFunction, Request, Response } from 'express';

const STATUS_TO_CODE: Record<number, string> = {
  400: 'bad_request',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
  409: 'conflict',
  422: 'validation_error',
  413: 'payload_too_large',
  415: 'unsupported_media_type',
  500: 'internal_server_error',
};

export class HttpError extends Error {
  public status: number;
  public code: string;
  public details?: unknown;

  constructor(status: number, message: string, details?: unknown, code?: string) {
    super(message);
    this.status = status;
    this.details = details;
    this.code = code ?? STATUS_TO_CODE[status] ?? 'error';
    this.name = 'HttpError';
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({
      code: error.code,
      message: error.message,
      details: error.details ?? null,
    });
  }

  console.error('Unhandled error', error);
  return res.status(500).json({
    code: 'internal_server_error',
    message: 'Error interno del servidor',
    details: null,
  });
}

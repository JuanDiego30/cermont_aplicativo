/**
 * @middleware RequestIdMiddleware
 *
 * Genera un ID único para cada request (correlación/tracing).
 * Permite seguir requests a través de logs y servicios distribuidos.
 *
 * Uso: Registrado globalmente en main.ts.
 * 
 * El requestId se puede acceder desde:
 * - Headers de response: x-request-id
 * - Request object: req.requestId
 * - Logs: contexto de LoggingInterceptor
 */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// Extender Request para incluir requestId
declare global {
    namespace Express {
        interface Request {
            requestId: string;
        }
    }
}

export const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void {
        // Usar el ID enviado por el cliente o generar uno nuevo
        const requestId = (req.headers[REQUEST_ID_HEADER] as string) || randomUUID();
        
        // Agregar al request para uso en la aplicación
        req.requestId = requestId;
        
        // Agregar al response para que el cliente pueda correlacionar
        res.setHeader(REQUEST_ID_HEADER, requestId);
        
        next();
    }
}

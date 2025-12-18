import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Guard personalizado para rate limiting
 * Extiende ThrottlerGuard con manejo de errores custom
 */
@Injectable()
export class CustomThrottleGuard extends ThrottlerGuard {
  protected async handleRequest(
    requestProps: any,
  ): Promise<boolean> {
    // Obtener IP del cliente
    const request = requestProps.context.switchToHttp().getRequest();
    const clientIp = request.ip || request.connection.remoteAddress;

    // Registrar intento
    console.warn(`⚠️  Rate limit check: ${clientIp} - ${request.path}`);

    return super.handleRequest(requestProps);
  }
}
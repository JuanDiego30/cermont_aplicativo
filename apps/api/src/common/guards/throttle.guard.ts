import { Injectable, Logger } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

/**
 * Guard personalizado para rate limiting
 * Extiende ThrottlerGuard con manejo de errores custom
 */
@Injectable()
export class CustomThrottleGuard extends ThrottlerGuard {
  private readonly logger = new Logger(CustomThrottleGuard.name);

  protected async handleRequest(requestProps: any): Promise<boolean> {
    const request = requestProps.context.switchToHttp().getRequest();
    const clientIp = request.ip ?? request.connection?.remoteAddress;
    const path = request.path;

    try {
      return await super.handleRequest(requestProps);
    } catch (error) {
      this.logger.warn(`Rate limit exceeded: ip=${clientIp} path=${path}`);
      throw error;
    }
  }
}

import { Injectable, Logger } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

/**
 * Guard personalizado para rate limiting
 * Extiende ThrottlerGuard con manejo de errores custom
 */
@Injectable()
export class CustomThrottleGuard extends ThrottlerGuard {
  private readonly logger = new Logger(CustomThrottleGuard.name);

  // handleRequest override removed to fix Throttler v5 compatibility
  // protected async handleRequest(requestProps: any): Promise<boolean> {
  //   return super.handleRequest(requestProps);
  // }
}

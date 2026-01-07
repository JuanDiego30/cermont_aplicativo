/**
 * Port: IJwtService
 * @description Interface for JWT operations (port in domain layer)
 * @layer Domain
 */

import { JwtPayload } from "../value-objects/jwt-token.vo";

export interface IJwtService {
  /**
   * Sign a JWT token with the given payload
   */
  sign(payload: Record<string, unknown>): string;

  /**
   * Verify and decode a JWT token
   */
  verify<T extends object = JwtPayload>(token: string): T;
}


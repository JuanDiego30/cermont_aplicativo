/**
 * Adapter: NestJwtServiceAdapter
 * @description Adapter that implements IJwtService using NestJS JwtService
 * @layer Infrastructure
 */

import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { IJwtService } from "../../domain/ports/jwt-service.port";

@Injectable()
export class NestJwtServiceAdapter implements IJwtService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: Record<string, unknown>): string {
    return this.jwtService.sign(payload);
  }

  verify<T extends object = Record<string, unknown>>(token: string): T {
    return this.jwtService.verify<T>(token);
  }
}


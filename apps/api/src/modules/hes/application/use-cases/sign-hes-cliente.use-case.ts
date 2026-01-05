/**
 * Use Case: SignHESClienteUseCase
 *
 * Firma una HES por parte del cliente.
 * Delega la lógica a HesSignService.
 */

import { Injectable } from "@nestjs/common";
import { HES } from "../../domain/entities/hes.entity";
import { SignHESDto } from "../dto/sign-hes.dto";
import { HesSignService } from "../services/hes-sign.service";

@Injectable()
export class SignHESClienteUseCase {
  constructor(private readonly signService: HesSignService) {}

  async execute(
    hesId: string,
    dto: SignHESDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<HES> {
    return this.signService.sign({
      hesId,
      dto,
      signerType: "cliente",
      ipAddress,
      userAgent,
    });
  }
}

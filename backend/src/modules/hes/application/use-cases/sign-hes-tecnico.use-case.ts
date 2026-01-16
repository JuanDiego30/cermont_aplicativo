/**
 * Use Case: SignHESTecnicoUseCase
 *
 * Firma una HES por parte del técnico.
 * Delega la lógica a HesSignService.
 */

import { Injectable } from '@nestjs/common';
import { HES } from '../../domain/entities/hes.entity';
import { SignHESDto } from '../dto/sign-hes.dto';
import { HesSignService } from '../services/hes-sign.service';

@Injectable()
export class SignHESTecnicoUseCase {
  constructor(private readonly signService: HesSignService) {}

  async execute(
    hesId: string,
    dto: SignHESDto,
    tecnicoId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<HES> {
    return this.signService.sign({
      hesId,
      dto,
      signerType: 'tecnico',
      tecnicoId,
      ipAddress,
      userAgent,
    });
  }
}

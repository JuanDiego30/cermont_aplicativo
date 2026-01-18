import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TotpService } from '../../infrastructure/services/totp.service';

export interface SetupTotpResult {
  secret: string;
  qrCode: string;
}

@Injectable()
export class SetupTotpUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly totpService: TotpService,
  ) {}

  async execute(userId: string, email: string): Promise<SetupTotpResult> {
    const secret = this.totpService.generateSecret();
    const otpauthUrl = this.totpService.generateKeyUri(email, 'Cermont App', secret);
    const qrCode = await this.totpService.generateQrCode(otpauthUrl);

    // Save secret to user (plain text for MVP)
    // In a real production scenario, encrypt this secret!
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return { secret, qrCode };
  }
}

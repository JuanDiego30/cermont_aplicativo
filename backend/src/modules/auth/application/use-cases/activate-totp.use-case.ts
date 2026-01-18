import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TotpService } from '../../infrastructure/services/totp.service';

@Injectable()
export class ActivateTotpUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly totpService: TotpService
  ) {}

  async execute(userId: string, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException(' TOTP setup not initiated');
    }

    const isValid = await this.totpService.verify(code, user.twoFactorSecret);

    if (!isValid) {
      throw new UnauthorizedException('Invalid TOTP code');
    }

    // Enable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return true;
  }
}

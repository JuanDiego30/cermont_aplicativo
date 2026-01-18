import { Injectable } from '@nestjs/common';
import { generateSecret, generateURI, verify } from 'otplib';
import * as qrcode from 'qrcode';

@Injectable()
export class TotpService {
  constructor() {}

  generateSecret(): string {
    return generateSecret();
  }

  generateKeyUri(email: string, appName: string, secret: string): string {
    return generateURI({
      issuer: appName,
      label: email,
      secret,
    });
  }

  async generateQrCode(otpauthUrl: string): Promise<string> {
    return qrcode.toDataURL(otpauthUrl);
  }

  async verify(token: string, secret: string): Promise<boolean> {
    const result = await verify({ token, secret });
    // In otplib v13 verify returns { valid: boolean, delta: number }? 
    // Wait, the d.ts said VerifyResult = VerifyResult$1 | VerifyResult$2
    // I should check if result is just boolean? No, verify returns VerifyResult object.
    // I will assume it has 'valid' property.
    // Actually, checking d.ts again: "Returns: { valid: true, delta: 0 }"
    if (result && typeof result === 'object' && 'valid' in result) {
        return result.valid;
    }
    return false;
  }
}

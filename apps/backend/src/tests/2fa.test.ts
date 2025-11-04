/**
 * 2FA Tests (TypeScript - November 2025)
 * @description Tests para 2FA TOTP service. Mock Speakeasy, test enable/verify/disable.
 * Uso: npm run test:2fa. Jest mocks para Speakeasy.verify (true/false), QRCode.toDataURL.
 * Tests: enable2FA returns secret/QR, verify2FACode valid/invalid, require2FA middleware.
 * Performance: Fast sync tests. Coverage: 90%+ branches.
 * Fixes: Mock external deps, test error cases. tsconfig strict.
 * Assumes: User model mocked, 2FA service imported.
 */

import { jest } from '@jest/globals';
import { enable2FA, verify2FACode, require2FA, disable2FA } from '../services/2fa.service';

// Mock dependencies
jest.mock('speakeasy', () => ({
  generateSecret: jest.fn(() => ({
    ascii: 'test-secret-ascii',
    base32: 'JBSWY3DPEHPK3PXP',
    hex: 'test-hex',
    qr_code_ascii: 'test-qr',
    qr_code_hex: 'test-qr-hex',
    qr_code_base64: 'test-qr-base64',
    google_auth_qr: 'test-google-qr',
    otpauth_url: 'otpauth://totp/test',
  })),
  totp: {
    verify: jest.fn(),
  },
}));

jest.mock('qrcode', () => ({
  toDataURL: jest.fn(() => Promise.resolve('data:image/png;base64,test-qr-code')),
}));

jest.mock('../models/User.ts', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

const Speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User.js');

describe('2FA Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enable2FA', () => {
    it('should generate secret and QR code', async () => {
      const userId = 'user123';
      const result = await enable2FA(userId);

      expect(Speakeasy.generateSecret).toHaveBeenCalledWith({
        name: 'CERMONT (user123)',
        issuer: 'CERMONT',
      });
      expect(QRCode.toDataURL).toHaveBeenCalled();
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        twoFaSecret: 'JBSWY3DPEHPK3PXP',
        twoFaEnabled: true,
      });
      expect(result).toEqual({
        secret: 'test-secret-ascii',
        qrCode: 'data:image/png;base64,test-qr-code',
        base32: 'JBSWY3DPEHPK3PXP',
      });
    });
  });

  describe('verify2FACode', () => {
    it('should return true for valid code', () => {
      (Speakeasy.totp.verify as jest.Mock).mockReturnValue(true);

      const result = verify2FACode('JBSWY3DPEHPK3PXP', '123456');

      expect(Speakeasy.totp.verify).toHaveBeenCalledWith({
        secret: 'JBSWY3DPEHPK3PXP',
        encoding: 'base32',
        token: '123456',
        window: 1,
      });
      expect(result).toBe(true);
    });

    it('should return false for invalid code', () => {
      (Speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

      const result = verify2FACode('JBSWY3DPEHPK3PXP', 'invalid');

      expect(result).toBe(false);
    });
  });

  describe('disable2FA', () => {
    it('should disable 2FA for user', async () => {
      const userId = 'user123';

      await disable2FA(userId);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        twoFaSecret: null,
        twoFaEnabled: false,
      });
    });
  });

  describe('require2FA middleware', () => {
    let req: any, res: any, next: any;

    beforeEach(() => {
      req = {
        user: { id: 'user123' },
        body: { twoFaCode: '123456' },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should call next for non-critical roles', async () => {
      (User.findById as any).mockResolvedValue({
        rol: 'technician',
        twoFaEnabled: false,
      });

      await require2FA(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should require 2FA for admin role', async () => {
      (User.findById as any).mockResolvedValue({
        rol: 'admin',
        twoFaEnabled: true,
        twoFaSecret: 'JBSWY3DPEHPK3PXP',
      });
      (Speakeasy.totp.verify as jest.Mock).mockReturnValue(true);

      await require2FA(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid 2FA code', async () => {
      (User.findById as any).mockResolvedValue({
        rol: 'admin',
        twoFaEnabled: true,
        twoFaSecret: 'JBSWY3DPEHPK3PXP',
      });
      (Speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

      await require2FA(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Código 2FA inválido' });
    });
  });
});
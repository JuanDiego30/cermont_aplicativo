/**
 * @test Password Value Object Unit Tests
 */

import { Password } from '../../../domain/value-objects/password.vo';

describe('Password Value Object', () => {
  describe('createFromPlainText', () => {
    it('should create a valid password with strong credentials', async () => {
      const password = await Password.createFromPlainText('SecurePass123!');
      
      expect(password).toBeDefined();
      expect(password.getHash()).toBeDefined();
      expect(password.getHash().length).toBeGreaterThan(20);
    });

    it('should throw error for password too short', async () => {
      await expect(Password.createFromPlainText('Short1!')).rejects.toThrow(
        'Debe tener al menos 8 caracteres',
      );
    });

    it('should throw error for password without uppercase', async () => {
      await expect(Password.createFromPlainText('lowercase123!')).rejects.toThrow(
        'Debe contener al menos una mayúscula',
      );
    });

    it('should throw error for password without lowercase', async () => {
      await expect(Password.createFromPlainText('UPPERCASE123!')).rejects.toThrow(
        'Debe contener al menos una minúscula',
      );
    });

    it('should throw error for password without number', async () => {
      await expect(Password.createFromPlainText('NoNumbers!')).rejects.toThrow(
        'Debe contener al menos un número',
      );
    });
  });

  describe('fromHash', () => {
    it('should create password from valid hash', () => {
      const validHash = '$2a$10$validhashstringhere1234567890abc';
      const password = Password.fromHash(validHash);
      
      expect(password.getHash()).toBe(validHash);
    });

    it('should throw error for invalid hash', () => {
      expect(() => Password.fromHash('shorthash')).toThrow('Hash de password inválido');
      expect(() => Password.fromHash('')).toThrow('Hash de password inválido');
    });
  });

  describe('matches', () => {
    it('should return true for matching password', async () => {
      const plainPassword = 'SecurePass123!';
      const password = await Password.createFromPlainText(plainPassword);
      
      const matches = await password.matches(plainPassword);
      
      expect(matches).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = await Password.createFromPlainText('SecurePass123!');
      
      const matches = await password.matches('WrongPassword123!');
      
      expect(matches).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should return valid for strong password', () => {
      const result = Password.validatePasswordStrength('SecurePass123!');
      
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(4);
    });

    it('should return invalid for weak password', () => {
      const result = Password.validatePasswordStrength('weak');
      
      expect(result.isValid).toBe(false);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should return feedback for missing criteria', () => {
      const result = Password.validatePasswordStrength('onlylowercase');
      
      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('Debe contener al menos una mayúscula');
      expect(result.feedback).toContain('Debe contener al menos un número');
    });
  });

  describe('generateTemporary', () => {
    it('should generate password of specified length', () => {
      const password = Password.generateTemporary(16);
      
      expect(password.length).toBe(16);
    });

    it('should generate password with default length', () => {
      const password = Password.generateTemporary();
      
      expect(password.length).toBe(12);
    });

    it('should generate password that meets strength requirements', () => {
      const password = Password.generateTemporary();
      const validation = Password.validatePasswordStrength(password);
      
      expect(validation.isValid).toBe(true);
    });
  });
});

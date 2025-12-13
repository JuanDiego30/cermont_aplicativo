/**
 * @test Email Value Object Unit Tests
 */

import { Email } from '../../../domain/value-objects/email.vo';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const email = Email.create('test@example.com');
      
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = Email.create('Test@EXAMPLE.COM');
      
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const email = Email.create('  test@example.com  ');
      
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should throw error for invalid email format', () => {
      expect(() => Email.create('invalid-email')).toThrow('Email inválido');
      expect(() => Email.create('no@domain')).toThrow('Email inválido');
      expect(() => Email.create('@nodomain.com')).toThrow('Email inválido');
      expect(() => Email.create('missing@.com')).toThrow('Email inválido');
    });

    it('should throw error for empty email', () => {
      expect(() => Email.create('')).toThrow('Email inválido');
    });

    it('should throw error for email exceeding max length', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      expect(() => Email.create(longEmail)).toThrow('Email inválido');
    });
  });

  describe('getDomain', () => {
    it('should return email domain', () => {
      const email = Email.create('user@cermont.com');
      
      expect(email.getDomain()).toBe('cermont.com');
    });
  });

  describe('getLocalPart', () => {
    it('should return local part of email', () => {
      const email = Email.create('user@cermont.com');
      
      expect(email.getLocalPart()).toBe('user');
    });
  });

  describe('equals', () => {
    it('should return true for equal emails', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');
      
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');
      
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('isCorporate', () => {
    it('should return true for corporate domain', () => {
      const email = Email.create('user@cermont.com');
      
      expect(email.isCorporate(['cermont.com', 'company.com'])).toBe(true);
    });

    it('should return false for non-corporate domain', () => {
      const email = Email.create('user@gmail.com');
      
      expect(email.isCorporate(['cermont.com', 'company.com'])).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return email string', () => {
      const email = Email.create('test@example.com');
      
      expect(email.toString()).toBe('test@example.com');
    });
  });
});

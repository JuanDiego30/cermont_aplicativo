/**
 * Tests unitarios para catchUtils
 */

import { getErrorMessage, getErrorStack, isAppError } from '../../shared/utils/catchUtils';
import { AppError } from '../../shared/errors';

describe('catchUtils', () => {
  describe('getErrorMessage', () => {
    it('debería extraer mensaje de un Error estándar', () => {
      const error = new Error('Test error message');
      expect(getErrorMessage(error)).toBe('Test error message');
    });

    it('debería extraer mensaje de un AppError', () => {
      const error = new AppError('Custom app error', 400);
      expect(getErrorMessage(error)).toBe('Custom app error');
    });

    it('debería manejar un string como error', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('debería manejar un objeto con propiedad message', () => {
      const error = { message: 'Object error' };
      expect(getErrorMessage(error)).toBe('Object error');
    });

    it('debería retornar mensaje por defecto para undefined', () => {
      expect(getErrorMessage(undefined)).toBe('Error desconocido');
    });

    it('debería retornar mensaje por defecto para null', () => {
      expect(getErrorMessage(null)).toBe('Error desconocido');
    });

    it('debería retornar mensaje por defecto para objeto vacío', () => {
      expect(getErrorMessage({})).toBe('Error desconocido');
    });

    it('debería usar mensaje personalizado por defecto', () => {
      expect(getErrorMessage(null, 'Custom default')).toBe('Custom default');
    });
  });

  describe('getErrorStack', () => {
    it('debería extraer stack de un Error', () => {
      const error = new Error('Test');
      const stack = getErrorStack(error);
      expect(stack).toContain('Error: Test');
    });

    it('debería retornar undefined para non-Error', () => {
      expect(getErrorStack('string')).toBeUndefined();
      expect(getErrorStack(null)).toBeUndefined();
      expect(getErrorStack({})).toBeUndefined();
    });
  });

  describe('isAppError', () => {
    it('debería retornar true para AppError', () => {
      const error = new AppError('Test', 400);
      expect(isAppError(error)).toBe(true);
    });

    it('debería retornar false para Error estándar', () => {
      const error = new Error('Test');
      expect(isAppError(error)).toBe(false);
    });

    it('debería retornar false para non-Error', () => {
      expect(isAppError('string')).toBe(false);
      expect(isAppError(null)).toBe(false);
      expect(isAppError({})).toBe(false);
    });
  });
});

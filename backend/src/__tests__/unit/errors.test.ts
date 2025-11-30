/**
 * Tests unitarios para AppError y tipos de error
 */

import { 
  AppError, 
  ValidationError, 
  NotFoundError, 
  AuthenticationError,
  AuthorizationError,
  ConflictError 
} from '../../../shared/errors';

describe('Error Types', () => {
  describe('AppError', () => {
    it('debería crear error con mensaje y código', () => {
      const error = new AppError('Test error', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    it('debería tener stack trace', () => {
      const error = new AppError('Test', 500);
      expect(error.stack).toBeDefined();
    });

    it('debería ser instancia de Error', () => {
      const error = new AppError('Test', 400);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('debería crear error de validación con código 400', () => {
      const error = new ValidationError('Campo inválido');
      
      expect(error.message).toBe('Campo inválido');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('debería aceptar detalles adicionales', () => {
      const error = new ValidationError('Campo inválido', { field: 'email' });
      
      expect(error.details).toEqual({ field: 'email' });
    });
  });

  describe('NotFoundError', () => {
    it('debería crear error 404', () => {
      const error = new NotFoundError('Usuario no encontrado');
      
      expect(error.message).toBe('Usuario no encontrado');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('debería usar mensaje por defecto', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Recurso no encontrado');
    });
  });

  describe('AuthenticationError', () => {
    it('debería crear error 401', () => {
      const error = new AuthenticationError('Token inválido');
      
      expect(error.message).toBe('Token inválido');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });

    it('debería usar mensaje por defecto', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('No autenticado');
    });
  });

  describe('AuthorizationError', () => {
    it('debería crear error 403', () => {
      const error = new AuthorizationError('Sin permisos');
      
      expect(error.message).toBe('Sin permisos');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
    });

    it('debería usar mensaje por defecto', () => {
      const error = new AuthorizationError();
      expect(error.message).toBe('No autorizado');
    });
  });

  describe('ConflictError', () => {
    it('debería crear error 409', () => {
      const error = new ConflictError('Email ya existe');
      
      expect(error.message).toBe('Email ya existe');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
    });

    it('debería usar mensaje por defecto', () => {
      const error = new ConflictError();
      expect(error.message).toBe('Conflicto de recursos');
    });
  });
});

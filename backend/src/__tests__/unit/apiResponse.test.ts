/**
 * Tests unitarios para apiResponse utilities
 * 
 * Estas funciones implementan RFC 7807 Problem Details para errores
 */

import { Response } from 'express';
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendUnprocessable,
  sendInternalError,
  sendPaginated,
  createProblemDetails,
  apiResponse,
} from '../../shared/utils/apiResponse';

// Mock de Response
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('apiResponse utilities', () => {
  describe('createProblemDetails', () => {
    it('debería crear estructura RFC 7807', () => {
      const problem = createProblemDetails(400, 'Bad Request', 'Datos inválidos');

      expect(problem).toEqual({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: 'Datos inválidos',
      });
    });

    it('debería incluir instance si se proporciona', () => {
      const problem = createProblemDetails(404, 'Not Found', 'No existe', '/api/users/123');

      expect(problem.instance).toBe('/api/users/123');
    });

    it('debería incluir extensiones', () => {
      const problem = createProblemDetails(
        422,
        'Unprocessable',
        'Validación fallida',
        undefined,
        { errors: { email: 'Inválido' } }
      );

      expect(problem.errors).toEqual({ email: 'Inválido' });
    });
  });

  describe('sendSuccess', () => {
    it('debería enviar respuesta 200 con datos', () => {
      const res = mockResponse();
      const data = { id: 1, name: 'Test' };

      sendSuccess(res, data);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('debería permitir status personalizado', () => {
      const res = mockResponse();

      sendSuccess(res, { id: 1 }, 202);

      expect(res.status).toHaveBeenCalledWith(202);
    });

    it('debería incluir mensaje si se proporciona', () => {
      const res = mockResponse();

      sendSuccess(res, { id: 1 }, 200, 'Operación exitosa');

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1 },
        message: 'Operación exitosa',
      });
    });
  });

  describe('sendCreated', () => {
    it('debería enviar respuesta 201', () => {
      const res = mockResponse();
      const data = { id: 'new-id' };

      sendCreated(res, data);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('debería incluir mensaje', () => {
      const res = mockResponse();

      sendCreated(res, { id: 1 }, 'Recurso creado');

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Recurso creado',
        })
      );
    });
  });

  describe('sendNoContent', () => {
    it('debería enviar respuesta 204 sin cuerpo', () => {
      const res = mockResponse();

      sendNoContent(res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('sendBadRequest', () => {
    it('debería enviar error 400 RFC 7807', () => {
      const res = mockResponse();

      sendBadRequest(res, 'Datos inválidos');

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: 'Datos inválidos',
      });
    });

    it('debería aceptar extensiones', () => {
      const res = mockResponse();

      sendBadRequest(res, 'Campo faltante', { field: 'email' });

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          field: 'email',
        })
      );
    });
  });

  describe('sendUnauthorized', () => {
    it('debería enviar error 401 con mensaje por defecto', () => {
      const res = mockResponse();

      sendUnauthorized(res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Unauthorized',
          detail: 'Autenticación requerida',
        })
      );
    });

    it('debería aceptar mensaje personalizado', () => {
      const res = mockResponse();

      sendUnauthorized(res, 'Token expirado');

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: 'Token expirado',
        })
      );
    });
  });

  describe('sendForbidden', () => {
    it('debería enviar error 403', () => {
      const res = mockResponse();

      sendForbidden(res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Forbidden',
          status: 403,
        })
      );
    });

    it('debería aceptar mensaje personalizado', () => {
      const res = mockResponse();

      sendForbidden(res, 'Solo administradores');

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: 'Solo administradores',
        })
      );
    });
  });

  describe('sendNotFound', () => {
    it('debería enviar error 404 genérico', () => {
      const res = mockResponse();

      sendNotFound(res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: 'Recurso no encontrado',
        })
      );
    });

    it('debería incluir nombre del recurso', () => {
      const res = mockResponse();

      sendNotFound(res, 'Usuario');

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: 'Usuario no encontrado',
        })
      );
    });

    it('debería incluir ID del recurso', () => {
      const res = mockResponse();

      sendNotFound(res, 'Usuario', '123');

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: 'Usuario con ID 123 no encontrado',
        })
      );
    });
  });

  describe('sendConflict', () => {
    it('debería enviar error 409', () => {
      const res = mockResponse();

      sendConflict(res, 'Email ya existe');

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Conflict',
          detail: 'Email ya existe',
        })
      );
    });
  });

  describe('sendUnprocessable', () => {
    it('debería enviar error 422', () => {
      const res = mockResponse();

      sendUnprocessable(res, 'Validación fallida');

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Unprocessable Entity',
          detail: 'Validación fallida',
        })
      );
    });

    it('debería incluir errores de validación', () => {
      const res = mockResponse();

      sendUnprocessable(res, 'Validación fallida', {
        email: 'Formato inválido',
        password: 'Muy corta',
      });

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: {
            email: 'Formato inválido',
            password: 'Muy corta',
          },
        })
      );
    });
  });

  describe('sendInternalError', () => {
    it('debería enviar error 500 con mensaje por defecto', () => {
      const res = mockResponse();

      sendInternalError(res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Internal Server Error',
          detail: 'Ha ocurrido un error interno del servidor',
        })
      );
    });

    it('debería aceptar mensaje personalizado', () => {
      const res = mockResponse();

      sendInternalError(res, 'Error de base de datos');

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: 'Error de base de datos',
        })
      );
    });
  });

  describe('sendPaginated', () => {
    it('debería incluir metadatos de paginación', () => {
      const res = mockResponse();
      const data = [{ id: 1 }, { id: 2 }];

      sendPaginated(res, data, {
        page: 1,
        limit: 10,
        total: 100,
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 100,
          totalPages: 10,
        },
      });
    });

    it('debería calcular totalPages correctamente', () => {
      const res = mockResponse();

      sendPaginated(res, [], {
        page: 1,
        limit: 7,
        total: 50,
      });

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            totalPages: 8, // Math.ceil(50/7) = 8
          }),
        })
      );
    });

    it('debería manejar datos vacíos', () => {
      const res = mockResponse();

      sendPaginated(res, [], {
        page: 1,
        limit: 10,
        total: 0,
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });
  });

  describe('apiResponse convenience object', () => {
    it('debería tener todas las funciones disponibles', () => {
      expect(apiResponse.success).toBe(sendSuccess);
      expect(apiResponse.created).toBe(sendCreated);
      expect(apiResponse.noContent).toBe(sendNoContent);
      expect(apiResponse.badRequest).toBe(sendBadRequest);
      expect(apiResponse.unauthorized).toBe(sendUnauthorized);
      expect(apiResponse.forbidden).toBe(sendForbidden);
      expect(apiResponse.notFound).toBe(sendNotFound);
      expect(apiResponse.conflict).toBe(sendConflict);
      expect(apiResponse.unprocessable).toBe(sendUnprocessable);
      expect(apiResponse.internalError).toBe(sendInternalError);
      expect(apiResponse.paginated).toBe(sendPaginated);
      expect(apiResponse.problem).toBe(createProblemDetails);
    });
  });
});

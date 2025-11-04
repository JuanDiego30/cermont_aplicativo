/**
 * Swagger/OpenAPI Configuration (TypeScript - November 2025)
 * @description Generación dinámica de spec OpenAPI v3 para documentación de API CERMONT ATG.
 * Uso: import getSwaggerSpec from './config/swagger'; app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(getSwaggerSpec()));
 * Env: SWAGGER_ENABLED=true (default dev), API_BASE_URL, API_VERSION, CONTACT_EMAIL.
 * Integrado con: swagger-jsdoc (JSDoc parsing), logger. Secure: Disabled en prod por default.
 * Performance: Lazy init (singleton spec gen). Types: swagger-jsdoc@^6, @types/swagger-jsdoc.
 */

import swaggerJsdoc, { OAS3Definition, OAS3Options } from 'swagger-jsdoc';
import { logger } from '../utils/logger.js';

// Cache del spec generado (singleton)
let swaggerSpec: any | null = null;

/**
 * Obtener opciones de configuración de Swagger
 * @returns Opciones de Swagger o null si está deshabilitado
 */
const getSwaggerOptions = (): OAS3Options | null => {
  const isProduction: boolean = process.env.NODE_ENV === 'production';
  const swaggerEnabled: boolean = process.env.SWAGGER_ENABLED !== 'false';

  // Deshabilitar en producción por default
  if (isProduction && !swaggerEnabled) {
    logger.info('📚 Swagger/OpenAPI deshabilitado en producción');
    return null;
  }

  // Validar y derivar base URL
  const apiBaseUrl: string = process.env.API_BASE_URL || 
    (isProduction ? 'https://api.cermont.com' : 'http://localhost:4100');
  const fallbackUrl: string = isProduction ? apiBaseUrl : 'http://localhost:4000';

  // Validación de variables de entorno
  if (!process.env.API_VERSION) {
    logger.warn('⚠️ API_VERSION no definido en .env, usando default 1.0.0');
  }
  if (!process.env.CONTACT_EMAIL) {
    logger.warn('⚠️ CONTACT_EMAIL no definido en .env, usando default');
  }

  // Definición OpenAPI 3.0
  const definition: OAS3Definition = {
    openapi: '3.0.0',
    info: {
      title: 'CERMONT ATG - API Backend',
      version: process.env.API_VERSION || '1.0.0',
      description: `
        Backend API para el sistema de gestión de órdenes de trabajo de CERMONT SAS.

        **Características principales:**
        - Autenticación JWT con refresh tokens y rotación
        - Sistema de roles y permisos (RBAC)
        - Auditoría completa de operaciones
        - Caching inteligente con invalidación automática
        - Rate limiting por IP/usuario
        - Compresión de respuestas (gzip/brotli)
        - Paginación cursor-based y offset

        **Seguridad:**
        - HTTPS con certificados SSL
        - Sanitización de inputs (XSS/NoSQL injection)
        - Token blacklist para revocación inmediata
        - Security headers (CSP, HSTS, X-Frame-Options)
        - Validación estricta con Joi/Zod

        **Performance:**
        - Cache in-memory con TTL configurable
        - Compresión adaptativa
        - Índices MongoDB optimizados
        - Queries lean() para mejor rendimiento
      `,
      contact: {
        name: 'CERMONT SAS - Soporte Técnico',
        email: process.env.CONTACT_EMAIL || 'soporte@cermont.com',
        url: process.env.CONTACT_URL || 'https://cermont.com',
      },
      license: {
        name: 'Propietario',
        url: process.env.LICENSE_URL || 'https://cermont.com/licencia',
      },
    },
    externalDocs: {
      description: 'Guía completa de integración API',
      url: 'https://docs.cermont.com/api',
    },
    servers: [
      {
        url: apiBaseUrl,
        description: `${isProduction ? 'Producción' : 'Desarrollo'} (HTTPS)`,
      },
      ...(isProduction ? [] : [
        { 
          url: fallbackUrl, 
          description: 'Desarrollo (HTTP auxiliar para testing local)' 
        }
      ]),
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint /api/v1/auth/login. Incluir en header: `Authorization: Bearer <token>`',
        },
      },
      schemas: {
        // ==================== USUARIO ====================
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            nombre: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', format: 'email', example: 'juan.perez@cermont.com' },
            cedula: { type: 'string', example: '1234567890' },
            rol: {
              type: 'string',
              enum: ['root', 'admin', 'coordinator_hes', 'engineer', 'technician', 'accountant', 'client'],
              example: 'engineer',
            },
            telefono: { type: 'string', example: '+57 300 123 4567' },
            cargo: { type: 'string', example: 'Ingeniero Senior' },
            especialidad: { type: 'string', example: 'Redes CCTV' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        UserCreate: {
          type: 'object',
          required: ['nombre', 'email', 'password', 'rol', 'cedula'],
          properties: {
            nombre: { type: 'string', minLength: 2, maxLength: 100, example: 'Juan Pérez' },
            email: { type: 'string', format: 'email', example: 'juan.perez@cermont.com' },
            password: {
              type: 'string',
              format: 'password',
              minLength: 8,
              writeOnly: true,
              description: 'Debe contener al menos 8 caracteres, mayúsculas, minúsculas y números',
              example: 'Password123!',
            },
            cedula: { type: 'string', minLength: 5, maxLength: 20, example: '1234567890' },
            rol: {
              type: 'string',
              enum: ['admin', 'coordinator_hes', 'engineer', 'technician', 'accountant', 'client'],
              example: 'engineer',
            },
            telefono: { type: 'string', maxLength: 20, example: '+57 300 123 4567' },
            cargo: { type: 'string', maxLength: 100, example: 'Ingeniero Senior' },
            especialidad: { type: 'string', maxLength: 100, example: 'Redes CCTV' },
          },
        },

        // ==================== ORDEN ====================
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            numeroOrden: { type: 'string', example: 'ORD-000001' },
            clienteNombre: { type: 'string', example: 'Ecopetrol S.A.' },
            descripcion: { type: 'string', example: 'Mantenimiento preventivo sistema CCTV' },
            estado: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed', 'cancelled'],
              example: 'in_progress',
            },
            prioridad: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              example: 'high',
            },
            lugar: { type: 'string', example: 'Refinería de Barrancabermeja' },
            fechaInicio: { type: 'string', format: 'date', example: '2025-11-15' },
            fechaFinEstimada: { type: 'string', format: 'date', example: '2025-11-20' },
            fechaFinReal: { type: 'string', format: 'date' },
            assignedUsers: {
              type: 'array',
              items: { type: 'string', description: 'ID del usuario asignado' },
              example: ['507f1f77bcf86cd799439011'],
            },
            createdBy: { type: 'string', description: 'ID del usuario creador' },
            costoEstimado: { type: 'number', example: 1500000 },
            costoReal: { type: 'number', example: 1450000 },
            moneda: { type: 'string', enum: ['COP', 'USD'], example: 'COP' },
            progreso: { type: 'integer', minimum: 0, maximum: 100, example: 75 },
            workPlanId: { type: 'string', description: 'ID del plan de trabajo asociado' },
            isArchived: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        OrderCreate: {
          type: 'object',
          required: ['clienteNombre', 'descripcion', 'lugar', 'fechaInicio'],
          properties: {
            clienteNombre: { type: 'string', example: 'Ecopetrol S.A.' },
            descripcion: { type: 'string', minLength: 10, example: 'Mantenimiento preventivo sistema CCTV' },
            prioridad: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              default: 'medium',
            },
            lugar: { type: 'string', example: 'Refinería de Barrancabermeja' },
            fechaInicio: { type: 'string', format: 'date', example: '2025-11-15' },
            fechaFinEstimada: { type: 'string', format: 'date', example: '2025-11-20' },
            assignedUsers: {
              type: 'array',
              items: { type: 'string' },
              example: ['507f1f77bcf86cd799439011'],
            },
            costoEstimado: { type: 'number', minimum: 0, example: 1500000 },
          },
        },

        // ==================== AUTENTICACIÓN ====================
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@cermont.com' },
            password: { type: 'string', format: 'password', writeOnly: true, example: 'Admin123!' },
            remember: { type: 'boolean', default: false, description: 'Extender sesión a 30 días' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                tokens: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    tokenType: { type: 'string', example: 'Bearer' },
                    expiresIn: { type: 'integer', example: 900, description: 'Segundos hasta expiración' },
                    expiresAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
            message: { type: 'string', example: 'Login exitoso' },
          },
        },

        // ==================== WORKPLAN (ATG) ====================
        WorkPlan: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            orderId: { type: 'string', description: 'ID de la orden relacionada' },
            titulo: { type: 'string', example: 'Plan de Mantenimiento CCTV Q1-2025' },
            descripcion: { type: 'string' },
            alcance: { type: 'string' },
            unidadNegocio: {
              type: 'string',
              enum: ['CCTV', 'IT', 'MNT', 'SC', 'GEN', 'OTROS'],
              example: 'CCTV',
            },
            fechaInicio: { type: 'string', format: 'date' },
            fechaFin: { type: 'string', format: 'date' },
            cronograma: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  actividad: { type: 'string' },
                  fechaInicio: { type: 'string', format: 'date' },
                  fechaFin: { type: 'string', format: 'date' },
                  responsable: { type: 'string' },
                  completada: { type: 'boolean' },
                },
              },
            },
            materiales: { type: 'array', items: { type: 'object' } },
            herramientas: { type: 'array', items: { type: 'string' } },
            estado: {
              type: 'string',
              enum: ['draft', 'pending', 'approved', 'in_progress', 'completed', 'cancelled'],
              example: 'approved',
            },
            createdBy: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ==================== RESPUESTAS GENÉRICAS ====================
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string', example: 'Operación exitosa' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 20 },
                total: { type: 'integer', example: 100 },
                pages: { type: 'integer', example: 5 },
                hasMore: { type: 'boolean', example: true },
                cursor: { type: 'string', example: '507f1f77bcf86cd799439011' },
              },
            },
            message: { type: 'string', example: 'Datos obtenidos exitosamente' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Usuario no encontrado' },
                code: { type: 'string', example: 'USER_NOT_FOUND' },
                details: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['El email es requerido', 'La contraseña debe tener al menos 8 caracteres'],
                },
              },
            },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },

        // ==================== AUDITORÍA ====================
        AuditLog: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            userEmail: { type: 'string' },
            action: {
              type: 'string',
              enum: ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN_FAILED', 'PASSWORD_CHANGE'],
            },
            resource: {
              type: 'string',
              enum: ['User', 'Order', 'Auth', 'WorkPlan', 'ToolKit'],
            },
            resourceId: { type: 'string' },
            ipAddress: { type: 'string' },
            userAgent: { type: 'string' },
            method: { type: 'string', example: 'POST' },
            endpoint: { type: 'string', example: '/api/v1/auth/login' },
            status: { type: 'string', enum: ['SUCCESS', 'FAILURE'] },
            severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
            errorMessage: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }], // Seguridad global (override por endpoint si necesario)
    tags: [
      { name: 'Autenticación', description: 'Endpoints de autenticación JWT y gestión de sesiones' },
      { name: 'Usuarios', description: 'CRUD y gestión de usuarios del sistema' },
      { name: 'Órdenes', description: 'Gestión completa de órdenes de trabajo' },
      { name: 'Workplans', description: 'Planes de trabajo y cronogramas (CERMONT ATG)' },
      { name: 'ToolKits', description: 'Gestión de kits de herramientas' },
      { name: 'Auditoría', description: 'Consulta de logs de auditoría y seguridad' },
      { name: 'Sistema', description: 'Administración del sistema (cache, métricas, health)' },
    ],
  };

  // Opciones de swagger-jsdoc
  const options: OAS3Options = {
    definition,
    apis: [
      './src/routes/*.ts',
      './src/controllers/*.ts',
      './src/features/**/*.ts',
    ],
  };

  return options;
};

/**
 * Generar o obtener Swagger/OpenAPI spec (lazy singleton)
 * @returns Spec de OpenAPI o null si está deshabilitado
 */
export const getSwaggerSpec = (): any | null => {
  // Cache del spec (solo genera una vez)
  if (swaggerSpec === null) {
    const options = getSwaggerOptions();
    
    if (!options) {
      logger.info('📚 Swagger deshabilitado (producción sin SWAGGER_ENABLED=true)');
      return null;
    }

    try {
      swaggerSpec = swaggerJsdoc(options);
      
      if (swaggerSpec && Object.keys(swaggerSpec).length > 0) {
        logger.info('✅ Swagger spec generada exitosamente');
        logger.debug(`Spec contiene ${Object.keys(swaggerSpec.paths || {}).length} rutas documentadas`);
      } else {
        logger.warn('⚠️ Swagger spec vacío (verifica JSDoc en routes/controllers)');
        swaggerSpec = null;
      }
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('❌ Error generando Swagger spec:', err.message);
      if (process.env.NODE_ENV !== 'production') {
        logger.error('Stack trace:', err.stack);
      }
      swaggerSpec = null;
    }
  }

  return swaggerSpec;
};

export default getSwaggerSpec;

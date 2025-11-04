import swaggerJsdoc from 'swagger-jsdoc';
import { logger } from '../utils/logger';
let swaggerSpec = null;
const getSwaggerOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const swaggerEnabled = process.env.SWAGGER_ENABLED !== 'false';
    if (isProduction && !swaggerEnabled) {
        logger.info('Swagger/OpenAPI deshabilitado en producción');
        return null;
    }
    const apiBaseUrl = process.env.API_BASE_URL ||
        (isProduction ? 'https://api.cermont.com' : 'https://localhost:4100');
    const fallbackUrl = isProduction ? apiBaseUrl : 'http://localhost:4000';
    if (!process.env.API_VERSION) {
        logger.warn('API_VERSION no definido en .env, usando default 1.0.0');
    }
    if (!process.env.CONTACT_EMAIL) {
        logger.warn('CONTACT_EMAIL no definido en .env, usando default');
    }
    const definition = {
        openapi: '3.0.0',
        info: {
            title: 'CERMONT ATG - API Backend',
            version: process.env.API_VERSION || '1.0.0',
            description: `
        Backend API para el sistema de gestión de órdenes de trabajo de CERMONT SAS.

        **Características principales:**
        - Autenticación JWT con refresh tokens
        - Sistema de roles y permisos (RBAC)
        - Auditoría completa de operaciones
        - Caching inteligente
        - Rate limiting
        - Compresión de respuestas
        - Paginación cursor-based y offset

        **Seguridad:**
        - HTTPS con certificados SSL
        - Sanitización de inputs (XSS/NoSQL injection)
        - Token blacklist para revocación inmediata
        - Security headers (CSP, HSTS, etc.)

        **Performance:**
        - Cache in-memory con invalidación automática
        - Compresión gzip/brotli
        - Paginación optimizada
        - Índices MongoDB optimizados
      `,
            contact: {
                name: 'CERMONT SAS',
                email: process.env.CONTACT_EMAIL || 'soporte@cermont.com',
                url: process.env.CONTACT_URL || 'https://cermont.com',
            },
            license: {
                name: 'Propietario',
                url: process.env.LICENSE_URL || 'https://cermont.com/licencia',
            },
            externalDocs: {
                description: 'Guía completa de API',
                url: 'https://docs.cermont.com/api',
            },
        },
        servers: [
            {
                url: apiBaseUrl,
                description: `${isProduction ? 'Producción' : 'Desarrollo'} (HTTPS)`,
            },
            ...(isProduction ? [] : [{ url: fallbackUrl, description: 'Desarrollo (HTTP auxiliar)' }]),
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT obtenido del endpoint /api/v1/auth/login. Incluir en header: Authorization: Bearer <token>',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        nombre: { type: 'string', example: 'Juan Pérez' },
                        email: { type: 'string', format: 'email', example: 'juan.perez@cermont.com' },
                        cedula: { type: 'string', example: '1234567890' },
                        rol: {
                            type: 'string',
                            enum: ['admin', 'coordinator', 'supervisor', 'engineer', 'technician', 'accountant', 'client'],
                            example: 'engineer',
                        },
                        telefono: { type: 'string', example: '+57 300 123 4567' },
                        activo: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                UserCreate: {
                    type: 'object',
                    required: ['nombre', 'email', 'password', 'rol', 'cedula'],
                    properties: {
                        nombre: { type: 'string', example: 'Juan Pérez' },
                        email: { type: 'string', format: 'email', example: 'juan.perez@cermont.com' },
                        password: {
                            type: 'string',
                            format: 'password',
                            minLength: 8,
                            writeOnly: true,
                            example: 'Password123!',
                        },
                        cedula: { type: 'string', example: '1234567890' },
                        rol: {
                            type: 'string',
                            enum: ['admin', 'coordinator', 'supervisor', 'engineer', 'technician', 'accountant', 'client'],
                            example: 'engineer',
                        },
                        telefono: { type: 'string', example: '+57 300 123 4567' },
                    },
                },
                Order: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        numeroOrden: { type: 'string', example: 'ORD-000001' },
                        clienteNombre: { type: 'string', example: 'Ecopetrol S.A.' },
                        descripcion: { type: 'string', example: 'Mantenimiento preventivo de válvulas' },
                        estado: {
                            type: 'string',
                            enum: ['pendiente', 'planificacion', 'en_progreso', 'completada', 'facturacion', 'facturada', 'pagada', 'cancelada'],
                            example: 'en_progreso',
                        },
                        prioridad: {
                            type: 'string',
                            enum: ['baja', 'media', 'alta', 'urgente'],
                            example: 'alta',
                        },
                        lugar: { type: 'string', example: 'Refinería de Barrancabermeja' },
                        fechaInicio: { type: 'string', format: 'date' },
                        fechaFinEstimada: { type: 'string', format: 'date' },
                        fechaFinReal: { type: 'string', format: 'date' },
                        asignadoA: {
                            type: 'array',
                            items: { type: 'string', description: 'IDs de usuarios asignados' },
                            example: ['507f1f77bcf86cd799439011'],
                        },
                        creadoPor: { type: 'string', description: 'ID del usuario creador' },
                        costoEstimado: { type: 'number', example: 1500000 },
                        costoReal: { type: 'number', example: 1450000 },
                        moneda: { type: 'string', enum: ['COP', 'USD'], example: 'COP' },
                        progreso: { type: 'integer', minimum: 0, maximum: 100, example: 75 },
                        notas: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    contenido: { type: 'string' },
                                    autor: { type: 'string', description: 'ID del autor' },
                                    fecha: { type: 'string', format: 'date-time' },
                                },
                            },
                        },
                        archivos: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    nombre: { type: 'string' },
                                    url: { type: 'string' },
                                    tipo: { type: 'string' },
                                    tamano: { type: 'integer' },
                                },
                            },
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                OrderCreate: {
                    type: 'object',
                    required: ['clienteNombre', 'descripcion', 'lugar', 'fechaInicio'],
                    properties: {
                        clienteNombre: { type: 'string', example: 'Ecopetrol S.A.' },
                        descripcion: { type: 'string', example: 'Mantenimiento preventivo de válvulas' },
                        prioridad: {
                            type: 'string',
                            enum: ['baja', 'media', 'alta', 'urgente'],
                            default: 'media',
                        },
                        lugar: { type: 'string', example: 'Refinería de Barrancabermeja' },
                        fechaInicio: { type: 'string', format: 'date', example: '2025-11-15' },
                        fechaFinEstimada: { type: 'string', format: 'date', example: '2025-11-20' },
                        asignadoA: {
                            type: 'array',
                            items: { type: 'string', description: 'ID del usuario asignado' },
                            example: ['507f1f77bcf86cd799439011'],
                        },
                        costoEstimado: { type: 'number', example: 1500000 },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'admin@cermont.com' },
                        password: {
                            type: 'string',
                            format: 'password',
                            writeOnly: true,
                            example: 'Admin123!',
                        },
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
                                    },
                                },
                            },
                        },
                    },
                },
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
                        timestamp: { type: 'string', format: 'date-time' },
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
                AuditLog: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        userId: { type: 'string' },
                        userEmail: { type: 'string' },
                        action: {
                            type: 'string',
                            enum: ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN_FAILED'],
                        },
                        resource: {
                            type: 'string',
                            enum: ['User', 'Order', 'Auth', 'WorkPlan'],
                        },
                        ipAddress: { type: 'string' },
                        status: { type: 'string', enum: ['SUCCESS', 'FAILURE', 'DENIED'] },
                        severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                        timestamp: { type: 'string', format: 'date-time' },
                    },
                },
                WorkPlan: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        orderId: { type: 'string', description: 'ID de la orden relacionada' },
                        titulo: { type: 'string' },
                        descripcion: { type: 'string' },
                        alcance: { type: 'string' },
                        unidadNegocio: {
                            type: 'string',
                            enum: ['IT', 'MNT', 'SC', 'GEN', 'Otros'],
                        },
                        startDate: { type: 'string', format: 'date' },
                        endDate: { type: 'string', format: 'date' },
                        kitTipico: {
                            type: 'array',
                            items: { type: 'string', description: 'Herramientas/materiales predefinidas' },
                        },
                        checklist: {
                            type: 'array',
                            items: { type: 'string', description: 'Ítems de verificación' },
                        },
                        costoEstimado: { type: 'number' },
                        assignedUsers: {
                            type: 'array',
                            items: { type: 'string', description: 'IDs de usuarios asignados' },
                        },
                        tools: { type: 'array', items: { type: 'string' } },
                        estado: {
                            type: 'string',
                            enum: ['borrador', 'en_revision', 'aprobado', 'en_ejecucion', 'completado', 'cancelado'],
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: 'Autenticación', description: 'Endpoints de autenticación y autorización' },
            { name: 'Usuarios', description: 'Gestión de usuarios del sistema' },
            { name: 'Órdenes', description: 'Gestión de órdenes de trabajo' },
            { name: 'Workplans', description: 'Gestión de planes de trabajo' },
            { name: 'Auditoría', description: 'Consulta de logs de auditoría' },
            { name: 'Sistema', description: 'Endpoints de administración del sistema' },
        ],
        'x-tagGroups': {
            name: 'Groups',
            tags: [
                { name: 'Core', tags: ['Autenticación', 'Usuarios', 'Órdenes', 'Workplans'] },
                { name: 'Admin', tags: ['Auditoría', 'Sistema'] },
            ],
        },
    };
    const options = {
        definition,
        apis: [
            './src/routes/*.ts',
            './src/controllers/*.ts',
            './src/features/**/*.ts',
        ],
        failOnErrors: !isProduction,
    };
    return options;
};
export const getSwaggerSpec = () => {
    if (swaggerSpec === null) {
        const options = getSwaggerOptions();
        if (options) {
            try {
                swaggerSpec = swaggerJsdoc(options);
                if (swaggerSpec) {
                    logger.debug('Swagger spec generada exitosamente');
                }
                else {
                    logger.warn('Swagger spec vacío (verifica JSDoc en routes/controllers)');
                }
            }
            catch (error) {
                const err = error;
                logger.error('Error generando Swagger spec:', err.message);
                swaggerSpec = null;
            }
        }
    }
    return swaggerSpec;
};
export default getSwaggerSpec;
//# sourceMappingURL=swagger.js.map
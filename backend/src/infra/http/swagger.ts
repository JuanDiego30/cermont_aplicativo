/**
 * Swagger/OpenAPI Configuration
 * 
 * Documentación automática de la API REST.
 */
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'CERMONT API',
    version: '1.0.0',
    description: `
## Sistema de Gestión de Órdenes de Trabajo y Mantenimiento

API REST para el sistema CERMONT ATG, que permite gestionar:
- **Órdenes de Trabajo**: Crear, consultar, actualizar y gestionar estados
- **Planes de Trabajo (Work Plans)**: Planificación y ejecución de trabajos
- **Kits**: Gestión de kits de herramientas y materiales
- **Usuarios**: Administración de usuarios y roles
- **Evidencias**: Carga y gestión de evidencias fotográficas
- **Reportes**: Generación de reportes y estadísticas

### Autenticación
La API utiliza JWT (JSON Web Tokens) para autenticación. Incluye el token en el header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

### Roles
- **ROOT**: Acceso total al sistema
- **ADMIN**: Administración de usuarios y configuración
- **ENGINEER**: Gestión de órdenes y planes de trabajo
- **TECHNICIAN**: Ejecución de trabajos y carga de evidencias
- **VIEWER**: Solo lectura
    `,
    contact: {
      name: 'CERMONT SAS',
      email: 'soporte@cermont.com',
    },
    license: {
      name: 'Propietario',
      url: 'https://cermont.com',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header usando el esquema Bearer',
      },
    },
    schemas: {
      // Common Responses
      Error: {
        type: 'object',
        properties: {
          type: { type: 'string', example: 'https://httpstatuses.com/400' },
          title: { type: 'string', example: 'Bad Request' },
          status: { type: 'integer', example: 400 },
          detail: { type: 'string', example: 'Datos de entrada inválidos' },
          instance: { type: 'string', example: '/api/orders' },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 100 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          totalPages: { type: 'integer', example: 5 },
        },
      },
      // Auth
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@cermont.com' },
          password: { type: 'string', minLength: 8, example: 'password123' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
              user: { $ref: '#/components/schemas/User' },
            },
          },
        },
      },
      // User
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['ROOT', 'ADMIN', 'ENGINEER', 'TECHNICIAN', 'VIEWER'] },
          active: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      // Order
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          clientName: { type: 'string' },
          description: { type: 'string' },
          state: { 
            type: 'string', 
            enum: ['SOLICITUD', 'VISITA', 'PO', 'PLANEACION', 'EJECUCION', 'INFORME', 'ACTA', 'SES', 'FACTURA', 'PAGO', 'COMPLETED'],
          },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
          archived: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateOrderRequest: {
        type: 'object',
        required: ['clientName', 'description'],
        properties: {
          clientName: { type: 'string', minLength: 2, example: 'Ecopetrol' },
          description: { type: 'string', minLength: 10, example: 'Mantenimiento preventivo de bombas' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
          responsibleId: { type: 'string', format: 'uuid' },
        },
      },
      // WorkPlan
      WorkPlan: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          orderId: { type: 'string', format: 'uuid' },
          status: { 
            type: 'string', 
            enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
          },
          plannedStart: { type: 'string', format: 'date-time' },
          plannedEnd: { type: 'string', format: 'date-time' },
          estimatedBudget: { type: 'number', format: 'float' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      // Kit
      Kit: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string', enum: ['HERRAMIENTAS', 'EPP', 'MATERIALES', 'EQUIPOS', 'CONSUMIBLES'] },
          active: { type: 'boolean' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/KitItem' },
          },
        },
      },
      KitItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          quantity: { type: 'integer' },
          unit: { type: 'string' },
        },
      },
      // Evidence
      Evidence: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['PHOTO', 'DOCUMENT', 'VIDEO'] },
          filename: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          description: { type: 'string' },
          uploadedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Token de autenticación faltante o inválido',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              type: 'https://httpstatuses.com/401',
              title: 'Unauthorized',
              status: 401,
              detail: 'Token de autenticación requerido',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'No tiene permisos para realizar esta acción',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFoundError: {
        description: 'Recurso no encontrado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      ValidationError: {
        description: 'Datos de entrada inválidos',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
  security: [
    { bearerAuth: [] },
  ],
  tags: [
    { name: 'Auth', description: 'Autenticación y gestión de sesión' },
    { name: 'Users', description: 'Gestión de usuarios' },
    { name: 'Orders', description: 'Órdenes de trabajo' },
    { name: 'WorkPlans', description: 'Planes de trabajo' },
    { name: 'Kits', description: 'Kits de herramientas y materiales' },
    { name: 'Evidences', description: 'Evidencias fotográficas y documentos' },
    { name: 'Dashboard', description: 'Métricas y estadísticas' },
    { name: 'Reports', description: 'Generación de reportes' },
  ],
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: [
    './src/infra/http/routes/*.ts',
    './src/infra/http/controllers/*.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Setup Swagger UI
 */
export function setupSwagger(app: Express): void {
  // Swagger JSON endpoint
  app.get('/api/docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Swagger UI
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'CERMONT API - Documentación',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
      },
    })
  );
}

export { swaggerSpec };

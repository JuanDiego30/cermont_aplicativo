import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Configuración de Swagger/OpenAPI para documentación de API
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CERMONT ATG - API Backend',
      version: '1.0.0',
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
        email: 'soporte@cermont.com',
        url: 'https://cermont.com'
      },
      license: {
        name: 'Propietario',
        url: 'https://cermont.com/licencia'
      }
    },
    servers: [
      {
        url: 'https://localhost:4100',
        description: 'Servidor de desarrollo (HTTPS)'
      },
      {
        url: 'http://localhost:4000',
        description: 'Servidor de desarrollo (HTTP auxiliar)'
      },
      {
        url: 'https://api.cermont.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint /api/v1/auth/login'
        }
      },
      schemas: {
        // ========================================
        // SCHEMAS DE USUARIO
        // ========================================
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            nombre: {
              type: 'string',
              example: 'Juan Pérez'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'juan.perez@cermont.com'
            },
            cedula: {
              type: 'string',
              example: '1234567890'
            },
            rol: {
              type: 'string',
              enum: ['admin', 'coordinator', 'supervisor', 'engineer', 'technician', 'accountant', 'client'],
              example: 'engineer'
            },
            telefono: {
              type: 'string',
              example: '+57 300 123 4567'
            },
            activo: {
              type: 'boolean',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        UserCreate: {
          type: 'object',
          required: ['nombre', 'email', 'password', 'rol', 'cedula'],
          properties: {
            nombre: {
              type: 'string',
              example: 'Juan Pérez'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'juan.perez@cermont.com'
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 8,
              example: 'Password123!'
            },
            cedula: {
              type: 'string',
              example: '1234567890'
            },
            rol: {
              type: 'string',
              enum: ['admin', 'coordinator', 'supervisor', 'engineer', 'technician', 'accountant', 'client'],
              example: 'engineer'
            },
            telefono: {
              type: 'string',
              example: '+57 300 123 4567'
            }
          }
        },

        // ========================================
        // SCHEMAS DE ORDEN
        // ========================================
        Order: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            numeroOrden: {
              type: 'string',
              example: 'ORD-000001'
            },
            clienteNombre: {
              type: 'string',
              example: 'Ecopetrol S.A.'
            },
            descripcion: {
              type: 'string',
              example: 'Mantenimiento preventivo de válvulas'
            },
            estado: {
              type: 'string',
              enum: ['pendiente', 'planificacion', 'en_progreso', 'completada', 'facturacion', 'facturada', 'pagada', 'cancelada'],
              example: 'en_progreso'
            },
            prioridad: {
              type: 'string',
              enum: ['baja', 'media', 'alta', 'urgente'],
              example: 'alta'
            },
            lugar: {
              type: 'string',
              example: 'Refinería de Barrancabermeja'
            },
            fechaInicio: {
              type: 'string',
              format: 'date'
            },
            fechaFinEstimada: {
              type: 'string',
              format: 'date'
            },
            fechaFinReal: {
              type: 'string',
              format: 'date'
            },
            asignadoA: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User'
              }
            },
            creadoPor: {
              $ref: '#/components/schemas/User'
            },
            costoEstimado: {
              type: 'number',
              example: 1500000
            },
            costoReal: {
              type: 'number',
              example: 1450000
            },
            moneda: {
              type: 'string',
              enum: ['COP', 'USD'],
              example: 'COP'
            },
            progreso: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              example: 75
            },
            notas: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  contenido: {
                    type: 'string'
                  },
                  autor: {
                    $ref: '#/components/schemas/User'
                  },
                  fecha: {
                    type: 'string',
                    format: 'date-time'
                  }
                }
              }
            },
            archivos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  nombre: {
                    type: 'string'
                  },
                  url: {
                    type: 'string'
                  },
                  tipo: {
                    type: 'string'
                  },
                  tamano: {
                    type: 'integer'
                  }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        OrderCreate: {
          type: 'object',
          required: ['clienteNombre', 'descripcion', 'lugar', 'fechaInicio'],
          properties: {
            clienteNombre: {
              type: 'string',
              example: 'Ecopetrol S.A.'
            },
            descripcion: {
              type: 'string',
              example: 'Mantenimiento preventivo de válvulas'
            },
            prioridad: {
              type: 'string',
              enum: ['baja', 'media', 'alta', 'urgente'],
              default: 'media'
            },
            lugar: {
              type: 'string',
              example: 'Refinería de Barrancabermeja'
            },
            fechaInicio: {
              type: 'string',
              format: 'date',
              example: '2025-11-15'
            },
            fechaFinEstimada: {
              type: 'string',
              format: 'date',
              example: '2025-11-20'
            },
            asignadoA: {
              type: 'array',
              items: {
                type: 'string',
                description: 'ID del usuario asignado'
              },
              example: ['507f1f77bcf86cd799439011']
            },
            costoEstimado: {
              type: 'number',
              example: 1500000
            }
          }
        },

        // ========================================
        // SCHEMAS DE AUTENTICACIÓN
        // ========================================
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@cermont.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Admin123!'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                tokens: {
                  type: 'object',
                  properties: {
                    accessToken: {
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    },
                    refreshToken: {
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    }
                  }
                }
              }
            }
          }
        },

        // ========================================
        // SCHEMAS GENÉRICOS
        // ========================================
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object'
            },
            message: {
              type: 'string',
              example: 'Operación exitosa'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  example: 1
                },
                limit: {
                  type: 'integer',
                  example: 20
                },
                total: {
                  type: 'integer',
                  example: 100
                },
                pages: {
                  type: 'integer',
                  example: 5
                },
                hasMore: {
                  type: 'boolean',
                  example: true
                },
                cursor: {
                  type: 'string',
                  example: '507f1f77bcf86cd799439011'
                }
              }
            },
            message: {
              type: 'string',
              example: 'Datos obtenidos exitosamente'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Usuario no encontrado'
                },
                code: {
                  type: 'string',
                  example: 'USER_NOT_FOUND'
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  example: ['El email es requerido', 'La contraseña debe tener al menos 8 caracteres']
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // ========================================
        // SCHEMAS DE AUDITORÍA
        // ========================================
        AuditLog: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            userId: {
              type: 'string'
            },
            userEmail: {
              type: 'string'
            },
            action: {
              type: 'string',
              enum: ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN_FAILED']
            },
            resource: {
              type: 'string',
              enum: ['User', 'Order', 'Auth']
            },
            ipAddress: {
              type: 'string'
            },
            status: {
              type: 'string',
              enum: ['SUCCESS', 'FAILURE', 'DENIED']
            },
            severity: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints de autenticación y autorización'
      },
      {
        name: 'Usuarios',
        description: 'Gestión de usuarios del sistema'
      },
      {
        name: 'Órdenes',
        description: 'Gestión de órdenes de trabajo'
      },
      {
        name: 'Auditoría',
        description: 'Consulta de logs de auditoría'
      },
      {
        name: 'Sistema',
        description: 'Endpoints de administración del sistema'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
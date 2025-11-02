/**
 * Custom Validators (October 2025)
 * @description Validadores específicos del negocio
 */

import { sanitizers, validateObjectId } from '../middleware/sanitize.js';

// ============================================================================
// VALIDADORES DE USUARIO
// ============================================================================

/**
 * Validar datos de registro de usuario
 */
export const validateRegisterData = (data) => {
  const errors = [];
  const sanitized = {};

  // Nombre
  if (!data.nombre || typeof data.nombre !== 'string') {
    errors.push('Nombre es requerido');
  } else {
    sanitized.nombre = sanitizers.string(data.nombre, { maxLength: 100 });
    if (sanitized.nombre.length < 2) {
      errors.push('Nombre debe tener al menos 2 caracteres');
    }
  }

  // Email
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email es requerido');
  } else {
    sanitized.email = sanitizers.email(data.email);
    if (!sanitized.email) {
      errors.push('Email inválido');
    }
  }

  // Password
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Contraseña es requerida');
  } else if (data.password.length < 8) {
    errors.push('Contraseña debe tener al menos 8 caracteres');
  } else {
    sanitized.password = data.password; // No sanitizar passwords
  }

  // Rol (opcional)
  if (data.rol) {
    const validRoles = ['root', 'admin', 'coordinator_hes', 'engineer', 'supervisor', 'technician', 'accountant', 'client'];
    if (!validRoles.includes(data.rol)) {
      errors.push('Rol inválido');
    } else {
      sanitized.rol = data.rol;
    }
  }

  // Teléfono (opcional)
  if (data.telefono) {
    sanitized.telefono = sanitizers.string(data.telefono, { maxLength: 20 });
  }

  // Cédula (opcional)
  if (data.cedula) {
    sanitized.cedula = sanitizers.string(data.cedula, { maxLength: 20 });
  }

  // Cargo (opcional)
  if (data.cargo) {
    sanitized.cargo = sanitizers.string(data.cargo, { maxLength: 100 });
  }

  // Especialidad (opcional)
  if (data.especialidad) {
    sanitized.especialidad = sanitizers.string(data.especialidad, { maxLength: 100 });
  }

  return { errors, sanitized };
};

/**
 * Validar datos de login
 */
export const validateLoginData = (data) => {
  const errors = [];
  const sanitized = {};

  // Email
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email es requerido');
  } else {
    sanitized.email = sanitizers.email(data.email);
    if (!sanitized.email) {
      errors.push('Email inválido');
    }
  }

  // Password
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Contraseña es requerida');
  } else {
    sanitized.password = data.password; // No sanitizar
  }

  // Remember (opcional)
  if (data.remember !== undefined) {
    sanitized.remember = Boolean(data.remember);
  }

  return { errors, sanitized };
};

// ============================================================================
// VALIDADORES DE ORDEN
// ============================================================================

/**
 * Validar datos de orden de trabajo
 */
export const validateOrderData = (data) => {
  const errors = [];
  const sanitized = {};

  // Número de orden
  if (!data.numeroOrden) {
    errors.push('Número de orden es requerido');
  } else {
    sanitized.numeroOrden = sanitizers.string(data.numeroOrden, { maxLength: 50 });
  }

  // Cliente nombre
  if (!data.clienteNombre) {
    errors.push('Nombre del cliente es requerido');
  } else {
    sanitized.clienteNombre = sanitizers.string(data.clienteNombre, { maxLength: 100 });
  }

  // Cliente (ObjectId) - opcional
  if (data.cliente && !validateObjectId(data.cliente)) {
    errors.push('ID de cliente inválido');
  } else if (data.cliente) {
    sanitized.cliente = data.cliente;
  }

  // Descripción
  if (!data.descripcion) {
    errors.push('Descripción es requerida');
  } else {
    sanitized.descripcion = sanitizers.string(data.descripcion, { 
      maxLength: 2000,
      allowHTML: false,
    });
  }

  // Lugar
  if (!data.lugar) {
    errors.push('Lugar es requerido');
  } else {
    sanitized.lugar = sanitizers.string(data.lugar, { maxLength: 200 });
  }

  // Creado por (ObjectId)
  if (!data.creadoPor || !validateObjectId(data.creadoPor)) {
    errors.push('ID de usuario creador inválido');
  } else {
    sanitized.creadoPor = data.creadoPor;
  }

  // Fecha inicio
  if (!data.fechaInicio) {
    errors.push('Fecha de inicio es requerida');
  } else {
    const date = new Date(data.fechaInicio);
    if (isNaN(date.getTime())) {
      errors.push('Fecha de inicio inválida');
    } else {
      sanitized.fechaInicio = date;
    }
  }

  // Fecha (legacy support)
  if (data.fecha) {
    const date = new Date(data.fecha);
    if (isNaN(date.getTime())) {
      errors.push('Fecha inválida');
    } else {
      sanitized.fecha = date;
    }
  }

  // Estado
  if (data.estado) {
    const validStates = ['pendiente', 'planificacion', 'en_progreso', 'completada', 'facturacion', 'facturada', 'pagada', 'cancelada'];
    if (!validStates.includes(data.estado)) {
      errors.push('Estado inválido');
    } else {
      sanitized.estado = data.estado;
    }
  }

  // Prioridad
  if (data.prioridad) {
    const validPriorities = ['baja', 'media', 'alta', 'urgente'];
    if (!validPriorities.includes(data.prioridad)) {
      errors.push('Prioridad inválida');
    } else {
      sanitized.prioridad = data.prioridad;
    }
  }

  return { errors, sanitized };
};

// ============================================================================
// VALIDADORES DE PLAN DE TRABAJO
// ============================================================================

/**
 * Validar datos de plan de trabajo
 */
export const validateWorkPlanData = (data) => {
  const errors = [];
  const sanitized = {};

  // Orden (ObjectId)
  if (!data.orden || !validateObjectId(data.orden)) {
    errors.push('ID de orden inválido');
  } else {
    sanitized.orden = data.orden;
  }

  // Actividades (array)
  if (data.actividades && Array.isArray(data.actividades)) {
    sanitized.actividades = data.actividades.map(actividad => ({
      descripcion: sanitizers.string(actividad.descripcion, { maxLength: 500 }),
      responsable: validateObjectId(actividad.responsable) ? actividad.responsable : null,
      fechaInicio: actividad.fechaInicio ? new Date(actividad.fechaInicio) : null,
      fechaFin: actividad.fechaFin ? new Date(actividad.fechaFin) : null,
      estado: ['pendiente', 'en_progreso', 'completada'].includes(actividad.estado) 
        ? actividad.estado 
        : 'pendiente',
    }));
  }

  // Observaciones
  if (data.observaciones) {
    sanitized.observaciones = sanitizers.string(data.observaciones, { 
      maxLength: 2000,
      allowHTML: false,
    });
  }

  return { errors, sanitized };
};

// ============================================================================
// VALIDADORES DE ARCHIVOS
// ============================================================================

/**
 * Validar archivo subido
 */
export const validateFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push('Archivo es requerido');
    return { errors, valid: false };
  }

  // Tamaño máximo: 10MB
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('Archivo debe ser menor a 10MB');
  }

  // Tipos permitidos
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    errors.push('Tipo de archivo no permitido');
  }

  // Sanitizar filename
  const sanitizedFilename = sanitizers.filename(file.originalname);
  if (!sanitizedFilename) {
    errors.push('Nombre de archivo inválido');
  }

  return { 
    errors, 
    valid: errors.length === 0,
    sanitizedFilename,
  };
};

// ============================================================================
// VALIDADORES DE QUERY PARAMS
// ============================================================================

/**
 * Validar parámetros de paginación
 */
export const validatePaginationParams = (query) => {
  const sanitized = {
    page: 1,
    limit: 10,
    sort: '-createdAt',
  };

  // Page
  if (query.page) {
    const page = parseInt(query.page, 10);
    if (!isNaN(page) && page > 0) {
      sanitized.page = page;
    }
  }

  // Limit
  if (query.limit) {
    const limit = parseInt(query.limit, 10);
    if (!isNaN(limit) && limit > 0 && limit <= 100) {
      sanitized.limit = limit;
    }
  }

  // Sort
  if (query.sort) {
    sanitized.sort = sanitizers.string(query.sort, { maxLength: 50 });
  }

  return sanitized;
};

/**
 * Validar filtros de búsqueda
 */
export const validateSearchFilters = (query) => {
  const sanitized = {};

  // Search term
  if (query.search) {
    sanitized.search = sanitizers.string(query.search, { 
      maxLength: 100,
      allowHTML: false,
    });
  }

  // Estado
  if (query.estado) {
    const validStates = ['pendiente', 'en_progreso', 'completada', 'cancelada'];
    if (validStates.includes(query.estado)) {
      sanitized.estado = query.estado;
    }
  }

  // Fecha desde/hasta
  if (query.fechaDesde) {
    const date = new Date(query.fechaDesde);
    if (!isNaN(date.getTime())) {
      sanitized.fechaDesde = date;
    }
  }

  if (query.fechaHasta) {
    const date = new Date(query.fechaHasta);
    if (!isNaN(date.getTime())) {
      sanitized.fechaHasta = date;
    }
  }

  return sanitized;
};

// ============================================================================
// HELPER: VALIDAR Y RESPONDER
// ============================================================================

/**
 * Helper para validar datos y devolver error si hay problemas
 */
export const validateAndRespond = (validator, data, res) => {
  const { errors, sanitized } = validator(data);
  
  if (errors.length > 0) {
    return {
      hasErrors: true,
      response: res.status(400).json({
        success: false,
        error: {
          message: 'Errores de validación',
          code: 'VALIDATION_ERROR',
          details: errors,
        },
      }),
    };
  }

  return {
    hasErrors: false,
    sanitized,
  };
};

/**
 * Input Sanitization Middleware (October 2025)
 * @description Sanitización completa de inputs para prevenir ataques
 */

import validator from 'validator';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import { logger } from '../utils/logger.js';

// Crear instancia de DOMPurify para Node.js
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

/**
 * Patrones peligrosos a detectar
 */
const DANGEROUS_PATTERNS = {
  xss: /<script[^>]*>[\s\S]*?<\/script>|javascript:|on\w+\s*=/gi,
  sqlInjection: /(\bor\b|\band\b).*?['"=]/gi,
  noSqlOperators: /^\$|\.\$|\$\{/,
  pathTraversal: /\.\.[\/\\]/g,
  commandInjection: /[;&|`$()]/g,
};

/**
 * Configuración de DOMPurify
 */
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href', 'title'],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
};

// ============================================================================
// FUNCIONES DE SANITIZACIÓN
// ============================================================================

/**
 * Sanitizar string básico
 */
const sanitizeString = (value, options = {}) => {
  if (typeof value !== 'string') return value;
  
  const {
    trim = true,
    escape = true,
    maxLength = 10000,
    allowHTML = false,
  } = options;
  
  let sanitized = value;
  
  // Trim espacios
  if (trim) {
    sanitized = sanitized.trim();
  }
  
  // Limitar longitud
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
    logger.warn(`String truncated to ${maxLength} characters`);
  }
  
  // Escapar HTML si no se permite
  if (!allowHTML && escape) {
    // Eliminar atributos de evento como onerror, onclick, etc.
    sanitized = sanitized.replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    // Eliminar protocolos peligrosos embebidos
    sanitized = sanitized.replace(/javascript:\s*/gi, '');
    sanitized = sanitized.replace(/data:\s*/gi, '');
    sanitized = validator.escape(sanitized);
    // Remove common JS function calls that may indicate XSS payloads
    sanitized = sanitized.replace(/\b(alert|confirm|prompt|eval|Function)\b/gi, '');
  }
  
  // Si se permite HTML, usar DOMPurify
  if (allowHTML) {
    sanitized = DOMPurify.sanitize(sanitized, DOMPURIFY_CONFIG);
  }
  
  return sanitized;
};

/**
 * Sanitizar objeto recursivamente
 */
const sanitizeObject = (obj, options = {}) => {
  if (obj === null || typeof obj !== 'object') {
    return sanitizeString(obj, options);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Validar key (prevenir NoSQL injection en keys)
    const sanitizedKey = sanitizeString(key, { allowHTML: false });
    
    // Detectar operadores MongoDB peligrosos en keys
    if (DANGEROUS_PATTERNS.noSqlOperators.test(sanitizedKey)) {
      logger.warn(`Dangerous NoSQL operator detected in key: ${key}`);
      continue; // Skip this key
    }
    
    // Sanitizar value recursivamente
    if (typeof value === 'object' && value !== null) {
      sanitized[sanitizedKey] = sanitizeObject(value, options);
    } else {
      sanitized[sanitizedKey] = sanitizeString(value, options);
    }
  }
  
  return sanitized;
};

/**
 * Detectar patrones peligrosos
 */
const detectDangerousPatterns = (value) => {
  if (typeof value !== 'string') return null;
  
  const threats = [];
  
  // XSS
  if (DANGEROUS_PATTERNS.xss.test(value)) {
    threats.push('XSS');
  }
  
  // SQL Injection
  if (DANGEROUS_PATTERNS.sqlInjection.test(value)) {
    threats.push('SQL_INJECTION');
  }
  
  // Path Traversal
  if (DANGEROUS_PATTERNS.pathTraversal.test(value)) {
    threats.push('PATH_TRAVERSAL');
  }
  
  // Command Injection
  if (DANGEROUS_PATTERNS.commandInjection.test(value)) {
    threats.push('COMMAND_INJECTION');
  }
  
  return threats.length > 0 ? threats : null;
};

/**
 * Validar email
 */
const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return email;
  
  const normalized = validator.normalizeEmail(email, {
    all_lowercase: true,
    gmail_remove_dots: false,
  });
  
  return validator.isEmail(normalized) ? normalized : null;
};

/**
 * Sanitizar URL
 */
const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // Validar que sea URL válida
  if (!validator.isURL(url, { require_protocol: true })) {
    logger.warn(`Invalid URL detected: ${url}`);
    return null;
  }
  
  // Bloquear protocolos peligrosos
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];
  if (dangerousProtocols.some(proto => url.toLowerCase().startsWith(proto))) {
    logger.warn(`Dangerous protocol detected in URL: ${url}`);
    return null;
  }
  
  return url;
};

/**
 * Sanitizar filename
 */
const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return filename;
  
  // Remover path traversal
  let sanitized = filename.replace(DANGEROUS_PATTERNS.pathTraversal, '');
  
  // Remover caracteres peligrosos
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limitar longitud
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop();
    sanitized = sanitized.substring(0, 250) + '.' + ext;
  }
  
  return sanitized;
};

// ============================================================================
// MIDDLEWARE PRINCIPAL
// ============================================================================

/**
 * Middleware de sanitización para req.body
 */
export const sanitizeBody = (options = {}) => {
  return (req, res, next) => {
    if (req.body && Object.keys(req.body).length > 0) {
      const originalBody = JSON.stringify(req.body);
      
      // Sanitizar body
      req.body = sanitizeObject(req.body, options);
      
      // Log si hubo cambios
      if (JSON.stringify(req.body) !== originalBody) {
        logger.debug('Body sanitized:', {
          path: req.path,
          method: req.method,
        });
      }
    }
    
    next();
  };
};

/**
 * Middleware de sanitización para req.query
 */
export const sanitizeQuery = (options = {}) => {
  return (req, res, next) => {
    if (req.query && Object.keys(req.query).length > 0) {
      req.query = sanitizeObject(req.query, options);
    }
    
    next();
  };
};

/**
 * Middleware de sanitización para req.params
 */
export const sanitizeParams = (options = {}) => {
  return (req, res, next) => {
    if (req.params && Object.keys(req.params).length > 0) {
      req.params = sanitizeObject(req.params, options);
    }
    
    next();
  };
};

/**
 * Middleware completo (body + query + params)
 */
export const sanitizeAll = (options = {}) => {
  return (req, res, next) => {
    // Sanitizar body
    if (req.body && Object.keys(req.body).length > 0) {
      req.body = sanitizeObject(req.body, options);
    }
    
    // Sanitizar query
    if (req.query && Object.keys(req.query).length > 0) {
      req.query = sanitizeObject(req.query, options);
    }
    
    // Sanitizar params
    if (req.params && Object.keys(req.params).length > 0) {
      req.params = sanitizeObject(req.params, options);
    }
    
    next();
  };
};

/**
 * Middleware de detección de amenazas
 */
export const detectThreats = (req, res, next) => {
  const checkForThreats = (obj, path = '') => {
    if (typeof obj === 'string') {
      const threats = detectDangerousPatterns(obj);
      if (threats) {
        logger.warn('Security threat detected:', {
          threats,
          path: path || req.path,
          value: obj.substring(0, 100),
          ip: req.ip,
          userId: req.userId,
        });
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        checkForThreats(value, `${path}.${key}`);
      }
    }
  };
  
  // Verificar body, query y params
  checkForThreats(req.body, 'body');
  checkForThreats(req.query, 'query');
  checkForThreats(req.params, 'params');
  
  next();
};

// ============================================================================
// MIDDLEWARE DE TERCEROS (PRE-CONFIGURADOS)
// ============================================================================

/**
 * MongoDB Sanitization (prevenir NoSQL injection)
 */
export const mongoSanitization = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`MongoDB sanitization triggered`, {
      path: req.path,
      key,
    });
  },
});

/**
 * XSS Clean (limpiar HTML malicioso)
 */
export const xssClean = xss();

// ============================================================================
// FUNCIONES HELPER EXPORTADAS
// ============================================================================

export const sanitizers = {
  string: sanitizeString,
  object: sanitizeObject,
  email: sanitizeEmail,
  url: sanitizeUrl,
  filename: sanitizeFilename,
  detectThreats: detectDangerousPatterns,
};

// ============================================================================
// VALIDADORES COMUNES
// ============================================================================

/**
 * Validar y sanitizar datos de usuario
 */
export const validateUserInput = (data) => {
  const sanitized = {};
  
  if (data.email) {
    sanitized.email = sanitizeEmail(data.email);
    if (!sanitized.email) {
      throw new Error('Email inválido');
    }
  }
  
  if (data.nombre) {
    sanitized.nombre = sanitizeString(data.nombre, { maxLength: 100 });
    if (sanitized.nombre.length < 2) {
      throw new Error('Nombre debe tener al menos 2 caracteres');
    }
  }
  
  if (data.telefono) {
    sanitized.telefono = sanitizeString(data.telefono, { maxLength: 20 });
  }
  
  return sanitized;
};

/**
 * Validar ObjectId de MongoDB
 */
export const validateObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

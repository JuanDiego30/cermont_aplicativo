/**
 * Configuración general de la aplicación
 */

export const APP_CONFIG = {
  // Información de la aplicación
  name: 'CERMONT WEB',
  description: 'Sistema de gestión de órdenes de trabajo para CERMONT',
  version: '1.0.0',
  
  // Configuración de la empresa
  company: {
    name: 'CERMONT',
    website: 'https://cermont.com',
    email: 'info@cermont.com',
    phone: '+57 300 123 4567',
  },
  
  // Límites y restricciones
  limits: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 10,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageDimension: 4096,
  },
  
  // Paginación
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
  
  // Tiempos (en ms)
  timeouts: {
    api: 30000, // 30 segundos
    debounce: 300,
    toast: 5000,
  },
  
  // Feature flags
  features: {
    enableRegistration: true,
    enablePasswordReset: true,
    enableDarkMode: true,
    enablePdfExport: true,
    enableNotifications: false,
  },
  
  // Validaciones
  validation: {
    minPasswordLength: 8,
    maxPasswordLength: 128,
    minUsernameLength: 3,
    maxUsernameLength: 50,
  },
} as const;

/**
 * Mensajes de la aplicación
 */
export const MESSAGES = {
  errors: {
    generic: 'Ha ocurrido un error. Por favor intenta de nuevo.',
    network: 'Error de conexión. Verifica tu conexión a internet.',
    unauthorized: 'No tienes permisos para realizar esta acción.',
    notFound: 'Recurso no encontrado.',
    validation: 'Por favor corrige los errores en el formulario.',
  },
  success: {
    saved: 'Guardado exitosamente.',
    deleted: 'Eliminado exitosamente.',
    updated: 'Actualizado exitosamente.',
    submitted: 'Enviado exitosamente.',
  },
  confirmations: {
    delete: '¿Estás seguro de que deseas eliminar este elemento?',
    unsavedChanges: 'Tienes cambios sin guardar. ¿Deseas salir?',
  },
} as const;

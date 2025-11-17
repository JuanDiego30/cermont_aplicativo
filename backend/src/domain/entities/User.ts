import { UserRole } from '../../shared/constants/roles.js';

/**
 * Entidad: Usuario del sistema
 * Representa un usuario con autenticación, roles y gestión de contraseñas
 */
export interface User {
  /** ID único del usuario */
  id: string;
  
  /** Email del usuario (único) */
  email: string;
  
  /** Hash de la contraseña (bcrypt) */
  password: string;
  
  /** Nombre completo del usuario */
  name: string;
  
  /** Rol del usuario en el sistema */
  role: UserRole;

  /** URL del avatar del usuario */
  avatar?: string;
  
  /** Indica si el usuario tiene MFA habilitado */
  mfaEnabled: boolean;
  
  /** Secret de MFA (TOTP) */
  mfaSecret?: string;
  
  /** Fecha del último cambio de contraseña */
  lastPasswordChange: Date;
  
  /** Historial de hashes de contraseñas anteriores (máximo 5 entradas) */
  passwordHistory: string[];
  
  /** Fecha de expiración de la contraseña (90 días por defecto) */
  passwordExpiresAt: Date;
  
  /** Fecha del último login exitoso */
  lastLogin?: Date;

  /** Fecha del último login fallido */
  lastFailedLogin?: Date | null;
  
  /** Número de intentos de login fallidos consecutivos */
  loginAttempts: number;
  
  /** Fecha de bloqueo por intentos fallidos */
  lockedUntil?: Date | null;
  
  /** Indica si el usuario está activo */
  active: boolean;
  
  /** ID del usuario que creó este usuario */
  createdBy?: string;
  
  /** Fecha de creación */
  createdAt: Date;

  /** Fecha de última actualización */
  updatedAt: Date;
}


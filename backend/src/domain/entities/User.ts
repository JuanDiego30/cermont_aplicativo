import { UserRole } from '../../shared/constants/roles.js';

// Re-export UserRole for convenience
export { UserRole };

/**
 * Información de seguridad sensible separada
 * para evitar exposición accidental.
 */
export interface UserSecurity {
  mfaSecret?: string;
  mfaEnabled?: boolean;
  passwordHistory: string[];
  recoveryCodes?: string[];
  lastPasswordChange?: Date;
  passwordExpiresAt?: Date;
}

/**
 * Perfil profesional (opcional, solo para técnicos/operativos)
 */
export interface ProfessionalProfile {
  idNumber?: string;     // Cédula/DNI
  certifications?: string[];
  specialties?: string[];
}

/**
 * Entidad: Usuario
 * Núcleo de identidad y acceso del sistema.
 */
export interface User {
  id: string;
  email: string;
  password: string; // Hashed
  name: string;
  role: UserRole;
  avatar?: string;

  // --- Estado de Cuenta ---
  active: boolean;
  mfaEnabled: boolean;
  
  // --- Seguridad y Ciclo de Vida de Password ---
  lastPasswordChange: Date;
  passwordExpiresAt: Date;
  
  // --- Control de Acceso (Rate Limiting / Locking) ---
  lastLogin?: Date;
  lastFailedLogin?: Date | null;
  loginAttempts: number;
  lockedUntil?: Date | null;

  // --- Datos Profesionales (Embedded) ---
  /** Datos específicos para roles operativos */
  professionalDetails?: ProfessionalProfile;

  // --- Auditoría ---
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  
  /**
   * Contenedor de secretos sensibles.
   * Debe excluirse siempre de respuestas API y logs.
   */
  security?: UserSecurity;
}




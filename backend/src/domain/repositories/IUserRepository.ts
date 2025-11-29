import type { User } from '../entities/User.js';
import { UserRole } from '../../shared/constants/roles.js';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface SortingParams {
  field: keyof User;
  order: 'asc' | 'desc';
}

export interface UserFilters {
  role?: UserRole;
  active?: boolean;
  search?: string;
  email?: string;
  createdBy?: string;
}

/**
 * Repositorio: Usuarios
 * Gestión de identidad y acceso.
 */
export interface IUserRepository {
  // --- CRUD Básico ---
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  
  update(id: string, user: Partial<User>): Promise<User>;
  
  findById(id: string): Promise<User | null>;
  
  findByEmail(email: string): Promise<User | null>;

  /**
   * Búsqueda unificada con filtros.
   */
  findAll(
    filters: UserFilters,
    pagination?: PaginationParams,
    sorting?: SortingParams
  ): Promise<User[]>;

  count(filters: UserFilters): Promise<number>;

  /**
   * Soft delete (desactivación).
   */
  deactivate(id: string): Promise<User>;
  
  activate(id: string): Promise<User>;

  /**
   * Hard delete (solo admins, con verificación de referencias).
   */
  delete(id: string): Promise<void>;

  /**
   * Verifica si un email ya existe (para validación de unicidad).
   */
  emailExists(email: string, excludeId?: string): Promise<boolean>;

  /**
   * Actualiza campos de seguridad (intentos de login, bloqueo).
   */
  updateLoginAttempts(id: string, attempts: number, lockedUntil?: Date | null): Promise<void>;

  /**
   * Registra un login exitoso.
   */
  recordSuccessfulLogin(id: string): Promise<void>;
}

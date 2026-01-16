/**
 * @interface IUserRepository
 *
 * Interfaz del repositorio de usuarios.
 * Define el contrato que debe implementar cualquier persistencia.
 *
 * Principio DIP: El dominio define la interfaz, la infraestructura implementa.
 */

import { UserEntity } from '../entities/user.entity';

/**
 * Resultado paginado genérico
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Filtros para búsqueda de usuarios
 */
export interface UserFilters {
  role?: string;
  active?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Estadísticas de usuarios
 */
export interface UserStats {
  total: number;
  activos: number;
  porRol: Record<string, number>;
}

/**
 * Interfaz del repositorio de usuarios
 */
export interface IUserRepository {
  /**
   * Encuentra un usuario por ID
   */
  findById(id: string): Promise<UserEntity | null>;

  /**
   * Encuentra un usuario por email
   */
  findByEmail(email: string): Promise<UserEntity | null>;

  /**
   * Encuentra todos los usuarios con filtros y paginación
   */
  findAll(filters: UserFilters): Promise<PaginatedResult<UserEntity>>;

  /**
   * Guarda un usuario (create o update)
   */
  save(user: UserEntity): Promise<UserEntity>;

  /**
   * Elimina un usuario por ID (hard delete - usar con precaución)
   */
  delete(id: string): Promise<void>;

  /**
   * Verifica si existe un usuario con el email
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Cuenta usuarios por rol
   */
  countByRole(role: string): Promise<number>;

  /**
   * Cuenta usuarios activos
   */
  countActive(): Promise<number>;

  /**
   * Obtiene estadísticas de usuarios
   */
  getStats(): Promise<UserStats>;

  /**
   * Encuentra usuarios por rol
   */
  findByRole(role: string): Promise<UserEntity[]>;

  /**
   * Cuenta total de usuarios con un rol específico
   * (útil para validar que no se elimine el último admin)
   */
  countAdmins(): Promise<number>;
}

/**
 * Token para inyección de dependencias
 */
export const USER_REPOSITORY = Symbol('IUserRepository');

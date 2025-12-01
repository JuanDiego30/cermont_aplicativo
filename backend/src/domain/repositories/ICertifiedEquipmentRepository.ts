/**
 * Repository Interface: ICertifiedEquipmentRepository
 * Define operaciones de persistencia para equipos certificados
 * 
 * @file backend/src/domain/repositories/ICertifiedEquipmentRepository.ts
 */

import type {
  CertifiedEquipment,
  CreateCertifiedEquipmentDTO,
  UpdateCertifiedEquipmentDTO,
  EquipmentCategory,
  EquipmentStatus,
} from '../entities/CertifiedEquipment.js';

export interface EquipmentFilters {
  category?: EquipmentCategory;
  status?: EquipmentStatus;
  search?: string;           // Búsqueda en nombre, descripción, serial
  location?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'expiryDate' | 'createdAt' | 'lastUsedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ICertifiedEquipmentRepository {
  /**
   * Crear nuevo equipo certificado
   */
  create(data: CreateCertifiedEquipmentDTO): Promise<CertifiedEquipment>;

  /**
   * Buscar por ID
   */
  findById(id: string): Promise<CertifiedEquipment | null>;

  /**
   * Listar todos con filtros y paginación
   */
  findAll(filters: EquipmentFilters): Promise<PaginatedResult<CertifiedEquipment>>;

  /**
   * Buscar por categoría
   */
  findByCategory(category: EquipmentCategory): Promise<CertifiedEquipment[]>;

  /**
   * Buscar equipos con certificación próxima a vencer
   * @param daysAhead - Días hacia adelante para buscar
   */
  findExpiringCertifications(daysAhead: number): Promise<CertifiedEquipment[]>;

  /**
   * Buscar equipos con certificación vencida
   */
  findExpiredCertifications(): Promise<CertifiedEquipment[]>;

  /**
   * Buscar por número de serie
   */
  findBySerialNumber(serialNumber: string): Promise<CertifiedEquipment | null>;

  /**
   * Buscar equipos asignados a un usuario
   */
  findByAssignedUser(userId: string): Promise<CertifiedEquipment[]>;

  /**
   * Buscar equipos disponibles por categoría
   */
  findAvailableByCategory(category: EquipmentCategory): Promise<CertifiedEquipment[]>;

  /**
   * Actualizar equipo
   */
  update(id: string, data: UpdateCertifiedEquipmentDTO): Promise<CertifiedEquipment>;

  /**
   * Eliminar equipo (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Contar equipos por estado
   */
  countByStatus(): Promise<Record<EquipmentStatus, number>>;

  /**
   * Contar equipos por categoría
   */
  countByCategory(): Promise<Record<EquipmentCategory, number>>;

  /**
   * Verificar si existe equipo con serial number
   */
  existsBySerialNumber(serialNumber: string): Promise<boolean>;

  /**
   * Marcar equipo como en uso
   */
  markAsInUse(id: string, userId: string): Promise<CertifiedEquipment>;

  /**
   * Marcar equipo como disponible
   */
  markAsAvailable(id: string): Promise<CertifiedEquipment>;

  /**
   * Actualizar fecha de último uso
   */
  updateLastUsed(id: string): Promise<void>;
}

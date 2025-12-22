/**
 * @interface IAlertaRepository
 * 
 * Interfaz del repositorio de alertas.
 * Define el contrato que debe implementar cualquier persistencia.
 * 
 * Principio DIP: El dominio define la interfaz, la infraestructura implementa.
 */

import { Alerta } from '../entities/alerta.entity';

/**
 * Resultado paginado genérico
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

/**
 * Filtros para búsqueda de alertas
 */
export interface HistorialQuery {
  usuarioId: string;
  page: number;
  limit: number;
  tipo?: string;
  estado?: string;
  prioridad?: string;
  soloNoLeidas?: boolean;
}

/**
 * Interfaz del repositorio de alertas
 */
export interface IAlertaRepository {
  /**
   * Guarda una alerta (create o update)
   */
  save(alerta: Alerta): Promise<Alerta>;

  /**
   * Encuentra una alerta por ID
   */
  findById(id: string): Promise<Alerta | null>;

  /**
   * Encuentra alertas pendientes de un usuario
   */
  findPendientesByUsuario(usuarioId: string): Promise<Alerta[]>;

  /**
   * Encuentra historial de alertas con paginación
   */
  findHistorial(query: HistorialQuery): Promise<PaginatedResult<Alerta>>;

  /**
   * Encuentra alertas fallidas que pueden reintentarse
   */
  findFallidasParaReintentar(): Promise<Alerta[]>;

  /**
   * Marca una alerta como enviada
   */
  marcarComoEnviada(id: string, canal: string): Promise<void>;

  /**
   * Marca una alerta como leída
   */
  marcarComoLeida(id: string): Promise<void>;

  /**
   * Verifica si existe una alerta similar no resuelta
   */
  findExistentAlerta(ordenId: string, tipo: string): Promise<Alerta | null>;

  /**
   * Cuenta alertas no leídas de un usuario
   */
  countNoLeidasByUsuario(usuarioId: string): Promise<number>;
}

/**
 * Token para inyección de dependencias
 */
export const ALERTA_REPOSITORY = Symbol('IAlertaRepository');


/**
 * @interface IPreferenciaAlertaRepository
 * 
 * Interfaz del repositorio de preferencias de alertas.
 * Define el contrato que debe implementar cualquier persistencia.
 */

import { PreferenciaAlerta } from '../entities/preferencia-alerta.entity';

/**
 * Interfaz del repositorio de preferencias
 */
export interface IPreferenciaAlertaRepository {
  /**
   * Guarda una preferencia (create o update)
   */
  save(preferencia: PreferenciaAlerta): Promise<PreferenciaAlerta>;

  /**
   * Encuentra todas las preferencias de un usuario
   */
  findByUsuario(usuarioId: string): Promise<PreferenciaAlerta[]>;

  /**
   * Encuentra preferencia de un usuario para un tipo específico
   */
  findByUsuarioYTipo(
    usuarioId: string,
    tipo: string,
  ): Promise<PreferenciaAlerta | null>;

  /**
   * Elimina una preferencia
   */
  delete(id: string): Promise<void>;
}

/**
 * Token para inyección de dependencias
 */
export const PREFERENCIA_ALERTA_REPOSITORY = Symbol('IPreferenciaAlertaRepository');


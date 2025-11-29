/**
 * Interface: Servicio de Caché
 * Abstracción para almacenamiento temporal de alta velocidad (Key-Value).
 * Asume que el servicio maneja serialización JSON automáticamente.
 */
export interface ICacheService {
  /**
   * Recupera un objeto tipado.
   * @returns null si no existe o expiró.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Almacena un valor.
   * @param ttlSeconds Tiempo de vida. Si no se provee, puede ser infinito o default.
   */
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;

  /**
   * Elimina una clave.
   */
  delete(key: string): Promise<void>;

  /**
   * Verifica existencia eficientemente (sin traer el valor).
   */
  exists(key: string): Promise<boolean>;

  /**
   * Borrado masivo por patrón (ej: 'users:*').
   * Crítico para invalidación de caché agrupada.
   */
  clearPattern(pattern: string): Promise<void>;

  /**
   * Limpieza total (Cuidado en producción).
   */
  clearAll(): Promise<void>;
}

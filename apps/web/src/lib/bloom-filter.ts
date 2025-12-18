/**
 * ARCHIVO: bloom-filter.ts
 * FUNCION: Bloom Filter para optimizar redirects
 * IMPLEMENTACION: Basado en vercel/examples/solutions/redirects-bloom-filter
 * USO: Verificar rápidamente si una URL necesita redirect antes de consultar DB
 */

/**
 * Implementación simple de Bloom Filter
 * Estructura probabilística para membership testing
 */
export class BloomFilter {
  private bitArray: Uint8Array;
  private size: number;
  private hashCount: number;

  constructor(size: number = 1000, hashCount: number = 3) {
    this.size = size;
    this.hashCount = hashCount;
    this.bitArray = new Uint8Array(Math.ceil(size / 8));
  }

  /**
   * Función hash simple usando FNV-1a
   */
  private hash(str: string, seed: number): number {
    let hash = 2166136261 ^ seed;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash) % this.size;
  }

  /**
   * Agregar elemento al filtro
   */
  add(item: string): void {
    for (let i = 0; i < this.hashCount; i++) {
      const index = this.hash(item, i);
      const byteIndex = Math.floor(index / 8);
      const bitIndex = index % 8;
      this.bitArray[byteIndex] |= 1 << bitIndex;
    }
  }

  /**
   * Verificar si elemento posiblemente existe
   * @returns true si posiblemente existe, false si definitivamente no existe
   */
  mightContain(item: string): boolean {
    for (let i = 0; i < this.hashCount; i++) {
      const index = this.hash(item, i);
      const byteIndex = Math.floor(index / 8);
      const bitIndex = index % 8;
      if ((this.bitArray[byteIndex] & (1 << bitIndex)) === 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Serializar filtro para almacenamiento
   */
  serialize(): string {
    return Buffer.from(this.bitArray).toString('base64');
  }

  /**
   * Deserializar filtro desde almacenamiento
   */
  static deserialize(
    data: string,
    size: number = 1000,
    hashCount: number = 3
  ): BloomFilter {
    const filter = new BloomFilter(size, hashCount);
    filter.bitArray = new Uint8Array(Buffer.from(data, 'base64'));
    return filter;
  }
}

// ─────────────────────────────────────
// Configuración de redirects con Bloom Filter
// ─────────────────────────────────────

// Cache del filtro
let redirectFilter: BloomFilter | null = null;

// Mapa de redirects (en producción, cargar de DB/Edge Config)
const redirectMap: Map<string, string> = new Map([
  ['/old-dashboard', '/dashboard'],
  ['/ordenes-trabajo', '/dashboard/ordenes'],
  ['/clientes-lista', '/dashboard/clientes'],
  ['/tecnicos-lista', '/dashboard/tecnicos'],
  ['/reportes-antiguos', '/dashboard/reportes'],
]);

/**
 * Inicializar Bloom Filter con redirects conocidos
 */
export function initRedirectFilter(): BloomFilter {
  if (redirectFilter) return redirectFilter;

  redirectFilter = new BloomFilter(1000, 3);
  
  for (const path of redirectMap.keys()) {
    redirectFilter.add(path);
  }

  return redirectFilter;
}

/**
 * Verificar si una ruta podría tener redirect
 * @param path - Ruta a verificar
 * @returns true si podría tener redirect (verificar en DB), false si no
 */
export function mightHaveRedirect(path: string): boolean {
  const filter = initRedirectFilter();
  return filter.mightContain(path);
}

/**
 * Obtener destino de redirect si existe
 * @param path - Ruta original
 * @returns URL de destino o null
 */
export function getRedirect(path: string): string | null {
  // Primero verificar con Bloom Filter (rápido)
  if (!mightHaveRedirect(path)) {
    return null;
  }

  // Si el filtro dice "maybe", verificar en el mapa real
  return redirectMap.get(path) || null;
}

/**
 * Agregar nuevo redirect al sistema
 */
export function addRedirect(from: string, to: string): void {
  redirectMap.set(from, to);
  
  // Actualizar filtro
  if (redirectFilter) {
    redirectFilter.add(from);
  }
}

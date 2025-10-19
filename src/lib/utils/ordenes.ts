export type EstadoOrden = 'pendiente' | 'en progreso' | 'finalizada';

export interface Orden {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string; // ISO
  estado: EstadoOrden;
  creadoEn: string; // ISO
  actualizadoEn: string; // ISO
}

const CLAVE = 'cermont_ordenes_v1';

function estaEnCliente() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function leer(): Orden[] {
  if (!estaEnCliente()) return [];
  try {
    const raw = localStorage.getItem(CLAVE);
    return raw ? (JSON.parse(raw) as Orden[]) : [];
  } catch {
    return [];
  }
}

function escribir(lista: Orden[]) {
  if (!estaEnCliente()) return;
  localStorage.setItem(CLAVE, JSON.stringify(lista));
}

export function listarOrdenes(): Orden[] {
  return leer().sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
}

export function obtenerOrden(id: string): Orden | null {
  const lista = leer();
  return lista.find(o => o.id === id) || null;
}

export function crearOrden(data: Omit<Orden, 'id' | 'creadoEn' | 'actualizadoEn'>): Orden {
  const lista = leer();
  const ahora = new Date().toISOString();
  const nueva: Orden = {
    id: crypto.randomUUID(),
    creadoEn: ahora,
    actualizadoEn: ahora,
    ...data,
  };
  lista.push(nueva);
  escribir(lista);
  return nueva;
}

export function actualizarOrden(id: string, cambios: Partial<Omit<Orden, 'id' | 'creadoEn'>>): Orden | null {
  const lista = leer();
  const idx = lista.findIndex(o => o.id === id);
  if (idx === -1) return null;
  const actualizado: Orden = {
    ...lista[idx],
    ...cambios,
    actualizadoEn: new Date().toISOString(),
  };
  lista[idx] = actualizado;
  escribir(lista);
  return actualizado;
}

export function eliminarOrden(id: string): boolean {
  const lista = leer();
  const nueva = lista.filter(o => o.id !== id);
  if (nueva.length === lista.length) return false;
  escribir(nueva);
  return true;
}

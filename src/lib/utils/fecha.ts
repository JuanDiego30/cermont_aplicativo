// Utilidad para formatear fechas
export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-ES');
}

/**
 * ARCHIVO: cn.ts
 * FUNCION: Utilidad para combinar clases CSS de Tailwind de forma segura
 * IMPLEMENTACION: Combina clsx para condicionales y tailwind-merge para resolver conflictos
 * DEPENDENCIAS: clsx, tailwind-merge
 * EXPORTS: cn (función)
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

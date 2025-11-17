/**
 * CERMONT ATG - Sistema de Diseño 2025
 * Paleta de colores oficial basada en el branding corporativo
 * 
 * @author Juan Diego Arévalo
 * @version 1.0.0
 * @license Propiedad de CERMONT S.A.S.
 */

/**
 * Colores primarios, secundarios, neutrales y de estado
 * organizados en escalas de 50 a 950 siguiendo convención Tailwind
 */
export const CermontColors = {
  // ========================================
  // COLORES PRIMARIOS (Del logo - Azul)
  // ========================================
  primary: {
    50: '#EBF4FC',   // Azul muy claro
    100: '#D7E9F9',  // Azul claro
    200: '#AFD3F3',  // Azul suave
    300: '#87BDED',  // Azul medio claro
    400: '#5FA7E7',  // Azul medio
    500: '#1D5FA8',  // Azul corporativo principal ⭐
    600: '#174C86',  // Azul oscuro
    700: '#113964',  // Azul muy oscuro
    800: '#0C2642',  // Azul profundo
    900: '#061321',  // Azul casi negro
  },

  // ========================================
  // COLORES SECUNDARIOS (Del logo - Verde)
  // ========================================
  secondary: {
    50: '#E8F7ED',   // Verde muy claro
    100: '#D1EFDB',  // Verde claro
    200: '#A3DFB7',  // Verde suave
    300: '#75CF93',  // Verde medio claro
    400: '#47BF6F',  // Verde medio
    500: '#2D9F4E',  // Verde corporativo ⭐
    600: '#247F3E',  // Verde oscuro
    700: '#1B5F2F',  // Verde muy oscuro
    800: '#12401F',  // Verde profundo
    900: '#092010',  // Verde casi negro
  },

  // ========================================
  // COLORES NEUTROS (Grises)
  // ========================================
  neutral: {
    50: '#F9FAFB',   // Blanco grisáceo
    100: '#F3F4F6',  // Gris muy claro
    200: '#E5E7EB',  // Gris claro
    300: '#D1D5DB',  // Gris medio claro
    400: '#9CA3AF',  // Gris medio
    500: '#6B7280',  // Gris
    600: '#4B5563',  // Gris oscuro
    700: '#374151',  // Gris muy oscuro
    800: '#2D3748',  // Gris corporativo (texto CERMONT) ⭐
    900: '#1F2937',  // Casi negro
    950: '#0F172A',  // Negro corporativo
  },

  // ========================================
  // COLORES DE ESTADO (UI Feedback)
  // ========================================
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#22C55E',  // Verde éxito
    600: '#16A34A',
    700: '#15803D',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',  // Naranja advertencia
    600: '#D97706',
    700: '#B45309',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',  // Rojo error
    600: '#DC2626',
    700: '#B91C1C',
  },

  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',  // Azul información
    600: '#2563EB',
    700: '#1D4ED8',
  },

  // ========================================
  // COLORES DE ESTADOS DE ÓRDENES
  // ========================================
  orderStates: {
    solicitud: '#3B82F6',   // Azul - Solicitud inicial
    visita: '#8B5CF6',      // Violeta - Visita técnica
    po: '#10B981',          // Verde turquesa - PO aprobada
    planeacion: '#F59E0B',  // Naranja - Planeación
    ejecucion: '#EF4444',   // Rojo - En ejecución
    informe: '#6366F1',     // Índigo - Informe final
    completada: '#22C55E',  // Verde - Completada
    archivada: '#6B7280',   // Gris - Archivada
  },

  // ========================================
  // COLORES DE FONDO Y SUPERFICIES
  // ========================================
  background: {
    primary: '#FFFFFF',     // Fondo principal
    secondary: '#F9FAFB',   // Fondo secundario
    tertiary: '#F3F4F6',    // Fondo terciario
    dark: '#0F172A',        // Fondo oscuro (dark mode)
  },

  // ========================================
  // COLORES DE BORDES
  // ========================================
  border: {
    light: '#E5E7EB',       // Borde claro
    default: '#D1D5DB',     // Borde por defecto
    dark: '#9CA3AF',        // Borde oscuro
    focus: '#1D5FA8',       // Borde enfocado (azul corporativo)
  },

  // ========================================
  // GRADIENTES CORPORATIVOS
  // ========================================
  gradients: {
    primary: 'linear-gradient(135deg, #1D5FA8 0%, #2D9F4E 100%)',
    primaryReverse: 'linear-gradient(135deg, #2D9F4E 0%, #1D5FA8 100%)',
    subtle: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
    dark: 'linear-gradient(135deg, #2D3748 0%, #1F2937 100%)',
  },
} as const;

/**
 * Aliases de colores para acceso rápido
 * Uso: Colors.brand, Colors.text, etc.
 */
export const Colors = {
  // Colores principales
  cermont: {
    blue: CermontColors.primary[500],
    green: CermontColors.secondary[500],
    gray: CermontColors.neutral[800],
  },

  // Atajos frecuentes
  brand: CermontColors.primary[500],
  brandSecondary: CermontColors.secondary[500],
  text: CermontColors.neutral[800],
  textLight: CermontColors.neutral[600],
  textMuted: CermontColors.neutral[500],
} as const;

/**
 * Tipos de TypeScript para autocompletado
 */
export type CermontColorKey = keyof typeof CermontColors;
export type CermontColorScale = keyof typeof CermontColors.primary;
export type CermontColor = typeof CermontColors;

/**
 * Compatibilidad con código legacy
 * @deprecated Usar CermontColors directamente
 */
export const CERMONT_COLORS = CermontColors;

/**
 * Integración con Tailwind CSS
 * Importar en tailwind.config.ts:
 * 
 * @example
 * import { CermontColors } from './components/shared/paleta-colores';
 * 
 * export default {
 *   theme: {
 *     extend: {
 *       colors: CermontColors,
 *     },
 *   },
 * }
 */
export const TAILWIND_COLORS = {
  ...CermontColors,
};



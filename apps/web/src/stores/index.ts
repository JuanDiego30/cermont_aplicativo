/**
 * ARCHIVO: index.ts (stores)
 * FUNCION: Barrel file que re-exporta todos los stores Zustand
 * IMPLEMENTACION: Patrón barrel export para imports centralizados
 * DEPENDENCIAS: authStore, uiStore
 * EXPORTS: useAuthStore, useAuth, useUIStore, useInitializeTheme
 */
export { useAuthStore, useAuth } from './authStore';
export { useUIStore, useInitializeTheme } from './uiStore';

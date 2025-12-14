/**
 * ARCHIVO: api.ts
 * FUNCION: Re-exportación para compatibilidad con código legacy
 * IMPLEMENTACION: Barrel export que redirige a api-client.ts
 * DEPENDENCIAS: ./api-client
 * EXPORTS: apiClient, ApiException, ApiError
 * @deprecated Usar @/lib/api-client directamente
 */
export { apiClient, ApiException, type ApiError } from './api-client';

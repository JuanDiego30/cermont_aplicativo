/**
 * ARCHIVO: index.ts
 * FUNCION: Barrel file que centraliza y re-exporta todos los servicios
 * IMPLEMENTACION: Patron barrel/index para simplificar imports
 * DEPENDENCIAS: Todos los servicios del directorio
 * EXPORTS: authService, ordersService, usersService, weatherApi
 */
export { authService } from './auth.service';
export { ordersService } from './orders.service';
export { usersService } from './users.service';
export { weatherApi } from './weather.service';

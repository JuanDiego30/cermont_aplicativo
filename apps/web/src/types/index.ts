/**
 * ARCHIVO: index.ts (types)
 * FUNCION: Barrel file que re-exporta todos los tipos del dominio
 * IMPLEMENTACION: Patrón barrel export para imports centralizados
 * DEPENDENCIAS: api, user, order, client, kit, evidence, workplan, costing, report, notification
 * EXPORTS: Todos los tipos de los módulos importados
 */
export * from './api';
export * from './user';
export * from './order';
export * from './client';
export * from './kit';
export * from './evidence';
export * from './workplan';
export * from './costing';
export * from './report';
export * from './notification';

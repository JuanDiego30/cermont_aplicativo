/**
 * ARCHIVO: index.ts
 * FUNCION: Barrel export para componentes de layout
 * IMPLEMENTACION: Re-exporta todos los componentes del directorio layout
 * DEPENDENCIAS: app-header, app-sidebar, Backdrop
 * EXPORTS: AppHeader, AppSidebar, Backdrop (default exports)
 */
export * from './app-header';
export * from './app-sidebar';
export { default as Backdrop } from './Backdrop';

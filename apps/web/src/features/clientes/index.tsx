/**
 * ARCHIVO: index.tsx
 * FUNCION: Punto de entrada público del módulo de clientes
 * IMPLEMENTACION: Re-exporta tipos, hooks, servicios y componentes placeholder
 * DEPENDENCIAS: ./types, ./hooks, ./services
 * EXPORTS: ClienteTypes, useClientes hooks, clientesService, componentes UI
 */
// Types
export * from './types/clientes.types';

// Hooks
export {
    clientesKeys,
    useClientes,
    useCliente,
    useClientesStats,
    useCreateCliente,
    useUpdateCliente,
    useDeleteCliente,
    useToggleClienteActivo,
} from './hooks/use-clientes';

// Services
export { clientesService } from './services/clientes.service';

// Components (TODO: Implement properly)
export const ClientesGrid = (_props: { clientes?: any[]; isLoading?: boolean }) => null;
export const ClientesGridSkeleton = () => null;
export const ClienteCard = (_props: { cliente: any }) => null;
export const ClienteCardSkeleton = () => null;

// Config
export const ESTADO_CLIENTE_CONFIG = {
    activo: { label: 'Activo', color: 'green' },
    inactivo: { label: 'Inactivo', color: 'red' },
};

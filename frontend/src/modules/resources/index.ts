/**
 * Resources Module — Public Barrel
 *
 * Exposes the data layer (API + hooks + query keys) and UI components
 * for resource management across the Cermont catalog.
 *
 * @see backend/src/modules/resource/ for the corresponding backend module.
 * @see @cermont/shared-types/schemas/resource.schema.ts for the contract.
 */

export * from "./api/resources.api";
export * from "./hooks/useResources";
export * from "./model/queryKeys";
export * from "./ui/ResourceForm";
export * from "./ui/ResourceImageEditor";

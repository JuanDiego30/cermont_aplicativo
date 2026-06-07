/**
 * Kits Module — Public Barrel
 *
 * Exposes the data layer (API + hooks + query keys) and UI components
 * for kit template management.
 *
 * @see backend/src/modules/kit/ for the corresponding backend module.
 * @see @cermont/shared-types/schemas/kit.schema.ts for the contract.
 */

export * from "./api/kits.api";
export * from "./hooks/useKits";
export * from "./model/queryKeys";
export * from "./ui/KitForm";

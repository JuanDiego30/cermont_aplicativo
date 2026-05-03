/**
 * validate-query.middleware.ts — Query string validation (DOC-04, sección 8)
 *
 * Backward-compatible export for query validation middleware.
 *
 * Canonical implementation lives in:
 *   src/_shared/middlewares/validate.ts
 *
 * Usage:
 *   router.get('/orders', validateQuery(listOrdersQuerySchema), listOrders)
 */

export { validateQuery } from "../../middlewares/validate";

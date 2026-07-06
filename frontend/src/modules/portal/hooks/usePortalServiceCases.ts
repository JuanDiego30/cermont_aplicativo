/**
 * usePortalServiceCases — TanStack Query hooks for the client portal module.
 *
 * Service cases in the client portal are backed by the real portal endpoints
 * (`GET /portal/orders`, `GET /portal/orders/:id`), so these hooks delegate to
 * the canonical `portal-api` implementation instead of duplicating fetch logic.
 */

export {
	type PortalOrderDetail,
	type PortalOrderSummary,
	usePortalOrderDetail as usePortalServiceCaseDetail,
	usePortalOrders as usePortalServiceCases,
} from "../api/portal-api";

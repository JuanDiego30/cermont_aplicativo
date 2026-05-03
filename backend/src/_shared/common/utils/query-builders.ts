/**
 * Query Builders Utility
 *
 * Provides reusable query building functions to eliminate duplication across services.
 * Follows DRY principle by centralizing common query patterns.
 */

/**
 * Date range filter parameters
 */
export interface DateRangeFilter {
	startDate?: string;
	endDate?: string;
}

/**
 * User context for RBAC filtering
 */
export interface UserContext {
	id: string;
	role: string;
}

/**
 * Builds a MongoDB date range filter
 *
 * @param filter - Date range parameters
 * @param fieldName - The field to filter on (default: 'createdAt')
 * @returns MongoDB filter object with date range conditions
 *
 * @example
 * const filter = buildDateRangeFilter({ startDate: '2024-01-01', endDate: '2024-12-31' });
 * // Returns: { createdAt: { $gte: Date('2024-01-01'), $lte: Date('2024-12-31') } }
 */
export function buildDateRangeFilter(
	filter: DateRangeFilter,
	fieldName: string = "createdAt",
): Record<string, unknown> {
	const dateFilter: Record<string, unknown> = {};

	if (filter.startDate || filter.endDate) {
		const rangeCondition: Record<string, Date> = {};

		if (filter.startDate) {
			rangeCondition.$gte = new Date(filter.startDate);
		}

		if (filter.endDate) {
			rangeCondition.$lte = new Date(filter.endDate);
		}

		dateFilter[fieldName] = rangeCondition;
	}

	return dateFilter;
}

/**
 * Applies Role-Based Access Control (RBAC) filtering to a query
 *
 * Security by design: Ensures technicians only see their assigned orders,
 * while admins and supervisors see all data.
 *
 * @param user - User context with id and role
 * @param baseFilter - Existing filter to merge with RBAC constraints
 * @returns Filter object with RBAC constraints applied
 *
 * @example
 * const baseFilter = { status: 'active' };
 * const user = { id: '123', role: 'tecnico' };
 * const filter = applyRBACFilter(user, baseFilter);
 * // Returns: { status: 'active', assignedTechnician: '123' }
 */
export function applyRBACFilter(
	user: UserContext | undefined,
	baseFilter: Record<string, unknown>,
): Record<string, unknown> {
	// No user context = return base filter unchanged
	if (!user) {
		return baseFilter;
	}

	// Technicians can only see their own assigned orders
	// Implements principle of least privilege
	if (user.role === "tecnico") {
		return {
			...baseFilter,
			assignedTechnician: user.id,
		};
	}

	// Admin and Supervisor roles see all data
	return baseFilter;
}

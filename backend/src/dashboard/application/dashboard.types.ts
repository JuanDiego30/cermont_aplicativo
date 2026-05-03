export interface GroupCount {
	_id: string;
	count: number;
}

export interface ChecklistAggregateRow {
	_id: null;
	total: number;
	completed: number;
}

export interface FinancialAggregateRow {
	_id: null;
	total_actual: number;
	count: number;
}

export interface LeadTimeAggregateRow {
	_id: null;
	avg_lead_time_days: number | null;
	min_lead_time_days: number | null;
	max_lead_time_days: number | null;
	count: number;
}

export interface KpiOverview {
	total_orders: number;
	active_orders: number;
	overdue_orders: number;
	closed_orders: number;
	maintenance_open_count: number;
	resource_in_use_count: number;
	completed_month_count: number;
}

export interface KpiFinancial {
	total_actual: number;
	count: number;
	currency: string;
}

export interface KpiChecklists {
	total: number;
	completed: number;
	completion_rate_pct: number;
}

export interface KpiLeadTime {
	avg_lead_time_days: number | null;
	min_lead_time_days: number | null;
	max_lead_time_days: number | null;
	count: number;
}

export interface KpiResult {
	overview: KpiOverview;
	by_stage: Record<string, number>;
	by_priority: Record<string, number>;
	by_type: Record<string, number>;
	financial: KpiFinancial;
	checklists: KpiChecklists;
	lead_time: KpiLeadTime;
	generated_at: string;
}

export interface ErrorDashboardResult {
	total_errors: number;
	by_module: Array<{ module: string; count: number }>;
	by_endpoint: Array<{ module: string; endpoint: string; count: number; last_error_at: string }>;
	generated_at: string;
}

export interface KpiFilters {
	startDate?: string;
	endDate?: string;
	client?: string;
}

export interface DateWindow {
	start: Date;
	end: Date;
}

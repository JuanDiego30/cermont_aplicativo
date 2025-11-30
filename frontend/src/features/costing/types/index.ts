export interface CostBreakdownItem {
    id: string;
    workPlanId: string;
    category: string; // LABOR, MATERIALS, EQUIPMENT, TRANSPORT, OTHER, TAX
    description: string;
    estimatedAmount: number;
    actualAmount: number | null;
    quantity: number;
    unitPrice: number | null;
    taxRate: number;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CostSummary {
    totalEstimated: number;
    totalActual: number;
    variance: number;
    variancePercent: number;
    byCategory: Record<string, {
        estimated: number;
        actual: number;
    }>;
}

export interface CostBreakdownResponse {
    success: boolean;
    data: CostBreakdownItem[] | CostSummary;
}

interface SystemOverview {
    users: UserStats;
    orders: OrderStatsExt;
    performance: PerformanceStats;
    activity: ActivityStats;
    generatedAt: Date;
}
interface UserStats {
    total: number;
    active: number;
    inactive: number;
    byRole: Array<{
        _id: string;
        count: number;
    }>;
    newThisMonth: number;
    growth: Array<{
        month: string;
        count: number;
    }>;
}
interface OrderStatsExt {
    total: number;
    byStatus: Partial<Record<OrderStatus, number>>;
    completedThisMonth: number;
    overdue: number;
    averageCompletionTime: {
        averageDays: number;
        minDays: number;
        maxDays: number;
    };
    costs: {
        totalEstimated: number;
        totalReal: number;
        averageEstimated: number;
        averageReal: number;
        profitMargin: number;
    };
}
interface PerformanceStats {
    completionRate: number;
    averageResponseTime: number;
    onTimeCompletion: number;
    userProductivity: Array<{
        userId: string;
        nombre: string;
        completedOrders: number;
        totalEstimatedCost: number;
        totalRealCost: number;
        efficiency: number;
    }>;
}
interface ActivityStats {
    last24h: {
        newOrders: number;
        newUsers: number;
    };
    last7d: {
        newOrders: number;
        newUsers: number;
    };
    last30d: {
        newOrders: number;
        newUsers: number;
    };
}
interface Filters {
    fechaDesde?: Date;
    fechaHasta?: Date;
    rol?: string;
    estado?: OrderStatus;
}
interface StatsService {
    getSystemOverview: (filters?: Partial<Filters>) => Promise<SystemOverview>;
    getUserStats: (filters?: Partial<Filters>) => Promise<UserStats>;
    getOrderStats: () => Promise<OrderStatsExt>;
    getPerformanceStats: (filters?: Partial<Filters>) => Promise<PerformanceStats>;
    getActivityStats: (filters?: Partial<Filters>) => Promise<ActivityStats>;
    getUserGrowthStats: () => Promise<Array<{
        month: string;
        count: number;
    }>>;
    getOrdersByStatus: (baseFilter: any) => Promise<Partial<Record<OrderStatus, number>>>;
    getAverageCompletionTime: () => Promise<{
        averageDays: number;
        minDays: number;
        maxDays: number;
    }>;
    getOrderCostStats: (baseFilter: any) => Promise<OrderStatsExt['costs']>;
    getCompletionRate: () => Promise<number>;
    getAverageResponseTime: () => Promise<number>;
    getOnTimeCompletionRate: () => Promise<number>;
    getUserProductivityStats: () => Promise<PerformanceStats['userProductivity']>;
    clearStatsCache: () => Promise<void>;
}
declare class StatsService implements StatsService {
    getSystemOverview(filters?: Partial<Filters>): Promise<SystemOverview>;
    getUserStats(filters?: Partial<Filters>): Promise<UserStats>;
    getOrderStats(): Promise<OrderStatsExt>;
    getPerformanceStats(filters?: Partial<Filters>): Promise<PerformanceStats>;
    getActivityStats(filters?: Partial<Filters>): Promise<ActivityStats>;
    private getUserGrowthStats;
    getOrdersByStatus(baseFilter: any): Promise<Partial<Record<OrderStatus, number>>>;
    getAverageCompletionTime(): Promise<{
        averageDays: number;
        minDays: number;
        maxDays: number;
    }>;
    getOrderCostStats(baseFilter: any): Promise<OrderStatsExt['costs']>;
    getCompletionRate(): Promise<number>;
    getAverageResponseTime(): Promise<number>;
    getOnTimeCompletionRate(): Promise<number>;
    getUserProductivityStats(): Promise<PerformanceStats['userProductivity']>;
    clearStatsCache(): Promise<void>;
    private getMonthStart;
}
declare const _default: StatsService;
export default _default;
export type { SystemOverview, UserStats, OrderStatsExt, PerformanceStats, ActivityStats, Filters, StatsService };
//# sourceMappingURL=stats.service.d.ts.map
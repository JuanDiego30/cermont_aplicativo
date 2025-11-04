import type { WorkPlan, CreateWorkPlanData, WorkPlanFilters, WorkPlansResponse } from '@/types/workplan.types';
import type { CreateWorkPlanFormData } from '../schemas/workplan.schema';
export declare const workplansService: {
    createWorkPlan(data: CreateWorkPlanFormData): Promise<WorkPlan>;
    getWorkPlans(filters?: WorkPlanFilters, cursor?: string, limit?: number): Promise<WorkPlansResponse>;
    getWorkPlanById(id: string): Promise<WorkPlan>;
    updateWorkPlan(id: string, data: Partial<CreateWorkPlanData>): Promise<WorkPlan>;
    deleteWorkPlan(id: string): Promise<void>;
    approveWorkPlan(id: string, comentarios?: string): Promise<WorkPlan>;
};
export declare const createWorkPlan: (data: CreateWorkPlanFormData) => Promise<WorkPlan>;
export declare const getWorkPlans: (filters?: WorkPlanFilters, cursor?: string, limit?: number) => Promise<WorkPlansResponse>;
export declare const getWorkPlanById: (id: string) => Promise<WorkPlan>;
//# sourceMappingURL=workplans.service.d.ts.map
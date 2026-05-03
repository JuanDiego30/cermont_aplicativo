import type { ICostControl } from "../infrastructure/cost-control.model";

export interface ICostControlRepository {
	findOne(filter: Record<string, unknown>): Promise<ICostControl | null>;
	findOneLean(filter: Record<string, unknown>): Promise<ICostControl | null>;
	create(data: Partial<ICostControl>): Promise<ICostControl>;
	save(costControl: ICostControl): Promise<ICostControl>;
}

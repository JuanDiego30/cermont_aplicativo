import type { IPrivacyRequest } from "./privacy-requests.model";
import { PrivacyRequest } from "./privacy-requests.model";

export const privacyRequestsService = {
	async list(userId?: string): Promise<IPrivacyRequest[]> {
		const filter = userId ? { userId } : {};
		return PrivacyRequest.find(filter).sort({ submittedAt: -1 }).lean();
	},

	async get(id: string): Promise<IPrivacyRequest | null> {
		return PrivacyRequest.findById(id).lean();
	},

	async create(data: {
		userId: string;
		type: IPrivacyRequest["type"];
		description: string;
	}): Promise<IPrivacyRequest> {
		return PrivacyRequest.create({
			...data,
			status: "pending",
			submittedAt: new Date(),
		});
	},
};

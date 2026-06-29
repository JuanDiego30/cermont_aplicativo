import { FileAssetCategory, FileAssetEntityType, type FileAssetRef } from "@cermont/shared-types";
import { z } from "zod";

export const CreateMediaAssetSchema = z.object({
	ownerType: FileAssetEntityType,
	ownerId: z.string().min(1),
	category: FileAssetCategory,
	description: z.string().max(500).optional(),
	tags: z.array(z.string().min(1).max(50)).max(20).optional(),
});
export type CreateMediaAssetInput = z.infer<typeof CreateMediaAssetSchema>;

export const UpdateMediaAssetSchema = z.object({
	description: z.string().max(500).optional(),
	tags: z.array(z.string().min(1).max(50)).max(20).optional(),
	category: FileAssetCategory.optional(),
});
export type UpdateMediaAssetInput = z.infer<typeof UpdateMediaAssetSchema>;

export const MediaAssetIdSchema = z.object({ id: z.string().min(1) });
export type MediaAssetIdParams = z.infer<typeof MediaAssetIdSchema>;

export const MediaOwnerParamsSchema = z.object({
	ownerType: FileAssetEntityType,
	ownerId: z.string().min(1),
});
export type MediaOwnerParams = z.infer<typeof MediaOwnerParamsSchema>;

export const ListMediaQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	category: FileAssetCategory.optional(),
});
export type ListMediaQuery = z.infer<typeof ListMediaQuerySchema>;

export interface MediaAssetRecord {
	id: string;
	ownerType: FileAssetEntityType;
	ownerId: string;
	category: FileAssetCategory;
	description?: string;
	tags?: string[];
	fileAssets: FileAssetRef[];
	createdAt: Date;
	updatedAt: Date;
}

export interface MediaAssetListResult {
	data: MediaAssetRecord[];
	pagination: { page: number; limit: number; total: number; totalPages: number };
}

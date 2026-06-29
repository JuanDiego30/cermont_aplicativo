import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	deleteMediaAsset,
	getMediaAsset,
	listMediaAssets,
	type MediaListParams,
	uploadMediaAsset,
} from "./api/media";

export const mediaKeys = {
	list: (params: MediaListParams) => ["media", "list", params],
	detail: (id: string) => ["media", "detail", id],
};

export function useMediaAssets(params: MediaListParams) {
	return useQuery({
		queryKey: mediaKeys.list(params),
		queryFn: () => listMediaAssets(params),
	});
}

export function useMediaAsset(id: string) {
	return useQuery({
		queryKey: mediaKeys.detail(id),
		queryFn: () => getMediaAsset(id),
		enabled: Boolean(id),
	});
}

export function useUploadMediaAsset() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ file, ...params }: Parameters<typeof uploadMediaAsset>[0] & { file: File }) =>
			uploadMediaAsset(params, file),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["media", "list", { ownerType: variables.ownerType, ownerId: variables.ownerId }],
			});
		},
	});
}

export function useDeleteMediaAsset() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteMediaAsset,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["media"] });
		},
	});
}

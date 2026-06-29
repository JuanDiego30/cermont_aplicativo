"use client";

import type { MediaAsset } from "../api/media";
import { useMediaAssets } from "../queries";
import { MediaCard } from "./MediaCard";

interface MediaGalleryProps {
	ownerType: string;
	ownerId: string;
	onDelete?: (id: string) => void;
}

export function MediaGallery({ ownerType, ownerId, onDelete }: MediaGalleryProps) {
	const { data, isLoading, error, refetch } = useMediaAssets({ ownerType, ownerId });

	if (isLoading) {
		return (
			<div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
				Loading media...
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
				<p className="text-sm text-red-600">Failed to load media</p>
				<button
					type="button"
					onClick={() => refetch()}
					className="mt-2 text-sm font-medium text-cermont-blue hover:underline"
				>
					Retry
				</button>
			</div>
		);
	}

	if (!data?.data.length) {
		return (
			<div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
				No media assets found.
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{data.data.map((asset: MediaAsset) => (
				<MediaCard key={asset.id} asset={asset} onDelete={onDelete} />
			))}
		</div>
	);
}

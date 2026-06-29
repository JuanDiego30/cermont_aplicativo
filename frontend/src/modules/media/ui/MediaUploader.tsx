"use client";

import { useRef } from "react";
import { Button } from "@/core/ui/Button";
import { useUploadMediaAsset } from "../queries";

interface MediaUploaderProps {
	ownerType: string;
	ownerId: string;
	onUploaded?: () => void;
}

export function MediaUploader({ ownerType, ownerId, onUploaded }: MediaUploaderProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const mutation = useUploadMediaAsset();

	const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		try {
			await mutation.mutateAsync({
				ownerType,
				ownerId,
				category: "document",
				file,
			});
			onUploaded?.();
		} catch (error) {
			console.error("Upload failed", error);
		} finally {
			event.target.value = "";
		}
	};

	return (
		<div>
			<input
				ref={inputRef}
				type="file"
				className="hidden"
				onChange={handleChange}
				accept="image/*,.pdf,.doc,.docx"
			/>
			<Button type="button" onClick={() => inputRef.current?.click()} disabled={mutation.isPending}>
				{mutation.isPending ? "Uploading..." : "Upload media"}
			</Button>
			{mutation.isError && (
				<p className="mt-2 text-sm text-red-600">Upload failed. Please try again.</p>
			)}
		</div>
	);
}

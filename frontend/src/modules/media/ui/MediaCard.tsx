"use client";

import { File, FileText, Image, Trash2, Video } from "lucide-react";
import { Button } from "@/core/ui/Button";
import type { MediaAsset } from "../api/media";

const categoryIcons: Record<string, React.ReactNode> = {
	photo: <Image className="h-5 w-5" />,
	video: <Video className="h-5 w-5" />,
	document: <FileText className="h-5 w-5" />,
	signature: <FileText className="h-5 w-5" />,
	diagram: <Image className="h-5 w-5" />,
	report_attachment: <FileText className="h-5 w-5" />,
	other: <File className="h-5 w-5" />,
};

interface MediaCardProps {
	asset: MediaAsset;
	onDelete?: (id: string) => void;
}

export function MediaCard({ asset, onDelete }: MediaCardProps) {
	const file = asset.fileAssets[0];
	if (!file) {
		return null;
	}

	return (
		<div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
			<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
				{categoryIcons[asset.category] ?? <File className="h-5 w-5" />}
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-gray-900">{file.originalName}</p>
				<p className="text-xs text-gray-500">
					{(file.sizeBytes / 1024).toFixed(1)} KB • {file.mimeType}
				</p>
			</div>
			{onDelete && (
				<Button
					variant="ghost"
					size="icon"
					aria-label="Delete media"
					onClick={() => onDelete(asset.id)}
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			)}
		</div>
	);
}

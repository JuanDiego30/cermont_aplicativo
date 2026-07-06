"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/lib/http/api-client";
//import { Skeleton } from "@/components/ui/skeleton";

import { ImageIcon, X } from "lucide-react";

interface EvidenceItem {
	_id: string;
	title?: string;
	fileAssetId?: string;
	thumbnailUrl?: string;
	fsmStatus: string;
	rejection?: Record<string, unknown>;
}

interface EvidenceGalleryProps {
	orderId: string;
	readOnly?: boolean;
}

export function EvidenceGallery({ orderId, readOnly }: EvidenceGalleryProps) {
	const [selected, setSelected] = useState<EvidenceItem | null>(null);
	const [rejectionReason, setRejectionReason] = useState("");

	const { data, isLoading, error } = useQuery<{ data: EvidenceItem[] }>({
		queryKey: ["evidences", orderId],
		queryFn: () => apiClient.get(`/evidences?orderId=${orderId}`),
	});

	if (isLoading) {
		return (
			<div className="grid grid-cols-3 gap-4">
				{["ev-1", "ev-2", "ev-3", "ev-4", "ev-5", "ev-6"].map((id) => (
					<div
						key={id}
						className="aspect-video rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"
					/>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg">
				Could not load evidence
			</div>
		);
	}

	const items = (data?.data || data || []) as EvidenceItem[];

	if (items.length === 0) {
		return (
			<div className="flex flex-col items-center gap-2 p-8 text-gray-400">
				<ImageIcon className="size-12" />
				<p>No evidence uploaded yet</p>
			</div>
		);
	}

	return (
		<>
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
				{items.map((ev) => (
					<button
						key={ev._id}
						type="button"
						onClick={() => setSelected(ev)}
						className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-cermont-blue transition-all"
					>
						<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
						<div className="absolute bottom-1 left-1 right-1">
							<span className="text-[10px] text-white px-1 py-0.5 rounded bg-black/50">
								{ev.fsmStatus}
							</span>
						</div>
					</button>
				))}
			</div>

			{selected && (
				<Dialog.Root open onOpenChange={() => setSelected(null)}>
					<Dialog.Portal>
						<Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in" />
						<Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto focus:outline-none">
							<Dialog.Close asChild>
								<button
									type="button"
									className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
								>
									<X className="size-5" />
								</button>
							</Dialog.Close>
							<Dialog.Title className="text-lg font-semibold mb-2">
								{selected.title || "Evidence"}
							</Dialog.Title>
							<div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
								<p>Status: {selected.fsmStatus}</p>
							</div>
							{!readOnly && selected.fsmStatus === "rejected" && (
								<div className="mt-4">
									<label htmlFor="rejection-reason" className="block text-sm font-medium mb-1">
										Replacement reason
									</label>
									<textarea
										id="rejection-reason"
										value={rejectionReason}
										onChange={(e) => setRejectionReason(e.target.value)}
										className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-transparent focus:ring-2 focus:ring-cermont-blue focus:outline-none"
										rows={3}
										placeholder="Why is this evidence being replaced?"
									/>
								</div>
							)}
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog.Root>
			)}
		</>
	);
}

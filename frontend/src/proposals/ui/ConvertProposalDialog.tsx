"use client";

import {
	type ConvertProposalToOrderInput,
	ConvertProposalToOrderSchema,
} from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { ClipboardCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, FormField, Select, TextArea, TextField } from "@/core";
import { PRIORITY_OPTIONS, TYPE_OPTIONS } from "@/orders/ui/OrderFormFields";
import { useConvertProposal } from "@/proposals/queries";

interface ConvertProposalDialogProps {
	proposalId: string;
	proposalTitle: string;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ConvertProposalDialog({
	proposalId,
	proposalTitle,
	isOpen,
	onOpenChange,
}: ConvertProposalDialogProps) {
	const router = useRouter();
	const convertMutation = useConvertProposal(proposalId);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<ConvertProposalToOrderInput>({
		resolver: zodResolver(ConvertProposalToOrderSchema),
		defaultValues: {
			type: "maintenance",
			priority: "medium",
			description: proposalTitle,
			assetId: "",
			assetName: "",
			location: "",
		},
	});

	const onSubmit = (data: ConvertProposalToOrderInput) => {
		convertMutation.mutate(data, {
			onSuccess: (newOrder) => {
				toast.success("Proposal converted to order successfully");
				onOpenChange(false);
				reset();
				if (newOrder.order?._id) {
					router.push(`/orders/${newOrder.order._id}`);
				}
			},
			onError: (error: Error) => {
				toast.error(error.message || "Proposal could not be converted");
			},
		});
	};

	return (
		<Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200" />
				<Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950 animate-in zoom-in-95 fade-in duration-200">
					<div className="mb-6 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
								<ClipboardCheck className="h-6 w-6" aria-hidden="true" />
							</div>
							<div>
								<Dialog.Title className="text-xl font-bold text-slate-900 dark:text-white">
									Convert to order
								</Dialog.Title>
								<Dialog.Description className="text-sm text-slate-500 dark:text-slate-400">
									Create a work order based on this proposal.
								</Dialog.Description>
							</div>
						</div>
						<Dialog.Close
							className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
							aria-label="Close conversion dialog"
						>
							<X className="h-5 w-5" />
						</Dialog.Close>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField name="type" label="Work type" error={errors.type?.message} required>
								<Select id="type" {...register("type")}>
									{TYPE_OPTIONS.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</Select>
							</FormField>

							<FormField name="priority" label="Priority" error={errors.priority?.message} required>
								<Select id="priority" {...register("priority")}>
									{PRIORITY_OPTIONS.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</Select>
							</FormField>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormField name="assetId" label="Asset ID" error={errors.assetId?.message} required>
								<TextField id="assetId" placeholder="Example: GEN-001" {...register("assetId")} />
							</FormField>

							<FormField
								name="assetName"
								label="Asset name"
								error={errors.assetName?.message}
								required
							>
								<TextField
									id="assetName"
									placeholder="Example: Electric generator"
									{...register("assetName")}
								/>
							</FormField>
						</div>

						<FormField name="location" label="Location" error={errors.location?.message} required>
							<TextField
								id="location"
								placeholder="Example: Plant 1, Sector B"
								{...register("location")}
							/>
						</FormField>

						<FormField
							name="description"
							label="Work description"
							error={errors.description?.message}
						>
							<TextArea
								id="description"
								rows={3}
								placeholder="Describe the work scope..."
								{...register("description")}
							/>
						</FormField>

						<div className="mt-6 flex justify-end gap-3">
							<Dialog.Close asChild>
								<Button variant="ghost">Cancel</Button>
							</Dialog.Close>
							<Button type="submit" variant="primary" loading={convertMutation.isPending}>
								Create order
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

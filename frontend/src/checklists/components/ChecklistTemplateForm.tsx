"use client";

import type { ChecklistTemplate, CreateChecklistTemplateInput } from "@cermont/shared-types";
import {
	ChecklistFieldTypeSchema,
	ChecklistItemCategorySchema,
	CreateChecklistTemplateSchema,
} from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateChecklistTemplate, useUpdateChecklistTemplate } from "@/checklists/queries";
import { Button } from "@/core/ui/Button";

interface ChecklistTemplateFormProps {
	initialData?: ChecklistTemplate;
	templateId?: string;
}

export function ChecklistTemplateForm({ initialData, templateId }: ChecklistTemplateFormProps) {
	const router = useRouter();
	const createMutation = useCreateChecklistTemplate();
	const updateMutation = useUpdateChecklistTemplate(templateId ?? "");

	// Use the schema's inferred type directly - Zod 4.x compatibility
	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateChecklistTemplateInput>({
		// Cast required due to Zod 4.x resolver type incompatibility with react-hook-form
		// See: https://github.com/react-hook-form/resolvers/issues/540
		resolver: zodResolver(CreateChecklistTemplateSchema) as never,
		defaultValues: {
			name: initialData?.name ?? "",
			description: initialData?.description ?? "",
			category: initialData?.category ?? "",
			items: initialData?.items ?? [],
			version: initialData?.version ?? "1.0.0",
			isActive: initialData?.isActive ?? true,
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "items",
	});

	const onSubmit = async (data: CreateChecklistTemplateInput) => {
		try {
			if (templateId) {
				await updateMutation.mutateAsync(data);
				toast.success("Plantilla actualizada");
			} else {
				await createMutation.mutateAsync(data);
				toast.success("Plantilla creada");
			}
			router.push("/catalog/checklists");
		} catch (_err) {
			toast.error("Error al guardar la plantilla");
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
			<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
				<h2 className="mb-6 text-lg font-semibold">Información General</h2>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div className="space-y-2">
						<label htmlFor="templateName" className="text-sm font-medium">
							Nombre de la Plantilla
						</label>
						<input
							id="templateName"
							{...register("name")}
							className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
							placeholder="Ej: Inspección de Seguridad"
						/>
						{errors.name && <p className="text-xs text-red-500">{errors.name.message as string}</p>}
					</div>
					<div className="space-y-2">
						<label htmlFor="templateCategory" className="text-sm font-medium">
							Categoría
						</label>
						<input
							id="templateCategory"
							{...register("category")}
							className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
							placeholder="Ej: HSE, Mantenimiento"
						/>
					</div>
					<div className="space-y-2 md:col-span-2">
						<label htmlFor="templateDescription" className="text-sm font-medium">
							Descripción
						</label>
						<textarea
							id="templateDescription"
							{...register("description")}
							rows={3}
							className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
							placeholder="Breve descripción del propósito..."
						/>
					</div>
				</div>
			</section>

			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">Items de Verificación</h2>
					<Button
						type="button"
						onClick={() =>
							append({
								id: crypto.randomUUID(),
								description: "",
								category: "procedure",
								type: "boolean",
								required: false,
								options: [],
							})
						}
					>
						<Plus className="h-4 w-4" /> Agregar Item
					</Button>
				</div>

				<div className="space-y-4">
					{fields.map((field, index) => (
						<div
							key={field.id}
							className="group relative flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 dark:border-slate-800 dark:bg-slate-950"
						>
							<div className="flex items-start gap-4">
								<div className="mt-2 cursor-grab text-slate-300">
									<GripVertical className="h-5 w-5" />
								</div>
								<div className="flex-1 space-y-4">
									<div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
										<div className="lg:col-span-6">
											<input
												{...register(`items.${index}.description`)}
												placeholder="Descripción del requisito..."
												className="w-full border-b border-slate-200 py-1 text-sm font-medium outline-none focus:border-blue-500"
											/>
										</div>
										<div className="lg:col-span-3">
											<select
												{...register(`items.${index}.category`)}
												className="w-full bg-transparent text-xs text-slate-500 outline-none"
											>
												{ChecklistItemCategorySchema.options.map((cat) => (
													<option key={cat} value={cat}>
														{cat}
													</option>
												))}
											</select>
										</div>
										<div className="lg:col-span-3">
											<select
												{...register(`items.${index}.type`)}
												className="w-full bg-transparent text-xs text-blue-600 font-semibold outline-none"
											>
												{ChecklistFieldTypeSchema.options.map((t) => (
													<option key={t} value={t}>
														{t}
													</option>
												))}
											</select>
										</div>
									</div>

									<div className="flex items-center gap-6">
										<label className="flex items-center gap-2 text-xs font-medium text-slate-600">
											<input
												type="checkbox"
												{...register(`items.${index}.required`)}
												className="h-3.5 w-3.5 rounded border-slate-300"
											/>
											¿Es crítico / requerido?
										</label>
									</div>
								</div>
								<button
									type="button"
									onClick={() => remove(index)}
									className="text-slate-300 hover:text-red-500"
								>
									<Trash2 className="h-4 w-4" />
								</button>
							</div>
						</div>
					))}
					{fields.length === 0 && (
						<div className="py-12 text-center text-slate-400 border-2 border-dashed rounded-xl">
							No hay items en esta plantilla.
						</div>
					)}
				</div>
			</section>

			<div className="flex justify-end gap-3">
				<Button type="button" variant="ghost" onClick={() => router.back()}>
					Cancelar
				</Button>
				<Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
					{templateId ? "Actualizar Plantilla" : "Guardar Plantilla"}
				</Button>
			</div>
		</form>
	);
}
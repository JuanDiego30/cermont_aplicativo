"use client";

import type { OrderPlanningKitSnapshot, User, UserCertification } from "@cermont/shared-types";
import { UpdateOrderPlanningSchema } from "@cermont/shared-types";
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";

interface PersonnelAssignmentSectionProps {
	control: Control<PlanningFormValues>;
	register: UseFormRegister<PlanningFormValues>;
	setValue: UseFormSetValue<PlanningFormValues>;
	technicians: User[];
	requiredCertifications: string[];
	errors?: FieldErrors<PlanningFormValues>["personnelAssignments"];
}

interface PersonnelRowProps {
	index: number;
	register: UseFormRegister<PlanningFormValues>;
	setValue: UseFormSetValue<PlanningFormValues>;
	remove: (index: number) => void;
	technicians: User[];
	requiredCerts: string[];
	control: Control<PlanningFormValues>;
	error?: PersonnelRowError;
}

interface KitSnapshotSectionProps {
	control: Control<PlanningFormValues>;
	register: UseFormRegister<PlanningFormValues>;
}

interface SnapshotListWithCheckboxesProps {
	title: string;
	fields: Array<{
		id: string;
		name: string;
		quantity: number;
		confirmedAvailable?: boolean;
		certificateRequired?: boolean;
	}>;
	register: UseFormRegister<PlanningFormValues>;
	namePrefix: "kitSnapshot.tools" | "kitSnapshot.equipment";
}

import { zodResolver } from "@hookform/resolvers/zod";
import {
	AlertCircle,
	Calendar,
	CheckCircle2,
	FileText,
	Package,
	Plus,
	ShieldCheck,
	ShieldX,
	Trash2,
	Users,
	Wrench,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/_shared/lib/utils";
import { formatDate } from "@/_shared/lib/utils/format-date";
import { useDocuments } from "@/documents/queries";
import { DocumentUploader } from "@/documents/ui/DocumentUploader";
import { useKitTemplates } from "@/maintenance/queries";
import { useOrder, useUpdateOrderPlanning } from "@/orders/queries";
import { useUsers } from "@/users/queries";

const PlanningFormSchema = z
	.object({
		scheduledStartAt: z.string().optional(),
		estimatedHours: z.coerce.number().positive().optional(),
		crewSize: z.coerce.number().int().min(1).optional(),
		kitTemplateId: z.string().optional(),
		kitSnapshot: z
			.object({
				tools: z.array(
					z.object({
						name: z.string(),
						quantity: z.number(),
						confirmedAvailable: z.boolean().default(false),
					}),
				),
				equipment: z.array(
					z.object({
						name: z.string(),
						quantity: z.number(),
						certificateRequired: z.boolean(),
						confirmedAvailable: z.boolean().default(false),
					}),
				),
			})
			.optional(),
		personnelAssignments: z
			.array(
				z.object({
					technicianId: z.string().min(1),
					name: z.string().min(1),
					role: z.string().min(1),
					requiredCertifications: z.array(z.string()).default([]),
					estimatedHours: z.number().positive().optional(),
				}),
			)
			.default([]),
		astDocumentId: z.string().optional(),
		supportDocumentIds: z.array(z.string()).default([]),
	})
	.transform((value) => {
		return UpdateOrderPlanningSchema.parse({
			scheduledStartAt: value.scheduledStartAt || undefined,
			estimatedHours: value.estimatedHours,
			crewSize: value.crewSize,
			kitTemplateId: value.kitTemplateId || undefined,
				kitSnapshot: value.kitSnapshot as OrderPlanningKitSnapshot,
			personnelAssignments: value.personnelAssignments,
			astDocumentId: value.astDocumentId || undefined,
			supportDocumentIds: value.supportDocumentIds,
		});
	});

type PlanningFormValues = z.input<typeof PlanningFormSchema>;

interface PersonnelRowError {
	technicianId?: { message?: string };
	role?: { message?: string };
	estimatedHours?: { message?: string };
}

interface OrderPlanningTabProps {
	orderId: string;
}

function toDateTimeLocalValue(value?: string): string {
	if (!value) {
		return "";
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "";
	}
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, "0");
	const day = `${date.getDate()}`.padStart(2, "0");
	const hours = `${date.getHours()}`.padStart(2, "0");
	const minutes = `${date.getMinutes()}`.padStart(2, "0");
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function OrderPlanningTab({ orderId }: OrderPlanningTabProps) {
	const { data: order, isLoading, error } = useOrder(orderId);
	const updatePlanning = useUpdateOrderPlanning(orderId);
	const { data: templates = [] } = useKitTemplates(order?.type);
	const { data: documents = [] } = useDocuments({ orderId });
	const { data: allUsers = [] } = useUsers();

	const technicians = useMemo(
		() => allUsers.filter((u) => u.role === "technician" || u.role === "operator"),
		[allUsers],
	);

	const astDocuments = useMemo(
		() => documents.filter((doc) => doc.category === "ast"),
		[documents],
	);
	const supportDocuments = useMemo(
		() => documents.filter((doc) => doc.category === "support"),
		[documents],
	);

	const {
		register,
		control,
		setValue,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm<PlanningFormValues>({
		resolver: zodResolver(PlanningFormSchema),
		defaultValues: {
			scheduledStartAt: "",
			kitTemplateId: "",
			personnelAssignments: [],
			astDocumentId: "",
			supportDocumentIds: [],
		},
	});

	useEffect(() => {
		if (!order) {
			return;
		}
		reset({
			scheduledStartAt: toDateTimeLocalValue(order.planning.scheduledStartAt),
			estimatedHours: order.planning.estimatedHours,
			crewSize: order.planning.crewSize,
			kitTemplateId: order.planning.kitTemplateId ?? "",
			kitSnapshot: order.planning
				.kitSnapshot as OrderPlanningKitSnapshot,
			personnelAssignments: order.planning.personnelAssignments ?? [],
			astDocumentId: order.planning.astDocumentId ?? "",
			supportDocumentIds: order.planning.supportDocumentIds ?? [],
		});
	}, [order, reset]);

	const selectedKitId = watch("kitTemplateId");
	const selectedKit = templates.find((kit) => kit._id === selectedKitId);

	useEffect(() => {
		if (
			selectedKit &&
			(!watch("kitSnapshot") || watch("kitTemplateId") !== order?.planning.kitTemplateId)
		) {
			setValue("kitSnapshot", {
				tools: selectedKit.tools.map((t) => ({
					name: t.name,
					quantity: t.quantity,
					confirmedAvailable: false,
				})),
				equipment: selectedKit.equipment.map((e) => ({
					name: e.name,
					quantity: e.quantity,
					confirmedAvailable: false,
					certificateRequired: e.certificateRequired,
				})),
			});
		}
	}, [selectedKit, setValue, order?.planning.kitTemplateId, watch]);

	const planningReady = Boolean(order?.planning.planningReadyAt);

	const onSubmit = handleSubmit(async (values) => {
		try {
			await updatePlanning.mutateAsync(PlanningFormSchema.parse(values));
			toast.success("Planeación actualizada");
		} catch (submissionError) {
			toast.error(
				submissionError instanceof Error ? submissionError.message : "Error al guardar planeación",
			);
		}
	});

	if (isLoading) {
		return <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />;
	}

	if (error || !order) {
		return (
			<section className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
				Error al cargar la planeación.
			</section>
		);
	}

	const requiredCertifications =
		selectedKit?.assignmentRules?.requiredCertifications ??
		order.planning.kitSnapshot?.assignmentRules?.requiredCertifications ??
		[];

	return (
		<section className="space-y-6">
			<aside
				className={`rounded-xl border px-4 py-3 ${
					planningReady ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
				}`}
			>
				<div className="flex items-start gap-3">
					{planningReady ? (
						<CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
					) : (
						<AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
					)}
					<div>
						<p className="text-sm font-medium">
							{planningReady ? "Planeación lista" : "Habilitar salida a campo"}
						</p>
						<p className="mt-1 text-xs opacity-80">
							{planningReady
								? `Validada el ${formatDate(order.planning.planningReadyAt)}`
								: "Define cronograma, personal, kit y documentos para iniciar."}
						</p>
					</div>
				</div>
			</aside>

			<form
				onSubmit={onSubmit}
				className="space-y-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-950"
			>
				{/* Basic Planning Fields */}
				<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<FieldBlock
						label="Inicio programado"
						icon={<Calendar className="h-4 w-4" />}
						error={errors.scheduledStartAt?.message}
					>
						<input
							type="datetime-local"
							{...register("scheduledStartAt")}
							className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none dark:border-slate-700 dark:bg-slate-900"
						/>
					</FieldBlock>
					<FieldBlock
						label="Horas estimadas"
						icon={<Wrench className="h-4 w-4" />}
						error={errors.estimatedHours?.message}
					>
						<input
							type="number"
							step={0.5}
							{...register("estimatedHours")}
							className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none dark:border-slate-700 dark:bg-slate-900"
						/>
					</FieldBlock>
					<FieldBlock
						label="Tamaño de cuadrilla"
						icon={<Users className="h-4 w-4" />}
						error={errors.crewSize?.message}
					>
						<input
							type="number"
							{...register("crewSize")}
							className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none dark:border-slate-700 dark:bg-slate-900"
						/>
					</FieldBlock>
				</section>

				{/* Kit Selection & Documents */}
				<section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<FieldBlock
						label="Kit típico"
						icon={<Package className="h-4 w-4" />}
						error={errors.kitTemplateId?.message}
					>
						<select
							{...register("kitTemplateId")}
							className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none dark:border-slate-700 dark:bg-slate-900"
						>
							<option value="">Seleccionar kit</option>
							{templates.map((kit) => (
								<option key={kit._id} value={kit._id}>
									{kit.name}
								</option>
							))}
						</select>
					</FieldBlock>
					<FieldBlock
						label="AST firmado"
						icon={<FileText className="h-4 w-4" />}
						error={errors.astDocumentId?.message}
					>
						<select
							{...register("astDocumentId")}
							className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none dark:border-slate-700 dark:bg-slate-900"
						>
							<option value="">Seleccionar AST</option>
							{astDocuments.map((doc) => (
								<option key={doc._id} value={doc._id}>
									{doc.title}
								</option>
							))}
						</select>
					</FieldBlock>
				</section>

				{/* Personnel Section (Task 8) */}
				<PersonnelAssignmentSection
					control={control}
					register={register}
					setValue={setValue}
					technicians={technicians}
					requiredCertifications={requiredCertifications}
					errors={errors.personnelAssignments}
				/>

				{/* Kit Snapshot with Availability (Task 7) */}
				<KitSnapshotSection control={control} register={register} />

				<section className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
					<h3 className="mb-4 text-sm font-semibold">Documentos de soporte</h3>
					{supportDocuments.length > 0 ? (
						<ul className="space-y-2">
							{supportDocuments.map((doc) => (
								<li key={doc._id}>
									<label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
										<input
											type="checkbox"
											value={doc._id}
											{...register("supportDocumentIds")}
											className="h-4 w-4 rounded border-slate-300 text-blue-600"
										/>
										<span>{doc.title}</span>
									</label>
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-slate-500">Sin documentos de soporte cargados.</p>
					)}
				</section>

				<div className="flex justify-end">
					<button
						type="submit"
						disabled={updatePlanning.isPending}
						className="min-h-11 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
					>
						{updatePlanning.isPending ? "Guardando..." : "Guardar planeación"}
					</button>
				</div>
			</form>

			<section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-950">
				<h3 className="mb-4 text-sm font-semibold">Cargar soporte documental</h3>
				<DocumentUploader
					defaultOrderId={orderId}
					defaultCategory="support"
					allowedCategories={["ast", "support"]}
				/>
			</section>
		</section>
	);
}

function PersonnelAssignmentSection({
	control,
	register,
	setValue,
	technicians,
	requiredCertifications,
	errors,
}: PersonnelAssignmentSectionProps) {
	const { fields, append, remove } = useFieldArray({ control, name: "personnelAssignments" });

	return (
		<section className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
			<header className="mb-4 flex items-center justify-between">
				<h3 className="text-sm font-semibold">Personal y Certificaciones</h3>
				<button
					type="button"
					onClick={() =>
						append({
							technicianId: "",
							name: "",
							role: "",
							requiredCertifications: [],
							estimatedHours: 0,
						})
					}
					className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold"
				>
					<Plus className="h-3.5 w-3.5" /> Agregar Técnico
				</button>
			</header>
			<div className="space-y-4">
				{fields.map((field, index) => (
					<PersonnelRow
						key={field.id}
						index={index}
						register={register}
						setValue={setValue}
						remove={remove}
						technicians={technicians}
						requiredCerts={requiredCertifications}
						control={control}
						error={errors?.[index] as PersonnelRowError | undefined}
					/>
				))}
				{fields.length === 0 && (
					<p className="py-8 text-center text-xs text-slate-500 border-2 border-dashed rounded-lg">
						Sin técnicos asignados.
					</p>
				)}
			</div>
		</section>
	);
}

function PersonnelRow({
	index,
	register,
	setValue,
	remove,
	technicians,
	requiredCerts,
	control,
	error,
}: PersonnelRowProps) {
	const techId = useWatch({ control, name: `personnelAssignments.${index}.technicianId` });
	const selectedTech = technicians.find((technician) => technician._id === techId);

	// Update name field when technician is selected
	useEffect(() => {
		if (selectedTech) {
			setValue(`personnelAssignments.${index}.name`, selectedTech.name, {
				shouldDirty: true,
				shouldValidate: true,
			});
		}
	}, [index, selectedTech, setValue]);

	return (
		<div className="relative rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
			<button
				type="button"
				onClick={() => remove(index)}
				className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
			>
				<Trash2 className="h-4 w-4" />
			</button>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<FieldBlock label="Técnico" error={error?.technicianId?.message}>
					<select
						{...register(`personnelAssignments.${index}.technicianId`)}
						className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:bg-slate-900"
					>
						<option value="">Seleccionar</option>
						{technicians.map((t: User) => (
							<option key={t._id} value={t._id}>
								{t.name}
							</option>
						))}
					</select>
				</FieldBlock>
				<FieldBlock label="Rol" error={error?.role?.message}>
					<input
						{...register(`personnelAssignments.${index}.role`)}
						placeholder="Ej: Especialista"
						className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:bg-slate-900"
					/>
				</FieldBlock>
				<FieldBlock label="Horas Est.">
					<input
						type="number"
						{...register(`personnelAssignments.${index}.estimatedHours`)}
						className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:bg-slate-900"
					/>
				</FieldBlock>
			</div>
			{selectedTech && requiredCerts.length > 0 && (
				<div className="mt-4 flex flex-wrap gap-2">
					{requiredCerts.map((cert: string) => {
						const hasCert = selectedTech.certifications?.some(
							(c: UserCertification) =>
								c.name.toLowerCase() === cert.toLowerCase() && c.status === "active",
						);
						return (
							<span
								key={cert}
								className={cn(
									"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
									hasCert ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
								)}
							>
								{hasCert ? <ShieldCheck className="h-3 w-3" /> : <ShieldX className="h-3 w-3" />}{" "}
								{cert}
							</span>
						);
					})}
				</div>
			)}
		</div>
	);
}

function KitSnapshotSection({ control, register }: KitSnapshotSectionProps) {
	const { fields: tools } = useFieldArray({ control, name: "kitSnapshot.tools" });
	const { fields: equipment } = useFieldArray({ control, name: "kitSnapshot.equipment" });

	if (tools.length === 0 && equipment.length === 0) {
		return null;
	}

	return (
		<section className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
			<h3 className="mb-4 text-sm font-semibold">Confirmación de Kit (Disponibilidad)</h3>
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<SnapshotListWithCheckboxes
					title="Herramientas"
					fields={tools}
					register={register}
					namePrefix="kitSnapshot.tools"
				/>
				<SnapshotListWithCheckboxes
					title="Equipos"
					fields={equipment}
					register={register}
					namePrefix="kitSnapshot.equipment"
				/>
			</div>
		</section>
	);
}

function SnapshotListWithCheckboxes({
	title,
	fields,
	register,
	namePrefix,
}: SnapshotListWithCheckboxesProps) {
	return (
		<div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
			<h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h4>
			<ul className="mt-3 space-y-2">
				{fields.map((field, index) => (
					<li key={field.id} className="flex items-center justify-between gap-3 text-sm">
						<span>
							{field.name} x{field.quantity}
						</span>
						<input
							type="checkbox"
							{...register(`${namePrefix}.${index}.confirmedAvailable`)}
							className="h-4 w-4 rounded border-slate-300 text-blue-600"
						/>
					</li>
				))}
			</ul>
		</div>
	);
}

function FieldBlock({
	label,
	icon,
	error,
	children,
}: {
	label: string;
	icon?: ReactNode;
	error?: string;
	children: ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-tight">
				{icon}
				{label}
			</div>
			{children}
			{error && <p className="text-[10px] text-red-600 font-medium">{error}</p>}
		</div>
	);
}

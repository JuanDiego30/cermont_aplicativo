"use client";

import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useKitTemplates } from "@/modules/kits/queries";
import { useOrder } from "@/modules/orders/queries";
import {
	useApplyKitToPlanning,
	useApprovePlanning,
	useCreatePlanningPacket,
	usePlanningByWorkOrder,
	useReopenPlanning,
	useUpdatePlanningPacket,
	useValidatePlanningReadiness,
} from "@/modules/planning/queries";
import { ApiError } from "@/lib/http/api-client";
import { PLANNING_ACCESS_ROLES } from "@cermont/domain";
import {
	AlertTriangle,
	ArrowLeft,
	Briefcase,
	Calendar,
	CheckCircle,
	FileText,
	ListTodo,
	Loader2,
	Lock,
	MapPin,
	Package,
	Plus,
	Settings,
	ShieldAlert,
	Unlock,
	User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type FormEvent, useReducer } from "react";

// ── Reducer ──────────────────────────────────────────────────────

type TabKey = "materials" | "tools" | "equipment" | "safety";
type BusinessUnit = "IT" | "MNT" | "SC" | "GEN" | "OTHER";

interface PlanningFormState {
	activeTab: TabKey;
	isEditing: boolean;
	selectedKitId: string;
	place: string;
	plannedDate: string;
	businessUnit: BusinessUnit;
	scope: string;
	inspectorName: string;
	approvalNotes: string;
	reopenReason: string;
	showApprovalModal: boolean;
	showReopenModal: boolean;
}

type PlanningFormAction =
	| { type: "SET_ACTIVE_TAB"; payload: TabKey }
	| { type: "TOGGLE_EDIT"; payload?: boolean }
	| { type: "SET_KIT_ID"; payload: string }
	| { type: "UPDATE_FORM"; payload: Partial<Pick<PlanningFormState, "place" | "plannedDate" | "businessUnit" | "scope" | "inspectorName">> }
	| { type: "SET_APPROVAL_NOTES"; payload: string }
	| { type: "SET_REOPEN_REASON"; payload: string }
	| { type: "SHOW_APPROVAL_MODAL"; payload: boolean }
	| { type: "SHOW_REOPEN_MODAL"; payload: boolean }
	| { type: "POPULATE_FORM"; payload: { place: string; plannedDate: string; businessUnit: string; scope: string; inspectorName: string } };

const initialState: PlanningFormState = {
	activeTab: "materials",
	isEditing: false,
	selectedKitId: "",
	place: "",
	plannedDate: "",
	businessUnit: "MNT",
	scope: "",
	inspectorName: "",
	approvalNotes: "",
	reopenReason: "",
	showApprovalModal: false,
	showReopenModal: false,
};

function planningReducer(state: PlanningFormState, action: PlanningFormAction): PlanningFormState {
	switch (action.type) {
		case "SET_ACTIVE_TAB":
			return { ...state, activeTab: action.payload };
		case "TOGGLE_EDIT":
			return { ...state, isEditing: action.payload ?? !state.isEditing };
		case "SET_KIT_ID":
			return { ...state, selectedKitId: action.payload };
		case "UPDATE_FORM":
			return { ...state, ...action.payload };
		case "SET_APPROVAL_NOTES":
			return { ...state, approvalNotes: action.payload };
		case "SET_REOPEN_REASON":
			return { ...state, reopenReason: action.payload };
		case "SHOW_APPROVAL_MODAL":
			return { ...state, showApprovalModal: action.payload };
		case "SHOW_REOPEN_MODAL":
			return { ...state, showReopenModal: action.payload };
		case "POPULATE_FORM":
			return {
				...state,
				isEditing: true,
				place: action.payload.place,
				plannedDate: action.payload.plannedDate,
				businessUnit: (action.payload.businessUnit as BusinessUnit) || "MNT",
				scope: action.payload.scope,
				inspectorName: action.payload.inspectorName,
			};
		default:
			return state;
	}
}

export default function OrderPlanningPage() {
	const params = useParams();
	const id = params.id as string; // workOrderId

	const { user } = useAuth();
	const { data: order, isLoading: orderLoading } = useOrder(id);
	const {
		data: planningPacket,
		isLoading: planningLoading,
		error: planningError,
		refetch: refetchPlanning,
	} = usePlanningByWorkOrder(id);

	const { data: kitTemplates } = useKitTemplates();

	// Mutations
	const createMutation = useCreatePlanningPacket();
	const updateMutation = useUpdatePlanningPacket(planningPacket?._id || "");
	const applyKitMutation = useApplyKitToPlanning(planningPacket?._id || "");
	const validateMutation = useValidatePlanningReadiness(planningPacket?._id || "");
	const approveMutation = useApprovePlanning(planningPacket?._id || "");
	const reopenMutation = useReopenPlanning(planningPacket?._id || "");

	// Local state
	const [state, dispatch] = useReducer(planningReducer, initialState);
	const {
		activeTab,
		isEditing,
		selectedKitId,
		place,
		plannedDate,
		businessUnit,
		scope,
		inspectorName,
		approvalNotes,
		reopenReason,
		showApprovalModal,
		showReopenModal,
	} = state;

	const isPlanningRole = user?.role && (PLANNING_ACCESS_ROLES as readonly string[]).includes(user.role);
	const isGerenteOrResidente = user?.role === "gerente" || user?.role === "residente";

	const isNotFound =
		planningError instanceof ApiError && planningError.status === 404;

	// Populate form fields on edit start
	const startEdit = () => {
		if (planningPacket) {
			dispatch({
				type: "POPULATE_FORM",
				payload: {
					place: planningPacket.place || "",
					plannedDate: planningPacket.plannedDate
						? new Date(planningPacket.plannedDate).toISOString().slice(0, 16)
						: "",
					businessUnit: (planningPacket.businessUnit as string) || "MNT",
					scope: planningPacket.scope || "",
					inspectorName: planningPacket.responsibleInspectorName || "",
				},
			});
		}
	};

	const handleSave = async (e: FormEvent) => {
		e.preventDefault();
		if (!planningPacket) {
			return;
		}

		try {
			await updateMutation.mutateAsync({
				place,
				plannedDate: plannedDate ? new Date(plannedDate).toISOString() : undefined,
				businessUnit,
				scope,
				responsibleInspectorName: inspectorName,
			});
			dispatch({ type: "TOGGLE_EDIT", payload: false });
		} catch (err) {
			console.error("Error updating planning:", err);
		}
	};

	const handleCreatePlanning = async () => {
		try {
			await createMutation.mutateAsync({
				workOrderId: id,
				astRequired: false,
				ptwRequired: false,
			});
			refetchPlanning();
		} catch (err) {
			console.error("Error creating planning:", err);
		}
	};

	const handleApplyKit = async () => {
		if (!selectedKitId) {
			return;
		}
		try {
			await applyKitMutation.mutateAsync({ kitTemplateId: selectedKitId });
			dispatch({ type: "SET_KIT_ID", payload: "" });
		} catch (err) {
			console.error("Error applying kit:", err);
		}
	};

	const handleValidateReadiness = async () => {
		try {
			await validateMutation.mutateAsync();
		} catch (err) {
			console.error("Error validating readiness:", err);
		}
	};

	const handleApprove = async () => {
		try {
			await approveMutation.mutateAsync({ notes: approvalNotes });
			dispatch({ type: "SHOW_APPROVAL_MODAL", payload: false });
			dispatch({ type: "SET_APPROVAL_NOTES", payload: "" });
		} catch (err) {
			console.error("Error approving planning:", err);
		}
	};

	const handleReopen = async () => {
		try {
			await reopenMutation.mutateAsync({ reason: reopenReason });
			dispatch({ type: "SHOW_REOPEN_MODAL", payload: false });
			dispatch({ type: "SET_REOPEN_REASON", payload: "" });
		} catch (err) {
			console.error("Error reopening planning:", err);
		}
	};

	if (orderLoading || planningLoading) {
		return (
			<div className="flex h-64 items-center justify-center text-zinc-500">
				<Loader2 className="animate-spin size-6 mr-2 text-blue-600" />
				Cargando planificación y detalles de la OT…
			</div>
		);
	}

	const otNumber = order?.code || "OT Desconocida";
	const orderObj = order as Record<string, unknown> | undefined;
	const customFields = orderObj?.customFields as Record<string, unknown> | undefined;
	const clientName =
		(orderObj?.cliente as string) ||
		(orderObj?.clientName as string) ||
		(customFields?.clientName as string) ||
		(customFields?.cliente as string) ||
		"Cliente Desconocido";

	// Status badge mapping
	const getStatusConfig = (status: string) => {
		switch (status) {
			case "approved":
				return {
					text: "Aprobado",
					bg: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60",
					icon: <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />,
				};
			case "ready":
				return {
					text: "Listo para Ejecutar",
					bg: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60",
					icon: <CheckCircle className="size-4 text-blue-600 dark:text-blue-400" />,
				};
			case "blocked":
				return {
					text: "Bloqueado",
					bg: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60",
					icon: <ShieldAlert className="size-4 text-rose-600 dark:text-rose-400" />,
				};
			case "incomplete":
				return {
					text: "Incompleto",
					bg: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60",
					icon: <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />,
				};
			default:
				return {
					text: "Borrador",
					bg: "bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-850 dark:text-zinc-400 dark:border-zinc-800",
					icon: <FileText className="size-4 text-zinc-500 dark:text-zinc-450" />,
				};
		}
	};

	const statusConfig = planningPacket ? getStatusConfig(planningPacket.status) : null;

	return (
		<section className="space-y-6 max-w-6xl mx-auto p-4" aria-labelledby="order-planning-title">
			{/* Back Link */}
			<div className="flex items-center gap-4">
				<Link
					href={`/orders/${id}`}
					className="inline-flex items-center gap-2 text-sm text-zinc-650 dark:text-zinc-350 hover:text-zinc-900 dark:hover:text-white transition-colors"
				>
					<ArrowLeft aria-hidden="true" className="size-4" />
					Volver a la orden
				</Link>
			</div>

			{/* Page Title */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-5">
				<div>
					<h1
						id="order-planning-title"
						className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight"
					>
						Planificación de Trabajo — {otNumber}
					</h1>
					<p className="text-sm text-zinc-550 dark:text-zinc-400 mt-1">
						Cliente: <span className="font-semibold">{clientName}</span>
					</p>
				</div>
				{statusConfig && (
					<div
						className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full border ${statusConfig.bg}`}
					>
						{statusConfig.icon}
						{statusConfig.text}
					</div>
				)}
			</div>

			{/* Empty State / Initialize Plan */}
			{(isNotFound || !planningPacket) ? (
				<div className="rounded-2xl border-2 border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800 max-w-2xl mx-auto bg-white/50 dark:bg-zinc-900/50 shadow-sm">
					<Calendar aria-hidden="true" className="mx-auto size-16 text-zinc-400 dark:text-zinc-650 mb-4 animate-pulse" />
					<h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
						Sin Planificación Registrada
					</h3>
					<p className="text-sm text-zinc-500 dark:text-zinc-450 mb-6">
						Esta orden de trabajo no cuenta con una planeación formal y recursos asignados en el sistema.
					</p>
					{isPlanningRole ? (
						<button
							type="button"
							onClick={handleCreatePlanning}
							disabled={createMutation.isPending}
							className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
						>
							{createMutation.isPending ? (
								<Loader2 className="animate-spin size-5" />
							) : (
								<Plus className="size-5" />
							)}
							Inicializar Plan de Trabajo
						</button>
					) : (
						<p className="text-sm text-amber-600 dark:text-amber-400 italic">
							No tienes permisos para inicializar la planeación.
						</p>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left 2 Columns: Main Details / Edit Form & Resources */}
					<div className="lg:col-span-2 space-y-6">
						{/* Detail / Edit Card */}
						<div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-850 p-6 relative overflow-hidden">
							<div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 ml-2">
									<Settings className="size-5 text-blue-600" />
									Detalles del Plan
								</h2>
								{!isEditing && planningPacket.status !== "approved" && isPlanningRole && (
									<button
										type="button"
										onClick={startEdit}
										className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-450 dark:hover:text-blue-400 border border-blue-200 dark:border-blue-900/60 px-3 py-1.5 rounded-lg transition-colors"
									>
										Editar Plan
									</button>
								)}
							</div>

							{isEditing ? (
								<form onSubmit={handleSave} className="space-y-4 ml-2">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label htmlFor="inspector" className="block text-xs font-semibold text-zinc-550 dark:text-zinc-400 mb-1 uppercase tracking-wider">
												Inspector Responsable
											</label>
											<input
												id="inspector"
												type="text"
												value={inspectorName}
												onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { inspectorName: e.target.value } })}
												placeholder="Ej. Ing. Juan Diego"
												className="w-full text-sm px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
											/>
										</div>
										<div>
											<label htmlFor="place" className="block text-xs font-semibold text-zinc-550 dark:text-zinc-400 mb-1 uppercase tracking-wider">
												Lugar / Locación
											</label>
											<input
												id="place"
												type="text"
												value={place}
												onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { place: e.target.value } })}
												placeholder="Ej. Campo Caño Limón"
												className="w-full text-sm px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
												required
											/>
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label htmlFor="plannedDate" className="block text-xs font-semibold text-zinc-550 dark:text-zinc-400 mb-1 uppercase tracking-wider">
												Fecha Planificada
											</label>
											<input
												id="plannedDate"
												type="datetime-local"
												value={plannedDate}
												onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { plannedDate: e.target.value } })}
												className="w-full text-sm px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
											/>
										</div>
										<div>
											<label htmlFor="bu" className="block text-xs font-semibold text-zinc-550 dark:text-zinc-400 mb-1 uppercase tracking-wider">
												Unidad de Negocio
											</label>
											<select
												id="bu"
												value={businessUnit}
												onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { businessUnit: e.target.value as BusinessUnit } })}
												className="w-full text-sm px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
											>
												<option value="MNT">Mantenimiento (MNT)</option>
												<option value="IT">Tecnología (IT)</option>
												<option value="SC">Soporte Campo (SC)</option>
												<option value="GEN">General (GEN)</option>
												<option value="OTHER">Otros (OTHER)</option>
											</select>
										</div>
									</div>

									<div>
										<label htmlFor="scope" className="block text-xs font-semibold text-zinc-550 dark:text-zinc-400 mb-1 uppercase tracking-wider">
											Alcance de Actividad (Mínimo 20 caracteres)
										</label>
										<textarea
											id="scope"
											value={scope}
											onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { scope: e.target.value } })}
											rows={4}
											placeholder="Detalle el alcance técnico del plan de trabajo..."
											className="w-full text-sm px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
											required
										/>
									</div>

									<div className="flex items-center justify-end gap-3 pt-2">
										<button
											type="button"
											onClick={() => dispatch({ type: "TOGGLE_EDIT", payload: false })}
											className="text-sm font-semibold text-zinc-650 hover:text-zinc-900 dark:text-zinc-450 dark:hover:text-white px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl"
										>
											Cancelar
										</button>
										<button
											type="submit"
											disabled={updateMutation.isPending}
											className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50"
										>
											{updateMutation.isPending && <Loader2 className="animate-spin size-4" />}
											Guardar Cambios
										</button>
									</div>
								</form>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-2">
									<div className="space-y-4">
										<div className="flex items-start gap-2.5">
											<User className="size-4.5 text-zinc-400 mt-0.5" />
											<div>
												<h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-455 uppercase tracking-wider">
													Inspector Responsable
												</h4>
												<p className="text-sm font-medium text-zinc-850 dark:text-zinc-100 mt-0.5">
													{planningPacket.responsibleInspectorName || "No especificado"}
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2.5">
											<MapPin className="size-4.5 text-zinc-400 mt-0.5" />
											<div>
												<h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-455 uppercase tracking-wider">
													Lugar / Locación
												</h4>
												<p className="text-sm font-medium text-zinc-850 dark:text-zinc-100 mt-0.5">
													{planningPacket.place || "No especificado"}
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2.5">
											<Calendar className="size-4.5 text-zinc-400 mt-0.5" />
											<div>
												<h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-455 uppercase tracking-wider">
													Fecha Planificada
												</h4>
												<p className="text-sm font-medium text-zinc-850 dark:text-zinc-100 mt-0.5">
													{planningPacket.plannedDate
														? new Date(planningPacket.plannedDate).toLocaleString("es-CO", {
																dateStyle: "medium",
																timeStyle: "short",
															})
														: "No programada"}
												</p>
											</div>
										</div>
									</div>

									<div className="space-y-4">
										<div className="flex items-start gap-2.5">
											<Briefcase className="size-4.5 text-zinc-400 mt-0.5" />
											<div>
												<h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-455 uppercase tracking-wider">
													Unidad de Negocio
												</h4>
												<p className="text-sm font-medium text-zinc-850 dark:text-zinc-100 mt-0.5">
													{planningPacket.businessUnit || "No especificada"}
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2.5">
											<FileText className="size-4.5 text-zinc-400 mt-0.5" />
											<div>
												<h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-455 uppercase tracking-wider">
													Alcance Técnico
												</h4>
												<p className="text-sm text-zinc-850 dark:text-zinc-200 mt-0.5 whitespace-pre-wrap leading-relaxed">
													{planningPacket.scope || "No detallado"}
												</p>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Typical Kit Selection (Edit Mode only or if status permits) */}
						{!isEditing && planningPacket.status !== "approved" && isPlanningRole && (
							<div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950 p-6 border border-zinc-250 dark:border-zinc-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
								<div>
									<h3 className="text-base font-bold text-zinc-900 dark:text-white">
										Aplicar Plantilla de Kit Típico
									</h3>
									<p className="text-xs text-zinc-500 dark:text-zinc-450 mt-1 max-w-md">
										Carga automáticamente un listado estandarizado de materiales, herramientas, y EPIs correspondientes al tipo de actividad.
									</p>
								</div>
								<div className="flex items-center gap-2">
									<select
										id="kit"
										value={selectedKitId}
										onChange={(e) => dispatch({ type: "SET_KIT_ID", payload: e.target.value })}
										className="text-sm px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
									>
										<option value="">Seleccione un kit...</option>
										{(kitTemplates || []).map((kit) => (
											<option key={kit.id} value={kit.id}>
												{kit.name}
											</option>
										))}
									</select>
									<button
										type="button"
										onClick={handleApplyKit}
										disabled={!selectedKitId || applyKitMutation.isPending}
										className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors"
									>
										{applyKitMutation.isPending ? (
											<Loader2 className="animate-spin size-4" />
										) : (
											<Plus className="size-4" />
										)}
										Aplicar
									</button>
								</div>
							</div>
						)}

						{/* Resource Lists Tabs */}
						<div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-850 p-6">
							<div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-850 pb-3 mb-6">
								<h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
									<Package className="size-5 text-blue-600" />
									Recursos Planificados
								</h2>
								{planningPacket.kitSnapshot && (
									<span className="text-xs bg-zinc-100 text-zinc-650 px-2.5 py-1 rounded-md font-semibold border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-350 dark:border-zinc-700">
										Kit: {planningPacket.kitSnapshot.name}
									</span>
								)}
							</div>

							{/* Tab headers */}
							<div className="flex overflow-x-auto gap-2 border-b border-zinc-200 dark:border-zinc-850 mb-6 pb-2">
								<button
									type="button"
									onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "materials" })}
									className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
										activeTab === "materials"
											? "bg-blue-600 text-white shadow-sm"
											: "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-150 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-850"
									}`}
								>
									Materiales ({planningPacket.materials?.length || 0})
								</button>
								<button
									type="button"
									onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "tools" })}
									className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
										activeTab === "tools"
											? "bg-blue-600 text-white shadow-sm"
											: "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-150 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-850"
									}`}
								>
									Herramientas ({planningPacket.tools?.length || 0})
								</button>
								<button
									type="button"
									onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "equipment" })}
									className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
										activeTab === "equipment"
											? "bg-blue-600 text-white shadow-sm"
											: "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-150 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-850"
									}`}
								>
									Equipos ({planningPacket.equipment?.length || 0})
								</button>
								<button
									type="button"
									onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "safety" })}
									className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
										activeTab === "safety"
											? "bg-blue-600 text-white shadow-sm"
											: "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-150 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-850"
									}`}
								>
									EPIs ({planningPacket.safetyElements?.length || 0})
								</button>
							</div>

							{/* Tab content */}
							<div>
								{activeTab === "materials" && (
									<div className="overflow-x-auto">
										{!planningPacket.materials || planningPacket.materials.length === 0 ? (
											<p className="text-sm text-zinc-500 dark:text-zinc-450 italic py-4">
												No se han asignado materiales a esta planeación.
											</p>
										) : (
											<table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-850">
												<thead>
													<tr>
														<th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
															Descripción Material
														</th>
														<th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
															Cantidad
														</th>
														<th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
															Unidad
														</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-zinc-200 dark:divide-zinc-850">
													{planningPacket.materials.map((m) => (
														<tr key={m.description} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/40">
															<td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white">
																{m.description}
															</td>
															<td className="px-4 py-3 text-sm text-zinc-850 dark:text-zinc-200 font-semibold">
																{m.quantity}
															</td>
															<td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 font-semibold uppercase">
																{m.unit || "und"}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										)}
									</div>
								)}

								{activeTab === "tools" && (
									<div className="overflow-x-auto">
										{!planningPacket.tools || planningPacket.tools.length === 0 ? (
											<p className="text-sm text-zinc-500 dark:text-zinc-450 italic py-4">
												No se han asignado herramientas a esta planeación.
											</p>
										) : (
											<table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-850">
												<thead>
													<tr>
														<th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
															Herramienta
														</th>
														<th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
															Cantidad
														</th>
														<th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
															Disponible
														</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-zinc-200 dark:divide-zinc-850">
													{planningPacket.tools.map((t) => (
														<tr key={t.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/40">
															<td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white">
																{t.name}
															</td>
															<td className="px-4 py-3 text-sm text-zinc-850 dark:text-zinc-200 font-semibold">
																{t.quantity}
															</td>
															<td className="px-4 py-3 text-sm">
																<span
																	className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${
																		t.available
																			? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450"
																			: "bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-450"
																	}`}
																>
																	{t.available ? "Disponible" : "Sin Stock"}
																</span>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										)}
									</div>
								)}

								{activeTab === "equipment" && (
									<div className="overflow-x-auto">
										{!planningPacket.equipment || planningPacket.equipment.length === 0 ? (
											<p className="text-sm text-zinc-500 dark:text-zinc-455 italic py-4">
												No se han asignado equipos a esta planeación.
											</p>
										) : (
											<table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-850">
												<thead>
													<tr>
														<th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
															Equipo
														</th>
														<th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
															Cantidad
														</th>
														<th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
															Disponible
														</th>
														<th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
															Certificado Requerido
														</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-zinc-200 dark:divide-zinc-850">
													{planningPacket.equipment.map((eq) => (
														<tr key={eq.name} className="hover:bg-zinc-55 dark:hover:bg-zinc-850/40">
															<td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white">
																{eq.name}
															</td>
															<td className="px-4 py-3 text-sm text-zinc-850 dark:text-zinc-200 font-semibold">
																{eq.quantity}
															</td>
															<td className="px-4 py-3 text-sm">
																<span
																	className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${
																		eq.available
																			? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450"
																			: "bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-450"
																	}`}
																>
																	{eq.available ? "Disponible" : "Sin Stock"}
																</span>
															</td>
															<td className="px-4 py-3 text-sm">
																<span
																	className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${
																		eq.certificateRequired
																			? "bg-amber-100 text-amber-850 dark:bg-amber-950/30 dark:text-amber-450"
																			: "bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400"
																	}`}
																>
																	{eq.certificateRequired ? "Sí" : "No"}
																</span>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										)}
									</div>
								)}

								{activeTab === "safety" && (
									<div className="overflow-x-auto">
										{!planningPacket.safetyElements || planningPacket.safetyElements.length === 0 ? (
											<p className="text-sm text-zinc-500 dark:text-zinc-450 italic py-4">
												No se han asignado elementos de seguridad a esta planeación.
											</p>
										) : (
											<table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-850">
												<thead>
													<tr>
														<th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
															Elemento de Seguridad / EPI
														</th>
														<th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
															Cantidad
														</th>
														<th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
															Unidad
														</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-zinc-200 dark:divide-zinc-850">
													{planningPacket.safetyElements.map((s) => (
														<tr key={s.description} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/40">
															<td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white">
																{s.description}
															</td>
															<td className="px-4 py-3 text-sm text-zinc-850 dark:text-zinc-200 font-semibold">
																{s.quantity}
															</td>
															<td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 font-semibold uppercase">
																{s.unit || "und"}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										)}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Right 1 Column: Operations / Workflow Status Panel */}
					<div className="space-y-6">
						<div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-850 shadow-sm">
							<h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
								<ListTodo className="size-5 text-blue-600" />
								Flujo de Aprobación
							</h3>

							<div className="space-y-4">
								{/* Current status display */}
								<div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
									<span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
										Estado de Tarea
									</span>
									<p className="text-sm font-bold text-zinc-900 dark:text-white mt-1 capitalize">
										{planningPacket.status}
									</p>
								</div>

								{/* Action buttons */}
								{planningPacket.status !== "approved" && (
									<button
										type="button"
										onClick={handleValidateReadiness}
										disabled={validateMutation.isPending}
										className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-100 text-zinc-700 font-semibold border border-zinc-300 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm active:scale-[0.98]"
									>
										{validateMutation.isPending ? (
											<Loader2 className="animate-spin size-4" />
										) : (
											<Settings className="size-4" />
										)}
										Validar Viabilidad
									</button>
								)}

								{planningPacket.status === "ready" && isGerenteOrResidente && (
									<button
										type="button"
										onClick={() => dispatch({ type: "SHOW_APPROVAL_MODAL", payload: true })}
										className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm active:scale-[0.98]"
									>
										<Lock className="size-4" />
										Aprobar Planificación
									</button>
								)}

								{planningPacket.status === "approved" && isGerenteOrResidente && (
									<button
										type="button"
										onClick={() => dispatch({ type: "SHOW_REOPEN_MODAL", payload: true })}
										className="w-full inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm active:scale-[0.98]"
									>
										<Unlock className="size-4" />
										Reabrir Planificación
									</button>
								)}

								{/* Read-only status block */}
								{planningPacket.status === "approved" && (
									<div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-450 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 text-xs leading-relaxed space-y-2">
										<p className="font-bold flex items-center gap-1">
											<CheckCircle className="size-4 text-emerald-600" />
											Módulo Aprobado
										</p>
										<p>
											La planificación de la orden está aprobada. La ejecución en campo de esta orden ahora puede iniciarse.
										</p>
										{planningPacket.approvedAt && (
											<p className="text-[10px] text-zinc-500">
												Aprobado el: {new Date(planningPacket.approvedAt).toLocaleString()}
											</p>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Approval Modal */}
			{showApprovalModal && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-6 space-y-4">
						<h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
							<Lock className="text-emerald-600" />
							Aprobar Planificación
						</h3>
						<p className="text-sm text-zinc-500 dark:text-zinc-450">
							Por favor, registre cualquier comentario técnico o nota sobre la viabilidad del plan de trabajo antes de autorizar su ejecución en campo.
						</p>
						<textarea
							value={approvalNotes}
							onChange={(e) => dispatch({ type: "SET_APPROVAL_NOTES", payload: e.target.value })}
							rows={3}
							placeholder="Notas sobre el plan, personal, o equipos..."
							className="w-full text-sm px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
						/>
						<div className="flex items-center justify-end gap-3 pt-2">
							<button
								type="button"
								onClick={() => dispatch({ type: "SHOW_APPROVAL_MODAL", payload: false })}
								aria-label="Cancelar aprobación"
								className="text-sm font-semibold text-zinc-650 hover:text-zinc-900 dark:text-zinc-450 dark:hover:text-white px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={handleApprove}
								disabled={approveMutation.isPending}
								aria-label="Confirmar aprobación del plan"
								className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50"
							>
								{approveMutation.isPending && <Loader2 className="animate-spin size-4" />}
								Confirmar Aprobación
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Reopen Modal */}
			{showReopenModal && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-6 space-y-4">
						<h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
							<Unlock className="text-rose-600" />
							Reabrir Planificación
						</h3>
						<p className="text-sm text-zinc-500 dark:text-zinc-450">
							Esto cambiará el estado del plan de trabajo a borrador, bloqueando temporalmente el inicio de la ejecución. Es obligatorio especificar el motivo del cambio.
						</p>
						<textarea
							value={reopenReason}
							onChange={(e) => dispatch({ type: "SET_REOPEN_REASON", payload: e.target.value })}
							rows={3}
							placeholder="Razón por la cual se reabre el plan de trabajo..."
							className="w-full text-sm px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
							required
						/>
						<div className="flex items-center justify-end gap-3 pt-2">
							<button
								type="button"
								onClick={() => dispatch({ type: "SHOW_REOPEN_MODAL", payload: false })}
								aria-label="Cancelar reapertura"
								className="text-sm font-semibold text-zinc-650 hover:text-zinc-900 dark:text-zinc-450 dark:hover:text-white px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={handleReopen}
								disabled={!reopenReason.trim() || reopenMutation.isPending}
								aria-label="Reabrir plan de trabajo"
								className="text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50"
							>
								{reopenMutation.isPending && <Loader2 className="animate-spin size-4" />}
								Reabrir Plan
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}

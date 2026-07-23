"use client";

import { PLANNING_ACCESS_ROLES } from "@cermont/domain";
import type {
	PlanningEquipment,
	PlanningPacket,
	PlanningResourceLine,
	PlanningTool,
} from "@cermont/shared-types";
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
import { type FormEvent, type ReactNode, useMemo, useReducer } from "react";
import { ApiError } from "@/lib/http/api-client";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { usePermissions } from "@/modules/core/hooks/usePermissions";
import { type KitTemplate as QueryKitTemplate, useKitTemplates } from "@/modules/kits/queries";
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

// ── Types & Reducer ──────────────────────────────────────────────────────

type TabKey = "materials" | "tools" | "equipment" | "safety";
type BusinessUnit = "IT_MNT" | "SC" | "GEN" | "OTROS";

// Note: Re-defining locally as @cermont/shared-types might not export FormState/Action exactly like this
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
	| {
			type: "UPDATE_FORM";
			payload: Partial<
				Pick<
					PlanningFormState,
					"place" | "plannedDate" | "businessUnit" | "scope" | "inspectorName"
				>
			>;
	  }
	| { type: "SET_APPROVAL_NOTES"; payload: string }
	| { type: "SET_REOPEN_REASON"; payload: string }
	| { type: "SHOW_APPROVAL_MODAL"; payload: boolean }
	| { type: "SHOW_REOPEN_MODAL"; payload: boolean }
	| {
			type: "POPULATE_FORM";
			payload: {
				place: string;
				plannedDate: string;
				businessUnit: string;
				scope: string;
				inspectorName: string;
			};
	  };

const initialState: PlanningFormState = {
	activeTab: "materials",
	isEditing: false,
	selectedKitId: "",
	place: "",
	plannedDate: "",
	businessUnit: "IT_MNT",
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
				businessUnit: (action.payload.businessUnit as BusinessUnit) || "IT_MNT",
				scope: action.payload.scope,
				inspectorName: action.payload.inspectorName,
			};
		default:
			return state;
	}
}

// ── Sub-components ───────────────────────────────────────────────────────

interface SectionProps {
	id: string;
	otNumber: string;
	clientName: string;
	statusConfig: { text: string; bg: string; icon: ReactNode } | null;
}

function PlanningHeader({ id, otNumber, clientName, statusConfig }: SectionProps) {
	return (
		<>
			<div className="flex items-center gap-4">
				<Link
					href={`/orders/${id}`}
					className="inline-flex items-center gap-2 text-sm text-zinc-650 dark:text-zinc-350 hover:text-ink dark:hover:text-white transition-colors"
				>
					<ArrowLeft aria-hidden="true" className="size-4" />
					Volver a la orden
				</Link>
			</div>

			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-5">
				<div>
					<h1
						id="order-planning-title"
						className="text-2xl font-bold text-ink dark:text-white tracking-tight"
					>
						Planificación de Trabajo — {otNumber}
					</h1>
					<p className="text-sm text-zinc-550 dark:text-steel mt-1">
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
		</>
	);
}

function EmptyPlanningState({
	isPlanningRole,
	handleCreatePlanning,
	isPending,
}: {
	isPlanningRole: boolean;
	handleCreatePlanning: () => void;
	isPending: boolean;
}) {
	return (
		<div className="rounded-2xl border-2 border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800 max-w-2xl mx-auto bg-white/50 dark:bg-zinc-900/50 shadow-sm">
			<Calendar
				aria-hidden="true"
				className="mx-auto size-16 text-steel dark:text-zinc-650 mb-4 animate-pulse"
			/>
			<h3 className="text-xl font-bold text-ink dark:text-white mb-2">
				Sin Planificación Registrada
			</h3>
			<p className="text-sm text-steel dark:text-zinc-450 mb-6">
				Esta orden de trabajo no cuenta con una planeación formal y recursos asignados en el
				sistema.
			</p>
			{isPlanningRole ? (
				<button
					type="button"
					onClick={handleCreatePlanning}
					disabled={isPending}
					className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
				>
					{isPending ? <Loader2 className="animate-spin size-5" /> : <Plus className="size-5" />}
					Inicializar Plan de Trabajo
				</button>
			) : (
				<p className="text-sm text-brand-warn dark:text-brand-warn italic">
					No tienes permisos para inicializar la planeación.
				</p>
			)}
		</div>
	);
}

interface DetailProps {
	planningPacket: PlanningPacket;
	isEditing: boolean;
	isPlanningRole: boolean;
	state: PlanningFormState;
	dispatch: (action: PlanningFormAction) => void;
	startEdit: () => void;
	handleSave: (e: FormEvent) => Promise<void>;
	isPending: boolean;
}

function PlanningDetailCard({
	planningPacket,
	isEditing,
	isPlanningRole,
	state,
	dispatch,
	startEdit,
	handleSave,
	isPending,
}: DetailProps) {
	return (
		<div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-850 p-6 relative overflow-hidden">
			<div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-lg font-bold text-ink dark:text-white flex items-center gap-2 ml-2">
					<Settings className="size-5 text-brand-green" />
					Detalles del Plan
				</h2>
				{!isEditing && planningPacket.status !== "approved" && isPlanningRole && (
					<button
						type="button"
						onClick={startEdit}
						className="text-xs font-semibold text-brand-green hover:text-brand-green dark:text-brand-green dark:hover:text-brand-green border border-blue-200 dark:border-blue-900/60 px-3 py-1.5 rounded-lg transition-colors"
					>
						Editar Plan
					</button>
				)}
			</div>

			{isEditing ? (
				<form onSubmit={handleSave} className="space-y-4 ml-2">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="inspector"
								className="block text-xs font-semibold text-zinc-550 dark:text-steel mb-1 uppercase tracking-wider"
							>
								Inspector Responsable
							</label>
							<input
								id="inspector"
								type="text"
								value={state.inspectorName}
								onChange={(e) =>
									dispatch({ type: "UPDATE_FORM", payload: { inspectorName: e.target.value } })
								}
								placeholder="Ej. Ing. Juan Diego"
								className="w-full text-sm px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
							/>
						</div>
						<div>
							<label
								htmlFor="place"
								className="block text-xs font-semibold text-zinc-550 dark:text-steel mb-1 uppercase tracking-wider"
							>
								Lugar / Locación
							</label>
							<input
								id="place"
								type="text"
								value={state.place}
								onChange={(e) =>
									dispatch({ type: "UPDATE_FORM", payload: { place: e.target.value } })
								}
								placeholder="Ej. Campo Caño Limón"
								className="w-full text-sm px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="plannedDate"
								className="block text-xs font-semibold text-zinc-550 dark:text-steel mb-1 uppercase tracking-wider"
							>
								Fecha Planificada
							</label>
							<input
								id="plannedDate"
								type="datetime-local"
								value={state.plannedDate}
								onChange={(e) =>
									dispatch({ type: "UPDATE_FORM", payload: { plannedDate: e.target.value } })
								}
								className="w-full text-sm px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
							/>
						</div>
						<div>
							<label
								htmlFor="bu"
								className="block text-xs font-semibold text-zinc-550 dark:text-steel mb-1 uppercase tracking-wider"
							>
								Unidad de Negocio
							</label>
							<select
								id="bu"
								value={state.businessUnit}
								onChange={(e) =>
									dispatch({
										type: "UPDATE_FORM",
										payload: { businessUnit: e.target.value as BusinessUnit },
									})
								}
								className="w-full text-sm px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
							>
								<option value="IT_MNT">Mantenimiento (IT-MNT)</option>
								<option value="IT">Tecnología (IT)</option>
								<option value="SC">Soporte Campo (SC)</option>
								<option value="GEN">General (GEN)</option>
								<option value="OTHER">Otros (OTHER)</option>
							</select>
						</div>
					</div>

					<div>
						<label
							htmlFor="scope"
							className="block text-xs font-semibold text-zinc-550 dark:text-steel mb-1 uppercase tracking-wider"
						>
							Alcance de Actividad (Mínimo 20 caracteres)
						</label>
						<textarea
							id="scope"
							value={state.scope}
							onChange={(e) =>
								dispatch({ type: "UPDATE_FORM", payload: { scope: e.target.value } })
							}
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
							className="text-sm font-semibold text-zinc-650 hover:text-ink dark:text-zinc-450 dark:hover:text-white px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl"
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={isPending}
							className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50"
						>
							{isPending && <Loader2 className="animate-spin size-4" />}
							Guardar Cambios
						</button>
					</div>
				</form>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-2">
					<div className="space-y-4">
						<div className="flex items-start gap-2.5">
							<User aria-hidden="true" className="size-4.5 text-steel mt-0.5" />
							<div>
								<h4 className="text-xs font-semibold text-steel dark:text-zinc-455 uppercase tracking-wider">
									Inspector Responsable
								</h4>
								<p className="text-sm font-medium text-zinc-850 dark:text-muted-text mt-0.5">
									{planningPacket.responsibleInspectorName || "No especificado"}
								</p>
							</div>
						</div>

						<div className="flex items-start gap-2.5">
							<MapPin aria-hidden="true" className="size-4.5 text-steel mt-0.5" />
							<div>
								<h4 className="text-xs font-semibold text-steel dark:text-zinc-455 uppercase tracking-wider">
									Lugar / Locación
								</h4>
								<p className="text-sm font-medium text-zinc-850 dark:text-muted-text mt-0.5">
									{planningPacket.place || "No especificado"}
								</p>
							</div>
						</div>

						<div className="flex items-start gap-2.5">
							<Calendar aria-hidden="true" className="size-4.5 text-steel mt-0.5" />
							<div>
								<h4 className="text-xs font-semibold text-steel dark:text-zinc-455 uppercase tracking-wider">
									Fecha Planificada
								</h4>
								<p className="text-sm font-medium text-zinc-850 dark:text-muted-text mt-0.5">
									{planningPacket.plannedDate
										? new Date(planningPacket.plannedDate).toLocaleString("es-CO", {
												dateStyle: "medium",
												timeStyle: "short",
												timeZone: "America/Bogota",
											})
										: "No programada"}
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-start gap-2.5">
							<Briefcase aria-hidden="true" className="size-4.5 text-steel mt-0.5" />
							<div>
								<h4 className="text-xs font-semibold text-steel dark:text-zinc-455 uppercase tracking-wider">
									Unidad de Negocio
								</h4>
								<p className="text-sm font-medium text-zinc-850 dark:text-muted-text mt-0.5">
									{planningPacket.businessUnit || "No especificada"}
								</p>
							</div>
						</div>

						<div className="flex items-start gap-2.5">
							<FileText aria-hidden="true" className="size-4.5 text-steel mt-0.5" />
							<div>
								<h4 className="text-xs font-semibold text-steel dark:text-zinc-455 uppercase tracking-wider">
									Alcance Técnico
								</h4>
								<p className="text-sm text-zinc-850 dark:text-stone mt-0.5 whitespace-pre-wrap leading-relaxed">
									{planningPacket.scope || "No detallado"}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function TypicalKitSelector({
	selectedKitId,
	kitTemplates,
	handleApplyKit,
	isPending,
	dispatch,
}: {
	selectedKitId: string;
	kitTemplates?: QueryKitTemplate[];
	handleApplyKit: () => void;
	isPending: boolean;
	dispatch: (action: PlanningFormAction) => void;
}) {
	return (
		<div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950 p-6 border border-zinc-250 dark:border-zinc-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div>
				<h3 className="text-base font-bold text-ink dark:text-white">
					Aplicar Plantilla de Kit Típico
				</h3>
				<p className="text-xs text-steel dark:text-zinc-455 mt-1 max-w-md">
					Carga automáticamente un listado estandarizado de materiales, herramientas, y EPIs
					correspondientes al tipo de actividad.
				</p>
			</div>
			<div className="flex items-center gap-2">
				<label htmlFor="kit-select" className="sr-only">
					Seleccionar Kit Típico
				</label>
				<select
					id="kit-select"
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
					disabled={!selectedKitId || isPending}
					className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors"
				>
					{isPending ? (
						<Loader2 className="animate-spin size-4" />
					) : (
						<Plus aria-hidden="true" className="size-4" />
					)}
					Aplicar
				</button>
			</div>
		</div>
	);
}

function ResourceTabs({
	planningPacket,
	activeTab,
	dispatch,
}: {
	planningPacket: PlanningPacket;
	activeTab: TabKey;
	dispatch: (action: PlanningFormAction) => void;
}) {
	const tabs = [
		{ key: "materials", label: "Materiales", count: planningPacket.materials?.length || 0 },
		{ key: "tools", label: "Herramientas", count: planningPacket.tools?.length || 0 },
		{ key: "equipment", label: "Equipos", count: planningPacket.equipment?.length || 0 },
		{ key: "safety", label: "EPIs", count: planningPacket.safetyElements?.length || 0 },
	];

	return (
		<div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-850 p-6">
			<div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-850 pb-3 mb-6">
				<h2 className="text-lg font-bold text-ink dark:text-white flex items-center gap-2">
					<Package aria-hidden="true" className="size-5 text-brand-green" />
					Recursos Planificados
				</h2>
				{planningPacket.kitSnapshot && (
					<span className="text-xs bg-zinc-100 text-zinc-650 px-2.5 py-1 rounded-md font-semibold border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-350 dark:border-zinc-700">
						Kit: {planningPacket.kitSnapshot.name}
					</span>
				)}
			</div>

			<div className="flex overflow-x-auto gap-2 border-b border-zinc-200 dark:border-zinc-850 mb-6 pb-2">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						type="button"
						onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: tab.key as TabKey })}
						className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
							activeTab === tab.key
								? "bg-blue-600 text-white shadow-sm"
								: "text-steel hover:text-ink hover:bg-zinc-150 dark:text-steel dark:hover:text-white dark:hover:bg-zinc-850"
						}`}
					>
						{tab.label} ({tab.count})
					</button>
				))}
			</div>

			<div className="overflow-x-auto">
				{activeTab === "materials" && (
					<ResourceTable
						items={planningPacket.materials}
						emptyMessage="No se han asignado materiales a esta planeación."
						columns={[
							{ header: "Descripción Material", accessor: "description" },
							{ header: "Cantidad", accessor: "quantity" },
							{ header: "Unidad", accessor: "unit", fallback: "und" },
						]}
						keyExtractor={(m: PlanningResourceLine) => m.description}
					/>
				)}
				{activeTab === "tools" && (
					<ResourceTable
						items={planningPacket.tools}
						emptyMessage="No se han asignado herramientas a esta planeación."
						columns={[
							{ header: "Herramienta", accessor: "name" },
							{ header: "Cantidad", accessor: "quantity" },
							{
								header: "Disponible",
								render: (item: PlanningTool) => (
									<span
										className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${
											item.available
												? "bg-emerald-100 text-brand-annotate dark:bg-emerald-950/30 dark:text-brand-annotate"
												: "bg-rose-100 text-brand-error dark:bg-rose-950/30 dark:text-brand-error"
										}`}
									>
										{item.available ? "Disponible" : "Sin Stock"}
									</span>
								),
							},
						]}
						keyExtractor={(t: PlanningTool) => t.name}
					/>
				)}
				{activeTab === "equipment" && (
					<ResourceTable
						items={planningPacket.equipment}
						emptyMessage="No se han asignado equipos a esta planeación."
						columns={[
							{ header: "Equipo", accessor: "name" },
							{ header: "Cantidad", accessor: "quantity" },
							{
								header: "Disponible",
								render: (item: PlanningEquipment) => (
									<span
										className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${
											item.available
												? "bg-emerald-100 text-brand-annotate dark:bg-emerald-950/30 dark:text-brand-annotate"
												: "bg-rose-100 text-brand-error dark:bg-rose-950/30 dark:text-brand-error"
										}`}
									>
										{item.available ? "Disponible" : "Sin Stock"}
									</span>
								),
							},
							{
								header: "Certificado Requerido",
								render: (item: PlanningEquipment) => (
									<span
										className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${
											item.certificateRequired
												? "bg-amber-100 text-brand-warn dark:bg-amber-950/30 dark:text-brand-warn"
												: "bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-steel"
										}`}
									>
										{item.certificateRequired ? "Sí" : "No"}
									</span>
								),
							},
						]}
						keyExtractor={(eq: PlanningEquipment) => eq.name}
					/>
				)}
				{activeTab === "safety" && (
					<ResourceTable
						items={planningPacket.safetyElements}
						emptyMessage="No se han asignado elementos de seguridad a esta planeación."
						columns={[
							{ header: "Elemento de Seguridad / EPI", accessor: "description" },
							{ header: "Cantidad", accessor: "quantity" },
							{ header: "Unidad", accessor: "unit", fallback: "und" },
						]}
						keyExtractor={(s: PlanningResourceLine) => s.description}
					/>
				)}
			</div>
		</div>
	);
}

function ResourceTable<T extends Record<string, unknown>>({
	items,
	emptyMessage,
	columns,
	keyExtractor,
}: {
	items?: T[];
	emptyMessage: string;
	columns: Array<{
		header: string;
		accessor?: keyof T;
		fallback?: string;
		render?: (item: T) => ReactNode;
	}>;
	keyExtractor: (item: T) => string;
}) {
	if (!items || items.length === 0) {
		return <p className="text-sm text-steel dark:text-zinc-455 italic py-4">{emptyMessage}</p>;
	}

	return (
		<table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-850">
			<thead>
				<tr>
					{columns.map((col) => (
						<th
							key={col.header}
							className="px-4 py-3 text-left text-xs font-bold text-steel dark:text-steel uppercase tracking-wider"
						>
							{col.header}
						</th>
					))}
				</tr>
			</thead>
			<tbody className="divide-y divide-zinc-200 dark:divide-zinc-850">
				{items.map((item) => (
					<tr key={keyExtractor(item)} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/40">
						{columns.map((col) => (
							<td key={col.header} className="px-4 py-3 text-sm text-ink dark:text-white">
								{col.render
									? col.render(item)
									: col.accessor
										? (item[col.accessor] as ReactNode) || col.fallback
										: null}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}

function WorkflowStatusPanel({
	planningPacket,
	canApprove,
	handleValidateReadiness,
	isValidationPending,
	dispatch,
}: {
	planningPacket: PlanningPacket;
	canApprove: boolean;
	handleValidateReadiness: () => void;
	isValidationPending: boolean;
	dispatch: (action: PlanningFormAction) => void;
}) {
	return (
		<div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-850 shadow-sm">
			<h3 className="text-base font-bold text-ink dark:text-white flex items-center gap-2 mb-4">
				<ListTodo aria-hidden="true" className="size-5 text-brand-green" />
				Flujo de Aprobación
			</h3>

			<div className="space-y-4">
				<div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
					<span className="text-xs font-semibold text-steel uppercase tracking-wider">
						Estado de Tarea
					</span>
					<p className="text-sm font-bold text-ink dark:text-white mt-1 capitalize">
						{planningPacket.status}
					</p>
				</div>

				{planningPacket.status !== "approved" && (
					<button
						type="button"
						onClick={handleValidateReadiness}
						disabled={isValidationPending}
						className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-100 text-charcoal font-semibold border border-zinc-300 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:text-stone dark:border-zinc-800 px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm active:scale-[0.98]"
					>
						{isValidationPending ? (
							<Loader2 className="animate-spin size-4" />
						) : (
							<Settings aria-hidden="true" className="size-4" />
						)}
						Validar Viabilidad
					</button>
				)}

				{planningPacket.status === "ready" && canApprove && (
					<button
						type="button"
						onClick={() => dispatch({ type: "SHOW_APPROVAL_MODAL", payload: true })}
						className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm active:scale-[0.98]"
					>
						<Lock aria-hidden="true" className="size-4" />
						Aprobar Planificación
					</button>
				)}

				{planningPacket.status === "approved" && canApprove && (
					<button
						type="button"
						onClick={() => dispatch({ type: "SHOW_REOPEN_MODAL", payload: true })}
						className="w-full inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm active:scale-[0.98]"
					>
						<Unlock aria-hidden="true" className="size-4" />
						Reabrir Planificación
					</button>
				)}

				{planningPacket.status === "approved" && (
					<div className="bg-emerald-50 dark:bg-emerald-950/20 text-brand-annotate dark:text-brand-annotate p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 text-xs leading-relaxed space-y-2">
						<p className="font-bold flex items-center gap-1">
							<CheckCircle aria-hidden="true" className="size-4 text-brand-annotate" />
							Módulo Aprobado
						</p>
						<p>
							La planificación de la orden está aprobada. La ejecución en campo de esta orden ahora
							puede iniciarse.
						</p>
						{planningPacket.approvedAt && (
							<p className="text-[10px] text-steel">
								Aprobado el: {new Date(planningPacket.approvedAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })}
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

function ApprovalModal({
	approvalNotes,
	isPending,
	handleApprove,
	dispatch,
}: {
	approvalNotes: string;
	isPending: boolean;
	handleApprove: () => Promise<void>;
	dispatch: (action: PlanningFormAction) => void;
}) {
	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-6 space-y-4">
				<h3 className="text-lg font-bold text-ink dark:text-white flex items-center gap-2">
					<Lock aria-hidden="true" className="text-brand-annotate" />
					Aprobar Planificación
				</h3>
				<p className="text-sm text-steel dark:text-zinc-450">
					Por favor, registre cualquier comentario técnico o nota sobre la viabilidad del plan de
					trabajo antes de autorizar su ejecución en campo.
				</p>
				<label htmlFor="approval-notes" className="sr-only">
					Notas de aprobación
				</label>
				<textarea
					id="approval-notes"
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
						className="text-sm font-semibold text-zinc-650 hover:text-ink dark:text-zinc-450 dark:hover:text-white px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={handleApprove}
						disabled={isPending}
						aria-label="Confirmar aprobación del plan"
						className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50"
					>
						{isPending && <Loader2 className="animate-spin size-4" />}
						Confirmar Aprobación
					</button>
				</div>
			</div>
		</div>
	);
}

function ReopenModal({
	reopenReason,
	isPending,
	handleReopen,
	dispatch,
}: {
	reopenReason: string;
	isPending: boolean;
	handleReopen: () => Promise<void>;
	dispatch: (action: PlanningFormAction) => void;
}) {
	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-6 space-y-4">
				<h3 className="text-lg font-bold text-ink dark:text-white flex items-center gap-2">
					<Unlock aria-hidden="true" className="text-brand-error" />
					Reabrir Planificación
				</h3>
				<p className="text-sm text-steel dark:text-zinc-450">
					Esto cambiará el estado del plan de trabajo a borrador, bloqueando temporalmente el inicio
					de la ejecución. Es obligatorio especificar el motivo del cambio.
				</p>
				<label htmlFor="reopen-reason" className="sr-only">
					Razón de reapertura
				</label>
				<textarea
					id="reopen-reason"
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
						className="text-sm font-semibold text-zinc-650 hover:text-ink dark:text-zinc-450 dark:hover:text-white px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={handleReopen}
						disabled={!reopenReason.trim() || isPending}
						aria-label="Reabrir plan de trabajo"
						className="text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50"
					>
						{isPending && <Loader2 className="animate-spin size-4" />}
						Reabrir Plan
					</button>
				</div>
			</div>
		</div>
	);
}

// ── Status badge mapping helper ───────────────────────────────────────────

function getStatusConfig(status: string) {
	switch (status) {
		case "approved":
			return {
				text: "Aprobado",
				bg: "bg-emerald-100 text-brand-annotate border-emerald-300 dark:bg-emerald-950/40 dark:text-brand-annotate dark:border-emerald-900/60",
				icon: (
					<CheckCircle
						aria-hidden="true"
						className="size-4 text-brand-annotate dark:text-brand-annotate"
					/>
				),
			};
		case "ready":
			return {
				text: "Listo para Ejecutar",
				bg: "bg-blue-100 text-brand-green border-blue-300 dark:bg-blue-950/40 dark:text-brand-green dark:border-blue-900/60",
				icon: (
					<CheckCircle
						aria-hidden="true"
						className="size-4 text-brand-green dark:text-brand-green"
					/>
				),
			};
		case "blocked":
			return {
				text: "Bloqueado",
				bg: "bg-rose-100 text-brand-error border-rose-300 dark:bg-rose-950/40 dark:text-brand-error dark:border-rose-900/60",
				icon: (
					<ShieldAlert
						aria-hidden="true"
						className="size-4 text-brand-error dark:text-brand-error"
					/>
				),
			};
		case "incomplete":
			return {
				text: "Incompleto",
				bg: "bg-amber-100 text-brand-warn border-amber-300 dark:bg-amber-950/40 dark:text-brand-warn dark:border-amber-900/60",
				icon: (
					<AlertTriangle
						aria-hidden="true"
						className="size-4 text-brand-warn dark:text-brand-warn"
					/>
				),
			};
		default:
			return {
				text: "Borrador",
				bg: "bg-zinc-100 text-charcoal border-zinc-300 dark:bg-zinc-850 dark:text-steel dark:border-zinc-800",
				icon: <FileText aria-hidden="true" className="size-4 text-steel dark:text-zinc-450" />,
			};
	}
}

// ── Main Page Component ──────────────────────────────────────────────────

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
	const { canPerformAction } = usePermissions();
	const isGerenteOrResidente = useMemo(
		() => canPerformAction("approve_planning"),
		[canPerformAction],
	);

	const isPlanningRole = useMemo(
		() => user?.role && (PLANNING_ACCESS_ROLES as readonly string[]).includes(user.role),
		[user?.role],
	);

	const isNotFound = useMemo(
		() => planningError instanceof ApiError && planningError.status === 404,
		[planningError],
	);

	// Handlers
	const startEdit = () => {
		if (planningPacket) {
			dispatch({
				type: "POPULATE_FORM",
				payload: {
					place: planningPacket.place || "",
					plannedDate: planningPacket.plannedDate
						? new Date(planningPacket.plannedDate).toISOString().slice(0, 16)
						: "",
					businessUnit: (planningPacket.businessUnit as string) || "IT_MNT",
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
				place: state.place,
				...(state.plannedDate && { plannedDate: new Date(state.plannedDate).toISOString() }),
				businessUnit: state.businessUnit as BusinessUnit,
				scope: state.scope,
				responsibleInspectorName: state.inspectorName,
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
		if (!state.selectedKitId) {
			return;
		}
		try {
			await applyKitMutation.mutateAsync({ kitTemplateId: state.selectedKitId });
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
			await approveMutation.mutateAsync({ notes: state.approvalNotes });
			dispatch({ type: "SHOW_APPROVAL_MODAL", payload: false });
			dispatch({ type: "SET_APPROVAL_NOTES", payload: "" });
		} catch (err) {
			console.error("Error approving planning:", err);
		}
	};

	const handleReopen = async () => {
		try {
			await reopenMutation.mutateAsync({ reason: state.reopenReason });
			dispatch({ type: "SHOW_REOPEN_MODAL", payload: false });
			dispatch({ type: "SET_REOPEN_REASON", payload: "" });
		} catch (err) {
			console.error("Error reopening planning:", err);
		}
	};

	if (orderLoading || planningLoading) {
		return (
			<div className="flex h-64 items-center justify-center text-steel">
				<Loader2 className="animate-spin size-6 mr-2 text-brand-green" />
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

	const statusConfig = planningPacket ? getStatusConfig(planningPacket.status) : null;

	return (
		<section className="space-y-6 max-w-6xl mx-auto p-4" aria-labelledby="order-planning-title">
			<PlanningHeader
				id={id}
				otNumber={otNumber}
				clientName={clientName}
				statusConfig={statusConfig}
			/>

			{isNotFound || !planningPacket ? (
				<EmptyPlanningState
					isPlanningRole={!!isPlanningRole}
					handleCreatePlanning={handleCreatePlanning}
					isPending={createMutation.isPending}
				/>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 space-y-6">
						<PlanningDetailCard
							planningPacket={planningPacket}
							isEditing={state.isEditing}
							isPlanningRole={!!isPlanningRole}
							state={state}
							dispatch={dispatch}
							startEdit={startEdit}
							handleSave={handleSave}
							isPending={updateMutation.isPending}
						/>

						{!state.isEditing && planningPacket.status !== "approved" && isPlanningRole && (
							<TypicalKitSelector
								selectedKitId={state.selectedKitId}
								kitTemplates={kitTemplates}
								handleApplyKit={handleApplyKit}
								isPending={applyKitMutation.isPending}
								dispatch={dispatch}
							/>
						)}

						<ResourceTabs
							planningPacket={planningPacket}
							activeTab={state.activeTab}
							dispatch={dispatch}
						/>
					</div>

					<div className="space-y-6">
						<WorkflowStatusPanel
							planningPacket={planningPacket}
							canApprove={isGerenteOrResidente}
							handleValidateReadiness={handleValidateReadiness}
							isValidationPending={validateMutation.isPending}
							dispatch={dispatch}
						/>
					</div>
				</div>
			)}

			{state.showApprovalModal && (
				<ApprovalModal
					approvalNotes={state.approvalNotes}
					isPending={approveMutation.isPending}
					handleApprove={handleApprove}
					dispatch={dispatch}
				/>
			)}

			{state.showReopenModal && (
				<ReopenModal
					reopenReason={state.reopenReason}
					isPending={reopenMutation.isPending}
					handleReopen={handleReopen}
					dispatch={dispatch}
				/>
			)}
		</section>
	);
}

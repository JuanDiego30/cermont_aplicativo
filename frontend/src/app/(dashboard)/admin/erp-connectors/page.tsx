"use client";

import type { CreateErpConnectorInput } from "@cermont/shared-types";
import { ErpAuthTypeEnum, ErpProviderTypeEnum } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertCircle, Check, Loader2, Plug, Plus, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { FormField, Select, TextField } from "@/core/ui/FormField";
import {
	useCreateErpConnector,
	useErpConnectors,
	useSyncErpConnector,
} from "@/modules/erp-connector/queries";

const PROVIDER_LABELS: Record<string, string> = {
	fssm: "Gestión de Servicio en Campo",
	gmao_csm: "GMAO / CSM Mantenimiento",
	sap: "SAP",
	ariba: "SAP Ariba",
	dian: "DIAN",
	custom: "Adaptador personalizado",
};

const createErpSchema = z.object({
	provider: ErpProviderTypeEnum,
	name: z.string().min(1, "El nombre es requerido"),
	baseUrl: z.url("Debe ser una URL válida").optional().or(z.literal("")),
	authType: ErpAuthTypeEnum,
	enabled: z.boolean().default(true),
	syncInterval: z.number().int().min(0).default(300),
});

type CreateErpFormValues = z.output<typeof createErpSchema>;

function toCreateInput(values: CreateErpFormValues): CreateErpConnectorInput {
	return {
		provider: values.provider,
		name: values.name,
		baseUrl: values.baseUrl || undefined,
		authType: values.authType,
		enabled: values.enabled,
		syncInterval: values.syncInterval,
	};
}

function CreateErpDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (o: boolean) => void;
}) {
	const createMutation = useCreateErpConnector();
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(createErpSchema),
		defaultValues: {
			provider: "fssm",
			name: "",
			baseUrl: "",
			authType: "api_key",
			enabled: true,
			syncInterval: 300,
		},
	});

	const onSubmit = async (data: CreateErpFormValues) => {
		try {
			await createMutation.mutateAsync(toCreateInput(data));
			toast.success("Conector ERP creado");
			reset();
			onOpenChange(false);
		} catch {
			toast.error("Error al crear conector ERP");
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
				<Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-xl outline-none">
					<Dialog.Title className="text-lg font-semibold text-[var(--text-primary)]">
						Agregar conector ERP
					</Dialog.Title>

					<form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
						<FormField label="Proveedor" required error={errors.provider?.message}>
							<Select {...register("provider")}>
								{ErpProviderTypeEnum.options.map((opt) => (
									<option key={opt} value={opt}>
										{PROVIDER_LABELS[opt] ?? opt}
									</option>
								))}
							</Select>
						</FormField>

						<FormField label="Nombre" required error={errors.name?.message}>
							<TextField {...register("name")} placeholder="Mi conector ERP" />
						</FormField>

						<FormField label="URL base" error={errors.baseUrl?.message}>
							<TextField {...register("baseUrl")} placeholder="https://..." />
						</FormField>

						<FormField label="Tipo de autenticación" required error={errors.authType?.message}>
							<Select {...register("authType")}>
								{ErpAuthTypeEnum.options.map((opt) => (
									<option key={opt} value={opt}>
										{opt}
									</option>
								))}
							</Select>
						</FormField>

						<FormField label="Intervalo de sincronización (s)" error={errors.syncInterval?.message}>
							<TextField type="number" {...register("syncInterval")} />
						</FormField>

						<div className="flex justify-end gap-3 pt-2">
							<Dialog.Close asChild>
								<Button type="button" variant="outline">
									Cancelar
								</Button>
							</Dialog.Close>
							<Button
								type="submit"
								loading={createMutation.isPending}
								disabled={createMutation.isPending}
							>
								Crear
							</Button>
						</div>
					</form>

					<Dialog.Close asChild>
						<button
							type="button"
							aria-label="Close"
							className="absolute right-4 top-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
						>
							<X className="size-4" />
						</button>
					</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

export default function ErpConnectorsPage() {
	const [showCreate, setShowCreate] = useState(false);
	const { data: connectors, isLoading, isError, refetch } = useErpConnectors();
	const syncMutation = useSyncErpConnector();

	const handleSync = (provider: string) => {
		syncMutation.mutate(provider, {
			onSuccess: () => toast.success(`Sincronización iniciada para ${PROVIDER_LABELS[provider] ?? provider}`),
			onError: () => toast.error(`Sincronización falló para ${PROVIDER_LABELS[provider] ?? provider}`),
		});
	};

	if (isLoading) {
		return (
			<section
				aria-label="Cargando conectores ERP"
				className="flex items-center justify-center py-16"
			>
				<Loader2 className="size-7 animate-spin text-brand" />
			</section>
		);
	}

	if (isError) {
		return (
			<section className="flex flex-col items-center gap-4 py-16">
				<AlertCircle className="size-8 text-brand-error" />
				<h2 className="text-lg font-semibold">Error al cargar conectores ERP</h2>
				<Button onClick={() => refetch()}>Reintentar</Button>
			</section>
		);
	}

	if (!connectors || connectors.length === 0) {
		return (
			<section className="p-6">
				<EmptyState
					icon={Plug}
					title="Sin conectores ERP"
					description="Agregue un conector ERP para integrar sistemas externos como FSSM, GMAO/CSM, SAP o DIAN."
					action={{ label: "Agregar conector", onClick: () => setShowCreate(true) }}
				/>
				<CreateErpDialog open={showCreate} onOpenChange={setShowCreate} />
			</section>
		);
	}

	return (
		<section aria-labelledby="erp-title" className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 id="erp-title" className="text-2xl font-bold">
						Conectores ERP
					</h1>
					<p className="mt-1 text-sm text-secondary">
						Gestionar integraciones con sistemas externos para operaciones multi-ERP.
					</p>
				</div>
				<Button onClick={() => setShowCreate(true)} variant="primary" size="sm">
					<Plus className="size-4" /> Agregar
				</Button>
			</div>
			<CreateErpDialog open={showCreate} onOpenChange={setShowCreate} />

			<div className="grid gap-4 md:grid-cols-2">
				{connectors.map((conn) => (
					<div
						key={conn._id}
						className="rounded-xl border border-hairline bg-surface p-5 shadow-card"
					>
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-brand/10 p-2">
									<Plug className="size-5 text-brand" />
								</div>
								<div>
									<h3 className="font-semibold">{conn.name}</h3>
									<p className="text-sm text-secondary">
										{PROVIDER_LABELS[conn.provider] ?? conn.provider}
									</p>
								</div>
							</div>
							<span
								className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
									conn.enabled
										? "bg-success-bg/50 text-success dark:bg-success-bg/10 dark:text-success"
										: "bg-surface text-muted border border-hairline"
								}`}
							>
							{conn.enabled ? (
								<>
									<Check className="size-3" /> Activo
								</>
							) : (
								<>
									<X className="size-3" /> Inactivo
								</>
							)}
							</span>
						</div>

						<div className="mt-4 flex items-center gap-2">
							<Button
								size="sm"
								variant="secondary"
								onClick={() => handleSync(conn.provider)}
								disabled={syncMutation.isPending}
							>
								<RefreshCw className={`size-3 ${syncMutation.isPending ? "animate-spin" : ""}`} />
								Sincronizar
							</Button>
						</div>

						{conn.baseUrl && <p className="mt-3 text-xs text-tertiary truncate">{conn.baseUrl}</p>}
					</div>
				))}
			</div>
		</section>
	);
}

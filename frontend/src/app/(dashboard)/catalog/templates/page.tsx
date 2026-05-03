"use client";

import type { ReportTemplateSettings } from "@cermont/shared-types";
import { ReportTemplateSettingsSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Image as ImageIcon, Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import { useReportTemplateSettings, useUpdateReportTemplateSettings } from "@/reports/queries";

export default function ReportSettingsPage() {
	const { data: settings, isLoading } = useReportTemplateSettings();
	const updateMutation = useUpdateReportTemplateSettings();

	const { register, handleSubmit, reset } = useForm<ReportTemplateSettings>({
		resolver: zodResolver(ReportTemplateSettingsSchema),
		defaultValues: settings,
	});

	useEffect(() => {
		if (settings) {
			reset(settings);
		}
	}, [settings, reset]);

	const onSubmit = async (data: ReportTemplateSettings) => {
		try {
			await updateMutation.mutateAsync(data);
			toast.success("Configuración de plantillas actualizada");
		} catch (_err) {
			toast.error("Error al guardar la configuración");
		}
	};

	if (isLoading) {
		return <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />;
	}

	return (
		<section className="space-y-6">
			<header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
				<div className="space-y-2">
					<p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Catálogo</p>
					<h1 className="text-2xl font-bold text-slate-900 dark:text-white">
						Plantillas de Informe y Acta
					</h1>
					<p className="max-w-2xl text-sm text-slate-500">
						Configura la identidad visual y los campos estándar para los documentos generados por el
						sistema.
					</p>
				</div>
			</header>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{/* Identity Section */}
					<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
						<div className="mb-6 flex items-center gap-3">
							<ImageIcon className="h-5 w-5 text-blue-600" />
							<h2 className="text-lg font-semibold">Identidad Corporativa</h2>
						</div>
						<div className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="companyName" className="text-sm font-medium">
									Nombre de la Empresa
								</label>
								<input
									id="companyName"
									{...register("companyName")}
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="companyNit" className="text-sm font-medium">
									NIT
								</label>
								<input
									id="companyNit"
									{...register("companyNit")}
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="primaryColor" className="text-sm font-medium">
									Color Primario (Hex)
								</label>
								<div className="flex gap-2">
									<input
										id="primaryColor"
										{...register("primaryColor")}
										className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
										placeholder="#000000"
									/>
									<div
										className="h-10 w-10 rounded-lg border border-slate-300 shadow-inner"
										style={{ backgroundColor: settings?.primaryColor || "#000" }}
									/>
								</div>
							</div>
						</div>
					</section>

					{/* Document Section */}
					<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
						<div className="mb-6 flex items-center gap-3">
							<FileText className="h-5 w-5 text-blue-600" />
							<h2 className="text-lg font-semibold">Estructura del Documento</h2>
						</div>
						<div className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="headerText" className="text-sm font-medium">
									Texto del Encabezado
								</label>
								<input
									id="headerText"
									{...register("headerText")}
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="footerText" className="text-sm font-medium">
									Texto del Pie de Página
								</label>
								<textarea
									id="footerText"
									{...register("footerText")}
									rows={3}
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="logoUrl" className="text-sm font-medium">
									URL del Logo (Public)
								</label>
								<input
									id="logoUrl"
									{...register("logoUrl")}
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
									placeholder="https://..."
								/>
							</div>
						</div>
					</section>
				</div>

				<div className="flex justify-end">
					<Button type="submit" disabled={updateMutation.isPending}>
						{updateMutation.isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Save className="h-4 w-4" />
						)}
						Guardar Cambios
					</Button>
				</div>
			</form>

			<section className="rounded-xl border border-blue-100 bg-blue-50/50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10">
				<h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">Vista Previa</h3>
				<p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
					Los cambios realizados aquí se aplicarán a todos los nuevos informes y actas generados a
					partir de este momento.
				</p>
				<div className="mt-6 aspect-[1/1.4] w-full max-w-md mx-auto rounded-lg border border-slate-300 bg-white shadow-2xl overflow-hidden p-8 space-y-6">
					<div className="flex justify-between items-start border-b pb-4">
						<div className="h-10 w-32 bg-slate-100 rounded" />
						<div className="text-right space-y-1">
							<div className="h-4 w-40 bg-slate-200 rounded" />
							<div className="h-3 w-24 bg-slate-100 rounded ml-auto" />
						</div>
					</div>
					<div className="space-y-4">
						<div className="h-8 w-64 bg-blue-600/20 rounded mx-auto" />
						<div className="grid grid-cols-3 gap-2">
							<div className="h-12 bg-slate-50 rounded" />
							<div className="h-12 bg-slate-50 rounded" />
							<div className="h-12 bg-slate-50 rounded" />
						</div>
						<div className="h-40 bg-slate-50 rounded" />
					</div>
					<div className="pt-8 border-t text-center text-[10px] text-slate-400">
						{settings?.footerText || "CERMONT S.A.S."}
					</div>
				</div>
			</section>
		</section>
	);
}

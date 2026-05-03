"use client";

import { Layers3, Package2, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface MaintenancePageHeaderProps {
	totalKits: number;
	activeKits: number;
	topActivity: string;
	latestKitName: string | undefined;
	canCreate: boolean;
}

export function MaintenancePageHeader({
	totalKits,
	activeKits,
	topActivity,
	latestKitName,
	canCreate,
}: MaintenancePageHeaderProps) {
	return (
		<header className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,64,175,0.82))] px-6 py-8 text-white shadow-[var(--shadow-3)]">
			<div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
			<div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-center">
				<div className="space-y-5">
					<span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur">
						<Layers3 className="h-3.5 w-3.5" />
						Catálogo operativo
					</span>

					<div className="space-y-3">
						<h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
							Kits típicos para planeación, alistamiento y ejecución en campo
						</h1>
						<p className="max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
							Gestiona plantillas reales con herramientas, equipos, estados y actividad asociada.
							Esta vista reemplaza el antiguo modelo de mantenimientos genéricos.
						</p>
					</div>

					<div className="flex flex-wrap gap-3">
						{canCreate ? (
							<Link
								href="/maintenance/new"
								className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
							>
								<Plus className="h-4 w-4" />
								Nuevo kit
							</Link>
						) : null}

						<Link
							href="/resources/kits"
							className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
						>
							<Package2 className="h-4 w-4" />
							Ver inventario relacionado
						</Link>
					</div>
				</div>

				<aside className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
					<div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
								Resumen rápido
							</p>
							<p className="mt-1 text-lg font-semibold">Catálogo filtrado</p>
						</div>
						<ShieldCheck className="h-6 w-6 text-emerald-300" />
					</div>

					<dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
						<div className="rounded-2xl bg-white/10 px-4 py-3">
							<dt className="text-white/60">Kits visibles</dt>
							<dd className="mt-1 text-2xl font-black">{totalKits}</dd>
						</div>
						<div className="rounded-2xl bg-white/10 px-4 py-3">
							<dt className="text-white/60">Activos</dt>
							<dd className="mt-1 text-2xl font-black">{activeKits}</dd>
						</div>
						<div className="rounded-2xl bg-white/10 px-4 py-3">
							<dt className="text-white/60">Actividad líder</dt>
							<dd className="mt-1 truncate text-lg font-bold">{topActivity}</dd>
						</div>
						<div className="rounded-2xl bg-white/10 px-4 py-3">
							<dt className="text-white/60">Último kit</dt>
							<dd className="mt-1 truncate text-lg font-bold">{latestKitName ?? "—"}</dd>
						</div>
					</dl>
				</aside>
			</div>
		</header>
	);
}

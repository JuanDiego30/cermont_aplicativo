"use client";

import { Plus, Search, Settings2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatDate } from "@/_shared/lib/utils/format-date";
import { useChecklistTemplates } from "@/checklists/queries";
import { Button } from "@/core/ui/Button";

export default function ChecklistCatalogPage() {
	const { data: templates = [], isLoading, isError } = useChecklistTemplates();
	const [search, setSearch] = useState("");

	const filteredTemplates = templates.filter(
		(t) =>
			t.name.toLowerCase().includes(search.toLowerCase()) ||
			t.category?.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<section className="space-y-6">
			<header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
							Catálogo
						</p>
						<h1 className="text-2xl font-bold text-slate-900 dark:text-white">
							Checklists Dinámicos
						</h1>
						<p className="max-w-2xl text-sm text-slate-500">
							Administra las plantillas de verificación para inspecciones, mantenimiento y
							seguridad.
						</p>
					</div>
					<Link href="/catalog/checklists/new">
						<Button type="button">
							<Plus className="h-4 w-4" />
							Nueva Plantilla
						</Button>
					</Link>
				</div>
			</header>

			<div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
				<Search className="h-4 w-4 text-slate-400" />
				<input
					type="text"
					placeholder="Buscar por nombre o categoría..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="flex-1 bg-transparent text-sm outline-none"
				/>
			</div>

			<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
				<table className="w-full text-left text-sm">
					<thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900/50">
						<tr>
							<th className="px-4 py-3">Nombre</th>
							<th className="px-4 py-3">Categoría</th>
							<th className="px-4 py-3">Items</th>
							<th className="px-4 py-3">Versión</th>
							<th className="px-4 py-3">Última mod.</th>
							<th className="px-4 py-3 text-right">Acciones</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 dark:divide-slate-800">
						{isLoading ? (
							<tr>
								<td colSpan={6} className="px-4 py-8 text-center text-slate-400">
									Cargando plantillas...
								</td>
							</tr>
						) : isError ? (
							<tr>
								<td colSpan={6} className="px-4 py-8 text-center text-red-500">
									Error al cargar plantillas.
								</td>
							</tr>
						) : filteredTemplates.length === 0 ? (
							<tr>
								<td colSpan={6} className="px-4 py-8 text-center text-slate-400">
									No se encontraron plantillas.
								</td>
							</tr>
						) : (
							filteredTemplates.map((t) => (
								<tr key={t._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
									<td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
										{t.name}
									</td>
									<td className="px-4 py-3">
										<span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-400">
											{t.category || "General"}
										</span>
									</td>
									<td className="px-4 py-3 text-slate-500">{t.items.length}</td>
									<td className="px-4 py-3 text-slate-500">{t.version}</td>
									<td className="px-4 py-3 text-slate-500">{formatDate(t.updatedAt)}</td>
									<td className="px-4 py-3 text-right">
										<Link href={`/catalog/checklists/${t._id}`}>
											<Button variant="ghost" size="sm">
												<Settings2 className="h-3.5 w-3.5" />
												Configurar
											</Button>
										</Link>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
}

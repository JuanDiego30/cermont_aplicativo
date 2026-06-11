"use client";

/**
 * /orders/[id]/asts — ASTs (Análisis de Trabajo Seguro) de la orden.
 */

import { isPresent } from "@cermont/shared-types";
import { ArrowLeft, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Skeleton } from "@/core/ui/Skeleton";
import { useASTs, useCreateAST } from "@/modules/safety-analysis/queries";
import { ASTCard } from "@/modules/safety-analysis/ui/ASTCard";
import { ASTForm } from "@/modules/safety-analysis/ui/ASTForm";
import { useAuthStore } from "@/store/auth.store";

export default function OrderASTsPage() {
	const params = useParams<{ id: string }>();
	const orderId = params?.id ?? "";
	const [showForm, setShowForm] = useState(false);
	const { data, isLoading, error, refetch } = useASTs(orderId);
	const createMutation = useCreateAST();
	const userStatus = useAuthStore((state) => state.user);
	const currentUserName = isPresent(userStatus) ? userStatus.value.name : "";

	const asts = data?.data ?? [];

	return (
		<section className="space-y-6" aria-labelledby="asts-title">
			<Link
				href={`/orders/${orderId}`}
				className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-blue)] hover:underline"
			>
				<ArrowLeft className="size-4" aria-hidden="true" /> Volver a la orden
			</Link>

			<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 id="asts-title" className="text-xl font-semibold text-[var(--text-primary)]">
						Análisis de Trabajo Seguro
					</h1>
					<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
						ASTs requeridos para ejecutar la orden de forma segura.
					</p>
				</div>
				<button
					type="button"
					onClick={() => setShowForm((v) => !v)}
					className="flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
				>
					<Plus className="size-4" aria-hidden="true" />
					Nuevo AST
				</button>
			</header>

			{showForm && (
				<ASTForm
					orderId={orderId}
					isSaving={createMutation.isPending}
					onSubmit={async (input) => {
						await createMutation.mutateAsync(input);
						setShowForm(false);
					}}
					onCancel={() => setShowForm(false)}
				/>
			)}

			{isLoading && (
				<div className="space-y-2">
					{[1, 2].map((i) => (
						<Skeleton key={i} variant="chart" height={120} />
					))}
				</div>
			)}

			{error && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm">
					<p className="text-[var(--color-danger)]">Error al cargar los ASTs.</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="mt-2 text-sm font-medium text-[var(--color-brand-blue)] hover:underline"
					>
						Reintentar
					</button>
				</div>
			)}

			{!isLoading && !error && asts.length === 0 && !showForm && (
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-16 text-center">
					<ShieldCheck
						className="mx-auto mb-3 size-10 text-[var(--text-tertiary)]"
						aria-hidden="true"
					/>
					<p className="text-[var(--text-secondary)]">Esta orden aún no tiene ASTs registrados.</p>
				</div>
			)}

			{asts.length > 0 && (
				<div className="space-y-3">
					{asts.map((ast) => (
						<ASTCard key={ast._id} ast={ast} currentUserName={currentUserName} />
					))}
				</div>
			)}
		</section>
	);
}

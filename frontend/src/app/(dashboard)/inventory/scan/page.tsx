"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Package, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BarcodeScanner } from "@/components/common/BarcodeScanner";
import { apiClient } from "@/lib/http/api-client";
import { buildAssetRoute } from "@/lib/routes";

type LookupState =
	| { status: "idle" }
	| { status: "found"; code: string }
	| { status: "not_found"; code: string }
	| { status: "error"; message: string };

type AssetLookupItem = {
	_id: string;
	name: string;
	code: string;
	status: string;
};

export default function ScanPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [lookupState, setLookupState] = useState<LookupState>({ status: "idle" });
	const [scanCount, setScanCount] = useState(0);

	const lookupMutation = useMutation({
		mutationFn: async (code: string) => {
			const json = await apiClient.get<{
				success: boolean;
				data: AssetLookupItem[];
			}>(`/assets?search=${encodeURIComponent(code)}&limit=10`);
			return { code, assets: json.data };
		},
		onSuccess: ({ code, assets }) => {
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			const exactAsset = assets.find(
				(asset) => asset.code.toLocaleLowerCase() === code.toLocaleLowerCase(),
			);
			if (exactAsset) {
				setLookupState({ status: "found", code });
				router.push(buildAssetRoute(exactAsset._id));
				return;
			}
			setLookupState({ status: "not_found", code });
		},
		onError: (error) => {
			setLookupState({
				status: "error",
				message: error instanceof Error ? error.message : "No se pudo buscar el activo.",
			});
		},
	});

	const handleDetected = (value: string) => {
		setScanCount((c) => c + 1);
		lookupMutation.mutate(value);
	};

	return (
		<section className="mx-auto max-w-lg space-y-6 px-4 py-8" aria-labelledby="scan-title">
			<header>
				<div className="flex items-center gap-3">
					<div className="flex size-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
						<Package className="size-5" aria-hidden="true" />
					</div>
					<div>
						<h1 id="scan-title" className="text-xl font-semibold text-zinc-900 dark:text-white">
							Escanear Código
						</h1>
						<p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
							Escaneé códigos de barras o QR para buscar activos
						</p>
					</div>
				</div>
			</header>

			<BarcodeScanner
				onDetected={handleDetected}
				label="Escanear código de barras o QR"
				placeholder="Ingrese el código del activo"
			/>

			{/* Last scanned */}
			{lookupState.status === "found" ? (
				<div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/10">
					<div className="flex items-center gap-2">
						<CheckCircle2 className="size-5 text-green-500" aria-hidden="true" />
						<div>
							<p className="text-sm font-medium text-green-700 dark:text-green-400">
								Último código escaneado
							</p>
							<p className="mt-0.5 font-mono text-xs text-green-600 dark:text-green-500">
								{lookupState.code}
							</p>
						</div>
					</div>
					<p className="mt-2 text-xs text-green-600 dark:text-green-400">
						{scanCount} {scanCount === 1 ? "activo escaneado" : "activos escaneados"} en esta sesión
					</p>
				</div>
			) : null}

			{lookupState.status === "not_found" ? (
				<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
					No se encontro un activo con el codigo{" "}
					<span className="font-mono font-semibold">{lookupState.code}</span>.
				</div>
			) : null}

			{lookupState.status === "error" ? (
				<div
					className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
					role="alert"
				>
					{lookupState.message}
				</div>
			) : null}

			{lookupState.status === "idle" ? (
				<div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-600">
					<Search className="mx-auto size-8 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
					<p className="mt-3 text-sm text-zinc-400">
						Use la cámara o ingrese un código manualmente
					</p>
				</div>
			) : null}
		</section>
	);
}

import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useReducer } from "react";
import { Button } from "@/core/ui/Button";

type DraftValue = Record<string, unknown>;

interface UseStateAutosaveOptions<T extends DraftValue> {
	draftId: string;
	value: T;
}

interface UseStateAutosaveResult<T extends DraftValue> {
	restoreDraft: (fallback: T) => T;
	clearDraft: () => void;
	hasDraft: boolean;
}

function buildStorageKey(draftId: string) {
	return `cermont:draft:${draftId}`;
}

function readStoredDraft<T extends DraftValue>(storageKey: string): T | null {
	if (typeof window === "undefined") {
		return null;
	}

	try {
		const rawValue = window.localStorage.getItem(storageKey);
		if (!rawValue) {
			return null;
		}

		return JSON.parse(rawValue) as T;
	} catch {
		return null;
	}
}

function writeStoredDraft<T extends DraftValue>(storageKey: string, value: T) {
	if (typeof window === "undefined") {
		return;
	}

	try {
		window.localStorage.setItem(storageKey, JSON.stringify(value));
	} catch {
		// Ignore storage quota and serialization errors.
	}
}

export function useStateAutosave<T extends DraftValue>({
	draftId,
	value,
}: UseStateAutosaveOptions<T>): UseStateAutosaveResult<T> {
	const storageKey = useMemo(() => buildStorageKey(draftId), [draftId]);
	const initialSnapshot = useMemo(() => JSON.stringify(value), [value]);
	const [, bumpDraftRevision] = useReducer((current: number) => current + 1, 0);
	const hasDraft = readStoredDraft(storageKey) !== null;

	useEffect(() => {
		const currentSnapshot = JSON.stringify(value);

		if (currentSnapshot === initialSnapshot) {
			return;
		}

		writeStoredDraft(storageKey, value);
		bumpDraftRevision();
	}, [initialSnapshot, storageKey, value]);

	const restoreDraft = (fallback: T) => {
		const storedDraft = readStoredDraft<T>(storageKey);
		if (!storedDraft) {
			return fallback;
		}

		bumpDraftRevision();
		return storedDraft;
	};

	const clearDraft = () => {
		if (typeof window !== "undefined") {
			window.localStorage.removeItem(storageKey);
		}

		bumpDraftRevision();
	};

	return { restoreDraft, clearDraft, hasDraft };
}

interface DraftRestoreBannerProps {
	onRestore: () => void;
	onDiscard: () => void;
}

export function DraftRestoreBanner({ onRestore, onDiscard }: DraftRestoreBannerProps) {
	return (
		<section className="flex flex-col gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-900 dark:border-sky-900/40 dark:bg-sky-900/10 dark:text-sky-100 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-start gap-3">
				<RotateCcw className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
				<div>
					<p className="text-sm font-semibold">Se detectó un borrador guardado</p>
					<p className="text-xs text-sky-900/75 dark:text-sky-100/75">
						Puedes restaurarlo o descartarlo para continuar con la captura actual.
					</p>
				</div>
			</div>

			<div className="flex flex-wrap gap-2">
				<Button type="button" variant="outline" size="sm" onClick={onDiscard}>
					Descartar
				</Button>
				<Button type="button" size="sm" onClick={onRestore}>
					Restaurar borrador
				</Button>
			</div>
		</section>
	);
}

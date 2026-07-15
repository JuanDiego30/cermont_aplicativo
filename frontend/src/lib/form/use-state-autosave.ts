import { useEffect, useMemo, useReducer } from "react";
import { isPresent, type StatusObject } from "@cermont/shared-types";

type DraftValue = Record<string, unknown>;

interface UseStateAutosaveOptions<T extends DraftValue> {
	draftId: string;
	value: T;
}

interface UseStateAutosaveOutcome<T extends DraftValue> {
	restoreDraft: (fallback: T) => T;
	clearDraft: () => void;
	hasDraft: boolean;
}

function buildStorageKey(draftId: string) {
	return `cermont:draft:${draftId}`;
}

function readStoredDraft<T extends DraftValue>(storageKey: string): StatusObject<T> {
	if (typeof window === "undefined") {
		return { status: "absent" };
	}
	try {
		const rawValue = window.localStorage.getItem(storageKey);
		if (!rawValue) {
			return { status: "absent" };
		}
		return { status: "present", value: JSON.parse(rawValue) as T };
	} catch {
		return { status: "absent" };
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
}: UseStateAutosaveOptions<T>): UseStateAutosaveOutcome<T> {
	const storageKey = useMemo(() => buildStorageKey(draftId), [draftId]);
	const initialSnapshot = useMemo(() => JSON.stringify(value), [value]);
	const [, bumpDraftRevision] = useReducer((current: number) => current + 1, 0);
	const hasDraft = isPresent(readStoredDraft<T>(storageKey));

	useEffect(() => {
		const currentSnapshot = JSON.stringify(value);
		if (currentSnapshot === initialSnapshot) {
			return;
		}
		writeStoredDraft(storageKey, value);
		bumpDraftRevision();
	}, [initialSnapshot, storageKey, value]);

	const restoreDraft = (fallback: T) => {
		const draftStatus = readStoredDraft<T>(storageKey);
		if (!isPresent(draftStatus)) {
			return fallback;
		}
		bumpDraftRevision();
		return draftStatus.value;
	};

	const clearDraft = () => {
		if (typeof window !== "undefined") {
			window.localStorage.removeItem(storageKey);
		}
		bumpDraftRevision();
	};

	return { restoreDraft, clearDraft, hasDraft };
}

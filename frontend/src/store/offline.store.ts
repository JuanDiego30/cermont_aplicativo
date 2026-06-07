"use client";

import { create } from "zustand";

export interface OfflineUiState {
	isOnline: boolean;
	isSyncing: boolean;
	pendingCount: number;
	failedCount: number;
	conflictCount: number;
	lastSyncAt: string;
	showOfflineBanner: boolean;
	syncError: string;
	setConnectivity: (isOnline: boolean) => void;
	setSyncState: (input: {
		isSyncing?: boolean;
		pendingCount?: number;
		failedCount?: number;
		conflictCount?: number;
		syncError?: string;
		lastSyncAt?: string;
	}) => void;
	clearSyncError: () => void;
}

export const useOfflineStore = create<OfflineUiState>()((set) => ({
	isOnline: true,
	isSyncing: false,
	pendingCount: 0,
	failedCount: 0,
	conflictCount: 0,
	lastSyncAt: "",
	showOfflineBanner: true,
	syncError: "",
	setConnectivity: (isOnline) => set({ isOnline }),
	setSyncState: (input) =>
		set((state) => ({
			isSyncing: input.isSyncing ?? state.isSyncing,
			pendingCount: input.pendingCount ?? state.pendingCount,
			failedCount: input.failedCount ?? state.failedCount,
			conflictCount: input.conflictCount ?? state.conflictCount,
			syncError: input.syncError ?? state.syncError,
			lastSyncAt: input.lastSyncAt ?? state.lastSyncAt,
		})),
	clearSyncError: () => set({ syncError: "" }),
}));

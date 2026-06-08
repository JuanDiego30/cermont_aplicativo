"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useOfflineStore } from "@/store/offline.store";

export interface ConnectivityState {
	isOnline: boolean;
}

const CONNECTIVITY_ENDPOINTS = ["/api/backend/health", "/serwist/sw.js"] as const;
const PING_TIMEOUT_MS = 5_000;
const ONLINE_INTERVAL_MS = 30_000;
const OFFLINE_BACKOFF_MS = [5_000, 10_000, 30_000, 60_000] as const;
const MIN_CHECK_INTERVAL_MS = 5_000;
const MAX_OFFLINE_ATTEMPTS = 10; // circuit breaker: cap exponential backoff
const MAX_OFFLINE_DURATION_MS = 5 * 60 * 1000; // 5 minutes max offline before slowing to 60s

let lastSnapshot: boolean | null = null;
let activeMonitorStop: (() => void) | false = false;
let activeMonitorSubscribers = 0;
const listeners = new Set<() => void>();

function getInitialSnapshot(): boolean {
	if (typeof navigator === "undefined") {
		return true;
	}

	return navigator.onLine;
}

function setConnectivity(value: boolean): void {
	if (lastSnapshot === value) {
		return;
	}

	lastSnapshot = value;
	useOfflineStore.getState().setConnectivity(value);

	for (const listener of listeners) {
		listener();
	}
}

function subscribeToConnectivity(onStoreChange: () => void): () => void {
	listeners.add(onStoreChange);
	return () => {
		listeners.delete(onStoreChange);
	};
}

function getConnectivitySnapshot(): boolean {
	if (lastSnapshot === null) {
		lastSnapshot = getInitialSnapshot();
	}

	return lastSnapshot;
}

function getServerConnectivitySnapshot(): boolean {
	return true;
}

function isFallbackEligibleStatus(status: number): boolean {
	return status === 404 || status === 405;
}

async function pingEndpoint(
	url: string,
	parentSignal: AbortSignal,
): Promise<"online" | "offline" | "fallback"> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
	const abortFromParent = (): void => controller.abort();
	parentSignal.addEventListener("abort", abortFromParent, { once: true });

	try {
		const response = await fetch(url, {
			method: "HEAD",
			cache: "no-store",
			credentials: "omit",
			signal: controller.signal,
		});

		if (response.headers.get("X-Cermont-Connectivity-Fallback") === "serwist") {
			return "fallback";
		}

		if (response.ok) {
			return "online";
		}

		return isFallbackEligibleStatus(response.status) ? "fallback" : "offline";
	} catch {
		return parentSignal.aborted ? "offline" : "fallback";
	} finally {
		clearTimeout(timeout);
		parentSignal.removeEventListener("abort", abortFromParent);
	}
}

export async function checkRealConnectivity(options?: {
	signal?: AbortSignal;
	endpoints?: readonly string[];
}): Promise<boolean> {
	const signal = options?.signal ?? new AbortController().signal;
	const endpoints = options?.endpoints ?? CONNECTIVITY_ENDPOINTS;

	// Race all endpoints concurrently — first "online" result wins.
	// Promise.any resolves as soon as one endpoint succeeds, which is
	// faster than sequential pinging on flaky mobile networks.
	try {
		await Promise.any(
			endpoints.map(async (endpoint) => {
				const result = await pingEndpoint(endpoint, signal);
				if (result === "online") {
					return true;
				}
				// Reject so Promise.any tries the next endpoint
				throw new Error(result);
			}),
		);
		return true;
	} catch {
		// All endpoints rejected (offline or fallback)
		return false;
	}
}

interface ConnectivityMonitorOptions {
	enabled: boolean;
}

function startConnectivityMonitor({ enabled }: ConnectivityMonitorOptions): () => void {
	if (typeof window === "undefined") {
		return () => {};
	}

	const controller = new AbortController();
	const { signal } = controller;
	let pingTimer: ReturnType<typeof setTimeout> | false = false;
	let offlineAttempt = 0;
	let disposed = false;
	let lastCheckStartedAt = 0;
	let lastResolvedOnline = getConnectivitySnapshot();
	let firstOfflineAt = 0;

	const clearPingTimer = (): void => {
		if (pingTimer) {
			clearTimeout(pingTimer);
			pingTimer = false;
		}
	};

	const scheduleCheck = (delay: number): void => {
		if (disposed) {
			return;
		}

		clearPingTimer();
		pingTimer = setTimeout(() => {
			void runConnectivityCheck();
		}, delay);
	};

	const scheduleNextInterval = (isReachable: boolean): void => {
		if (isReachable) {
			scheduleCheck(ONLINE_INTERVAL_MS);
			return;
		}

		// Circuit breaker: if we've been offline too long or too many attempts,
		// cap the interval at the max backoff (60s) and slow down further
		const offlineDuration = Date.now() - firstOfflineAt;
		const shouldCap =
			offlineAttempt >= MAX_OFFLINE_ATTEMPTS || offlineDuration > MAX_OFFLINE_DURATION_MS;

		if (shouldCap) {
			// Use max backoff interval (60s) and don't increment further
			scheduleCheck(OFFLINE_BACKOFF_MS[OFFLINE_BACKOFF_MS.length - 1]);
			return;
		}

		// Normal exponential backoff
		const delay = OFFLINE_BACKOFF_MS[Math.min(offlineAttempt, OFFLINE_BACKOFF_MS.length - 1)];
		scheduleCheck(delay);
	};

	const requestBoundedCheck = (): void => {
		const elapsed = Date.now() - lastCheckStartedAt;
		const delay =
			lastCheckStartedAt === 0 || elapsed >= MIN_CHECK_INTERVAL_MS
				? 0
				: MIN_CHECK_INTERVAL_MS - elapsed;
		scheduleCheck(delay);
	};

	async function runConnectivityCheck(): Promise<void> {
		if (disposed) {
			return;
		}

		// Short-circuit: if browser says offline, don't even try to ping.
		// This prevents recursive setTimeout loops when the network is down.
		if (typeof navigator !== "undefined" && !navigator.onLine) {
			if (firstOfflineAt === 0) {
				firstOfflineAt = Date.now();
			}
			// Set offline state without pinging
			setConnectivity(false);
			offlineAttempt += 1;
			scheduleNextInterval(false);
			return;
		}

		lastCheckStartedAt = Date.now();
		const isReachable = await checkRealConnectivity({ signal });
		if (disposed) {
			return;
		}

		setConnectivity(isReachable);
		if (isReachable) {
			if (!lastResolvedOnline) {
				window.dispatchEvent(new Event("sync-queue:changed"));
				window.dispatchEvent(new Event("sync-queue:trigger"));
			}
			offlineAttempt = 0;
			firstOfflineAt = 0;
		} else {
			if (firstOfflineAt === 0) {
				firstOfflineAt = Date.now();
			}
			offlineAttempt += 1;
		}
		lastResolvedOnline = isReachable;
		scheduleNextInterval(isReachable);
	}

	const handleConnectivityHint = (): void => {
		requestBoundedCheck();
	};

	const handleVisibilityChange = (): void => {
		if (document.visibilityState === "visible") {
			requestBoundedCheck();
		}
	};

	window.addEventListener("online", handleConnectivityHint, { signal });
	window.addEventListener("offline", handleConnectivityHint, { signal });
	document.addEventListener("visibilitychange", handleVisibilityChange, { signal });

	if (enabled) {
		setConnectivity(getInitialSnapshot());
		requestBoundedCheck();
	}

	return () => {
		disposed = true;
		clearPingTimer();
		controller.abort();
	};
}

export function resetConnectivityForTests(): void {
	if (activeMonitorStop) {
		activeMonitorStop();
	}
	lastSnapshot = null;
	activeMonitorStop = false;
	activeMonitorSubscribers = 0;
	listeners.clear();
}

function retainConnectivityMonitor(): () => void {
	activeMonitorSubscribers += 1;

	if (!activeMonitorStop) {
		activeMonitorStop = startConnectivityMonitor({ enabled: true });
	}

	return () => {
		activeMonitorSubscribers = Math.max(0, activeMonitorSubscribers - 1);
		if (activeMonitorSubscribers === 0 && activeMonitorStop) {
			activeMonitorStop();
			activeMonitorStop = false;
		}
	};
}

export function useConnectivity(): ConnectivityState {
	const isOnline = useSyncExternalStore(
		subscribeToConnectivity,
		getConnectivitySnapshot,
		getServerConnectivitySnapshot,
	);

	const stopRef = useRef<(() => void) | false>(false);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		stopRef.current = retainConnectivityMonitor();

		return () => {
			if (stopRef.current) {
				stopRef.current();
				stopRef.current = false;
			}
		};
	}, []);

	return { isOnline };
}

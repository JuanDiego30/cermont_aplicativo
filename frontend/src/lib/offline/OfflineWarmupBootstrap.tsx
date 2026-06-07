"use client";

import type { QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { APP_ROUTES } from "@/lib/routes";
import { fetchServiceCaseList, SERVICE_CASE_KEYS } from "@/modules/service-cases/queries";
import { fetchSiteVisitList, SITE_VISIT_KEYS } from "@/modules/site-visits/queries";
import { fetchTemplateList, TEMPLATE_KEYS } from "@/modules/templates/queries";
import { fetchWorkRequestList, WORK_REQUEST_KEYS } from "@/modules/work-requests/queries";
import { useAuthStore } from "@/store/auth.store";
import { useOfflineStore } from "@/store/offline.store";

const OFFLINE_WARMUP_ROUTES = [
	APP_ROUTES.dashboard,
	APP_ROUTES.serviceCases,
	APP_ROUTES.workRequests,
	APP_ROUTES.siteVisits,
	APP_ROUTES.orders,
	APP_ROUTES.planning,
	APP_ROUTES.execution,
	APP_ROUTES.evidences,
	APP_ROUTES.reports,
	APP_ROUTES.documents,
	APP_ROUTES.templates,
] as const;

function hasReadyAuthenticatedSession(): boolean {
	const authState = useAuthStore.getState();
	return authState.isAuthenticated && authState.accessToken.status === "present";
}

async function warmRouteDocuments(): Promise<void> {
	await Promise.allSettled(
		OFFLINE_WARMUP_ROUTES.map((route) =>
			fetch(route, {
				method: "GET",
				credentials: "include",
				headers: { Accept: "text/html" },
			}),
		),
	);
}

export function OfflineWarmupBootstrap({ queryClient }: { queryClient: QueryClient }) {
	const router = useRouter();
	const isOnline = useOfflineStore((state) => state.isOnline);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const hasAccessToken = useAuthStore((state) => state.accessToken.status === "present");

	useEffect(() => {
		if (!isOnline || !isAuthenticated || !hasAccessToken || !hasReadyAuthenticatedSession()) {
			return;
		}

		for (const route of OFFLINE_WARMUP_ROUTES) {
			router.prefetch(route);
		}

		void warmRouteDocuments();
		void queryClient.prefetchQuery({
			queryKey: SERVICE_CASE_KEYS.list(),
			queryFn: fetchServiceCaseList,
			staleTime: STALE_TIMES.REALTIME,
		});
		void queryClient.prefetchQuery({
			queryKey: WORK_REQUEST_KEYS.list(),
			queryFn: fetchWorkRequestList,
			staleTime: STALE_TIMES.REALTIME,
		});
		void queryClient.prefetchQuery({
			queryKey: SITE_VISIT_KEYS.list(),
			queryFn: fetchSiteVisitList,
			staleTime: STALE_TIMES.REALTIME,
		});
		void queryClient.prefetchQuery({
			queryKey: TEMPLATE_KEYS.list(),
			queryFn: fetchTemplateList,
			staleTime: STALE_TIMES.REALTIME,
		});
	}, [hasAccessToken, isAuthenticated, isOnline, queryClient, router]);

	return null;
}

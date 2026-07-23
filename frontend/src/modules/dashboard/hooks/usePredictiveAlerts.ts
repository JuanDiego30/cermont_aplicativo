import { useQuery } from "@tanstack/react-query";
import { dashboardKeys } from "../query-keys/dashboard.keys";
import { dashboardApi, type PredictiveAlert } from "../api/dashboard.service";

export function usePredictiveAlerts() {
  return useQuery<PredictiveAlert[]>({
    queryKey: dashboardKeys.predictiveAlerts(),
    queryFn: async () => {
      const res = await dashboardApi.getPredictiveAlerts();
      if (!res?.success || !res?.data) {
        throw new Error("Error al cargar alertas predictivas");
      }
      return res.data;
    },
    refetchInterval: 300_000,
    staleTime: 120_000,
  });
}

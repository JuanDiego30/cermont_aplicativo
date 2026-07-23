import { useQuery } from "@tanstack/react-query";
import { dashboardKeys } from "../query-keys/dashboard.keys";
import { dashboardApi, type HealthScore } from "../api/dashboard.service";

export function useHealthScore() {
  return useQuery<HealthScore>({
    queryKey: dashboardKeys.healthScore(),
    queryFn: async () => {
      const res = await dashboardApi.getHealthScore();
      if (!res?.success || !res?.data) {
        throw new Error("Error al cargar el score de salud operacional");
      }
      return res.data;
    },
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

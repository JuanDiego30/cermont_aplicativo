import dynamic from "next/dynamic";

export const LazyTrendLineChart = dynamic(
  () => import("./TrendLineChart").then((m) => ({ default: m.TrendLineChart })),
  {
    ssr: false,
    loading: () => <div className="h-[260px] bg-[var(--bg-muted)] rounded-lg animate-pulse" />,
  },
);

export const LazyStatusDonutChart = dynamic(
  () => import("./StatusDonutChart").then((m) => ({ default: m.StatusDonutChart })),
  {
    ssr: false,
    loading: () => <div className="h-[260px] bg-[var(--bg-muted)] rounded-lg animate-pulse" />,
  },
);

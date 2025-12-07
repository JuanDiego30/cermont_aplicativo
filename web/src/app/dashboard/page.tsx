import { DashboardMetrics } from "@/components/features/dashboard/DashboardMetrics";
import MonthlyOrdersChart from "@/components/features/dashboard/MonthlyOrdersChart";
import CompletionTarget from "@/components/features/dashboard/CompletionTarget";
import StatisticsChart from "@/components/features/dashboard/StatisticsChart";
import RecentOrdersTable from "@/components/features/dashboard/RecentOrdersTable";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Left column - Metrics + Monthly Chart */}
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <DashboardMetrics />
        <MonthlyOrdersChart />
      </div>

      {/* Right column - Completion Target */}
      <div className="col-span-12 xl:col-span-5">
        <CompletionTarget />
      </div>

      {/* Full width - Statistics */}
      <div className="col-span-12">
        <StatisticsChart />
      </div>

      {/* Bottom row - Recent Orders */}
      <div className="col-span-12">
        <RecentOrdersTable />
      </div>
    </div>
  );
}

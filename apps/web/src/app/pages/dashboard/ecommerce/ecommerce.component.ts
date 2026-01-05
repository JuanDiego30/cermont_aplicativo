import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricCardComponent } from '../../../shared/components/metric-card/metric-card.component';
import { EcommerceMetricsComponent } from '../../../shared/components/ecommerce/ecommerce-metrics/ecommerce-metrics.component';
import { MonthlySalesChartComponent } from '../../../shared/components/ecommerce/monthly-sales-chart/monthly-sales-chart.component';
import { MonthlyTargetComponent } from '../../../shared/components/ecommerce/monthly-target/monthly-target.component';
import { StatisticsChartComponent } from '../../../shared/components/ecommerce/statics-chart/statics-chart.component';
import { DemographicCardComponent } from '../../../shared/components/ecommerce/demographic-card/demographic-card.component';
import { RecentOrdersComponent } from '../../../shared/components/ecommerce/recent-orders/recent-orders.component';
import { MobileProgressSectionComponent } from '../../../shared/components/common/mobile-progress-section/mobile-progress-section.component';

interface DashboardMetrics {
  totalOrders: number;
  revenue: number;
  activeCustomers: number;
  completionRate: number;
}

interface OrderStatus {
  status: string;
  count: number;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [
    CommonModule,
    MetricCardComponent,
    EcommerceMetricsComponent,
    MonthlySalesChartComponent,
    MonthlyTargetComponent,
    StatisticsChartComponent,
    DemographicCardComponent,
    RecentOrdersComponent,
    MobileProgressSectionComponent,
  ],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent implements OnInit {
  metrics: DashboardMetrics = {
    totalOrders: 0,
    revenue: 0,
    activeCustomers: 0,
    completionRate: 0,
  };

  orderStatuses: OrderStatus[] = [];

  ngOnInit() {
    this.loadMetrics();
    this.loadOrderStatuses();
  }

  private loadMetrics() {
    // Simular datos - en producción veniría del backend
    this.metrics = {
      totalOrders: 1243,
      revenue: 125650,
      activeCustomers: 842,
      completionRate: 94,
    };
  }

  private loadOrderStatuses() {
    // Simular datos - en producción veniría del backend
    this.orderStatuses = [
      { status: 'Completadas', count: 968, color: 'success' },
      { status: 'Pendientes', count: 156, color: 'warning' },
      { status: 'En Progreso', count: 89, color: 'info' },
      { status: 'Canceladas', count: 30, color: 'error' },
    ];
  }
}

import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../../features/dashboard/services/dashboard.service';
import { DashboardStats } from '../../../../core/models/dashboard.model';

interface QuickStat {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
  iconBg?: string;
}

@Component({
  selector: 'app-mobile-stat-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mobile-stat-cards.component.html',
  styles: [
    `
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `,
  ],
})
export class MobileStatCardsComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  @Input() stats: QuickStat[] = [];

  ngOnInit() {
    this.loadStats();
  }

  private loadStats() {
    this.dashboardService.getStats().subscribe(data => {
      this.stats = [
        {
          label: 'Total Órdenes',
          value: data.totalOrdenes,
          change: '+12%',
          changeType: 'positive',
          icon: '📋',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        },
        {
          label: 'Completadas',
          value: data.ordenesCompletadas,
          change: '+5',
          changeType: 'positive',
          icon: '✅',
          iconBg: 'bg-green-100 dark:bg-green-900/30',
        },
        {
          label: 'Pendientes',
          value: data.ordenesPendientes,
          change: '-3',
          changeType: 'negative',
          icon: '⏳',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
        },
        {
          label: 'Técnicos',
          value: data.totalTecnicos,
          change: '',
          changeType: 'neutral',
          icon: '👷',
          iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        },
      ];
    });
  }
}

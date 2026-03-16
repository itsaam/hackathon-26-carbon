import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardService, DashboardSummary } from './dashboard.service';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { DonutChartComponent } from '../../shared/components/donut-chart/donut-chart.component';
import { BarChartComponent } from '../../shared/components/bar-chart/bar-chart.component';
import { LineChartComponent } from '../../shared/components/line-chart/line-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardComponent,
    DonutChartComponent,
    BarChartComponent,
    LineChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  summary?: DashboardSummary;
  loading = false;

  ngOnInit(): void {
    this.loading = true;
    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}

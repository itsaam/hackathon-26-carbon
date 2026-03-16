import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardService } from '../dashboard/dashboard.service';
import { Site, SiteService } from '../../core/services/site.service';
import { BarChartComponent } from '../../shared/components/bar-chart/bar-chart.component';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, FormsModule, BarChartComponent],
  templateUrl: './compare.component.html',
  styleUrl: './compare.component.scss'
})
export class CompareComponent implements OnInit {
  private readonly siteService = inject(SiteService);
  private readonly dashboardService = inject(DashboardService);

  sites: Site[] = [];
  selectedIds: number[] = [];
  comparison: any;

  ngOnInit(): void {
    this.siteService.getSites().subscribe({
      next: (sites) => (this.sites = sites)
    });
  }

  toggleSelection(id: number, checked: boolean): void {
    if (checked) {
      this.selectedIds = [...this.selectedIds, id];
    } else {
      this.selectedIds = this.selectedIds.filter((x) => x !== id);
    }
  }

  compare(): void {
    if (!this.selectedIds.length) {
      return;
    }

    this.dashboardService.compareSites(this.selectedIds).subscribe({
      next: (data) => {
        this.comparison = data;
      }
    });
  }
}


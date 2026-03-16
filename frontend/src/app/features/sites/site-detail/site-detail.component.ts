import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { CarbonResult, Site, SiteService } from '../../../core/services/site.service';

@Component({
  selector: 'app-site-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './site-detail.component.html',
  styleUrl: './site-detail.component.scss'
})
export class SiteDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly siteService = inject(SiteService);

  site?: Site;
  latestResult?: CarbonResult;
  loading = false;
  calculating = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      return;
    }

    this.loadSite(id);
    this.loadLatestResult(id);
  }

  loadSite(id: number): void {
    this.loading = true;
    this.siteService.getSite(id).subscribe({
      next: (site) => {
        this.site = site;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadLatestResult(id: number): void {
    this.siteService.getLatestResult(id).subscribe({
      next: (result) => {
        this.latestResult = result;
      }
    });
  }

  recalculate(): void {
    if (!this.site?.id) {
      return;
    }

    this.calculating = true;
    this.siteService.calculateCarbon(this.site.id).subscribe({
      next: (result) => {
        this.latestResult = result;
        this.calculating = false;
      },
      error: () => {
        this.calculating = false;
      }
    });
  }
}


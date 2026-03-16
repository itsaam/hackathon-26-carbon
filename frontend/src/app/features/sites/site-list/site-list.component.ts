import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SiteService, Site, CarbonResult } from '../../../core/services/site.service';
import { inject } from '@angular/core';

interface SiteWithLatest extends Site {
  latestResult?: CarbonResult;
}

@Component({
  selector: 'app-site-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './site-list.component.html',
  styleUrl: './site-list.component.scss'
})
export class SiteListComponent implements OnInit {
  private readonly siteService = inject(SiteService);

  sites: SiteWithLatest[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadSites();
  }

  loadSites(): void {
    this.loading = true;
    this.siteService.getSites().subscribe({
      next: (sites) => {
        this.sites = sites;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}


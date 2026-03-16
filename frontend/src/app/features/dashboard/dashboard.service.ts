import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

export interface DashboardSummary {
  totalCo2Kg: number;
  siteCount: number;
  averageCo2PerM2: number;
}

export interface BreakdownEntry {
  label: string;
  value: number;
}

export interface HistoryPoint {
  date: string;
  totalCo2Kg: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard/summary`);
  }

  getBreakdown(siteId: number): Observable<BreakdownEntry[]> {
    return this.http.get<BreakdownEntry[]>(`${this.baseUrl}/sites/${siteId}/breakdown`);
  }

  getHistory(siteId: number): Observable<HistoryPoint[]> {
    return this.http.get<HistoryPoint[]>(`${this.baseUrl}/sites/${siteId}/history`);
  }

  compareSites(ids: number[]): Observable<any> {
    const query = ids.join(',');
    return this.http.get<any>(`${this.baseUrl}/sites/compare`, {
      params: { ids: query }
    });
  }
}

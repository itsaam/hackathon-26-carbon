import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

export interface Site {
  id?: number;
  name: string;
  surfaceM2: number;
  parkingUnderground: number;
  parkingBasement: number;
  parkingOutdoor: number;
  energyConsumptionKwh: number;
  employeeCount: number;
  workstationCount?: number;
}

export interface Material {
  id: number;
  name: string;
  emissionFactor: number;
  unit: string;
  source: string;
}

export interface CarbonResult {
  id: number;
  siteId: number;
  constructionCo2Kg: number;
  exploitationCo2Kg: number;
  totalCo2Kg: number;
  co2PerM2: number;
  co2PerEmployee: number;
  calculatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SiteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/sites`;

  createSite(payload: Site): Observable<Site> {
    return this.http.post<Site>(this.baseUrl, payload);
  }

  getSites(): Observable<Site[]> {
    return this.http.get<Site[]>(this.baseUrl);
  }

  getSite(id: number): Observable<Site> {
    return this.http.get<Site>(`${this.baseUrl}/${id}`);
  }

  updateSite(id: number, payload: Site): Observable<Site> {
    return this.http.put<Site>(`${this.baseUrl}/${id}`, payload);
  }

  deleteSite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  calculateCarbon(id: number): Observable<CarbonResult> {
    return this.http.post<CarbonResult>(`${this.baseUrl}/${id}/calculate`, {});
  }

  getResults(id: number): Observable<CarbonResult[]> {
    return this.http.get<CarbonResult[]>(`${this.baseUrl}/${id}/results`);
  }

  getLatestResult(id: number): Observable<CarbonResult> {
    return this.http.get<CarbonResult>(`${this.baseUrl}/${id}/results/latest`);
  }

  getMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(`${environment.apiUrl}/materials`);
  }
}

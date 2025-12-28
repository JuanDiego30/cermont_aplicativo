import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

interface DashboardResponse {
  stats: {
    totalOrdenes: number;
    ordenesCompletadas: number;
    ordenesPendientes: number;
    ingresoTotal: number;
    promedioOrdenes: number;
    tasaCrecimiento: number;
  };
  ordenesRecientes: Array<{
    id: string;
    numero: string;
    cliente: string;
    estado: string;
    total: number;
    fecha: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardApi {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getStats(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/stats`);
  }
}

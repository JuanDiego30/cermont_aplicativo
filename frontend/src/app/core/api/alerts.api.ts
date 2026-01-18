import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

// Alerta types
export type TipoAlerta = 'URGENTE' | 'IMPORTANTE' | 'INFORMATIVO' | 'SISTEMA';

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  titulo: string;
  mensaje: string;
  datos?: Record<string, unknown>;
  leida: boolean;
  fechaEnvio: string;
  fechaLectura?: string;
  destinatarioId: string;
  ordenId?: string;
}

export interface EnviarAlertaDto {
  tipo: TipoAlerta;
  titulo: string;
  mensaje: string;
  destinatarioId: string;
  ordenId?: string;
  datos?: Record<string, unknown>;
}

export interface HistorialQuery {
  page?: number;
  limit?: number;
  soloNoLeidas?: boolean;
  tipo?: TipoAlerta;
}

export interface PaginatedAlertas {
  items: Alerta[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class AlertsApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/alerts`;

  /**
   * Get alerts history for current user
   */
  getHistorial(query?: HistorialQuery): Observable<PaginatedAlertas> {
    let params = new HttpParams();
    if (query) {
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
      if (query.soloNoLeidas) params = params.set('soloNoLeidas', 'true');
      if (query.tipo) params = params.set('tipo', query.tipo);
    }
    return this.http.get<PaginatedAlertas>(`${this.apiUrl}/history`, { params });
  }

  /**
   * Get pending (unread) alerts
   */
  getPendientes(): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(`${this.apiUrl}/pendientes`);
  }

  /**
   * Get unread alerts count for badge
   */
  getBadgeCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/pendientes/badge`);
  }

  /**
   * Get alert by ID
   */
  getById(id: string): Observable<Alerta> {
    return this.http.get<Alerta>(`${this.apiUrl}/${id}`);
  }

  /**
   * Send a new alert
   */
  enviar(data: EnviarAlertaDto): Observable<Alerta> {
    return this.http.post<Alerta>(this.apiUrl, data);
  }

  /**
   * Mark alert as read
   */
  marcarComoLeida(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/read`, {});
  }
}

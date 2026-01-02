import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { logError } from '../core/utils/logger';

export interface Orden {
    id: string;
    numeroOrden: string;
    descripcion: string;
    clienteId: string;
    tecnicoId?: string;
    estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA' | 'ARCHIVADA';
    prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
    fechaInicio: string;
    fechaFin?: string;
    fechaRealInicio?: string;
    fechaRealFin?: string;
    ubicacion?: string;
    costoEstimado?: number;
    costoReal?: number;
    notas?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface CreateOrdenDto {
    numeroOrden: string;
    descripcion: string;
    clienteId: string;
    tecnicoId?: string;
    estado?: string;
    prioridad?: string;
    fechaInicio: string;
    fechaFin?: string;
    ubicacion?: string;
    costoEstimado?: number;
    notas?: string;
}

export interface UpdateOrdenDto extends Partial<CreateOrdenDto> {
    fechaRealInicio?: string;
    fechaRealFin?: string;
    costoReal?: number;
}

export interface QueryOrdenParams {
    estado?: string;
    prioridad?: string;
    clienteId?: string;
    tecnicoId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    buscar?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class OrdenesService {
    private readonly http = inject(HttpClient);
    private readonly API_URL = `${environment.apiUrl}/ordenes`;

    /**
     * Obtiene todas las órdenes con paginación y filtros
     */
    getAll(params?: QueryOrdenParams): Observable<PaginatedResponse<Orden>> {
        let httpParams = new HttpParams();

        if (params) {
            Object.keys(params).forEach(key => {
                const value = (params as Record<string, unknown>)[key];
                if (value !== undefined && value !== null) {
                    httpParams = httpParams.set(key, String(value));
                }
            });
        }

        return this.http.get<PaginatedResponse<Orden>>(this.API_URL, { params: httpParams }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Obtiene una orden por su ID
     */
    getById(id: string): Observable<Orden> {
        return this.http.get<Orden>(`${this.API_URL}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Crea una nueva orden
     */
    create(orden: CreateOrdenDto): Observable<Orden> {
        return this.http.post<Orden>(this.API_URL, orden).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Actualiza una orden existente
     */
    update(id: string, orden: UpdateOrdenDto): Observable<Orden> {
        return this.http.patch<Orden>(`${this.API_URL}/${id}`, orden).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Elimina una orden (soft delete)
     */
    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Obtiene estadísticas de órdenes
     */
    getEstadisticas(): Observable<Record<string, unknown>> {
        return this.http.get<Record<string, unknown>>(`${this.API_URL}/stats`).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Exporta órdenes a PDF
     */
    exportarPDF(params?: QueryOrdenParams): Observable<Blob> {
        let httpParams = new HttpParams();

        if (params) {
            Object.keys(params).forEach(key => {
                const value = (params as Record<string, unknown>)[key];
                if (value !== undefined && value !== null) {
                    httpParams = httpParams.set(key, String(value));
                }
            });
        }

        return this.http.get(`${this.API_URL}/export/pdf`, {
            params: httpParams,
            responseType: 'blob'
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Maneja errores HTTP
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Ha ocurrido un error';

        if (error.error instanceof ErrorEvent) {
            // Error del cliente
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Error del servidor
            if (error.error?.message) {
                errorMessage = error.error.message;
            } else {
                errorMessage = `Error ${error.status}: ${error.statusText}`;
            }
        }

        logError('Error en OrdenesService', error, { errorMessage });
        return throwError(() => new Error(errorMessage));
    }
}

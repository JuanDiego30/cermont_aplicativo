import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    private getHeaders(contentType: string = 'application/json'): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': contentType,
            'Accept': 'application/json'
        });
    }

    /**
     * GET request con parámetros opcionales
     */
    get<T>(path: string, params?: Record<string, any>): Observable<T> {
        const httpParams = this.buildParams(params);
        return this.http.get<T>(`${this.apiUrl}${path}`, {
            headers: this.getHeaders(),
            params: httpParams
        }).pipe(
            retry(1),
            catchError(this.handleError)
        );
    }

    /**
     * POST request
     */
    post<T>(path: string, body: unknown = {}): Observable<T> {
        return this.http.post<T>(`${this.apiUrl}${path}`, body, {
            headers: this.getHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * PUT request
     */
    put<T>(path: string, body: unknown = {}): Observable<T> {
        return this.http.put<T>(`${this.apiUrl}${path}`, body, {
            headers: this.getHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * PATCH request
     */
    patch<T>(path: string, body: unknown = {}): Observable<T> {
        return this.http.patch<T>(`${this.apiUrl}${path}`, body, {
            headers: this.getHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * DELETE request
     */
    delete<T>(path: string): Observable<T> {
        return this.http.delete<T>(`${this.apiUrl}${path}`, {
            headers: this.getHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Download PDF/File
     */
    downloadPdf(path: string, params?: Record<string, any>): Observable<Blob> {
        const httpParams = this.buildParams(params);
        return this.http.get(`${this.apiUrl}${path}`, {
            responseType: 'blob',
            params: httpParams
        }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Construye HttpParams desde un objeto
     */
    private buildParams(params?: Record<string, any>): HttpParams {
        let httpParams = new HttpParams();
        if (params) {
            Object.keys(params).forEach(key => {
                const value = params[key];
                if (value !== null && value !== undefined && value !== '') {
                    if (value instanceof Date) {
                        httpParams = httpParams.set(key, value.toISOString());
                    } else if (Array.isArray(value)) {
                        value.forEach(item => {
                            httpParams = httpParams.append(key, item.toString());
                        });
                    } else {
                        httpParams = httpParams.set(key, value.toString());
                    }
                }
            });
        }
        return httpParams;
    }

    /**
     * Manejo de errores HTTP
     */
    private handleError(error: any): Observable<never> {
        let errorMessage = 'Error desconocido';
        
        if (error.error instanceof ErrorEvent) {
            // Error del lado del cliente
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Error del lado del servidor
            errorMessage = `Código: ${error.status}\nMensaje: ${error.message || error.error?.message || 'Error desconocido'}`;
        }
        
        console.error('API Error:', errorMessage, error);
        return throwError(() => error);
    }
}

/**
 * ApiBaseService - Base class for all API clients
 *
 * Provides common HTTP methods with error handling and consistent response format.
 * All API clients should extend this or use it as a dependency.
 */
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { logError } from '../utils/logger';

@Injectable({
  providedIn: 'root',
})
export class ApiBaseService {
  protected readonly http = inject(HttpClient);
  protected readonly apiUrl = environment.apiUrl;

  /**
   * GET request with optional query parameters
   */
  protected get<T>(path: string, params?: Record<string, unknown>): Observable<T> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<T>(`${this.apiUrl}${path}`, {
        params: httpParams,
      })
      .pipe(
        retry({
          count: 1,
          delay: (error: HttpErrorResponse) => {
            if (error.status === 0 || error.status >= 500) {
              return timer(300);
            }
            return throwError(() => error);
          },
        }),
        catchError(this.handleError)
      );
  }

  /**
   * POST request
   */
  protected post<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${path}`, body).pipe(catchError(this.handleError));
  }

  /**
   * PUT request
   */
  protected put<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${path}`, body).pipe(catchError(this.handleError));
  }

  /**
   * PATCH request
   */
  protected patch<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${path}`, body).pipe(catchError(this.handleError));
  }

  /**
   * DELETE request
   */
  protected deleteRequest<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${path}`).pipe(catchError(this.handleError));
  }

  /**
   * Upload file (multipart/form-data)
   */
  protected upload<T>(path: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${path}`, formData).pipe(catchError(this.handleError));
  }

  /**
   * Download file as Blob
   */
  protected download(path: string, params?: Record<string, unknown>): Observable<Blob> {
    const httpParams = this.buildParams(params);
    return this.http
      .get(`${this.apiUrl}${path}`, {
        responseType: 'blob',
        params: httpParams,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Build HttpParams from object
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
   * Centralized error handling
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || `Error ${error.status}`;
    }

    logError('API Error', error, { errorMessage });
    return throwError(() => error);
  };
}

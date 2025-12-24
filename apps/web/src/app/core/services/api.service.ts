import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
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

    get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
        return this.http.get<T>(`${this.apiUrl}${path}`, {
            headers: this.getHeaders(),
            params
        });
    }

    post<T>(path: string, body: unknown = {}): Observable<T> {
        return this.http.post<T>(`${this.apiUrl}${path}`, body, {
            headers: this.getHeaders()
        });
    }

    put<T>(path: string, body: unknown = {}): Observable<T> {
        return this.http.put<T>(`${this.apiUrl}${path}`, body, { headers: this.getHeaders() });
    }

    patch<T>(path: string, body: unknown = {}): Observable<T> {
        return this.http.patch<T>(`${this.apiUrl}${path}`, body, { headers: this.getHeaders() });
    }

    delete<T>(path: string): Observable<T> {
        return this.http.delete<T>(`${this.apiUrl}${path}`, { headers: this.getHeaders() });
    }
}

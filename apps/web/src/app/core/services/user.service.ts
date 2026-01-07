import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/users`;

    /**
     * Get user by ID
     */
    getUser(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    /**
     * Update user profile
     */
    updateUser(id: string, data: UpdateUserDto): Observable<User> {
        return this.http.patch<User>(`${this.apiUrl}/${id}`, data);
    }

    /**
     * Change user password
     */
    changePassword(currentPassword: string, newPassword: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/change-password`, {
            currentPassword,
            newPassword
        });
    }

    /**
     * Get current user profile
     */
    getProfile(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/profile`);
    }

    /**
     * Upload user avatar
     */
    uploadAvatar(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ url?: string; avatarUrl?: string }>(`${environment.apiUrl}/upload/avatar`, formData).pipe(
            map((resp) => {
                const url = resp.url ?? resp.avatarUrl;
                if (!url) {
                    throw new Error('Respuesta inválida del servidor: falta url');
                }
                return { url };
            })
        );
    }
}

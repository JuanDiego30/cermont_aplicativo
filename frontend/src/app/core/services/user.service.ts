import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface UploadResponse {
    url: string;
    filename: string;
    size: number;
}

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/upload`;

    /**
     * Upload user avatar
     */
    uploadAvatar(file: File): Observable<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'avatar');

        return this.http.post<UploadResponse>(`${this.apiUrl}/avatar`, formData);
    }

    /**
     * Validate image file
     */
    validateImageFile(file: File): { valid: boolean; error?: string } {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Solo se permiten imágenes JPG, PNG o WebP'
            };
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return {
                valid: false,
                error: 'El archivo no debe superar los 5MB'
            };
        }

        return { valid: true };
    }

    /**
     * Create image preview from file
     */
    createImagePreview(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                resolve(e.target?.result as string);
            };

            reader.onerror = () => {
                reject(new Error('Error al leer el archivo'));
            };

            reader.readAsDataURL(file);
        });
    }
}

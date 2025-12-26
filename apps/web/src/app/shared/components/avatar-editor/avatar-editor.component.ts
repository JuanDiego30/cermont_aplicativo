import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from '../../../core/services/upload.service';

@Component({
    selector: 'app-avatar-editor',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="relative inline-block">
      <!-- Avatar Display -->
      <div 
        class="relative group cursor-pointer"
        (click)="fileInput.click()"
      >
        <!-- Image or Initials -->
        @if (currentAvatar()) {
          <img
            [src]="currentAvatar()"
            [alt]="userName"
            class="h-32 w-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg transition-all duration-200 group-hover:brightness-75"
          />
        } @else {
          <div class="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-cermont-primary-400 to-cermont-primary-600 border-4 border-white dark:border-gray-800 shadow-lg transition-all duration-200 group-hover:brightness-90">
            <span class="text-4xl font-bold text-white">
              {{ getInitials() }}
            </span>
          </div>
        }

        <!-- Overlay with camera icon -->
        <div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>

        <!-- Edit badge -->
        <div class="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-cermont-primary-600 border-4 border-white dark:border-gray-800 shadow-lg group-hover:scale-110 transition-transform duration-200">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
        </div>
      </div>

      <!-- Hidden file input -->
      <input
        #fileInput
        type="file"
        class="hidden"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        (change)="onFileSelected($event)"
      />

      <!-- Loading Indicator -->
      @if (uploading()) {
        <div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
          <div class="spinner border-white"></div>
        </div>
      }

      <!-- Error Message -->
      @if (error()) {
        <div class="absolute -bottom-16 left-1/2 -translate-x-1/2 w-64 text-center">
          <p class="text-sm text-error-600 dark:text-error-400 bg-white dark:bg-gray-900 rounded-lg px-4 py-2 shadow-lg">
            {{ error() }}
          </p>
        </div>
      }
    </div>
  `
})
export class AvatarEditorComponent {
    private readonly uploadService = inject(UploadService);

    @Input() userName: string = '';
    @Input() set avatar(value: string | null) {
        this.currentAvatar.set(value);
    }

    @Output() avatarChanged = new EventEmitter<string>();

    currentAvatar = signal<string | null>(null);
    uploading = signal(false);
    error = signal<string | null>(null);

    getInitials(): string {
        if (!this.userName) return '?';
        return this.userName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    async onFileSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) return;

        this.error.set(null);

        const validation = this.uploadService.validateImageFile(file);
        if (!validation.valid) {
            this.error.set(validation.error || 'Archivo inválido');
            setTimeout(() => this.error.set(null), 3000);
            return;
        }

        try {
            const preview = await this.uploadService.createImagePreview(file);
            this.currentAvatar.set(preview);

            this.uploading.set(true);
            this.uploadService.uploadAvatar(file).subscribe({
                next: (response) => {
                    this.currentAvatar.set(response.url);
                    this.avatarChanged.emit(response.url);
                    this.uploading.set(false);
                },
                error: (err) => {
                    this.error.set(err.error?.message || 'Error al subir la imagen');
                    this.uploading.set(false);
                    setTimeout(() => this.error.set(null), 3000);
                }
            });
        } catch (err) {
            this.error.set('Error al procesar la imagen');
            setTimeout(() => this.error.set(null), 3000);
        }

        input.value = '';
    }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-configuracion-home',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="p-6">
            <div class="mb-6">
                <h1 class="text-2xl font-semibold text-gray-800 dark:text-white">
                    Configuración
                </h1>
                <p class="text-gray-600 dark:text-gray-400 mt-2">
                    Ajustes del sistema y preferencias
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">General</h3>
                    <ul class="space-y-3">
                        <li class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <span class="text-gray-600 dark:text-gray-400">Usuario</span>
                            <span class="font-medium text-gray-800 dark:text-white">{{ auth.currentUserSignal()?.name || '-' }}</span>
                        </li>
                        <li class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <span class="text-gray-600 dark:text-gray-400">Rol</span>
                            <span class="font-medium text-gray-800 dark:text-white">{{ auth.currentUserSignal()?.role || '-' }}</span>
                        </li>
                        <li class="flex items-center justify-between py-2">
                            <span class="text-gray-600 dark:text-gray-400">Email</span>
                            <span class="font-medium text-gray-800 dark:text-white">{{ auth.currentUserSignal()?.email || '-' }}</span>
                        </li>
                    </ul>
                </div>
                
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Seguridad</h3>
                    <ul class="space-y-3">
                        <li class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <span class="text-gray-600 dark:text-gray-400">Email verificado</span>
                            <span class="font-medium text-gray-800 dark:text-white">{{ auth.currentUserSignal()?.emailVerified ? 'Sí' : 'No' }}</span>
                        </li>
                        <li class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <span class="text-gray-600 dark:text-gray-400">2FA</span>
                            <span class="font-medium text-gray-800 dark:text-white">{{ auth.currentUserSignal()?.twoFactorEnabled ? 'Habilitado' : 'Deshabilitado' }}</span>
                        </li>
                        <li class="flex items-center justify-between py-2">
                            <span class="text-gray-600 dark:text-gray-400">Creado</span>
                            <span class="font-medium text-gray-800 dark:text-white">{{ auth.currentUserSignal()?.createdAt ? (auth.currentUserSignal()?.createdAt | date:'short') : '-' }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `
})
export class ConfiguracionHomeComponent {
    readonly auth = inject(AuthService);
}

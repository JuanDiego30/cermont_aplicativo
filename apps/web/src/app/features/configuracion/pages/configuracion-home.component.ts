import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
                            <span class="text-gray-600 dark:text-gray-400">Nombre de la empresa</span>
                            <span class="font-medium text-gray-800 dark:text-white">Cermont</span>
                        </li>
                        <li class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <span class="text-gray-600 dark:text-gray-400">Zona horaria</span>
                            <span class="font-medium text-gray-800 dark:text-white">America/Bogota</span>
                        </li>
                        <li class="flex items-center justify-between py-2">
                            <span class="text-gray-600 dark:text-gray-400">Idioma</span>
                            <span class="font-medium text-gray-800 dark:text-white">Español (CO)</span>
                        </li>
                    </ul>
                </div>
                
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Notificaciones</h3>
                    <ul class="space-y-3">
                        <li class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <span class="text-gray-600 dark:text-gray-400">Email</span>
                            <div class="w-10 h-6 bg-blue-600 rounded-full relative">
                                <div class="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                            </div>
                        </li>
                        <li class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <span class="text-gray-600 dark:text-gray-400">Push</span>
                            <div class="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative">
                                <div class="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                            </div>
                        </li>
                        <li class="flex items-center justify-between py-2">
                            <span class="text-gray-600 dark:text-gray-400">SMS</span>
                            <div class="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative">
                                <div class="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `
})
export class ConfiguracionHomeComponent { }

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-calendario-home',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="p-6">
            <div class="mb-6">
                <h1 class="text-2xl font-semibold text-gray-800 dark:text-white">
                    Calendario
                </h1>
                <p class="text-gray-600 dark:text-gray-400 mt-2">
                    Planificación y agenda de actividades
                </p>
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div class="text-center text-gray-500 dark:text-gray-400 py-12">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p class="text-lg font-medium">Calendario en desarrollo</p>
                    <p class="mt-2">Integración con FullCalendar o similar pendiente.</p>
                </div>
            </div>
        </div>
    `
})
export class CalendarioHomeComponent { }

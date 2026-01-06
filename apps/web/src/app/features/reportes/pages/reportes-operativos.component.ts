import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesApi } from '../../../core/api/reportes.api';

@Component({
    selector: 'app-reportes-operativos',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="p-6">
            <div class="mb-6">
                <h1 class="text-2xl font-semibold text-gray-800 dark:text-white">
                    Reportes Operativos
                </h1>
                <p class="text-gray-600 dark:text-gray-400 mt-2">
                    Métricas operativas y rendimiento de órdenes
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Órdenes Completadas</p>
                    <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">0</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Tiempo Promedio</p>
                    <p class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">0h</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Técnicos Activos</p>
                    <p class="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">0</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Eficiencia</p>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white mt-1">0%</p>
                </div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Resumen Operativo</h2>
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Exportar PDF
                    </button>
                </div>
                <div class="p-6 text-center text-gray-500 dark:text-gray-400">
                    <p>Conectando con ReportesApi...</p>
                </div>
            </div>
        </div>
    `
})
export class ReportesOperativosComponent implements OnInit {
    private readonly reportesApi = inject(ReportesApi);
    loading = signal(false);

    ngOnInit() {
        // TODO: Load operational reports from backend
    }
}

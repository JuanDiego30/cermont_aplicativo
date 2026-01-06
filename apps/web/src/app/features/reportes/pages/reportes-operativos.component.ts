import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReportesService } from '../services/reportes.service';
import { ReporteOrdenes } from '../../../core/models/reporte.model';

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
                    <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{{ ordenesCompletadas() }}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Tiempo Promedio</p>
                    <p class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{{ tiempoPromedioDias() }}d</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Órdenes Pendientes</p>
                    <p class="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{{ ordenesPendientes() }}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Total Órdenes</p>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white mt-1">{{ data()?.total || 0 }}</p>
                </div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Resumen Operativo</h2>
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Exportar PDF
                    </button>
                </div>
                <div class="p-6">
                    <div *ngIf="loading()" class="text-center text-gray-500 dark:text-gray-400">
                        Cargando...
                    </div>

                    <div *ngIf="!loading() && errorMessage()" class="text-center text-red-600 dark:text-red-400">
                        {{ errorMessage() }}
                    </div>

                    <div *ngIf="!loading() && !errorMessage() && (data()?.items?.length || 0) === 0" class="text-center text-gray-500 dark:text-gray-400">
                        Sin datos para el rango actual.
                    </div>

                    <div *ngIf="!loading() && !errorMessage() && (data()?.items?.length || 0) > 0" class="overflow-x-auto">
                        <table class="min-w-full text-left text-sm">
                            <thead class="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th class="py-3 pr-4 font-medium">Orden</th>
                                    <th class="py-3 pr-4 font-medium">Cliente</th>
                                    <th class="py-3 pr-4 font-medium">Estado</th>
                                    <th class="py-3 pr-4 font-medium">Inicio</th>
                                    <th class="py-3 pr-4 font-medium">Fin</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let item of (data()?.items || []).slice(0, 10)" class="border-b border-gray-100 dark:border-gray-700">
                                    <td class="py-3 pr-4 text-gray-800 dark:text-white">{{ item.numeroOrden }}</td>
                                    <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">{{ item.cliente }}</td>
                                    <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">{{ item.estado }}</td>
                                    <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">{{ item.fechaInicio | date:'shortDate' }}</td>
                                    <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">{{ item.fechaFin ? (item.fechaFin | date:'shortDate') : '-' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ReportesOperativosComponent implements OnInit {
    private readonly reportesService = inject(ReportesService);
    private readonly destroyRef = inject(DestroyRef);

    readonly loading = signal(false);
    readonly errorMessage = signal<string | null>(null);
    readonly data = signal<ReporteOrdenes | null>(null);

    readonly ordenesCompletadas = signal(0);
    readonly ordenesPendientes = signal(0);
    readonly tiempoPromedioDias = signal(0);

    ngOnInit() {
        this.loading.set(true);
        this.errorMessage.set(null);

        this.reportesService.reporteOrdenes()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (resp) => {
                    this.data.set(resp);
                    this.ordenesCompletadas.set(resp?.resumen?.ordenesCompletadas ?? 0);
                    this.ordenesPendientes.set(resp?.resumen?.ordenesPendientes ?? 0);
                    this.tiempoPromedioDias.set(Math.round(resp?.resumen?.tiempoPromedioCompletado ?? 0));
                    this.loading.set(false);
                },
                error: (err) => {
                    const msg = err?.error?.message || err?.message || 'No se pudo cargar el reporte operativo.';
                    this.errorMessage.set(String(msg));
                    this.loading.set(false);
                }
            });
    }
}

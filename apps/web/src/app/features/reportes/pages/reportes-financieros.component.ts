import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReportesService } from '../services/reportes.service';
import { ReporteOrdenes } from '../../../core/models/reporte.model';

@Component({
    selector: 'app-reportes-financieros',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="p-6">
            <div class="mb-6">
                <h1 class="text-2xl font-semibold text-gray-800 dark:text-white">
                    Reportes Financieros
                </h1>
                <p class="text-gray-600 dark:text-gray-400 mt-2">
                    Análisis financiero de órdenes y servicios
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Ingresos Totales</p>
                    <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">$ {{ ingresosTotales() | number:'1.0-0' }}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Costos Operativos</p>
                    <p class="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">$ {{ costosOperativos() | number:'1.0-0' }}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Margen</p>
                    <p class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{{ margenPct() }}%</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Órdenes Facturadas</p>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white mt-1">{{ ordenesFacturadas() }}</p>
                </div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Detalle Financiero</h2>
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Exportar PDF
                    </button>
                </div>
                <div class="p-6">
                    @if (loading()) {
                        <div class="text-center text-gray-500 dark:text-gray-400">
                            Cargando...
                        </div>
                    }

                    @if (!loading() && errorMessage()) {
                        <div class="text-center text-red-600 dark:text-red-400">
                            {{ errorMessage() }}
                        </div>
                    }

                    @if (!loading() && !errorMessage() && (data()?.items?.length || 0) === 0) {
                        <div class="text-center text-gray-500 dark:text-gray-400">
                            Sin datos para el rango actual.
                        </div>
                    }

                    @if (!loading() && !errorMessage() && (data()?.items?.length || 0) > 0) {
                        <div class="overflow-x-auto">
                            <table class="min-w-full text-left text-sm">
                                <thead class="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th class="py-3 pr-4 font-medium">Orden</th>
                                        <th class="py-3 pr-4 font-medium">Cliente</th>
                                        <th class="py-3 pr-4 font-medium">Estado</th>
                                        <th class="py-3 pr-4 font-medium">Costo Est.</th>
                                        <th class="py-3 pr-4 font-medium">Costo Real</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @for (item of (data()?.items || []).slice(0, 10); track item.numeroOrden) {
                                        <tr class="border-b border-gray-100 dark:border-gray-700">
                                            <td class="py-3 pr-4 text-gray-800 dark:text-white">{{ item.numeroOrden }}</td>
                                            <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">{{ item.cliente }}</td>
                                            <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">{{ item.estado }}</td>
                                            <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">$ {{ (item.costoEstimado || 0) | number:'1.0-0' }}</td>
                                            <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">$ {{ (item.costoReal || 0) | number:'1.0-0' }}</td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    }
                </div>
            </div>
        </div>
    `
})
export class ReportesFinancierosComponent implements OnInit {
    private readonly reportesService = inject(ReportesService);
    private readonly destroyRef = inject(DestroyRef);

    readonly loading = signal(false);
    readonly errorMessage = signal<string | null>(null);
    readonly data = signal<ReporteOrdenes | null>(null);

    readonly ingresosTotales = signal(0);
    readonly costosOperativos = signal(0);
    readonly margenPct = signal(0);
    readonly ordenesFacturadas = signal(0);

    ngOnInit() {
        this.loading.set(true);
        this.errorMessage.set(null);

        this.reportesService.reporteOrdenes()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (resp) => {
                    this.data.set(resp);

                    const estimado = resp?.resumen?.costoTotalEstimado ?? 0;
                    const real = resp?.resumen?.costoTotalReal ?? 0;
                    const completadas = resp?.resumen?.ordenesCompletadas ?? 0;

                    // Heurística simple mientras no exista endpoint financiero dedicado:
                    // "Ingresos" = costo total real, "Costos" = estimado.
                    this.ingresosTotales.set(real);
                    this.costosOperativos.set(estimado);
                    this.ordenesFacturadas.set(completadas);

                    const margen = real > 0 ? ((real - estimado) / real) * 100 : 0;
                    this.margenPct.set(Number.isFinite(margen) ? Math.round(margen) : 0);

                    this.loading.set(false);
                },
                error: (err) => {
                    const msg = err?.error?.message || err?.message || 'No se pudo cargar el reporte financiero.';
                    this.errorMessage.set(String(msg));
                    this.loading.set(false);
                }
            });
    }
}

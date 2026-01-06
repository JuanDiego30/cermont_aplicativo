import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrdenesService } from '../../ordenes/services/ordenes.service';
import type { Orden, PaginatedOrdenes } from '../../../core/models/orden.model';

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
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Próximas Órdenes</p>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white mt-1">{{ totalProximas() }}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Mostrando</p>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white mt-1">{{ ordenes().length }}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white mt-1">{{ loading() ? 'Cargando' : 'OK' }}</p>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Agenda (próximas órdenes)</h2>
                </div>

                <div class="p-6">
                    <div *ngIf="loading()" class="text-center text-gray-500 dark:text-gray-400">
                        Cargando...
                    </div>

                    <div *ngIf="!loading() && errorMessage()" class="text-center text-red-600 dark:text-red-400">
                        {{ errorMessage() }}
                    </div>

                    <div *ngIf="!loading() && !errorMessage() && ordenes().length === 0" class="text-center text-gray-500 dark:text-gray-400">
                        No hay órdenes próximas para mostrar.
                    </div>

                    <div *ngIf="!loading() && !errorMessage() && ordenes().length > 0" class="overflow-x-auto">
                        <table class="min-w-full text-left text-sm">
                            <thead class="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th class="py-3 pr-4 font-medium">Orden</th>
                                    <th class="py-3 pr-4 font-medium">Cliente</th>
                                    <th class="py-3 pr-4 font-medium">Estado</th>
                                    <th class="py-3 pr-4 font-medium">Inicio</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let o of ordenes()" class="border-b border-gray-100 dark:border-gray-700">
                                    <td class="py-3 pr-4 text-gray-800 dark:text-white">{{ o.numeroOrden }}</td>
                                    <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">{{ o.cliente }}</td>
                                    <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">{{ o.estado }}</td>
                                    <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">{{ o.fechaInicio | date:'short' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class CalendarioHomeComponent implements OnInit {
    private readonly ordenesService = inject(OrdenesService);
    private readonly destroyRef = inject(DestroyRef);

    readonly loading = signal(false);
    readonly errorMessage = signal<string | null>(null);
    readonly ordenes = signal<Orden[]>([]);
    readonly totalProximas = signal(0);

    ngOnInit(): void {
        this.loading.set(true);
        this.errorMessage.set(null);

        const today = new Date();
        const fechaDesde = today.toISOString();

        this.ordenesService.list({
            page: 1,
            limit: 5,
            fechaDesde,
            sortBy: 'fechaInicio',
            sortOrder: 'asc'
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (resp: PaginatedOrdenes) => {
                    const items = resp.items ?? [];
                    this.ordenes.set(items);
                    this.totalProximas.set(resp.total ?? items.length);
                    this.loading.set(false);
                },
                error: (err) => {
                    const msg = err?.error?.message || err?.message || 'No se pudieron cargar las órdenes próximas.';
                    this.errorMessage.set(String(msg));
                    this.loading.set(false);
                }
            });
    }
}

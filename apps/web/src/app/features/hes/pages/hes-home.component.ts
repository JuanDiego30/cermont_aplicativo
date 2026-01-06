import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HesService } from '../services/hes.service';
import { EstadoHES, HES } from '../../../core/models/hes.model';

@Component({
    selector: 'app-hes-home',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="p-6">
            <div class="mb-6">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h1 class="text-2xl font-semibold text-gray-800 dark:text-white">
                            Hojas de Entrada y Salida (HES)
                        </h1>
                        <p class="text-gray-600 dark:text-gray-400 mt-2">
                            Gestión de hojas de entrada y salida de equipos
                        </p>
                    </div>
                    <a
                        routerLink="/dashboard/hes/nueva"
                        class="btn-primary"
                    >
                        Nueva HES
                    </a>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">HES Pendientes</p>
                            <p class="text-2xl font-bold text-gray-800 dark:text-white mt-1">{{ pendientes() }}</p>
                        </div>
                        <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">En Proceso</p>
                            <p class="text-2xl font-bold text-gray-800 dark:text-white mt-1">{{ enProceso() }}</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Completadas</p>
                            <p class="text-2xl font-bold text-gray-800 dark:text-white mt-1">{{ completadas() }}</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Listado de HES</h2>
                </div>
                <div class="p-6">
                    <div *ngIf="loading()" class="text-center text-gray-500 dark:text-gray-400">
                        Cargando...
                    </div>

                    <div *ngIf="!loading() && errorMessage()" class="text-center text-red-600 dark:text-red-400">
                        {{ errorMessage() }}
                    </div>

                    <div *ngIf="!loading() && !errorMessage() && hesList().length === 0" class="text-center text-gray-500 dark:text-gray-400">
                        No hay HES para mostrar.
                    </div>

                    <div *ngIf="!loading() && !errorMessage() && hesList().length > 0" class="overflow-x-auto">
                        <table class="min-w-full text-left text-sm">
                            <thead class="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th class="py-3 pr-4 font-medium">Número</th>
                                    <th class="py-3 pr-4 font-medium">Estado</th>
                                    <th class="py-3 pr-4 font-medium">Cliente</th>
                                    <th class="py-3 pr-4 font-medium">Actualizado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let item of hesList()" class="border-b border-gray-100 dark:border-gray-700">
                                    <td class="py-3 pr-4 text-gray-800 dark:text-white">{{ item.numero }}</td>
                                    <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">{{ item.estado }}</td>
                                    <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">{{ item.cliente?.nombre || '-' }}</td>
                                    <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">{{ item.updatedAt | date:'short' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class HesHomeComponent implements OnInit {
    private readonly hesService = inject(HesService);
    private readonly destroyRef = inject(DestroyRef);

    readonly loading = signal(false);
    readonly errorMessage = signal<string | null>(null);
    readonly hesList = signal<HES[]>([]);

    readonly pendientes = signal(0);
    readonly enProceso = signal(0);
    readonly completadas = signal(0);

    ngOnInit(): void {
        this.loading.set(true);
        this.errorMessage.set(null);

        this.hesService.list()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (items) => {
                    this.hesList.set(items ?? []);

                    const pendingCount = (items ?? []).filter(h => h.estado === EstadoHES.BORRADOR).length;
                    const completedCount = (items ?? []).filter(h => h.estado === EstadoHES.COMPLETADO).length;

                    this.pendientes.set(pendingCount);
                    this.completadas.set(completedCount);
                    this.enProceso.set(Math.max(0, (items ?? []).length - pendingCount - completedCount));

                    this.loading.set(false);
                },
                error: (err) => {
                    const msg = err?.error?.message || err?.message || 'No se pudo cargar el listado de HES.';
                    this.errorMessage.set(String(msg));
                    this.loading.set(false);
                }
            });
    }
}

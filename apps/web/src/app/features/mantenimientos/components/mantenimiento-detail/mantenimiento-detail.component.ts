/**
 * MantenimientoDetailComponent - Detalle de un mantenimiento
 */
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MantenimientosService } from '../../services/mantenimientos.service';
import { Mantenimiento } from '../../../../core/models/mantenimiento.model';

@Component({
  selector: 'app-mantenimiento-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <!-- Back button -->
      <a routerLink="/dashboard/mantenimientos" 
         class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        ← Volver a lista
      </a>

      @if (loading()) {
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }

      @if (!loading() && mantenimiento()) {
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <!-- Header -->
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-start">
              <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {{ mantenimiento()!.descripcion }}
                </h1>
                <div class="flex gap-2">
                  <span [class]="getTipoClass(mantenimiento()!.tipo)">
                    {{ mantenimiento()!.tipo | titlecase }}
                  </span>
                  <span [class]="getEstadoClass(mantenimiento()!.estado)">
                    {{ formatEstado(mantenimiento()!.estado) }}
                  </span>
                  <span [class]="getPrioridadClass(mantenimiento()!.prioridad)">
                    {{ mantenimiento()!.prioridad | titlecase }}
                  </span>
                </div>
              </div>
              <div class="flex gap-2">
                <a [routerLink]="['editar']" 
                   class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Editar
                </a>
                @if (mantenimiento()!.estado === 'programado') {
                  <button (click)="iniciarEjecucion()" 
                          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Iniciar Ejecución
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Fecha Programada
              </h3>
              <p class="text-gray-900 dark:text-white">
                {{ formatDate(mantenimiento()!.fechaProgramada) }}
              </p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Duración Estimada
              </h3>
              <p class="text-gray-900 dark:text-white">
                {{ mantenimiento()!.duracionEstimada || 'No especificada' }} horas
              </p>
            </div>
            @if (mantenimiento()!.tecnicoAsignado) {
              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Técnico Asignado
                </h3>
                <p class="text-gray-900 dark:text-white">
                  {{ mantenimiento()!.tecnicoAsignado!.name }}
                </p>
              </div>
            }
            @if (mantenimiento()!.observaciones) {
              <div class="md:col-span-2">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Observaciones
                </h3>
                <p class="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {{ mantenimiento()!.observaciones }}
                </p>
              </div>
            }
            @if (mantenimiento()!.trabajoRealizado) {
              <div class="md:col-span-2">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Trabajo Realizado
                </h3>
                <p class="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {{ mantenimiento()!.trabajoRealizado }}
                </p>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="p-6 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Creado: {{ formatDate(mantenimiento()!.createdAt) }} |
              Actualizado: {{ formatDate(mantenimiento()!.updatedAt) }}
            </div>
          </div>
        </div>
      }

      @if (!loading() && !mantenimiento()) {
        <div class="text-center py-12">
          <div class="text-4xl mb-4">❌</div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Mantenimiento no encontrado
          </h3>
          <a routerLink="/dashboard/mantenimientos" 
             class="text-blue-600 hover:text-blue-800">
            Volver a la lista
          </a>
        </div>
      }
    </div>
  `
})
export class MantenimientoDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(MantenimientosService);

  mantenimiento = signal<Mantenimiento | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMantenimiento(id);
    }
  }

  loadMantenimiento(id: string): void {
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (m) => {
        this.mantenimiento.set(m);
        this.loading.set(false);
      },
      error: () => {
        this.mantenimiento.set(null);
        this.loading.set(false);
      }
    });
  }

  iniciarEjecucion(): void {
    // TODO: Implementar modal de ejecución
    console.log('Iniciar ejecución');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CO', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  }

  formatEstado(estado: string): string {
    return estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getTipoClass(tipo: string): string {
    const classes: Record<string, string> = {
      'preventivo': 'px-2 py-1 rounded text-xs bg-blue-100 text-blue-800',
      'correctivo': 'px-2 py-1 rounded text-xs bg-orange-100 text-orange-800',
      'predictivo': 'px-2 py-1 rounded text-xs bg-purple-100 text-purple-800'
    };
    return classes[tipo] || 'px-2 py-1 rounded text-xs bg-gray-100 text-gray-800';
  }

  getEstadoClass(estado: string): string {
    const classes: Record<string, string> = {
      'programado': 'px-2 py-1 rounded text-xs bg-blue-100 text-blue-800',
      'en_ejecucion': 'px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800',
      'completado': 'px-2 py-1 rounded text-xs bg-green-100 text-green-800',
      'cancelado': 'px-2 py-1 rounded text-xs bg-red-100 text-red-800',
      'vencido': 'px-2 py-1 rounded text-xs bg-red-200 text-red-900'
    };
    return classes[estado] || 'px-2 py-1 rounded text-xs bg-gray-100 text-gray-800';
  }

  getPrioridadClass(prioridad: string): string {
    const classes: Record<string, string> = {
      'baja': 'px-2 py-1 rounded text-xs bg-green-100 text-green-800',
      'media': 'px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800',
      'alta': 'px-2 py-1 rounded text-xs bg-orange-100 text-orange-800',
      'critica': 'px-2 py-1 rounded text-xs bg-red-100 text-red-800'
    };
    return classes[prioridad] || 'px-2 py-1 rounded text-xs bg-gray-100 text-gray-800';
  }
}

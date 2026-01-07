/**
 * KitDetailComponent - Vista de detalle de un kit
 */
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { KitsService } from '../../services/kits.service';
import { Kit, KitItem } from '../../../../core/models/kit.model';

@Component({
  selector: 'app-kit-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <!-- Back button -->
      <a routerLink="/dashboard/kits" 
         class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        ← Volver a lista
      </a>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }

      <!-- Content -->
      @if (!loading() && kit()) {
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <!-- Header -->
          <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ kit()!.nombre }}
                </h1>
                <span [class]="getEstadoBadgeClass(kit()!.estado)">
                  {{ kit()!.estado }}
                </span>
              </div>
              @if (kit()!.descripcion) {
                <p class="text-gray-500 dark:text-gray-400">{{ kit()!.descripcion }}</p>
              }
              <div class="flex items-center gap-2 mt-2">
                <span [class]="getCategoriaBadgeClass(kit()!.categoria)">
                  {{ kit()!.categoria }}
                </span>
                @if (kit()!.esPlantilla) {
                  <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    Plantilla
                  </span>
                }
              </div>
            </div>
            <div class="flex gap-2 mt-4 md:mt-0">
              <a [routerLink]="['editar']"
                 class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                Editar
              </a>
              @if (kit()!.estado === 'activo') {
                <button (click)="toggleEstado(false)"
                        class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                  Desactivar
                </button>
              } @else {
                <button (click)="toggleEstado(true)"
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Activar
                </button>
              }
            </div>
          </div>

          <!-- Items section -->
          <div class="mt-8">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Items del Kit ({{ kit()!.items?.length || 0 }})
              </h2>
            </div>

            @if (!kit()!.items?.length) {
              <div class="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <p class="text-gray-500 dark:text-gray-400">No hay items en este kit</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Unidad
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Categoría
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    @for (item of kit()!.items; track item.id) {
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td class="px-4 py-3">
                          <div class="font-medium text-gray-900 dark:text-white">{{ item.nombre }}</div>
                          @if (item.descripcion) {
                            <div class="text-sm text-gray-500 dark:text-gray-400">{{ item.descripcion }}</div>
                          }
                        </td>
                        <td class="px-4 py-3 text-gray-900 dark:text-white">{{ item.cantidad }}</td>
                        <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ item.unidad }}</td>
                        <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ item.categoria || '-' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          <!-- Metadata -->
          <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500 dark:text-gray-400">Creado:</span>
                <span class="ml-2 text-gray-900 dark:text-white">
                  {{ kit()!.createdAt | date:'medium' }}
                </span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400">Actualizado:</span>
                <span class="ml-2 text-gray-900 dark:text-white">
                  {{ kit()!.updatedAt | date:'medium' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class KitDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(KitsService);

  kit = signal<Kit | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadKit(id);
    } else {
      this.router.navigate(['/dashboard/kits']);
    }
  }

  loadKit(id: string): void {
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (data) => {
        this.kit.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard/kits']);
      }
    });
  }

  toggleEstado(activate: boolean): void {
    const id = this.kit()?.id;
    if (!id) return;

    const action$ = activate ? this.service.activate(id) : this.service.deactivate(id);
    action$.subscribe({
      next: (res) => {
        this.kit.set(res.data);
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    const base = 'px-2 py-0.5 text-xs font-medium rounded-full';
    switch (estado) {
      case 'activo':
        return `${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`;
      case 'inactivo':
        return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`;
      case 'archivado':
        return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
      default:
        return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  }

  getCategoriaBadgeClass(categoria: string): string {
    const base = 'px-2 py-0.5 text-xs font-medium rounded-full';
    switch (categoria) {
      case 'herramientas':
        return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`;
      case 'materiales':
        return `${base} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300`;
      case 'seguridad':
        return `${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`;
      case 'equipos':
        return `${base} bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300`;
      default:
        return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  }
}
